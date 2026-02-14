import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../../types';

interface TerminalProps {
  logs: LogEntry[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="absolute bottom-6 right-6 w-96 h-64 bg-slate-950/80 border-glow rounded-xl flex flex-col overflow-hidden backdrop-blur-md">
      <div className="p-3 bg-slate-900/50 flex items-center justify-between border-b border-cyan-900/30">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
        <span className="text-[10px] font-orbitron tracking-widest text-slate-500">SYSTEM_LOGS_CONSOLE</span>
        <i className="fa-solid fa-terminal text-[10px] text-slate-500"></i>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-2 custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
            <span className={`
              ${log.type === 'success' ? 'text-emerald-400' : ''}
              ${log.type === 'error' ? 'text-rose-400' : ''}
              ${log.type === 'warning' ? 'text-amber-400' : ''}
              ${log.type === 'info' ? 'text-cyan-400' : ''}
            `}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default Terminal;
