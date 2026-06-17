import type { Position } from './Exercise';

export interface TransitionStep {
  finger: number;
  fromString: number;
  fromFret: number;
  toString: number;
  toFret: number;
  distance: number;
  instruction: string;
}

export interface TransitionAnalysis {
  difficultyScore: number;
  steps: TransitionStep[];
  commonFingers: number[];
  recommendation: string;
}

export function analyzeTransition(chordA: Position[], chordB: Position[]): TransitionAnalysis {
  const steps: TransitionStep[] = [];
  const commonFingers: number[] = [];
  let totalDistance = 0;

  // Group fingers by finger number
  const getFingers = (chord: Position[]) => {
    const map = new Map<number, Position[]>();
    chord.forEach(p => {
      if (p.finger) {
        if (!map.has(p.finger)) map.set(p.finger, []);
        map.get(p.finger)!.push(p);
      }
    });
    return map;
  };

  const fingersA = getFingers(chordA);
  const fingersB = getFingers(chordB);
  
  const allFingerNumbers = new Set([...fingersA.keys(), ...fingersB.keys()]);

  for (const finger of allFingerNumbers) {
    let listA = fingersA.get(finger) || [];
    let listB = fingersB.get(finger) || [];
    
    // Greedy matching for fingers with the same number (essential for barre chords)
    while (listA.length > 0 && listB.length > 0) {
      let bestPair = { a: 0, b: 0, dist: Infinity };
      
      for (let i = 0; i < listA.length; i++) {
        for (let j = 0; j < listB.length; j++) {
          const dist = Math.abs(listA[i].string - listB[j].string) + Math.abs(listA[i].fret - listB[j].fret);
          if (dist < bestPair.dist) {
            bestPair = { a: i, b: j, dist };
          }
        }
      }
      
      const posA = listA[bestPair.a];
      const posB = listB[bestPair.b];
      
      if (bestPair.dist === 0) {
        commonFingers.push(finger);
        steps.push({
          finger,
          fromString: posA.string, fromFret: posA.fret,
          toString: posB.string, toFret: posB.fret,
          distance: 0,
          instruction: `Mantén el dedo ${finger} fijo en la cuerda ${posA.string}/traste ${posA.fret} (ancla).`
        });
      } else {
        totalDistance += bestPair.dist;
        steps.push({
          finger,
          fromString: posA.string, fromFret: posA.fret,
          toString: posB.string, toFret: posB.fret,
          distance: bestPair.dist,
          instruction: `Mueve el dedo ${finger} de la cuerda ${posA.string}/traste ${posA.fret} a la cuerda ${posB.string}/traste ${posB.fret}.`
        });
      }
      
      // Remove the matched items
      listA = listA.filter((_, idx) => idx !== bestPair.a);
      listB = listB.filter((_, idx) => idx !== bestPair.b);
    }
    
    // Any remaining in A are lifted
    for (const posA of listA) {
      steps.push({
        finger,
        fromString: posA.string, fromFret: posA.fret,
        toString: 0, toFret: 0,
        distance: 1,
        instruction: `Levanta el dedo ${finger} de la cuerda ${posA.string}.`
      });
      totalDistance += 1;
    }
    
    // Any remaining in B are newly placed
    for (const posB of listB) {
      steps.push({
        finger,
        fromString: 0, fromFret: 0,
        toString: posB.string, toFret: posB.fret,
        distance: 1,
        instruction: `Coloca el dedo ${finger} en la cuerda ${posB.string}/traste ${posB.fret}.`
      });
      totalDistance += 1;
    }
  }

  // Sort steps by distance (anchors first)
  steps.sort((a, b) => a.distance - b.distance);

  let recommendation = '';
  if (commonFingers.length > 0) {
    recommendation = 'Aprovecha los dedos ancla para hacer la transición más estable.';
  } else if (totalDistance > 5) {
    recommendation = 'Esta es una transición con salto grande. Levanta la mano ligeramente y visualiza la forma antes de caer.';
  } else {
    recommendation = 'Intenta mover todos los dedos al mismo tiempo en bloque.';
  }

  return {
    difficultyScore: totalDistance,
    steps,
    commonFingers,
    recommendation
  };
}
