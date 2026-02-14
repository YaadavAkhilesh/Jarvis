import React, { useEffect, useState } from 'react';

interface GestureHUDProps {
  isLocked: boolean;
}

const GestureHUD: React.FC<GestureHUDProps> = ({ isLocked }) => {
  const [activeHand, setActiveHand] = useState(false);
  
  // Simulate hand detection activity for visual feedback
  useEffect(() => {
    if (isLocked) return;
    const interval = setInterval(() => {
      setActiveHand(Math.random() > 0.7);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLocked]);

  if (isLocked) return null;

  return (
    <div className="absolute bottom-24 right-10 flex flex-col items-end gap-3 pointer-events-none">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[10px] font-orbitron text-slate-500">KINETIC ENGINE</div>
          <div className={`text-xs font-orbitron ${activeHand ? 'text-emerald-400' : 'text-cyan-500'}`}>
            {activeHand ? 'HAND_DETECTED' : 'SCANNING_GESTURES'}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-all duration-300 ${activeHand ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-slate-700'}`}>
          <i className={`fa-solid fa-hand-point-up text-xl ${activeHand ? 'text-emerald-400' : 'text-slate-600'}`}></i>
        </div>
      </div>
      
      <div className="w-48 h-32 bg-slate-950/60 border border-cyan-900/30 rounded-lg overflow-hidden relative p-2">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="relative h-full w-full flex items-center justify-center">
          {/* Schematic of hand tracking */}
          <div className="relative w-16 h-20 border border-cyan-500/20 rounded-xl flex items-center justify-center">
             <div className={`w-2 h-2 rounded-full bg-cyan-400 absolute transition-all duration-500`} style={{ top: activeHand ? '10%' : '40%', left: '50%' }}></div>
             <div className={`w-1.5 h-1.5 rounded-full bg-cyan-600 absolute transition-all duration-700`} style={{ top: activeHand ? '15%' : '45%', left: '30%' }}></div>
             <div className={`w-1.5 h-1.5 rounded-full bg-cyan-600 absolute transition-all duration-300`} style={{ top: activeHand ? '12%' : '42%', left: '70%' }}></div>
             <div className="w-4 h-6 bg-cyan-900/40 rounded-full mt-4"></div>
          </div>
          <div className="absolute top-2 left-2 text-[8px] font-mono text-cyan-500/50">XYZ_TRACK_092</div>
        </div>
      </div>
    </div>
  );
};

export default GestureHUD;
