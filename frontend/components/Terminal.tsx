import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LogEntry } from '../../types';

const STORAGE_KEY = 'jarvis_terminal_position';

interface TerminalProps {
  logs: LogEntry[];
  position?: { x: number; y: number } | null;
  onPositionChange?: (pos: { x: number; y: number } | null) => void;
}

const Terminal: React.FC<TerminalProps> = ({ logs, position: controlledPosition, onPositionChange }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [internalPosition, setInternalPosition] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { x, y } = JSON.parse(saved);
        return { x: Number.isFinite(x) ? x : undefined, y: Number.isFinite(y) ? y : undefined };
      }
    } catch (_) {}
    return { x: undefined, y: undefined };
  });
  const isControlled = controlledPosition !== undefined && onPositionChange !== undefined;
  const position = isControlled
    ? (controlledPosition ?? { x: typeof window !== 'undefined' ? window.innerWidth - 24 - 384 : 0, y: typeof window !== 'undefined' ? window.innerHeight - 24 - 256 : 0 })
    : internalPosition;
  const setPosition = isControlled
    ? (p: { x: number; y: number }) => onPositionChange!(p)
    : (p: { x: number; y: number }) => setInternalPosition(p);

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 });

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (!isControlled && position.x != null && position.y != null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    }
  }, [isControlled, position]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    const w = 384; const h = 256;
    const left = position.x ?? (typeof window !== 'undefined' ? window.innerWidth - 24 - w : 0);
    const top = position.y ?? (typeof window !== 'undefined' ? window.innerHeight - 24 - h : 0);
    dragStart.current = { x: e.clientX, y: e.clientY, left, top };
  }, [position.x, position.y]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const w = 384; const h = 256;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - w, dragStart.current.left + dx)),
        y: Math.max(0, Math.min(window.innerHeight - h, dragStart.current.top + dy)),
      });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, setPosition]);

  const posX = position.x ?? (typeof window !== 'undefined' ? window.innerWidth - 24 - 384 : 0);
  const posY = position.y ?? (typeof window !== 'undefined' ? window.innerHeight - 24 - 256 : 0);
  const style: React.CSSProperties = {
    position: 'fixed',
    width: 384,
    height: 256,
    left: posX,
    top: posY,
    cursor: isDragging ? 'grabbing' : 'default',
  };

  return (
    <div
      style={style}
      className="bg-slate-950/80 border-glow rounded-xl flex flex-col overflow-hidden backdrop-blur-md shadow-xl z-30"
    >
      <div
        onMouseDown={handleMouseDown}
        className="p-3 bg-slate-900/50 flex items-center justify-between border-b border-cyan-900/30 cursor-grab active:cursor-grab"
      >
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
        <span className="text-[10px] font-orbitron tracking-widest text-slate-500">SYSTEM_LOGS_CONSOLE</span>
        <i className="fa-solid fa-grip text-[10px] text-slate-500" title="Drag to move"></i>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-2 min-h-0">
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
