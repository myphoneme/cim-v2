
import React, { useState, useEffect } from 'react';

interface PdfViewerProps {
  url: string;
  title?: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Force iframe reload when URL changes using a unique key
  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [url]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  if (!url) return null;

  return (
    <div className="relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
      {/* Loading State Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 transition-opacity duration-300">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fa-solid fa-file-pdf text-blue-500/50 animate-pulse text-xl"></i>
            </div>
          </div>
          <p className="mt-6 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
            Establishing Secure Document Link...
          </p>
        </div>
      )}

      {/* Error State Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-20 p-8 text-center">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-red-500/10">
            <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
          </div>
          <h4 className="text-white font-black text-xl mb-2">Resource Blocked</h4>
          <p className="text-slate-500 text-sm max-w-xs font-medium leading-relaxed">
            The technical document could not be rendered. This may be due to browser security policies or a malformed data stream.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 transition-all"
          >
            Refresh Interface
          </button>
        </div>
      )}

      {/* Main Iframe with unique key for reliable reloading */}
      <iframe
        key={url}
        src={url.includes('#') ? url : `${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
        className={`w-full h-full border-0 transition-all duration-700 bg-white ${
          loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        title={title || 'Technical Document'}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Security Watermark Overlay */}
      {!loading && !error && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] rotate-[-30deg] select-none">
          <span className="text-9xl font-black text-slate-900">INTERNAL SOP</span>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
