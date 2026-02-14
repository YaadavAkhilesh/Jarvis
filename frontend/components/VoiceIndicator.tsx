import React from 'react';

interface VoiceIndicatorProps {
  isListening: boolean;
  isThinking: boolean;
}

const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ isListening, isThinking }) => {
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-1">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${isThinking ? 'bg-cyan-400' : 'bg-slate-700'}`}
            style={{ 
              height: isListening ? `${Math.random() * 40 + 10}px` : '4px',
              animation: isListening ? `pulse-bar ${0.5 + Math.random()}s infinite alternate` : 'none'
            }}
          />
        ))}
      </div>
      
      <div className="flex flex-col items-center">
        <div className={`p-4 rounded-full border-2 transition-all duration-500 ${isThinking ? 'border-cyan-400 bg-cyan-400/20' : 'border-slate-800 bg-slate-900'}`}>
           <i className={`fa-solid ${isThinking ? 'fa-brain animate-pulse' : 'fa-microphone'} text-2xl ${isThinking ? 'text-cyan-200' : (isListening ? 'text-cyan-400 animate-pulse' : 'text-slate-600')}`}></i>
        </div>
        <span className="text-[10px] mt-2 font-orbitron tracking-widest text-slate-500">
           {isThinking ? 'PROCESSING' : (isListening ? 'VOICE READY' : 'OFFLINE')}
        </span>
      </div>

      <div className="flex items-center gap-1 scale-x-[-1]">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${isThinking ? 'bg-cyan-400' : 'bg-slate-700'}`}
            style={{ 
              height: isListening ? `${Math.random() * 40 + 10}px` : '4px',
              animation: isListening ? `pulse-bar ${0.5 + Math.random()}s infinite alternate` : 'none'
            }}
          />
        ))}
      </div>
      
      <style>{`
        @keyframes pulse-bar {
          from { height: 10px; opacity: 0.5; }
          to { height: 40px; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VoiceIndicator;
