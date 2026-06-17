import type { Position } from './Exercise';

import { CORE_CHORDS } from './ChordDictionary';

export function analyzeChord(userPositions: Position[]): { closestChord: string, matchPercentage: number, message: string, tags: string[] } | null {
  if (userPositions.length === 0) return null;

  let bestMatch: any = null;
  let lowestDistance = Infinity;
  let highestMatchCount = -1;

  for (const chord of CORE_CHORDS) {
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

  let tags: string[] = [];
  
  if (userPositions.length >= 4) {
    tags.push("Acorde Complejo");
  }
  
  const span = Math.max(...userPositions.map(p => p.fret)) - Math.min(...userPositions.map(p => p.fret));
  if (span >= 3) {
    tags.push("Estiramiento");
  }

  if (matchPercentage === 100) {
    tags.push("Perfecto");
  } else if (matchPercentage <= 50) {
    tags.push("Disonante");
    tags.push("Experimental");
  } else {
    tags.push("Variación");
  }

  return {
    closestChord: bestMatch.name,
    matchPercentage,
    message,
    tags
  };
}
