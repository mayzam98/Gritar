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

  // Find fingers in both chords
  const fingersA = new Map(chordA.filter(p => p.finger).map(p => [p.finger!, p]));
  const fingersB = new Map(chordB.filter(p => p.finger).map(p => [p.finger!, p]));

  // 1. Identify Anchor fingers (common fingers that don't move)
  for (const [finger, posA] of fingersA) {
    if (fingersB.has(finger)) {
      const posB = fingersB.get(finger)!;
      if (posA.string === posB.string && posA.fret === posB.fret) {
        commonFingers.push(finger);
        steps.push({
          finger,
          fromString: posA.string,
          fromFret: posA.fret,
          toString: posB.string,
          toFret: posB.fret,
          distance: 0,
          instruction: `Mantén el dedo ${finger} fijo como pivote (ancla).`
        });
      } else {
        // Finger moves
        const distance = Math.abs(posA.string - posB.string) + Math.abs(posA.fret - posB.fret);
        totalDistance += distance;
        steps.push({
          finger,
          fromString: posA.string,
          fromFret: posA.fret,
          toString: posB.string,
          toFret: posB.fret,
          distance,
          instruction: `Mueve el dedo ${finger} de la cuerda ${posA.string}/traste ${posA.fret} a la cuerda ${posB.string}/traste ${posB.fret}.`
        });
      }
    } else {
      // Finger is lifted
      steps.push({
        finger,
        fromString: posA.string,
        fromFret: posA.fret,
        toString: 0,
        toFret: 0,
        distance: 1,
        instruction: `Levanta el dedo ${finger}.`
      });
      totalDistance += 1;
    }
  }

  // Identify new fingers placed
  for (const [finger, posB] of fingersB) {
    if (!fingersA.has(finger)) {
      steps.push({
        finger,
        fromString: 0,
        fromFret: 0,
        toString: posB.string,
        toFret: posB.fret,
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
