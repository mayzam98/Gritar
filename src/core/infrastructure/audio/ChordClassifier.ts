export interface ChordFingerprint {
  chordId: string;
  chordName: string;
  features: { note: string; freq?: number; amplitude: number }[];
}

export class ChordClassifier {
  private model: ChordFingerprint[] = [];
  private readonly STORAGE_KEY = 'gritar_dsp_model';

  constructor() {
    this.loadModel();
  }

  /**
   * Guarda una nueva huella de sonido en el modelo
   */
  public train(chordId: string, chordName: string, features: { note: string; freq?: number; amplitude: number }[]): void {
    if (features.length === 0) return;
    
    // Normalizar amplitudes para que no dependa del volumen del micrófono
    const maxAmplitude = Math.max(...features.map(f => f.amplitude));
    
    // Identificar el bajo (la nota con menor frecuencia) para darle mayor peso
    const lowestFreqNote = features.reduce((prev, curr) => (curr.freq !== undefined && prev.freq !== undefined && curr.freq < prev.freq) ? curr : prev, features[0]);

    const normalizedFeatures = features.map(f => ({
      note: f.note,
      amplitude: ((f.amplitude + 100) / (maxAmplitude + 100)) * (f.note === lowestFreqNote?.note ? 2.5 : 1) // 2.5x peso al bajo
    }));

    this.model.push({
      chordId,
      chordName,
      features: normalizedFeatures
    });

    this.saveModel();
  }

  /**
   * Predice el acorde basado en K-Nearest Neighbors (K=1) y Similitud Coseno
   */
  public predict(currentFeatures: { note: string; freq?: number; amplitude: number }[]): { chordName: string, confidence: number } | null {
    if (this.model.length === 0 || currentFeatures.length === 0) return null;

    const maxAmplitude = Math.max(...currentFeatures.map(f => f.amplitude));
    
    // Identificar el bajo en el acorde actual
    const lowestFreqNote = currentFeatures.reduce((prev, curr) => (curr.freq !== undefined && prev.freq !== undefined && curr.freq < prev.freq) ? curr : prev, currentFeatures[0]);

    const normalizedCurrent = currentFeatures.map(f => ({
      note: f.note,
      amplitude: ((f.amplitude + 100) / (maxAmplitude + 100)) * (f.note === lowestFreqNote?.note ? 2.5 : 1)
    }));

    let bestMatch = null;
    let highestSimilarity = -1;

    for (const fingerprint of this.model) {
      const similarity = this.calculateCosineSimilarity(normalizedCurrent, fingerprint.features);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = fingerprint;
      }
    }

    // Si la similitud es muy baja, no estamos seguros
    if (highestSimilarity < 0.3) return null;

    return {
      chordName: bestMatch!.chordName,
      confidence: Math.round(highestSimilarity * 100)
    };
  }

  public getTrainedChordCount(): number {
    const uniqueChords = new Set(this.model.map(m => m.chordId));
    return uniqueChords.size;
  }
  
  public getModelSize(): number {
    return this.model.length;
  }

  public clearModel(): void {
    this.model = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Similitud Coseno adaptada con penalización por notas faltantes (Jaccard híbrido)
   */
  private calculateCosineSimilarity(
    vecA: { note: string; amplitude: number }[],
    vecB: { note: string; amplitude: number }[]
  ): number {
    const allNotes = new Set([...vecA.map(v => v.note), ...vecB.map(v => v.note)]);
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    let missingPenalty = 0;

    for (const note of allNotes) {
      const valA = vecA.find(v => v.note === note)?.amplitude || 0;
      const valB = vecB.find(v => v.note === note)?.amplitude || 0;
      
      dotProduct += valA * valB;
      normA += valA * valA;
      normB += valB * valB;
      
      // Penalizar fuertemente si una nota clave existe en el modelo pero no en lo que tocó el usuario (y viceversa)
      if ((valA > 0.3 && valB === 0) || (valB > 0.3 && valA === 0)) {
        missingPenalty += 0.15; 
      }
    }

    if (normA === 0 || normB === 0) return 0;
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    
    return Math.max(0, similarity - missingPenalty);
  }

  private saveModel(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.model));
    } catch (e) {
      console.error("No se pudo guardar el modelo DSP en LocalStorage", e);
    }
  }

  private loadModel(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.model = JSON.parse(data);
      }
    } catch (e) {
      console.error("Error cargando el modelo DSP", e);
    }
  }
}

export const chordClassifier = new ChordClassifier();
