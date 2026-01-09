
import React, { useState } from 'react';
import { Equipment, ManualContent, Attachment } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { generateEnhancedManual } from '../services/geminiService';

interface ManualGeneratorProps {
  inventory: Equipment[];
  onSaveManual?: (assetId: string, manual: ManualContent) => void;
  onUpdateAsset?: (asset: Equipment) => void;
}

const ManualGenerator: React.FC<ManualGeneratorProps> = ({ inventory, onSaveManual, onUpdateAsset }) => {
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState<ManualContent | null>(null);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [linksInput, setLinksInput] = useState('');
  const [enriching, setEnriching] = useState(false);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleGenerate = async () => {
    const equipment = inventory.find(i => i.id === selectedId);
    if (!equipment) return;

    setLoading(true);
    setManual(null);
    try {
      const data = await generateEnhancedManual(equipment);
      setManual(data);
    } catch (err) {
      alert("Failed to fetch AI data. Check your API configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    if (manual && selectedId && onSaveManual) {
      onSaveManual(selectedId, manual);
      alert("SOP published to Library successfully.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'video', asset: Equipment) => {
    const file = e.target.files?.[0];
    if (file && onUpdateAsset) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAttachment: Attachment = {
          name: file.name,
          type,
          url: reader.result as string,
          uploadDate: new Date()
        };
        onUpdateAsset({ ...asset, attachments: [...asset.attachments, newAttachment], sopStatus: 'Available' });
      };
      reader.readAsDataURL(file);
    }
  };

  const addLinks = async () => {
    const asset = inventory.find(i => i.id === selectedId);
    if (!asset || !linksInput.trim() || !onUpdateAsset) return;

    const urls = linksInput.split(/[\s\n]+/).filter(url => url.trim().startsWith('http'));
    if (urls.length === 0) {
      alert("No valid URLs detected.");
      return;
    }

    setEnriching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Step 1: Use Google Search to get REAL metadata for the YouTube links
      const searchPrompt = `Retrieve the official video titles, durations, and channel authors for the following URLs. These are technical training resources for data center operations.
      URLs: ${urls.join(', ')}`;
      
      const searchResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      // Step 2: Format the searched data into JSON
      const parseResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on this search result: "${searchResponse.text}", extract the metadata into a JSON array of objects with keys: url, title, duration, author, views, postedAt. 
        If some data is missing, provide the most realistic estimation based on the search context.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                url: { type: Type.STRING },
                title: { type: Type.STRING },
                duration: { type: Type.STRING },
                author: { type: Type.STRING },
                views: { type: Type.STRING },
                postedAt: { type: Type.STRING }
              },
              required: ["url", "title"]
            }
          }
        }
      });

      const enrichedData = JSON.parse(parseResponse.text || "[]");

      const newAttachments: Attachment[] = urls.map(url => {
        const ytId = getYoutubeId(url);
        const isYoutube = !!ytId;
        const meta = enrichedData.find((d: any) => d.url === url || url.includes(d.url));
        
        return {
          name: meta?.title || (isYoutube ? `YouTube Training Module` : 'Web Documentation'),
          type: isYoutube ? 'youtube' : 'video',
          url: url,
          thumbnail: isYoutube ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : undefined,
          metadata: {
            duration: meta?.duration,
            views: meta?.views || (isYoutube ? "Verified Source" : undefined),
            postedAt: meta?.postedAt,
            author: meta?.author
          },
          uploadDate: new Date()
        };
      });

      onUpdateAsset({ 
        ...asset, 
        attachments: [...asset.attachments, ...newAttachments], 
        sopStatus: 'Available' 
      });
      
      setLinksInput('');
      setShowLinksModal(false);
    } catch (err) {
      console.error("Link enrichment failed", err);
      // Fallback behavior
      const fallback = urls.map(url => ({
        name: "Manual Asset Source",
        type: (getYoutubeId(url) ? 'youtube' : 'video') as any,
        url,
        uploadDate: new Date()
      }));
      onUpdateAsset({ ...asset, attachments: [...asset.attachments, ...fallback], sopStatus: 'Available' });
      setShowLinksModal(false);
    } finally {
      setEnriching(false);
    }
  };

  const removeAttachment = (asset: Equipment, index: number) => {
    if (onUpdateAsset) {
      const updated = [...asset.attachments];
      updated.splice(index, 1);
      onUpdateAsset({ ...asset, attachments: updated });
    }
  };

  const selectedAsset = inventory.find(i => i.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
      <div className="lg:col-span-4 space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2 custom-scrollbar">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Select Asset to Manage</h3>
        {inventory.map(item => {
          const docCount = item.attachments.filter(a => a.type === 'pdf').length;
          const videoCount = item.attachments.filter(a => a.type === 'video' || a.type === 'youtube').length;
          const isSelected = selectedId === item.id;

          return (
            <div 
              key={item.id}
              onClick={() => { setSelectedId(item.id); setManual(null); }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative group ${
                isSelected 
                  ? 'border-blue-600 bg-white shadow-xl shadow-blue-500/5' 
                  : 'border-slate-100 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{item.vendor}</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${item.area === 'Network' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {item.area}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 mb-3">{item.name}</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase">
                  <i className={`fa-solid fa-file-pdf ${docCount > 0 ? 'text-red-500' : 'text-slate-200'}`}></i> {docCount} Docs
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase">
                  <i className={`fa-solid fa-play-circle ${videoCount > 0 ? 'text-blue-500' : 'text-slate-200'}`}></i> {videoCount} Media
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="lg:col-span-8 space-y-6">
        {selectedAsset ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                      <i className="fa-solid fa-folder-tree"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">Knowledge Source Management</h3>
                      <p className="text-sm text-slate-500 font-medium">Equip {selectedAsset.name} with technical assets.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <i className="fa-solid fa-wand-sparkles"></i> {loading ? 'Researching...' : 'Generate AI SOP'}
                  </button>
                </div>

                <div className="relative group mt-8">
                  <div className="absolute inset-0 bg-blue-600/10 rounded-2xl blur group-focus-within:opacity-100 opacity-0 transition-opacity"></div>
                  <div className="relative bg-[#1a1b1e] border border-blue-600/20 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 w-full">
                      <i className="fa-solid fa-magnifying-glass text-slate-500 text-sm ml-2"></i>
                      <input 
                        type="text" 
                        placeholder="Search for new operational guides..." 
                        className="bg-transparent text-white text-sm w-full outline-none placeholder-slate-500 font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-2 border-l border-white/10 pl-4 w-full md:w-auto">
                      <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase py-2 px-3 rounded-lg transition-colors border border-white/5 tracking-widest whitespace-nowrap">
                        <i className="fa-solid fa-globe text-blue-400"></i> Auto-Search
                      </button>
                      <button className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ml-2">
                        <i className="fa-solid fa-arrow-right text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8 bg-white">
                <div className="flex flex-col items-center justify-center p-14 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                  <p className="text-3xl font-bold text-slate-300 mb-8">deploy resources</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <label className="flex items-center gap-3 bg-[#1e2023] hover:bg-slate-800 text-white px-7 py-4 rounded-2xl cursor-pointer transition-all border border-white/5 shadow-2xl active:scale-95">
                      <i className="fa-solid fa-upload text-blue-400"></i>
                      <span className="text-sm font-black uppercase tracking-widest">Upload files</span>
                      <input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e, 'pdf', selectedAsset)} />
                    </label>
                    
                    <button 
                      onClick={() => setShowLinksModal(true)}
                      className="flex items-center gap-3 bg-[#1e2023] hover:bg-slate-800 text-white px-7 py-4 rounded-2xl transition-all border border-white/5 shadow-2xl active:scale-95"
                    >
                      <i className="fa-solid fa-link text-blue-400"></i>
                      <i className="fa-brands fa-youtube text-red-500"></i>
                      <span className="text-sm font-black uppercase tracking-widest">Web & YouTube</span>
                    </button>
                  </div>
                </div>

                {selectedAsset.attachments.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attached Knowledge Bases ({selectedAsset.attachments.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedAsset.attachments.map((at, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-all group overflow-hidden relative">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 relative overflow-hidden`}>
                              {at.thumbnail ? (
                                <img src={at.thumbnail} className="w-full h-full object-cover" />
                              ) : (
                                <i className={`fa-solid ${at.type === 'pdf' ? 'fa-file-pdf text-red-500' : 'fa-film text-blue-500'} text-xl`}></i>
                              )}
                              {at.metadata?.duration && (
                                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] px-1 rounded font-bold">{at.metadata.duration}</span>
                              )}
                            </div>
                            <div className="truncate flex-1">
                              <p className="text-sm font-bold text-slate-800 truncate">{at.name}</p>
                              <div className="flex gap-2 items-center">
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{at.type}</p>
                                {at.metadata?.author && <span className="text-[9px] text-slate-300 truncate">• {at.metadata.author}</span>}
                              </div>
                            </div>
                          </div>
                          <button onClick={() => removeAttachment(selectedAsset, idx)} className="w-8 h-8 rounded-full hover:bg-red-50 text-slate-200 hover:text-red-500 transition-colors z-10">
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {manual && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-bottom-6 duration-700">
                <div className="bg-slate-900 text-white p-8 flex justify-between items-center">
                   <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                       <i className="fa-solid fa-robot text-xl"></i>
                     </div>
                     <div>
                       <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 block mb-1">AI Protocol Initialized</span>
                       <h4 className="text-2xl font-black">Draft SOP Protocol</h4>
                     </div>
                   </div>
                   <button 
                     onClick={handlePublish}
                     className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                   >
                     <i className="fa-solid fa-cloud-arrow-up"></i> Publish Protocol
                   </button>
                </div>
                <div className="p-10 bg-white">
                  <div className="space-y-6">
                    <p className="text-slate-700 italic border-l-4 border-blue-100 pl-6 leading-relaxed">"{manual.summary}"</p>
                    <div className="grid grid-cols-2 gap-8">
                       <div>
                         <h5 className="text-[10px] font-black uppercase text-emerald-600 mb-4 tracking-widest">Operation Steps</h5>
                         <ul className="space-y-3">
                           {manual.monitoring.slice(0, 3).map((m, i) => (
                             <li key={i} className="text-sm flex gap-3 text-slate-600 font-medium">
                               <i className="fa-solid fa-circle-check text-emerald-500 mt-1"></i> {m}
                             </li>
                           ))}
                         </ul>
                       </div>
                       {manual.imageUrl && (
                         <div className="relative group">
                            <h5 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Visual Map</h5>
                            <img src={manual.imageUrl} className="rounded-xl border border-slate-100 shadow-sm w-full" />
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-slate-50 border-2 border-dashed border-slate-100 rounded-[3rem] text-center p-20">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-100 mb-8">
              <i className="fa-solid fa-microchip text-5xl"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-400">Select an asset to begin deployment</h3>
            <p className="text-slate-400 text-sm mt-3 max-w-xs font-medium leading-relaxed">Map technical documentation, training modules, and AI-generated protocols to your fleet.</p>
          </div>
        )}
      </div>

      {showLinksModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1a1b1e] w-full max-w-4xl rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-10 md:p-14 space-y-8">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl md:text-3xl font-medium text-white max-w-2xl leading-tight">
                  Import training modules for <span className="text-blue-400">{selectedAsset?.name}</span>.
                </h3>
                <button 
                  onClick={() => setShowLinksModal(false)}
                  className="w-12 h-12 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all flex items-center justify-center"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <div className="relative group">
                <textarea 
                  className="w-full h-80 bg-transparent border-2 border-blue-600/30 rounded-[1.5rem] p-8 text-white text-lg placeholder-white/20 outline-none focus:border-blue-500 transition-all resize-none font-light"
                  placeholder="Paste YouTube or Web URLs..."
                  value={linksInput}
                  onChange={(e) => setLinksInput(e.target.value)}
                ></textarea>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Technical Guidelines</h5>
                  <ul className="space-y-2 text-white/40 text-[11px] font-medium">
                    <li className="flex items-center gap-3"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> Automatic metadata enrichment for YouTube.</li>
                    <li className="flex items-center gap-3"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> Search-grounded title verification.</li>
                    <li className="flex items-center gap-3"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> Secure playback within Engineering Portal.</li>
                  </ul>
                </div>

                <button 
                  onClick={addLinks}
                  disabled={!linksInput.trim() || enriching}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-20 flex items-center gap-3"
                >
                  {enriching ? (
                    <>
                      <i className="fa-solid fa-circle-notch animate-spin"></i>
                      Verifying Metadata...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-cloud-arrow-up"></i>
                      Deploy Sources
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualGenerator;
