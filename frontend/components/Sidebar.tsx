import React from 'react';

interface SidebarProps {
  activePrinter: string;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePrinter, onOpenSettings }) => {
  return (
    <aside className="w-64 bg-slate-950/90 border-r border-cyan-900/50 flex flex-col p-6 z-20">
      <div className="mb-10 text-center">
        <div className="inline-block p-4 border-2 border-cyan-500 rounded-full mb-4 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <i className="fa-solid fa-user-astronaut text-3xl text-cyan-400"></i>
        </div>
        <h2 className="text-lg font-orbitron tracking-widest text-white uppercase">Sir Akhil</h2>
        <p className="text-xs text-slate-500 font-mono mt-1 tracking-tighter">AUTHENTICATED USER</p>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem icon="fa-gauge-high" label="Dashboard" active />
        <NavItem icon="fa-hand-point-up" label="Gesture Hub" />
        <NavItem icon="fa-microchip" label="Neural Ops" />
        <NavItem icon="fa-print" label="Printer Hub" />
        <NavItem icon="fa-network-wired" label="IoT Mesh" />
        <div onClick={onOpenSettings}>
          <NavItem icon="fa-gear" label="Settings" />
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-cyan-900/30">
        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter mb-2">Active Bridge</div>
        <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg border border-cyan-900/10">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs text-cyan-100 truncate">{activePrinter}</span>
        </div>
      </div>
    </aside>
  );
};

const NavItem: React.FC<{icon: string, label: string, active?: boolean}> = ({ icon, label, active }) => (
  <div className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${active ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-100 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]' : 'hover:bg-slate-900 text-slate-400 hover:text-cyan-300'}`}>
    <i className={`fa-solid ${icon} w-5 text-center`}></i>
    <span className="text-sm font-medium tracking-wide font-orbitron text-[11px] uppercase">{label}</span>
  </div>
);

export default Sidebar;
