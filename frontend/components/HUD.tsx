import React from 'react';
import { AppState } from '../../types';

interface HUDProps {
  state: AppState;
}

const HUD: React.FC<HUDProps> = ({ state }) => {
  return (
    <div className={`flex-1 relative flex items-center justify-center pointer-events-none transition-opacity duration-1000 ${state.isLocked ? 'opacity-20 blur-sm' : 'opacity-100 blur-0'}`}>
      <div className="relative">
        <div className={`w-80 h-80 rounded-full arc-reactor flex items-center justify-center border-4 border-cyan-500/30 transition-all duration-700 ${state.isThinking ? 'scale-110 shadow-[0_0_100px_rgba(34,211,238,0.6)]' : 'scale-100'}`}>
          <div className="absolute inset-0 border-8 border-cyan-400/10 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-4 border-2 border-cyan-400/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          <div className="text-center z-10">
             <div className="text-sm font-orbitron text-cyan-200 mb-1 tracking-widest">WAKE: JARVIS</div>
             <div className="text-3xl font-orbitron font-bold text-white tracking-tighter">
               {state.isThinking ? 'ANALYZING...' : (state.isListening ? 'READY' : 'IDLE')}
             </div>
          </div>
        </div>
      </div>

      <div className="absolute top-10 left-10 space-y-4">
        <HUDCard title="Printer Status" icon="fa-print">
          <div className="text-xs text-cyan-300">{state.printer.activePrinter}</div>
          <div className="text-[10px] mt-2 text-slate-500">Queue: {state.printer.queue.length}</div>
        </HUDCard>

        <HUDCard title="Smart Home" icon="fa-house">
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
            <div className={`p-1 border ${state.home.lights ? 'bg-cyan-500/20 border-cyan-500' : 'border-slate-800'}`}>LIGHTS</div>
            <div className={`p-1 border ${state.home.fan ? 'bg-cyan-500/20 border-cyan-500' : 'border-slate-800'}`}>HVAC</div>
          </div>
        </HUDCard>
      </div>

      <div className="absolute top-10 right-10 space-y-4">
        <HUDCard title="Neural Bridge" icon="fa-brain">
          <div className="text-[10px] text-cyan-300">Region: Asia-Pacific</div>
          <div className="text-[10px] text-slate-500">Language: {state.language}</div>
        </HUDCard>
      </div>
    </div>
  );
};

const HUDCard: React.FC<{title: string, icon: string, children: React.ReactNode}> = ({ title, icon, children }) => (
  <div className="w-56 p-4 border-glow bg-slate-950/40 backdrop-blur-sm rounded-tr-3xl rounded-bl-3xl">
    <div className="flex items-center gap-2 mb-3 border-b border-cyan-900 pb-2">
      <i className={`fa-solid ${icon} text-cyan-400 text-sm`}></i>
      <h3 className="text-xs font-orbitron uppercase tracking-widest">{title}</h3>
    </div>
    {children}
  </div>
);

export default HUD;
