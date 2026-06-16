export class PolyphonicDSP {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private isListening: boolean = false;
  
  // Expose analyser for canvas visualization
  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }
  
  // Array de frecuencias de notas de guitarra (E2 a E4 y sus armónicos)
  private readonly NOTE_FREQUENCIES: { note: string, freq: number }[] = [
    { note: 'E2', freq: 82.41 }, { note: 'F2', freq: 87.31 }, { note: 'F#2', freq: 92.50 },
    { note: 'G2', freq: 98.00 }, { note: 'G#2', freq: 103.83 }, { note: 'A2', freq: 110.00 },
    { note: 'A#2', freq: 116.54 }, { note: 'B2', freq: 123.47 }, { note: 'C3', freq: 130.81 },
    { note: 'C#3', freq: 138.59 }, { note: 'D3', freq: 146.83 }, { note: 'D#3', freq: 155.56 },
    { note: 'E3', freq: 164.81 }, { note: 'F3', freq: 174.61 }, { note: 'F#3', freq: 185.00 },
    { note: 'G3', freq: 196.00 }, { note: 'G#3', freq: 207.65 }, { note: 'A3', freq: 220.00 },
    { note: 'A#3', freq: 233.08 }, { note: 'B3', freq: 246.94 }, { note: 'C4', freq: 261.63 },
    { note: 'C#4', freq: 277.18 }, { note: 'D4', freq: 293.66 }, { note: 'D#4', freq: 311.13 },
    { note: 'E4', freq: 329.63 }, { note: 'F4', freq: 349.23 }, { note: 'F#4', freq: 369.99 },
    { note: 'G4', freq: 392.00 }, { note: 'G#4', freq: 415.30 }, { note: 'A4', freq: 440.00 },
    { note: 'A#4', freq: 466.16 }, { note: 'B4', freq: 493.88 }, { note: 'C5', freq: 523.25 },
    { note: 'C#5', freq: 554.37 }, { note: 'D5', freq: 587.33 }, { note: 'D#5', freq: 622.25 },
    { note: 'E5', freq: 659.25 }, { note: 'F5', freq: 698.46 }, { note: 'F#5', freq: 739.99 },
    { note: 'G5', freq: 783.99 }, { note: 'G#5', freq: 830.61 }, { note: 'A5', freq: 880.00 },
    { note: 'A#5', freq: 932.33 }, { note: 'B5', freq: 987.77 }, { note: 'C6', freq: 1046.50 }
  ];

  public async startMicrophone(): Promise<void> {
    if (this.isListening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioCtx.createAnalyser();
      
      // FFT Size alto para mayor resolución en frecuencias bajas (esencial para la guitarra)
      this.analyser.fftSize = 16384; 
      this.analyser.smoothingTimeConstant = 0.8;

      this.microphone = this.audioCtx.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);
      
      this.isListening = true;
      console.log("Gritar DSP: Micrófono activado. Escuchando polifonía...");
    } catch (err) {
      console.error("Gritar DSP Error: No se pudo acceder al micrófono.", err);
      throw err;
    }
  }

  public stopMicrophone(): void {
    if (this.microphone) {
      this.microphone.mediaStream.getTracks().forEach(track => track.stop());
      this.microphone.disconnect();
    }
    if (this.audioCtx) {
      this.audioCtx.close();
    }
    this.isListening = false;
  }

  /**
   * Núcleo del algoritmo DSP. Extrae las frecuencias dominantes actuales (picos FFT).
   * Supera a algoritmos básicos identificando múltiples picos simultáneos.
   */
  public analyzeCurrentSpectrum(): { note: string, freq: number, amplitude: number }[] {
    if (!this.analyser || !this.audioCtx) return [];

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    this.analyser.getFloatFrequencyData(dataArray);

    const sampleRate = this.audioCtx.sampleRate;
    const peaks: { bin: number, amplitude: number }[] = [];

    // Calcular el umbral de ruido dinámico (Noise Floor)
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
    const avgNoise = sum / bufferLength;
    const dynamicThreshold = Math.max(-80, avgNoise + 15); // Al menos 15 dB sobre el ruido ambiente

    // 1. Detección de picos (Peak Picking)
    for (let i = 1; i < bufferLength - 1; i++) {
      const amplitude = dataArray[i];
      if (amplitude > dynamicThreshold) { 
        if (amplitude > dataArray[i - 1] && amplitude > dataArray[i + 1]) {
          peaks.push({ bin: i, amplitude });
        }
      }
    }

    // 2. Ordenar por amplitud
    peaks.sort((a, b) => b.amplitude - a.amplitude);
    
    // 3. Supresión de Armónicos (Overtone Suppression)
    // Las cuerdas de guitarra generan armónicos fuertes en múltiplos enteros (x2, x3, x4)
    // Si vemos un pico en 164Hz (E3) y ya tenemos uno muy fuerte en 82Hz (E2), 
    // es probable que el 164Hz sea un armónico, no una nota nueva.
    const filteredPeaks: { bin: number, amplitude: number, freq: number }[] = [];
    const binToFreq = sampleRate / this.analyser!.fftSize;

    for (const peak of peaks) {
      const freq = peak.bin * binToFreq;
      if (freq < 70 || freq > 1000) continue; // Fuera del rango de la guitarra

      let isHarmonic = false;
      for (const fp of filteredPeaks) {
        const ratio = freq / fp.freq;
        const isIntegerMultiple = Math.abs(ratio - Math.round(ratio)) < 0.05;
        // Si la frecuencia es un múltiplo entero (x2, x3, etc.) de una fundamental más fuerte, y su amplitud es menor, lo marcamos como armónico
        if (isIntegerMultiple && peak.amplitude < fp.amplitude + 5) {
          isHarmonic = true;
          break;
        }
      }

      if (!isHarmonic && filteredPeaks.length < 6) { // Máximo 6 cuerdas
        filteredPeaks.push({ bin: peak.bin, amplitude: peak.amplitude, freq });
      }
    }

    // 4. Mapeo de Frecuencias a Notas Musicales
    const detectedNotes = filteredPeaks.map(peak => {
      return {
        note: this.closestNote(peak.freq),
        freq: peak.freq,
        amplitude: peak.amplitude
      };
    });

    // 4. Filtrar duplicados para obtener las notas limpias del acorde
    const uniqueNotes = detectedNotes.filter((val, index, self) =>
      index === self.findIndex((t) => (t.note === val.note))
    );

    return uniqueNotes;
  }

  private closestNote(frequency: number): string {
    let minDiff = Infinity;
    let closest = 'Unknown';
    
    for (const note of this.NOTE_FREQUENCIES) {
      const diff = Math.abs(frequency - note.freq);
      if (diff < minDiff) {
        minDiff = diff;
        closest = note.note;
      }
    }
    
    // Si la frecuencia está muy lejos de una nota de guitarra, la ignoramos
    if (minDiff > 5) return 'Out of Range';
    
    return closest;
  }
}

export const dspEngine = new PolyphonicDSP();
