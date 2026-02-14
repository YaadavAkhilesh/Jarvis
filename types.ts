
export enum ModuleType {
  PRINTER = 'PRINTER',
  SMART_HOME = 'SMART_HOME',
  MOBILE = 'MOBILE',
  SYSTEM = 'SYSTEM'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface PrinterState {
  isOnline: boolean;
  activePrinter: string;
  queue: string[];
}

export interface SmartHomeState {
  lights: boolean;
  fan: boolean;
  ac: boolean;
  bedroom: boolean;
}

export interface UserSettings {
  enableFaceDetection: boolean;
  fastResponseMode: boolean;
  ultraSensitiveVoice: boolean;
  hologramIntensity: number;
}

export interface AppState {
  isListening: boolean;
  isThinking: boolean;
  isLocked: boolean;
  language: string;
  lastCommand: string;
  logs: LogEntry[];
  printer: PrinterState;
  home: SmartHomeState;
  settings: UserSettings;
}
