
import { GoogleGenAI, Type } from "@google/genai";
import { Equipment, ManualContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateEnhancedManual(equipment: Equipment): Promise<ManualContent> {
  const searchPrompt = `Search for the official OEM manual and technical SOPs for the ${equipment.vendor} ${equipment.model}. 
  I need a simplified guide for L1/L2 engineers. 
  Focus on:
  1. Daily monitoring health check steps.
  2. Standard maintenance routines (quarterly/monthly).
  3. Common troubleshooting for known errors.
  4. Links to the official documentation.
  5. Also, write a detailed 50-word description of a technical diagram illustrating a key maintenance procedure for this device (like port mapping or chassis filter cleaning).`;

  // Fix: When using googleSearch, response.text may not be in JSON format.
  // We perform the search first to get the ground truth, then use a second call to structure it into JSON.
  const searchResponse = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: searchPrompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const searchText = searchResponse.text;
  const grounding = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  // Second pass: structuring the searched info into JSON
  const structureResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Convert the following technical documentation into a structured JSON object. 
    Documentation:
    ${searchText}

    Schema requirements:
    - summary: A brief high-level overview.
    - monitoring: Array of daily health check steps.
    - maintenance: Array of standard maintenance routines.
    - troubleshooting: Array of common troubleshooting steps.
    - illustrationPrompt: A 50-word description for an AI image generator to draw a technical maintenance diagram.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          monitoring: { type: Type.ARRAY, items: { type: Type.STRING } },
          maintenance: { type: Type.ARRAY, items: { type: Type.STRING } },
          troubleshooting: { type: Type.ARRAY, items: { type: Type.STRING } },
          illustrationPrompt: { type: Type.STRING }
        },
        required: ["summary", "monitoring", "maintenance", "troubleshooting", "illustrationPrompt"]
      }
    },
  });

  const manualData = JSON.parse(structureResponse.text || "{}") as ManualContent;
  
  // Extract URLs from grounding
  manualData.links = grounding
    .filter((g: any) => g.web)
    .map((g: any) => ({ title: g.web.title, uri: g.web.uri }))
    .slice(0, 3);

  // 2. Generate Pictorial Illustration
  try {
    const imageResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: `A high-quality 3D isometric technical diagram of ${equipment.vendor} hardware showing: ${manualData.illustrationPrompt}. Professional blueprint style, clean, labeled components, white background.`,
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    for (const part of imageResponse.candidates[0].content.parts) {
      if (part.inlineData) {
        manualData.imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  } catch (e) {
    console.error("Image generation failed", e);
  }

  return manualData;
}

// Existing chat service updated to use history more effectively
export async function* sendMessageStream(message: string, currentInventory: Equipment[]) {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are the DC-Ops Master AI. Use this inventory: ${JSON.stringify(currentInventory)}`,
      temperature: 0.7,
    }
  });

  const responseStream = await chat.sendMessageStream({ message });
  for await (const chunk of responseStream) {
    yield chunk.text;
  }
}
