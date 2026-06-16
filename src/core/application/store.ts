import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface SavedSong {
  id: string;
  url: string;
  title: string; // Since we don't fetch YT titles yet, user can name it, or we use a generic name
  chords: string[];
  chordTimestamps: any[];
  chordDetails?: any[];
  strumming: string;
  summary: string[];
  createdAt: number;
}

export interface Discovery {
  id: string;
  type: 'chord' | 'scale' | 'technique' | 'strumming' | 'other';
  title: string;
  notes: string;
  positions?: any[]; // added positions
  tags?: string[];
  createdAt: number;
}

export interface Composition {
  id: string;
  title: string;
  description: string;
  bpm: number;
  timeSignature: string;
  discoveries: Discovery[];
  createdAt: number;
  updatedAt: number;
}

interface AppState {
  savedSongs: SavedSong[];
  saveSong: (song: Omit<SavedSong, 'id' | 'createdAt'>) => void;
  deleteSong: (id: string) => void;

  compositions: Composition[];
  addComposition: (comp: Omit<Composition, 'id' | 'createdAt' | 'updatedAt' | 'discoveries'>) => void;
  updateComposition: (id: string, comp: Partial<Composition>) => void;
  deleteComposition: (id: string) => void;
  
  addDiscoveryToComposition: (compId: string, discovery: Omit<Discovery, 'id' | 'createdAt'>) => void;
  deleteDiscoveryFromComposition: (compId: string, discoveryId: string) => void;
  updateDiscoveryInComposition: (compId: string, discoveryId: string, discovery: Partial<Discovery>) => void;

  // Standalone discoveries
  discoveries: Discovery[];
  addDiscovery: (discovery: Omit<Discovery, 'id' | 'createdAt'>) => void;
  deleteDiscovery: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      savedSongs: [],
      saveSong: (song) => set((state) => ({
        savedSongs: [...state.savedSongs, { ...song, id: uuidv4(), createdAt: Date.now() }]
      })),
      deleteSong: (id) => set((state) => ({
        savedSongs: state.savedSongs.filter((s) => s.id !== id)
      })),

      compositions: [],
      addComposition: (comp) => set((state) => ({
        compositions: [...state.compositions, { ...comp, id: uuidv4(), createdAt: Date.now(), updatedAt: Date.now(), discoveries: [] }]
      })),
      updateComposition: (id, updates) => set((state) => ({
        compositions: state.compositions.map((c) => c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c)
      })),
      deleteComposition: (id) => set((state) => ({
        compositions: state.compositions.filter(c => c.id !== id)
      })),

      addDiscoveryToComposition: (compId, discovery) => set((state) => ({
        compositions: state.compositions.map((c) => 
          c.id === compId 
            ? { ...c, discoveries: [...c.discoveries, { ...discovery, id: uuidv4(), createdAt: Date.now() }], updatedAt: Date.now() }
            : c
        )
      })),
      deleteDiscoveryFromComposition: (compId, discoveryId) => set((state) => ({
        compositions: state.compositions.map((c) => 
          c.id === compId 
            ? { ...c, discoveries: c.discoveries.filter(d => d.id !== discoveryId), updatedAt: Date.now() }
            : c
        )
      })),
      updateDiscoveryInComposition: (compId, discoveryId, updates) => set((state) => ({
        compositions: state.compositions.map((c) => 
          c.id === compId 
            ? { ...c, discoveries: c.discoveries.map(d => d.id === discoveryId ? { ...d, ...updates } : d), updatedAt: Date.now() }
            : c
        )
      })),

      discoveries: [],
      addDiscovery: (discovery) => set((state) => ({
        discoveries: [{ ...discovery, id: uuidv4(), createdAt: Date.now() }, ...state.discoveries]
      })),
      deleteDiscovery: (id) => set((state) => ({
        discoveries: state.discoveries.filter(d => d.id !== id)
      }))
    }),
    {
      name: 'gritar-storage',
    }
  )
);
