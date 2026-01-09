import { useState } from 'react';
import { useEquipment, useEquipmentById } from '../hooks/useEquipment';
import type { Attachment, DocumentCategory } from '../types';

export default function Library() {
  const { data: inventory = [], isLoading } = useEquipment();
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Attachment | null>(null);
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'all'>('all');

  const { data: selectedEquipment } = useEquipmentById(selectedEquipmentId || 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getCategoryLabel = (category: DocumentCategory) => {
    const labels: Record<DocumentCategory, string> = {
      implementation: 'Implementation',
      tutorial: 'Tutorial',
      troubleshooting: 'Troubleshooting',
      maintenance: 'Maintenance',
    };
    return labels[category];
  };

  const getCategoryColor = (category: DocumentCategory) => {
    const colors: Record<DocumentCategory, string> = {
      implementation: 'bg-blue-500/10 text-blue-500',
      tutorial: 'bg-green-500/10 text-green-500',
      troubleshooting: 'bg-amber-500/10 text-amber-500',
      maintenance: 'bg-purple-500/10 text-purple-500',
    };
    return colors[category];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return { icon: 'fa-file-shield', color: 'text-red-500' };
      case 'docx': return { icon: 'fa-file-word', color: 'text-blue-500' };
      case 'video': return { icon: 'fa-play-circle', color: 'text-brand-500' };
      case 'youtube': return { icon: 'fa-play-circle', color: 'text-brand-500' };
      case 'web': return { icon: 'fa-globe', color: 'text-blue-500' };
      default: return { icon: 'fa-file', color: 'text-slate-400' };
    }
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  // Filter equipment that has published documents
  const equipmentWithDocs = inventory.filter(item => (item.doc_count > 0 || item.video_count > 0));

  // Document Viewer Modal
  if (viewingDocument) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => setViewingDocument(null)}
          className="text-slate-400 font-black flex items-center gap-3 hover:text-brand-500 transition-colors text-xs uppercase tracking-widest"
        >
          <i className="fa-solid fa-arrow-left"></i> Back to Knowledge Hub
        </button>

        <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-white/5">
                <i className={`fa-solid ${getFileIcon(viewingDocument.type).icon} ${getFileIcon(viewingDocument.type).color} text-2xl`}></i>
              </div>
              <div>
                <h2 className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter">{viewingDocument.name}</h2>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getCategoryColor(viewingDocument.document_category)}`}>
                  {getCategoryLabel(viewingDocument.document_category)}
                </span>
              </div>
            </div>
          </div>

          <div className="relative" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
            {/* Watermark */}
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-5">
              <span className="text-8xl font-black text-slate-900 dark:text-white rotate-[-30deg] uppercase tracking-widest">
                PhoneMe Ops
              </span>
            </div>

            {viewingDocument.type === 'youtube' && (
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(viewingDocument.url)}?rel=0`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}

            {viewingDocument.type === 'pdf' && (
              <iframe
                src={`/api/attachments/file/${viewingDocument.id}#toolbar=0`}
                className="w-full h-full"
              />
            )}

            {viewingDocument.type === 'video' && (
              <video
                src={`/api/attachments/file/${viewingDocument.id}`}
                controls
                className="w-full h-full object-contain bg-black"
                controlsList="nodownload"
              />
            )}

            {viewingDocument.type === 'web' && (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <i className="fa-solid fa-globe text-6xl text-blue-500 mb-6"></i>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">External Web Resource</h3>
                <a
                  href={viewingDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest pill-shadow"
                >
                  <i className="fa-solid fa-external-link mr-3"></i>
                  Open External Link
                </a>
              </div>
            )}

            {viewingDocument.type === 'docx' && (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <i className="fa-solid fa-file-word text-6xl text-blue-500 mb-6"></i>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Word Document</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                  Word documents cannot be previewed directly. Contact your administrator if you need access.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Knowledge Hub View
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
      {/* Left Sidebar - Knowledge Targets */}
      <div className="lg:col-span-4 space-y-6 max-h-[calc(100vh-14rem)] overflow-y-auto pr-4 custom-scrollbar">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 px-2">Knowledge Targets</h3>
        {equipmentWithDocs.length > 0 ? equipmentWithDocs.map(item => (
          <div
            key={item.id}
            onClick={() => { setSelectedEquipmentId(item.id); setActiveCategory('all'); }}
            className={`p-8 rounded-[2rem] border-2 transition-all cursor-pointer relative group ${
              selectedEquipmentId === item.id
                ? 'border-brand-500 bg-white dark:bg-[#111111] shadow-2xl shadow-brand-500/10'
                : 'border-slate-100 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:border-slate-200 dark:hover:border-white/10'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.vendor}</span>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${item.area === 'Network' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-brand-500/10 text-brand-500'}`}>
                {item.area}
              </span>
            </div>
            <h4 className="font-black text-slate-900 dark:text-white text-xl tracking-tight leading-none mb-4">{item.name}</h4>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                <i className={`fa-solid fa-file-shield ${item.doc_count > 0 ? 'text-red-500' : 'opacity-20'}`}></i> {item.doc_count} Docs
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                <i className={`fa-solid fa-play-circle ${item.video_count > 0 ? 'text-brand-500' : 'opacity-20'}`}></i> {item.video_count} Media
              </div>
            </div>
          </div>
        )) : (
          <div className="p-10 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-white/5 text-center">
            <i className="fa-solid fa-folder-tree text-4xl text-slate-200 dark:text-slate-800 mb-4"></i>
            <p className="text-slate-400 text-sm font-bold">No published documentation available.</p>
          </div>
        )}
      </div>

      {/* Right Panel - Content Display */}
      <div className="lg:col-span-8 space-y-8">
        {selectedEquipment ? (
          <div className="space-y-10">
            <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-[1.5rem] flex items-center justify-center text-white dark:text-slate-900 shadow-xl">
                      <i className="fa-solid fa-book-bookmark text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedEquipment.name}</h3>
                      <p className="text-base text-slate-500 dark:text-slate-400 font-medium">{selectedEquipment.vendor} {selectedEquipment.model}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <i className="fa-solid fa-file-shield"></i> {selectedEquipment.attachments?.filter((a: Attachment) => a.is_published && ['pdf', 'docx', 'web'].includes(a.type)).length || 0} Docs
                    </span>
                    <span className="bg-brand-500/10 text-brand-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <i className="fa-solid fa-play-circle"></i> {selectedEquipment.attachments?.filter((a: Attachment) => a.is_published && ['video', 'youtube'].includes(a.type)).length || 0} Media
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex gap-3 overflow-x-auto custom-scrollbar">
                {(['all', 'implementation', 'tutorial', 'troubleshooting', 'maintenance'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${
                      activeCategory === cat
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {cat === 'all' ? 'All Resources' : getCategoryLabel(cat)}
                  </button>
                ))}
              </div>

              {/* Documents Grid */}
              <div className="p-8">
                {(() => {
                  const filteredAttachments = selectedEquipment.attachments?.filter(
                    (att: Attachment) => att.is_published && (activeCategory === 'all' || att.document_category === activeCategory)
                  ) || [];

                  if (filteredAttachments.length > 0) {
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredAttachments.map((attachment: Attachment) => {
                          const ytId = attachment.type === 'youtube' ? extractYouTubeId(attachment.url) : null;
                          return (
                            <div
                              key={attachment.id}
                              onClick={() => setViewingDocument(attachment)}
                              className="flex items-center justify-between p-6 bg-white dark:bg-[#0A0A0A] border border-slate-100 dark:border-white/5 rounded-[1.5rem] shadow-sm group relative cursor-pointer hover:border-brand-500 transition-all"
                            >
                              <div className="flex items-center gap-5 overflow-hidden">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-slate-50 dark:bg-white/5 overflow-hidden border border-slate-100 dark:border-white/5">
                                  {ytId ? (
                                    <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <i className={`fa-solid ${getFileIcon(attachment.type).icon} ${getFileIcon(attachment.type).color} text-xl opacity-60`}></i>
                                  )}
                                </div>
                                <div className="truncate">
                                  <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate tracking-tight group-hover:text-brand-500 transition-colors">{attachment.name}</p>
                                  <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">
                                    {attachment.type} • {getCategoryLabel(attachment.document_category)}
                                  </p>
                                </div>
                              </div>
                              <button className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 group-hover:bg-brand-500 text-slate-400 group-hover:text-white transition-all flex items-center justify-center shrink-0">
                                <i className="fa-solid fa-play"></i>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  } else {
                    return (
                      <div className="p-16 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[2rem] text-center">
                        <i className="fa-solid fa-folder-open text-5xl text-slate-200 dark:text-slate-800 mb-6"></i>
                        <h4 className="text-xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">No Resources Available</h4>
                        <p className="text-slate-400 text-sm mt-3">
                          {activeCategory === 'all'
                            ? 'No published documentation for this equipment.'
                            : `No ${getCategoryLabel(activeCategory as DocumentCategory).toLowerCase()} resources available.`}
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-slate-50 dark:bg-[#111111]/50 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem] text-center p-20">
            <div className="w-32 h-32 bg-white dark:bg-[#111111] rounded-[2.5rem] shadow-xl flex items-center justify-center text-slate-100 dark:text-slate-800 mb-10 border border-slate-100 dark:border-white/5">
              <i className="fa-solid fa-book-bookmark text-6xl"></i>
            </div>
            <h3 className="text-3xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">Select Target Node</h3>
            <p className="text-slate-400 dark:text-slate-500 text-lg mt-4 max-w-sm font-medium">
              Access operational training, OEM manuals, and technical documentation for your infrastructure.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
