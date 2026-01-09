import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useChat } from '../hooks/useChat';

export default function ChatInterface() {
  const { messages, isStreaming, sendMessage, clearMessages } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="bg-slate-900 dark:bg-slate-950 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
            <i className="fa-solid fa-robot text-sm"></i>
          </div>
          <div>
            <h3 className="font-bold">DC Operations Assistant</h3>
            <p className="text-xs text-brand-300">Equipped with Support & SOP Data</p>
          </div>
        </div>
        <button
          onClick={clearMessages}
          className="text-slate-400 hover:text-white transition-colors"
          title="Clear chat"
        >
          <i className="fa-solid fa-trash-can"></i>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-900">
        {messages.length === 0 && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                Hello Engineer. I am your DC-Ops Master AI. Ask me about our equipment, monitoring SOPs, or how to raise a ticket with an OEM.
              </p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.role === 'user'
                ? 'bg-brand-500 text-white rounded-tr-none'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none'
            }`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {msg.timestamp && (
                <p className={`text-[10px] mt-1.5 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        ))}
        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full typing-dot"></span>
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full typing-dot"></span>
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full typing-dot"></span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2">
        <input
          type="text"
          placeholder="e.g., How do I raise a ticket for the Fortinet Firewall?"
          className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition-all text-slate-900 dark:text-white"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
        />
        <button
          type="submit"
          className="bg-brand-500 text-white w-12 h-12 rounded-xl hover:bg-brand-600 transition-colors flex items-center justify-center shadow-md disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
          disabled={!input.trim() || isStreaming}
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
}
