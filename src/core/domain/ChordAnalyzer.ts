import type { Position } from './Exercise';

export interface KnownChord {
  name: string;
  positions: Position[];
}

const KNOWN_CHORDS: KnownChord[] = [
  {
    name: 'Do Mayor (C)',
    positions: [
      { string: 5, fret: 3 },
      { string: 4, fret: 2 },
      { string: 2, fret: 1 }
    ]
  },
  {
    name: 'Re Mayor (D)',
    positions: [
      { string: 3, fret: 2 },
      { string: 2, fret: 3 },
      { string: 1, fret: 2 }
    ]
  },
  {
    name: 'Mi Mayor (E)',
    positions: [
      { string: 5, fret: 2 },
      { string: 4, fret: 2 },
      { string: 3, fret: 1 }
    ]
  },
  {
    name: 'Sol Mayor (G)',
    positions: [
      { string: 6, fret: 3 },
      { string: 5, fret: 2 },
      { string: 1, fret: 3 }
    ]
  },
  {
    name: 'La Mayor (A)',
    positions: [
      { string: 4, fret: 2 },
      { string: 3, fret: 2 },
      { string: 2, fret: 2 }
    ]
  },
  {
    name: 'La Menor (Am)',
    positions: [
      { string: 4, fret: 2 },
      { string: 3, fret: 2 },
      { string: 2, fret: 1 }
    ]
  },
  {
    name: 'Mi Menor (Em)',
    positions: [
      { string: 5, fret: 2 },
      { string: 4, fret: 2 }
    ]
  },
  {
    name: 'Re Menor (Dm)',
    positions: [
      { string: 3, fret: 2 },
      { string: 2, fret: 3 },
      { string: 1, fret: 1 }
    ]
  },
  {
    name: 'Fa Mayor (F)',
    positions: [
      { string: 4, fret: 3 },
      { string: 3, fret: 2 },
      { string: 2, fret: 1 },
      { string: 1, fret: 1 }
    ]
  }
];

export function analyzeChord(userPositions: Position[]): { closestChord: string, matchPercentage: number, message: string } | null {
  if (userPositions.length === 0) return null;

  let bestMatch: KnownChord | null = null;
  let lowestDistance = Infinity;
  let highestMatchCount = -1;

  for (const chord of KNOWN_CHORDS) {
    let distance = 0;
    let matchCount = 0;

    // To compare, we look at the strings the user is playing vs the chord.
    // A more advanced algorithm would map to notes, but we'll use positional distance for now.
    
    const userMap = new Map(userPositions.map(p => [p.string, p.fret]));
    const chordMap = new Map(chord.positions.map(p => [p.string, p.fret]));

    // Check strings present in the chord
    for (const [str, fret] of chordMap.entries()) {
      if (userMap.has(str)) {
        const uFret = userMap.get(str)!;
        if (uFret === fret) {
          matchCount++;
        } else {
          distance += Math.abs(uFret - fret);
        }
      } else {
        // Missing a string that the chord needs
        distance += 2; // penalty
      }
    }

    // Check strings the user is playing that the chord doesn't need
    for (const [str, fret] of userMap.entries()) {
      if (!chordMap.has(str)) {
        // User is playing an extra string
        distance += 3; // heavier penalty for wrong strings
      }
    }

    if (distance < lowestDistance || (distance === lowestDistance && matchCount > highestMatchCount)) {
      lowestDistance = distance;
      highestMatchCount = matchCount;
      bestMatch = chord;
    }
  }

  if (!bestMatch) return null;

  let matchPercentage = 0;
  if (lowestDistance === 0) {
    matchPercentage = 100;
  } else if (lowestDistance <= 2) {
    matchPercentage = 80;
  } else if (lowestDistance <= 4) {
    matchPercentage = 50;
  } else {
    matchPercentage = 20;
  }

  let message = "";
  if (matchPercentage === 100) {
    message = `¡Perfecto! Has descubierto exactamente cómo se toca ${bestMatch.name}.`;
  } else if (matchPercentage >= 80) {
    message = `Estás muy cerca de tocar ${bestMatch.name}. Te falta corregir un solo dedo.`;
  } else if (matchPercentage >= 50) {
    message = `Tu creación se parece vagamente a ${bestMatch.name}, pero tiene notas bastante distintas. ¡Sigue experimentando!`;
  } else {
    message = `Esta es una forma muy única. Su estructura base se aleja de los acordes tradicionales, pero recuerda más o menos a un ${bestMatch.name}.`;
  }

  return {
    closestChord: bestMatch.name,
    matchPercentage,
    message
  };
}
