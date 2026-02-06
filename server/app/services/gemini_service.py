from typing import AsyncGenerator, List, Dict, Any, Optional
import json
from ..config import get_settings

settings = get_settings()


class GeminiService:
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        try:
            from google import genai
            self.client = genai.Client(api_key=api_key or settings.GEMINI_API_KEY)
            self.model_name = model_name or settings.GEMINI_MODEL
            self.use_new_sdk = True
        except ImportError:
            # Fallback to old SDK if new one not available
            import google.generativeai as genai
            genai.configure(api_key=api_key or settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(model_name or settings.GEMINI_MODEL)
            self.use_new_sdk = False

    async def generate_enhanced_manual(self, equipment) -> Dict[str, Any]:
        """Generate enhanced SOP manual using Gemini AI."""

        prompt = f"""
        Create a technical SOP manual for {equipment.vendor} {equipment.model} ({equipment.name}).

        Provide a JSON response with:
        {{
            "summary": "A 2-3 sentence overview of the equipment",
            "monitoring": ["Step 1: ...", "Step 2: ...", ...],
            "maintenance": ["Monthly: ...", "Quarterly: ...", ...],
            "troubleshooting": ["Issue: ... Solution: ...", ...],
            "links": [{{"title": "...", "uri": "..."}}],
            "illustration_prompt": "50-word description for technical diagram"
        }}

        Return ONLY valid JSON.
        """

        try:
            if self.use_new_sdk:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                response_text = response.text
            else:
                response = self.model.generate_content(prompt)
                response_text = response.text

            # Clean up response text
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]

            manual_data = json.loads(response_text.strip())

            return {
                "summary": manual_data.get("summary", f"Technical documentation for {equipment.vendor} {equipment.model}"),
                "monitoring": manual_data.get("monitoring", []),
                "maintenance": manual_data.get("maintenance", []),
                "troubleshooting": manual_data.get("troubleshooting", []),
                "links": manual_data.get("links", []),
                "illustration_prompt": manual_data.get("illustration_prompt", ""),
                "image_url": None
            }

        except Exception as e:
            print(f"Gemini error: {e}")
            return {
                "summary": f"Technical documentation for {equipment.vendor} {equipment.model}.",
                "monitoring": [
                    "Check system status indicators",
                    "Verify network connectivity",
                    "Review system logs for errors",
                    "Monitor resource utilization"
                ],
                "maintenance": [
                    "Monthly: Clean air filters and vents",
                    "Quarterly: Update firmware if available",
                    "Quarterly: Review and rotate logs",
                    "Annually: Full system health check"
                ],
                "troubleshooting": [
                    "Issue: No response - Solution: Check power and network connections",
                    "Issue: High CPU - Solution: Review running processes and logs",
                    "Issue: Connectivity issues - Solution: Verify network configuration"
                ],
                "links": [],
                "illustration_prompt": f"Technical diagram of {equipment.vendor} {equipment.model}",
                "image_url": None
            }

    async def chat_stream(
        self,
        message: str,
        inventory: List[Dict[str, Any]],
        history: List[Dict[str, str]]
    ) -> AsyncGenerator[str, None]:
        """Stream chat responses with inventory context."""

        system_context = f"""You are DC-Ops Master, an AI assistant for data center operations.

Current Inventory:
{json.dumps(inventory, indent=2)}

Help engineers with equipment monitoring, troubleshooting, and maintenance."""

        full_message = f"{system_context}\n\nUser: {message}"

        try:
            if self.use_new_sdk:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=full_message
                )
                yield response.text
            else:
                response = self.model.generate_content(full_message, stream=True)
                for chunk in response:
                    if chunk.text:
                        yield chunk.text

        except Exception as e:
            yield f"I apologize, but I encountered an error: {str(e)}. Please try again."

    def extract_metrics_from_image(self, file_path: str) -> Dict[str, Any]:
        prompt = """
        Extract metrics from this monitoring dashboard screenshot.
        If multiple hosts/VMs are present, return a COMPLETE row per host/VM IP with all metric keys.
        For each IP, always include cpu_util, ram_util, disk_util, net_in, net_out (use null if not visible).
        Return JSON ONLY in this format:
        {
          "metrics": [
            {"ip_address": "10.0.1.11", "key": "cpu_util", "value": 0.0, "unit": "%", "confidence": 0.0},
            {"ip_address": "10.0.1.11", "key": "ram_util", "value": 0.0, "unit": "%", "confidence": 0.0},
            {"ip_address": "10.0.1.11", "key": "disk_util", "value": 0.0, "unit": "%", "confidence": 0.0},
            {"ip_address": "10.0.1.11", "key": "net_in", "value": null, "unit": "%", "confidence": 0.0},
            {"ip_address": "10.0.1.11", "key": "net_out", "value": null, "unit": "%", "confidence": 0.0}
          ],
          "raw_text": "...",
          "confidence": 0.0,
          "status": "ok",
          "capture_time": null
        }
        Use keys cpu_util, ram_util, disk_util, net_in, net_out only.
        If a metric is not visible for an IP, set value to null (do not guess).
        """
        try:
            import mimetypes
            mime_type, _ = mimetypes.guess_type(file_path)
            mime_type = mime_type or "image/png"
            with open(file_path, "rb") as f:
                image_bytes = f.read()

            if self.use_new_sdk:
                from google.genai import types
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=[
                        prompt,
                        types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
                    ]
                )
                response_text = response.text
            else:
                response = self.model.generate_content([prompt, image_bytes])
                response_text = response.text

            if response_text.startswith("```"):
                response_text = response_text.split("```", 2)[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]

            cleaned = response_text.strip()
            try:
                data = json.loads(cleaned)
                return data
            except Exception:
                # Try to extract JSON block if the model added extra text.
                import re
                match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
                if match:
                    try:
                        data = json.loads(match.group(0))
                        return data
                    except Exception:
                        pass

            return {
                "metrics": [],
                "raw_text": cleaned,
                "confidence": 0.0,
                "status": "error",
                "capture_time": None
            }
        except Exception as e:
            return {
                "metrics": [],
                "raw_text": None,
                "confidence": 0.0,
                "status": "error",
                "capture_time": None,
                "error": str(e)
            }
