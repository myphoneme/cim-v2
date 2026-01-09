
import React, { useState, useEffect } from 'react';
import { Equipment, Attachment } from '../types';
import PdfViewer from './PdfViewer';

interface LibraryProps {
  inventory: Equipment[];
}

const Library: React.FC<LibraryProps> = ({ inventory }) => {
  const [viewManual, setViewManual] = useState<Equipment | null>(null);
  const [activeMediaTab, setActiveMediaTab] = useState<'sop' | 'resources'>('sop');
  const [viewerItem, setViewerItem] = useState<Attachment | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const publishedManuals = inventory.filter(item => item.generatedManual || item.attachments.length > 0);

  const folders = [
    { name: 'OEM Manuals', count: publishedManuals.length, icon: 'fa-box-open', color: 'text-blue-500' },
    { name: 'Standard SOPs', count: inventory.filter(i => i.sopStatus === 'Available').length, icon: 'fa-clipboard-list', color: 'text-emerald-500' },
    { name: 'Monitoring Logs', count: 250, icon: 'fa-chart-line', color: 'text-amber-500' },
    { name: 'Compliance', count: 12, icon: 'fa-shield-halved', color: 'text-red-500' },
  ];

  // Robust blob generation for PDF/Video to prevent blank pages or early revocation
  useEffect(() => {
    let currentUrl: string | null = null;
    
    if (viewerItem && (viewerItem.type === 'pdf' || viewerItem.type === 'video')) {
      if (viewerItem.url.startsWith('data:')) {
        try {
          const parts = viewerItem.url.split(',');
          const mime = parts[0].match(/:(.*?);/)?.[1] || '';
          const b64 = parts[1];
          const binary = atob(b64);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([array], { type: mime });
          currentUrl = URL.createObjectURL(blob);
          setBlobUrl(currentUrl);
        } catch (e) {
          console.error("Failed to generate Blob URL", e);
          setBlobUrl(viewerItem.url);
        }
      } else {
        setBlobUrl(viewerItem.url);
      }
    } else {
      setBlobUrl(null);
    }

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [viewerItem]);

  const getYoutubeEmbed = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    
    if (!id) return null;

    // Error 153 is often caused by problematic parameters or domain restrictions.
    // Simplified parameters for maximum compatibility.
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&rel=0&modestbranding=1`;
  };

  if (viewManual) {
    const manual = viewManual.generatedManual;
    const resources = viewManual.attachments;

    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-6xl mx-auto">
        <button 
          onClick={() => { setViewManual(null); setActiveMediaTab('sop'); }}
          className="text-slate-600 font-bold flex items-center gap-2 mb-4 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm"
        >
          <i className="fa-solid fa-arrow-left"></i> Back to Resource Library
        </button>
        
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden relative">
          <div className="bg-[#1a1b1e] text-white p-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${viewManual.area === 'Network' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'}`}>
                  {viewManual.area}
                </span>
                <span className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">{viewManual.vendor} • {viewManual.model}</span>
              </div>
              <h2 className="text-5xl font-black tracking-tight">{viewManual.name}</h2>
              <p className="text-slate-500 mt-4 font-medium text-lg leading-relaxed">Centralized Operational Protocol & Maintenance Hub</p>
            </div>
            <div className="flex gap-8 bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
               <div className="text-center">
                 <p className="text-3xl font-black text-blue-400">{resources.length}</p>
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">Resources</p>
               </div>
               <div className="text-center border-l border-white/10 pl-8">
                 <p className="text-3xl font-black text-emerald-400">SOP</p>
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">Ready</p>
               </div>
            </div>
          </div>

          <div className="flex border-b border-slate-100 bg-slate-50/50 p-2">
            <button 
              onClick={() => setActiveMediaTab('sop')}
              className={`flex-1 md:flex-none px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 ${activeMediaTab === 'sop' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-800 hover:bg-white'}`}
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i> AI SOP Guide
            </button>
            <button 
              onClick={() => setActiveMediaTab('resources')}
              className={`flex-1 md:flex-none px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 ${activeMediaTab === 'resources' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-800 hover:bg-white'}`}
            >
              <i className="fa-solid fa-layer-group"></i> Learning Resources ({resources.length})
            </button>
          </div>

          <div className="p-12 min-h-[500px]">
            {activeMediaTab === 'sop' && (
              manual ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-in fade-in duration-500">
                  <div className="space-y-12">
                    <section className="bg-blue-50/30 p-8 rounded-3xl border border-blue-100/50 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <i className="fa-solid fa-quote-right text-6xl text-blue-900"></i>
                      </div>
                      <h3 className="text-blue-900 font-black uppercase text-[10px] tracking-widest mb-6 flex items-center gap-2">
                        <i className="fa-solid fa-lightbulb"></i> Executive Protocol
                      </h3>
                      <p className="text-blue-900 leading-relaxed text-xl font-bold italic">"{manual.summary}"</p>
                    </section>
                    <section>
                      <h4 className="text-emerald-700 font-black text-xs uppercase mb-8 tracking-[0.2em] flex items-center gap-3">
                        <i className="fa-solid fa-clipboard-check"></i> Standard Health Routine
                      </h4>
                      <div className="space-y-4">
                        {manual.monitoring.map((m, i) => (
                          <div key={i} className="flex gap-5 p-6 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-sm font-black shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                              {i + 1}
                            </div>
                            <span className="text-sm text-slate-800 font-bold pt-2.5 leading-relaxed">{m}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                  {manual.imageUrl && (
                    <div className="space-y-6">
                      <h4 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Maintenance Visualization</h4>
                      <div className="bg-[#1a1b1e] rounded-[2.5rem] p-6 shadow-2xl border border-white/5 relative group">
                        <img src={manual.imageUrl} className="rounded-2xl border border-white/5 w-full h-auto shadow-inner group-hover:scale-[1.02] transition-transform duration-700" alt="SOP Viz" />
                        <div className="mt-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                            <i className="fa-solid fa-circle-info mr-2 text-blue-400"></i>
                            This digital twin SOP provides an optimized visual perspective for on-site engineers. Follow the illustrated hardware mapping strictly during cabinet ingress.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center space-y-6 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 shadow-sm">
                    <i className="fa-solid fa-brain text-5xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">No SOP Protocol Found</h3>
                    <p className="text-slate-500 font-medium max-w-sm mt-2">The AI generator has not published a protocol for this asset yet. Consult with the Admin Team.</p>
                  </div>
                </div>
              )
            )}

            {activeMediaTab === 'resources' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 animate-in fade-in duration-500">
                {resources.length > 0 ? resources.map((res, i) => (
                  <div 
                    key={i} 
                    onClick={() => setViewerItem(res)}
                    className="flex flex-col group cursor-pointer"
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-100 shadow-sm transition-transform group-hover:scale-[1.02]">
                      {res.thumbnail ? (
                        <img src={res.thumbnail} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <i className={`fa-solid ${res.type === 'pdf' ? 'fa-file-pdf text-red-500' : 'fa-film text-blue-500'} text-5xl`}></i>
                        </div>
                      )}
                      
                      {res.metadata?.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {res.metadata.duration}
                        </div>
                      )}

                      {(res.type === 'youtube' || res.type === 'video') && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                           <i className="fa-solid fa-play text-white opacity-0 group-hover:opacity-100 text-3xl transition-opacity"></i>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 px-1">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                         <i className={`fa-solid ${res.type === 'pdf' ? 'fa-file-invoice text-red-500' : 'fa-clapperboard text-blue-500'} text-sm`}></i>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h5 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">{res.name}</h5>
                        <div className="text-slate-500 text-[11px] font-medium">
                          {res.metadata?.author || (res.type === 'pdf' ? 'Technical Manual' : 'DC Internal')}
                        </div>
                        <div className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
                          {res.metadata?.views && <span>{res.metadata.views}</span>}
                          {res.metadata?.views && res.metadata?.postedAt && <span className="text-[6px]">•</span>}
                          {res.metadata?.postedAt && <span>{res.metadata.postedAt}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full flex flex-col items-center justify-center h-96 text-center space-y-6 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <i className="fa-solid fa-folder-open text-5xl text-slate-200"></i>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Resource Pool Empty</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RESOURCE VIEWER MODAL */}
        {viewerItem && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
            <div className="bg-[#1a1b1e] w-full max-w-6xl h-[90vh] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
               <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                      <i className={`fa-solid ${viewerItem.type === 'pdf' ? 'fa-file-lines' : 'fa-play'}`}></i>
                    </div>
                    <div>
                      <h4 className="text-white font-bold leading-none">{viewerItem.name}</h4>
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Encrypted Engineering Preview • No Downloads</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setViewerItem(null)}
                  className="w-12 h-12 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all flex items-center justify-center"
                 >
                   <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
               </div>
               <div className="flex-1 bg-black relative select-none" onContextMenu={(e) => e.preventDefault()}>
                 {viewerItem.type === 'youtube' ? (
                    <iframe 
                      src={getYoutubeEmbed(viewerItem.url) || ''}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                 ) : viewerItem.type === 'pdf' ? (
                    <PdfViewer 
                      url={blobUrl || ''} 
                      title={viewerItem.name}
                    />
                 ) : (
                    <video controls controlsList="nodownload" className="w-full h-full">
                      <source src={blobUrl || ''} />
                    </video>
                 )}
               </div>
               <div className="p-4 bg-red-950/20 text-red-500/60 text-[10px] font-black uppercase text-center tracking-[0.3em]">
                 Unauthorized recording or distribution is strictly prohibited by DC Policy 7.4.2
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {folders.map(folder => (
          <div 
            key={folder.name} 
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl transition-all group cursor-default hover:-translate-y-1"
          >
            <div className={`w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 transition-all group-hover:bg-slate-900 group-hover:text-white group-hover:rotate-6 shadow-sm`}>
              <i className={`fa-solid ${folder.icon} text-2xl ${folder.color} group-hover:text-white transition-colors`}></i>
            </div>
            <h3 className="font-black text-slate-900 text-xl tracking-tight">{folder.name}</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 bg-slate-50 inline-block px-2 py-1 rounded-lg">{folder.count} Documents Verified</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-50/30">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Operation Knowledge Hub</h2>
            <p className="text-slate-500 text-lg mt-2 font-medium">Standardized technical protocols for the Data Centre maintenance team.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
             <i className="fa-solid fa-shield-halved text-blue-600"></i>
             <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">L1/L2 Authorized Access</span>
          </div>
        </div>
        
        <div className="divide-y divide-slate-100 p-4">
          {publishedManuals.length > 0 ? publishedManuals.map(item => (
            <div key={item.id} className="p-8 flex flex-col sm:flex-row items-center justify-between hover:bg-slate-50/80 transition-all group rounded-[2rem] gap-6">
              <div className="flex items-center gap-8 w-full sm:w-auto">
                <div className={`w-20 h-20 rounded-[1.75rem] flex flex-col items-center justify-center shadow-sm group-hover:shadow-xl transition-all border-2 border-transparent group-hover:border-white ${item.area === 'Network' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                  <i className={`fa-solid fa-microchip text-2xl`}></i>
                  <span className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-60">{item.area}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-black text-slate-900 text-2xl tracking-tight leading-none">{item.vendor} {item.model}</h4>
                    <span className="bg-slate-900 text-white text-[8px] font-black px-2 py-0.5 rounded tracking-widest uppercase">Active</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.name}</span>
                    <div className="flex gap-2">
                       {item.generatedManual && <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center" title="AI SOP Ready"><i className="fa-solid fa-bolt text-[10px] text-blue-600"></i></div>}
                       {item.attachments.filter(a => a.type === 'pdf').length > 0 && <div className="w-5 h-5 bg-red-50 rounded flex items-center justify-center" title="PDF Manuals"><i className="fa-solid fa-file-pdf text-[10px] text-red-500"></i></div>}
                       {item.attachments.filter(a => a.type === 'video' || a.type === 'youtube').length > 0 && <div className="w-5 h-5 bg-emerald-50 rounded flex items-center justify-center" title="Video Training"><i className="fa-solid fa-play text-[10px] text-emerald-600"></i></div>}
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewManual(item)}
                className="w-full sm:w-auto text-xs font-black uppercase tracking-widest text-white bg-slate-900 px-10 py-5 rounded-[1.25rem] hover:bg-blue-600 transition-all hover:shadow-2xl hover:shadow-blue-600/30 active:scale-95"
              >
                Open Hub <i className="fa-solid fa-arrow-right-long ml-2"></i>
              </button>
            </div>
          )) : (
            <div className="p-24 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-folder-open text-4xl text-slate-300"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800">No Operational Docs Published</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs">Waiting for Admin to initialize asset knowledge bases and SOP protocols.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
