
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Equipment } from '../types';
import { sendMessageStream } from '../services/geminiService';

interface ChatInterfaceProps {
  inventory: Equipment[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ inventory }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello Engineer. I am your DC-Ops Master AI. Ask me about our equipment, monitoring SOPs, or how to raise a ticket with an OEM.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    let modelText = '';
    const newModelMsg: ChatMessage = { role: 'model', text: '', timestamp: new Date() };
    setMessages(prev => [...prev, newModelMsg]);

    try {
      const stream = sendMessageStream(input, inventory);
      for await (const chunk of stream) {
        modelText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], text: modelText };
          return updated;
        });
      }
    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'model', text: 'Error: Connection lost. Please try again later.', timestamp: new Date() }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <i className="fa-solid fa-robot text-sm"></i>
        </div>
        <div>
          <h3 className="font-bold">DC Operations Assistant</h3>
          <p className="text-xs text-blue-300">Equipped with Support & SOP Data</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              <p className={`text-[10px] mt-1.5 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && messages[messages.length-1].text === '' && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex gap-2">
        <input 
          type="text" 
          placeholder="e.g., How do I raise a ticket for the Fortinet Firewall?" 
          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
        />
        <button 
          type="submit"
          className="bg-blue-600 text-white w-12 h-12 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed"
          disabled={!input.trim() || isTyping}
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
