export class BPMRecord {
  constructor(
    public readonly exerciseId: string,
    public readonly bpm: number,
    public readonly date: Date
  ) {
    if (bpm <= 0 || bpm > 400) {
      throw new Error('El BPM debe estar en un rango realista (1-400).');
    }
  }
}
