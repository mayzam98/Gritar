import { Soundfont } from 'smplr';

export class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private instrument: any = null;
  private isLoaded: boolean = false;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (!this.instrument) {
      // Usamos smplr para cargar samples de audio real de guitarra acústica (Soundfont)
      this.instrument = new Soundfont(this.audioCtx, {
        instrument: 'acoustic_guitar_steel',
      });
      this.instrument.load.then(() => {
        this.isLoaded = true;
      });
    }
  }

  // Notas MIDI base de cada cuerda (Afinación Estándar)
  // 6: Mi grave (E2) = 40
  // 5: La (A2) = 45
  // 4: Re (D3) = 50
  // 3: Sol (G3) = 55
  // 2: Si (B3) = 59
  // 1: Mi agudo (E4) = 64
  private stringBaseMidi = [40, 45, 50, 55, 59, 64];

  private getMidiNote(stringNum: number, fret: number): number {
    // stringNum va de 1 a 6 (1 es la aguda, 6 es la grave)
    const baseMidi = this.stringBaseMidi[6 - stringNum];
    return baseMidi + fret;
  }

  public playNote(stringNum: number, fret: number, timeOffset: number = 0) {
    this.init();
    
    // Si los samples no han cargado aún, no intentamos reproducir
    if (!this.isLoaded || !this.instrument || !this.audioCtx) return;

    const midiNote = this.getMidiNote(stringNum, fret);
    
    // Reproducimos la nota pregrabada (Sample)
    this.instrument.start({
      note: midiNote,
      time: this.audioCtx.currentTime + timeOffset,
      velocity: 80, // Volumen/Fuerza del rasgueo
      duration: 3 // Segundos de resonancia
    });
  }

  public playChord(positions: {string: number, fret: number}[]) {
    this.init();
    // Ordenamos de cuerda 6 a cuerda 1 para simular rasgueo hacia abajo
    const sortedPositions = [...positions].sort((a, b) => b.string - a.string);
    
    sortedPositions.forEach((pos, idx) => {
      // 0.04 segundos de separación entre cada cuerda
      this.playNote(pos.string, pos.fret, idx * 0.04);
    });
  }
}

export const audioEngine = new AudioEngine();
