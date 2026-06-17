export interface ChordFingerprint {
  chordId: string;
  chordName: string;
  vector: Record<string, number>;
  magnitude: number;
}

export class ChordClassifier {
  private model: ChordFingerprint[] = [];
  private readonly STORAGE_KEY = 'gritar_dsp_model';

  constructor() {
    this.loadModel();
  }

  public train(chordId: string, chordName: string, features: { note: string; freq?: number; amplitude: number }[]): void {
    if (features.length === 0) return;
    
    const maxAmplitude = Math.max(...features.map(f => f.amplitude));
    const lowestFreqNote = features.reduce((prev, curr) => (curr.freq !== undefined && prev.freq !== undefined && curr.freq < prev.freq) ? curr : prev, features[0]);

    const vector: Record<string, number> = {};
    let sumSquares = 0;

    features.forEach(f => {
      const normalizedAmp = ((f.amplitude + 100) / (maxAmplitude + 100)) * (f.note === lowestFreqNote?.note ? 2.5 : 1);
      vector[f.note] = normalizedAmp;
      sumSquares += normalizedAmp * normalizedAmp;
    });

    this.model.push({
      chordId,
      chordName,
      vector,
      magnitude: Math.sqrt(sumSquares)
    });

    this.saveModel();
  }

  public predict(currentFeatures: { note: string; freq?: number; amplitude: number }[]): { chordName: string, confidence: number } | null {
    if (this.model.length === 0 || currentFeatures.length === 0) return null;

    // Squelch Dinámico: Filtro de silencio absoluto (RMS o energía total)
    let totalEnergy = 0;
    currentFeatures.forEach(f => totalEnergy += Math.max(0, f.amplitude + 100)); // +100 para volver positivos los dB
    if (totalEnergy < 50) return null; // Umbral de energía mínima para evitar procesar siseos

    const maxAmplitude = Math.max(...currentFeatures.map(f => f.amplitude));
    const lowestFreqNote = currentFeatures.reduce((prev, curr) => (curr.freq !== undefined && prev.freq !== undefined && curr.freq < prev.freq) ? curr : prev, currentFeatures[0]);

    const currentVector: Record<string, number> = {};
    let currentSumSquares = 0;

    currentFeatures.forEach(f => {
      const normalizedAmp = ((f.amplitude + 100) / (maxAmplitude + 100)) * (f.note === lowestFreqNote?.note ? 2.5 : 1);
      currentVector[f.note] = normalizedAmp;
      currentSumSquares += normalizedAmp * normalizedAmp;
    });

    const currentMagnitude = Math.sqrt(currentSumSquares);
    if (currentMagnitude === 0) return null;

    const similarities = this.model.map(fingerprint => {
      let dotProduct = 0;
      let missingPenalty = 0;
      
      const allNotes = new Set([...Object.keys(currentVector), ...Object.keys(fingerprint.vector)]);
      for (const note of allNotes) {
        const valA = currentVector[note] || 0;
        const valB = fingerprint.vector[note] || 0;
        dotProduct += valA * valB;
        
        if ((valA > 0.3 && valB === 0) || (valB > 0.3 && valA === 0)) {
          missingPenalty += 0.15;
        }
      }
      
      const rawSimilarity = dotProduct / (currentMagnitude * fingerprint.magnitude);
      return {
        chordName: fingerprint.chordName,
        similarity: Math.max(0, rawSimilarity - missingPenalty)
      };
    });

    similarities.sort((a, b) => b.similarity - a.similarity);
    const kNearest = similarities.slice(0, 3);
    
    // Votación simple de los top K=3
    const votes: Record<string, number> = {};
    for (const match of kNearest) {
      votes[match.chordName] = (votes[match.chordName] || 0) + match.similarity;
    }

    const bestChord = Object.keys(votes).reduce((a, b) => votes[a] > votes[b] ? a : b);
    const highestConfidence = kNearest.find(k => k.chordName === bestChord)?.similarity || 0;

    // Umbral de Confianza Estricto (Squelch Dinámico)
    // Evita falsos positivos. Si no se parece en un 70%, es ruido.
    if (highestConfidence < 0.70) return null;

    return {
      chordName: bestChord,
      confidence: Math.round(highestConfidence * 100)
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
        const parsed = JSON.parse(data);
        // Compatibilidad hacia atrás si la base de datos era array de objetos old style
        this.model = parsed.map((item: any) => {
          if (item.vector && item.magnitude) return item; // Ya optimizado
          
          const vector: Record<string, number> = {};
          let sumSquares = 0;
          if (item.features) {
            item.features.forEach((f: any) => {
              vector[f.note] = f.amplitude;
              sumSquares += f.amplitude * f.amplitude;
            });
          }
          return {
            chordId: item.chordId,
            chordName: item.chordName,
            vector,
            magnitude: Math.sqrt(sumSquares)
          };
        });
      }
    } catch (e) {
      console.error("Error cargando el modelo DSP", e);
    }
  }
}

export const chordClassifier = new ChordClassifier();
