import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isThinking: boolean;
  onClose: () => void;
  language: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSend, isThinking, onClose, language }) => {
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isThinking) return;
    onSend(text);
    setInput('');
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-950/95 border-l border-cyan-900/50 shadow-2xl flex flex-col z-40 backdrop-blur-xl">
      <div className="p-4 border-b border-cyan-900/50 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-orbitron tracking-widest text-cyan-400 uppercase">Text Chat</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-cyan-400 rounded transition-colors"
          aria-label="Close chat"
        >
          <i className="fa-solid fa-times"></i>
        </button>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <p className="text-slate-500 text-sm">Type in English or Hinglish. Jarvis will respond in character.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 ${
                m.role === 'user'
                  ? 'bg-cyan-900/40 text-cyan-100 border border-cyan-700/50'
                  : 'bg-slate-800/80 text-slate-200 border border-cyan-900/30'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              <p className="text-[10px] text-slate-500 mt-1">{m.timestamp}</p>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 border border-cyan-900/30 rounded-lg px-4 py-2 text-cyan-400 text-sm">
              <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Thinking...
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-cyan-900/50 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type in English or Hinglish..."
            className="flex-1 bg-slate-900 border border-cyan-900/50 rounded-lg px-4 py-2.5 text-cyan-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
            disabled={isThinking}
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-lg transition-colors"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
