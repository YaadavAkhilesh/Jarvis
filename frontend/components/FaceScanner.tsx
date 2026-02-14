import React, { useEffect, useRef, useState } from 'react';

interface FaceScannerProps {
  onAuthenticated: () => void;
}

const FaceScanner: React.FC<FaceScannerProps> = ({ onAuthenticated }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'scanning' | 'match' | 'denied'>('scanning');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    };

    startCamera();

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('match');
          setTimeout(onAuthenticated, 1000); // Faster transition for Sir Akhil
          return 100;
        }
        return prev + 4; // Faster scanning speed
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onAuthenticated]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center">
      <div className="relative w-80 h-80 rounded-full overflow-hidden border-4 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.4)]">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          className="w-full h-full object-cover scale-x-[-1] opacity-60"
        />
        
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-[scan_2s_infinite_ease-in-out]" />
        
        <div className="absolute inset-4 border border-cyan-500/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
           {status === 'match' && (
             <div className="bg-emerald-500/80 text-white p-2 rounded animate-bounce font-orbitron text-xs">
               ID MATCHED: SIR_AKHIL
             </div>
           )}
        </div>
      </div>

      <div className="mt-10 w-64 text-center">
        <div className="text-xs font-orbitron tracking-[0.3em] mb-4 text-cyan-300 uppercase">
          {status === 'scanning' ? 'Verifying Neural Pattern' : 'Access Granted: Hello Sir Akhil'}
        </div>
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_10px_#06b6d4]" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <div className="mt-2 font-mono text-[10px] text-slate-500">
          SYSCORP_SECURE_AUTH // V4.0.1_AKHIL
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default FaceScanner;
