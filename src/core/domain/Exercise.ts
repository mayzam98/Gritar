export interface Position {
  string: number; // 1 (highest E) to 6 (lowest E)
  fret: number;
  finger?: number; // 1 (index), 2 (middle), 3 (ring), 4 (pinky)
  color?: string; // Optional custom color
  id?: string; // Persistent ID for animations across chords
}

export type HandCategory = 'LEFT_HAND' | 'RIGHT_HAND' | 'BOTH';

export class Exercise {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly category: HandCategory;
  public readonly durationInSeconds: number;
  public readonly defaultBPM: number;
  public readonly targetBPM: number;
  public readonly imageUrl: string;
  public readonly instructions: string[];
  public readonly fretboardData?: Position[];
  public readonly sequence?: Position[][];
  public readonly strummingPattern?: string[];

  constructor(
    id: string,
    name: string,
    description: string,
    category: HandCategory,
    durationInSeconds: number,
    defaultBPM: number,
    targetBPM: number,
    imageUrl: string,
    instructions: string[],
    fretboardData?: Position[],
    sequence?: Position[][],
    strummingPattern?: string[]
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.category = category;
    this.durationInSeconds = durationInSeconds;
    this.defaultBPM = defaultBPM;
    this.targetBPM = targetBPM;
    this.imageUrl = imageUrl;
    this.instructions = instructions;
    this.fretboardData = fretboardData;
    this.sequence = sequence;
    this.strummingPattern = strummingPattern;
  }
}
