import React, { useState, useEffect } from 'react';

const TitleBar: React.FC = () => {
  const [time, setTime] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const formatTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const h = hours % 12 || 12;
      const m = minutes < 10 ? `0${minutes}` : minutes;
      setTime(`${h}:${m} ${ampm}`);
    };
    formatTime();
    const interval = setInterval(formatTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleMinimize = () => {
    if (typeof (window as any).electron?.minimize === 'function') {
      (window as any).electron.minimize();
    }
  };

  const handleMaximize = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleClose = () => {
    if (typeof (window as any).electron?.close === 'function') {
      (window as any).electron.close();
    } else {
      window.close();
    }
  };

  return (
    <div
      className="flex items-center justify-end gap-2 h-10 px-4 bg-black/80 border-b border-cyan-500/40 select-none"
      style={{
        WebkitAppRegion: 'drag',
        boxShadow: '0 1px 0 rgba(34, 211, 238, 0.2)',
      }}
    >
      <div className="flex items-center gap-1 text-cyan-400 font-orbitron text-sm tracking-wider" style={{ WebkitAppRegion: 'no-drag' }}>
        <span className="tabular-nums" style={{ textShadow: '0 0 8px rgba(34, 211, 238, 0.6)' }}>
          {time}
        </span>
      </div>
      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          type="button"
          onClick={handleMinimize}
          className="w-8 h-8 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 rounded transition-colors border border-transparent hover:border-cyan-500/50"
          title="Minimize"
        >
          <span className="text-lg leading-none">−</span>
        </button>
        <button
          type="button"
          onClick={handleMaximize}
          className="w-8 h-8 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 rounded transition-colors border border-transparent hover:border-cyan-500/50"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          <span className="text-sm leading-none">{isFullscreen ? '⧉' : '☐'}</span>
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center text-cyan-400 hover:bg-red-500/30 hover:text-red-400 rounded transition-colors border border-transparent hover:border-red-500/50"
          title="Close"
        >
          <span className="text-lg leading-none">×</span>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
