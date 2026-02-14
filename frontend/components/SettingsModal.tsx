import React from 'react';
import { UserSettings } from '../../types';

interface SettingsModalProps {
  settings: UserSettings;
  onUpdate: (newSettings: UserSettings) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onUpdate, onClose }) => {
  const toggle = (key: keyof UserSettings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden">
        <div className="p-6 border-b border-cyan-900/50 flex justify-between items-center bg-slate-950">
          <h2 className="text-xl font-orbitron font-bold text-cyan-400 tracking-wider">SYSTEM CONFIG</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <SettingToggle 
              label="Biometric Face Unlock" 
              desc="Require camera authentication on startup" 
              active={settings.enableFaceDetection} 
              onToggle={() => toggle('enableFaceDetection')} 
            />
            <SettingToggle 
              label="Lightning Response" 
              desc="Minimize AI thinking for faster replies" 
              active={settings.fastResponseMode} 
              onToggle={() => toggle('fastResponseMode')} 
            />
            <SettingToggle 
              label="Low-Voice Sensitivity" 
              desc="Enhanced detection for whispers/low tones" 
              active={settings.ultraSensitiveVoice} 
              onToggle={() => toggle('ultraSensitiveVoice')} 
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-orbitron text-slate-500 uppercase tracking-widest">
              <span>Hologram Intensity</span>
              <span>{settings.hologramIntensity}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={settings.hologramIntensity}
              onChange={(e) => onUpdate({...settings, hologramIntensity: parseInt(e.target.value)})}
              className="w-full accent-cyan-500 bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-950/50 text-center border-t border-cyan-900/20">
          <p className="text-[10px] font-mono text-slate-600">JARVIS CORE v4.2.0_SECURE_PROTOCOLS</p>
        </div>
      </div>
    </div>
  );
};

const SettingToggle: React.FC<{label: string, desc: string, active: boolean, onToggle: () => void}> = ({ label, desc, active, onToggle }) => (
  <div className="flex items-center justify-between group cursor-pointer" onClick={onToggle}>
    <div className="flex-1">
      <div className="text-sm font-orbitron text-cyan-100 group-hover:text-cyan-400 transition-colors">{label}</div>
      <div className="text-[10px] text-slate-500 font-medium">{desc}</div>
    </div>
    <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${active ? 'bg-cyan-500' : 'bg-slate-800'}`}>
      <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </div>
);

export default SettingsModal;
