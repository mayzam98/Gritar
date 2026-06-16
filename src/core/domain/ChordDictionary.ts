import type { Position } from './Exercise';

export interface ChordDefinition {
  id: string;
  name: string;
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  positions: Position[];
  unlocked?: boolean;
}

export const CORE_CHORDS: ChordDefinition[] = [
  // Acordes Mayores (Básicos)
  { id: 'c', name: 'Do Mayor (C)', level: 'Básico', unlocked: true, positions: [{ string: 5, fret: 3, finger: 3 }, { string: 4, fret: 2, finger: 2 }, { string: 2, fret: 1, finger: 1 }] },
  { id: 'd', name: 'Re Mayor (D)', level: 'Básico', unlocked: true, positions: [{ string: 3, fret: 2, finger: 1 }, { string: 1, fret: 2, finger: 2 }, { string: 2, fret: 3, finger: 3 }] },
  { id: 'e', name: 'Mi Mayor (E)', level: 'Básico', unlocked: true, positions: [{ string: 5, fret: 2, finger: 2 }, { string: 4, fret: 2, finger: 3 }, { string: 3, fret: 1, finger: 1 }] },
  { id: 'f', name: 'Fa Mayor (F)', level: 'Intermedio', unlocked: true, positions: [{ string: 6, fret: 1, finger: 1 }, { string: 5, fret: 3, finger: 3 }, { string: 4, fret: 3, finger: 4 }, { string: 3, fret: 2, finger: 2 }, { string: 2, fret: 1, finger: 1 }, { string: 1, fret: 1, finger: 1 }] },
  { id: 'g', name: 'Sol Mayor (G)', level: 'Básico', unlocked: true, positions: [{ string: 6, fret: 3, finger: 3 }, { string: 5, fret: 2, finger: 2 }, { string: 1, fret: 3, finger: 4 }] },
  { id: 'a', name: 'La Mayor (A)', level: 'Básico', unlocked: true, positions: [{ string: 4, fret: 2, finger: 1 }, { string: 3, fret: 2, finger: 2 }, { string: 2, fret: 2, finger: 3 }] },
  
  // Acordes Menores (Básicos)
  { id: 'dm', name: 'Re Menor (Dm)', level: 'Básico', unlocked: true, positions: [{ string: 3, fret: 2, finger: 2 }, { string: 1, fret: 1, finger: 1 }, { string: 2, fret: 3, finger: 3 }] },
  { id: 'em', name: 'Mi Menor (Em)', level: 'Básico', unlocked: true, positions: [{ string: 5, fret: 2, finger: 2 }, { string: 4, fret: 2, finger: 3 }] },
  { id: 'am', name: 'La Menor (Am)', level: 'Básico', unlocked: true, positions: [{ string: 4, fret: 2, finger: 2 }, { string: 3, fret: 2, finger: 3 }, { string: 2, fret: 1, finger: 1 }] },
  { id: 'bm', name: 'Si Menor (Bm)', level: 'Intermedio', unlocked: true, positions: [{ string: 5, fret: 2, finger: 1 }, { string: 4, fret: 4, finger: 3 }, { string: 3, fret: 4, finger: 4 }, { string: 2, fret: 3, finger: 2 }, { string: 1, fret: 2, finger: 1 }] },
  
  // Acordes Séptima (Intermedios)
  { id: 'c7', name: 'Do Séptima (C7)', level: 'Intermedio', unlocked: true, positions: [{ string: 5, fret: 3, finger: 3 }, { string: 4, fret: 2, finger: 2 }, { string: 3, fret: 3, finger: 4 }, { string: 2, fret: 1, finger: 1 }] },
  { id: 'd7', name: 'Re Séptima (D7)', level: 'Intermedio', unlocked: true, positions: [{ string: 3, fret: 2, finger: 2 }, { string: 2, fret: 1, finger: 1 }, { string: 1, fret: 2, finger: 3 }] },
  { id: 'e7', name: 'Mi Séptima (E7)', level: 'Intermedio', unlocked: true, positions: [{ string: 5, fret: 2, finger: 2 }, { string: 3, fret: 1, finger: 1 }] },
  { id: 'g7', name: 'Sol Séptima (G7)', level: 'Intermedio', unlocked: true, positions: [{ string: 6, fret: 3, finger: 3 }, { string: 5, fret: 2, finger: 2 }, { string: 1, fret: 1, finger: 1 }] },
  { id: 'a7', name: 'La Séptima (A7)', level: 'Intermedio', unlocked: true, positions: [{ string: 4, fret: 2, finger: 2 }, { string: 2, fret: 2, finger: 3 }] },
  { id: 'b7', name: 'Si Séptima (B7)', level: 'Intermedio', unlocked: true, positions: [{ string: 5, fret: 2, finger: 2 }, { string: 4, fret: 1, finger: 1 }, { string: 3, fret: 2, finger: 3 }, { string: 1, fret: 2, finger: 4 }] },
  
  // Acordes Extendidos y Cejillas (Avanzados)
  { id: 'f_sharp_m', name: 'Fa# Menor (F#m)', level: 'Avanzado', unlocked: true, positions: [{ string: 6, fret: 2, finger: 1 }, { string: 5, fret: 4, finger: 3 }, { string: 4, fret: 4, finger: 4 }, { string: 3, fret: 2, finger: 1 }, { string: 2, fret: 2, finger: 1 }, { string: 1, fret: 2, finger: 1 }] },
  { id: 'c_sharp_m', name: 'Do# Menor (C#m)', level: 'Avanzado', unlocked: true, positions: [{ string: 5, fret: 4, finger: 1 }, { string: 4, fret: 6, finger: 3 }, { string: 3, fret: 6, finger: 4 }, { string: 2, fret: 5, finger: 2 }, { string: 1, fret: 4, finger: 1 }] },
  { id: 'cmaj7', name: 'Do Mayor Séptima (Cmaj7)', level: 'Avanzado', unlocked: true, positions: [{ string: 5, fret: 3, finger: 3 }, { string: 4, fret: 2, finger: 2 }] },
  { id: 'amaj7', name: 'La Mayor Séptima (Amaj7)', level: 'Avanzado', unlocked: true, positions: [{ string: 4, fret: 2, finger: 2 }, { string: 3, fret: 1, finger: 1 }, { string: 2, fret: 2, finger: 3 }] },
];
