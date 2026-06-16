export interface Position {
  string: number; // 1 (highest E) to 6 (lowest E)
  fret: number;
  finger?: number; // 1 (index), 2 (middle), 3 (ring), 4 (pinky)
  color?: string; // Optional custom color
}

export type HandCategory = 'LEFT_HAND' | 'RIGHT_HAND' | 'BOTH';

export class Exercise {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly category: HandCategory,
    public readonly durationInSeconds: number,
    public readonly defaultBPM: number,
    public readonly imageUrl: string,
    public readonly instructions: string[],
    public readonly fretboardData?: Position[] // Positional data for dynamic rendering
  ) {}
}
