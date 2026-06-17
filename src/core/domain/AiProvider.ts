export interface AiAnalysisResult {
  chords: string[];
  chordTimestamps: { chord: string; timeSeconds: number }[];
  chordDetails?: { 
    chord: string; 
    startFret: number; 
    positions: { string: number; fret: number; finger?: number }[] 
  }[];
  strumming: string | string[]; // Legacy
  strummingPatterns?: { name: string; pattern: string[] }[]; // New multi-pattern format
  summary: string[];
}

export interface AiProvider {
  analyzeTutorial(transcript: string): Promise<AiAnalysisResult>;
}

export enum AiProviderType {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  DEEPSEEK = 'deepseek'
}
