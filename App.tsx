import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LogEntry, AppState, UserSettings } from './types';
import { GoogleGenAI } from '@google/genai';
import HUD from './frontend/components/HUD';
import Sidebar from './frontend/components/Sidebar';
import Terminal from './frontend/components/Terminal';
import VoiceIndicator from './frontend/components/VoiceIndicator';
import FaceScanner from './frontend/components/FaceScanner';
import GestureHUD from './frontend/components/GestureHUD';
import SettingsModal from './frontend/components/SettingsModal';
import TitleBar from './frontend/components/TitleBar';

// Removed constant for API_KEY to use process.env.API_KEY directly in API calls as per guidelines.

const useSpeechRecognition = (onResult: (transcript: string, isFinal: boolean) => void, lang: string) => {
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (recognitionRef.current) recognitionRef.current.stop();
      
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true; 
      recognitionRef.current.lang = lang;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            onResult(event.results[i][0].transcript.trim(), true);
          } else {
            interimTranscript += event.results[i][0].transcript;
            onResult(interimTranscript.trim(), false);
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
      };

      recognitionRef.current.start();
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [onResult, lang]);

  return recognitionRef.current;
};

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('jarvis_settings');
    const initialSettings: UserSettings = saved ? JSON.parse(saved) : {
      enableFaceDetection: true,
      fastResponseMode: true,
      ultraSensitiveVoice: true,
      hologramIntensity: 80
    };

    return {
      isListening: true,
      isThinking: false,
      isLocked: initialSettings.enableFaceDetection,
      language: 'en-US',
      lastCommand: '',
      logs: [{ id: '1', timestamp: new Date().toLocaleTimeString(), message: 'Jarvis Neural Bridge Online...', type: 'info' }],
      printer: { isOnline: true, activePrinter: 'HP LaserJet Pro M404n', queue: [] },
      home: { lights: false, fan: false, ac: false, bedroom: false },
      settings: initialSettings
    };
  });

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setState(prev => ({
      ...prev,
      logs: [
        { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), message, type },
        ...prev.logs.slice(0, 49)
      ]
    }));
  }, []);

  // Initial Security Check - using process.env.API_KEY directly as per Gemini API requirements
  useEffect(() => {
    if (!process.env.API_KEY) {
      addLog("NEURAL LINK ERROR: Missing API_KEY in environment variable.", 'error');
    }
  }, [addLog]);

  useEffect(() => {
    localStorage.setItem('jarvis_settings', JSON.stringify(state.settings));
  }, [state.settings]);

  const isLockedRef = useRef(state.isLocked);
  useEffect(() => { isLockedRef.current = state.isLocked; }, [state.isLocked]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice;

    if (state.language.startsWith('en')) {
      preferredVoice = voices.find(v => v.name.includes('British') || v.name.includes('UK') || v.name.includes('Male')) ||
                       voices.find(v => v.lang.includes('en-GB')) ||
                       voices.find(v => v.name.includes('David'));
    } else if (state.language.startsWith('hi')) {
      preferredVoice = voices.find(v => v.lang.includes('hi')) || 
                       voices.find(v => v.name.includes('Google हिन्दी'));
    }

    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.pitch = 0.85; 
    utterance.rate = state.settings.fastResponseMode ? 1.0 : 0.95; 
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  const processCommand = useCallback(async (transcript: string, isFinal: boolean) => {
    if (isLockedRef.current) return;

    const input = transcript.toLowerCase();
    const wakeWords = ["jarvis", "jarvish", "jervis", "jarves", "jarwis", "javeez", "javiz", "avis"];
    const matchedWakeWord = wakeWords.find(w => input.includes(w));
    
    if (matchedWakeWord) {
      const parts = input.split(matchedWakeWord);
      const command = parts[parts.length - 1]?.trim() || "";

      if (!command && !isFinal) return;

      if (command && isFinal) {
        addLog(`Requesting: "${command}" [Sir Akhil]`, 'success');
        setState(prev => ({ ...prev, isThinking: true, lastCommand: command }));

        // Local Smart Home Control
        if (command.includes('light') || command.includes('लाइट') || command.includes('प्रकाश')) {
          const newState = !(command.includes('off') || command.includes('बंद') || command.includes('निवाओ'));
          setState(prev => ({ ...prev, home: { ...prev.home, lights: newState }, isThinking: false }));
          const response = state.language.startsWith('hi') ? `जी अखिल सर, लाइट ${newState ? 'चालू' : 'बंद'} कर दी है।` : 
                          `As you wish, Sir Akhil. The lights are now ${newState ? 'on' : 'off'}.`;
          speak(response);
          return;
        }

        // Neural AI Processing
        try {
          if (!process.env.API_KEY) throw new Error("Missing API Key");
          
          // Initializing GoogleGenAI with process.env.API_KEY directly inside the call to ensure freshness
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `You are JARVIS from the Iron Man movies. You are serving Sir Akhil. 
            Personality: Sophisticated, polite, slightly dry British wit, extremely intelligent.
            Current Language: ${state.language}. 
            Input from Sir Akhil: "${command}". 
            Respond naturally and stay in character. Keep it brief.`,
          });
          const reply = (response?.text && typeof response.text === 'string')
            ? response.text
            : (response?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Operational, sir.');
          speak(reply);
          addLog(`Jarvis: ${reply}`);
          setState(prev => ({ ...prev, isThinking: false }));
        } catch (error) {
          addLog("Neural connection failure. Check environment configuration.", 'error');
          setState(prev => ({ ...prev, isThinking: false }));
        }
      }
    }
  }, [state.language, state.settings, addLog]);

  useSpeechRecognition(processCommand, state.language);

  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  const handleUnlock = () => {
    setState(prev => ({ ...prev, isLocked: false }));
    addLog("Biometric Match: Sir Akhil. Systems Active.", 'success');
    speak("Welcome back, Sir Akhil. I've taken the liberty of running a full system diagnostic. All protocols are green.");
  };

  const updateSettings = (newSettings: UserSettings) => {
    setState(prev => ({ ...prev, settings: newSettings }));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden text-cyan-400 fixed inset-0 bg-slate-950">
      <TitleBar />
      <div className="flex flex-1 min-h-0">
        {state.isLocked && state.settings.enableFaceDetection && <FaceScanner onAuthenticated={handleUnlock} />}

        <Sidebar activePrinter={state.printer.activePrinter} onOpenSettings={() => setShowSettings(true)} />

        <main className="flex-1 flex flex-col relative min-w-0" style={{ opacity: state.settings.hologramIntensity / 100 }}>
          <header className="p-6 border-b border-cyan-900/50 flex justify-between items-center bg-slate-950/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div className={`h-3 w-3 rounded-full ${state.isLocked ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-cyan-500 animate-pulse shadow-[0_0_10px_#22d3ee]'}`} />
            <h1 className="text-2xl font-orbitron tracking-widest glow-cyan font-black uppercase">Jarvis v4.3 // AKHIL</h1>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-lg border border-cyan-900/30">
            <i className="fa-solid fa-microphone-lines text-cyan-500 animate-pulse"></i>
            <span className="text-[10px] font-orbitron text-slate-500 mr-1 uppercase">User: Akhil</span>
            <select 
              value={state.language} 
              onChange={(e) => setState(prev => ({...prev, language: e.target.value}))}
              className="bg-transparent text-xs font-orbitron outline-none cursor-pointer text-cyan-300 hover:text-white"
            >
              <option value="en-US">ENGLISH</option>
              <option value="hi-IN">HINDI</option>
              <option value="gu-IN">GUJARATI</option>
            </select>
            <button 
              onClick={() => setShowSettings(true)}
              className="ml-4 text-cyan-500 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-gear"></i>
            </button>
          </div>
        </header>

        <HUD state={state} />
        
        <GestureHUD isLocked={state.isLocked} />

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
           {!state.isLocked && <VoiceIndicator isListening={state.isListening} isThinking={state.isThinking} />}
        </div>

        <Terminal logs={state.logs} />

        {showSettings && (
          <SettingsModal 
            settings={state.settings} 
            onUpdate={updateSettings} 
            onClose={() => setShowSettings(false)} 
          />
        )}
        </main>
      </div>
    </div>
  );
};

export default App;
