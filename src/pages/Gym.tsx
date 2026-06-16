import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Star, Lock } from 'lucide-react';
import FretboardVisualizer from '../components/ui/FretboardVisualizer';
import type { Position } from '../core/domain/Exercise';
import { Link } from 'react-router-dom';
import { CORE_CHORDS } from '../core/domain/ChordDictionary';
import { audioEngine } from '../core/infrastructure/audio/AudioEngine';
import { dspEngine } from '../core/infrastructure/audio/PolyphonicDSP';
import { Volume2, Mic, Activity } from 'lucide-react';

const Gym: React.FC = () => {
  const chords = CORE_CHORDS;
  const [isListening, setIsListening] = React.useState(false);
  const [detectedNotes, setDetectedNotes] = React.useState<{note: string, freq: number, amplitude: number}[]>([]);
  const animationRef = React.useRef<number>();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const toggleDSP = async () => {
    if (isListening) {
      dspEngine.stopMicrophone();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setIsListening(false);
      setDetectedNotes([]);
    } else {
      try {
        await dspEngine.startMicrophone();
        setIsListening(true);
        const analyzeLoop = () => {
          const notes = dspEngine.analyzeCurrentSpectrum();
          setDetectedNotes(notes);

          // Draw spectrum
          const analyser = dspEngine.getAnalyser();
          if (analyser && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const bufferLength = analyser.frequencyBinCount;
              const dataArray = new Uint8Array(bufferLength);
              analyser.getByteFrequencyData(dataArray);

              ctx.clearRect(0, 0, canvas.width, canvas.height);
              
              // Draw mirrored spectrum (center out)
              const barWidth = (canvas.width / 200);
              let x = 0;
              const centerY = canvas.height / 2;

              for (let i = 0; i < 200; i++) {
                const barHeight = (dataArray[i] / 255) * (canvas.height / 2);
                
                // Neon glow effect for higher amplitudes
                ctx.fillStyle = dataArray[i] > 180 ? '#34d399' : '#059669';
                
                // Draw top half
                ctx.fillRect(x, centerY - barHeight, barWidth, barHeight);
                // Draw bottom half
                ctx.fillRect(x, centerY, barWidth, barHeight);
                
                x += barWidth + 1;
              }
            }
          }

          animationRef.current = requestAnimationFrame(analyzeLoop);
        };
        analyzeLoop();
      } catch (err) {
        alert("No se pudo acceder al micrófono.");
      }
    }
  };

  React.useEffect(() => {
    return () => {
      if (isListening) {
        dspEngine.stopMicrophone();
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <header className="page-header">
        <h1 className="page-title">Gimnasio de Acordes</h1>
        <p className="page-subtitle">Aprende y memoriza nuevas posiciones</p>
      </header>

      <div style={{ padding: '0 20px' }}>
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '50%' }}>
              <Dumbbell color="#22c55e" size={24} />
            </div>
            <div>
              <h2 className="card-title" style={{ margin: 0 }}>Tu Progreso</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>{chords.length} acordes en librería</p>
            </div>
          </div>
          <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '100%', backgroundColor: '#22c55e', borderRadius: '4px' }}></div>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
          <Link to="/transiciones" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
            Practicar Transiciones
          </Link>
          <Link to="/fisico" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
            Ejercicios Físicos
          </Link>
        </div>

        {/* DSP Engine Panel */}
        <div className="card" style={{ marginTop: '24px', border: isListening ? '1px solid #10b981' : '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: isListening ? '#10b981' : 'var(--text-primary)' }}>
              <Activity size={20} />
              Motor DSP Analítico
            </h4>
            <button 
              onClick={toggleDSP}
              style={{
                backgroundColor: isListening ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                color: isListening ? '#10b981' : '#60a5fa',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Mic size={16} />
              {isListening ? 'Detener Análisis' : 'Activar Micrófono'}
            </button>
          </div>
          
          <div style={{ 
            backgroundColor: '#0f172a', 
            padding: '16px', 
            borderRadius: '8px', 
            fontFamily: 'monospace', 
            minHeight: '100px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {!isListening ? (
              <div style={{ color: '#64748b', textAlign: 'center', marginTop: '24px' }}>
                El DSP está apagado. Actívalo y toca tu guitarra.
              </div>
            ) : (
              <>
                <div style={{ color: '#10b981', fontSize: '0.8rem', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>STATUS: ESCUCHANDO_POLIFONIA</span>
                  <span>PEAKS: {detectedNotes.length}</span>
                </div>
                
                <canvas 
                  ref={canvasRef} 
                  width={300} 
                  height={60} 
                  style={{ width: '100%', height: '60px', marginBottom: '12px', opacity: 0.8, borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.3)' }} 
                />

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {detectedNotes.length === 0 && (
                    <span style={{ color: '#475569' }}>Silencio detectado...</span>
                  )}
                  {detectedNotes.map((n, i) => (
                    <div key={i} style={{ 
                      backgroundColor: `rgba(16, 185, 129, ${Math.max(0.2, (n.amplitude + 100) / 100)})`,
                      border: '1px solid #10b981',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      color: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{n.note.replace(/[0-9]/g, '')}</span>
                      <span style={{ fontSize: '0.6rem', color: '#a7f3d0' }}>{n.freq.toFixed(1)}Hz</span>
                    </div>
                  ))}
                </div>
                {detectedNotes.length > 2 && (
                  <div style={{ 
                    marginTop: '16px', 
                    textAlign: 'center', 
                    color: '#60a5fa', 
                    fontSize: '1.1rem', 
                    fontWeight: 800,
                    textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
                    padding: '8px',
                    borderTop: '1px solid rgba(96, 165, 250, 0.2)'
                  }}>
                    {/* Basic chord guessing logic */}
                    {['C', 'E', 'G'].every(n => detectedNotes.some(d => d.note.includes(n))) && "🎯 ACORDE DETECTADO: Do Mayor (C)"}
                    {['G', 'B', 'D'].every(n => detectedNotes.some(d => d.note.includes(n))) && "🎯 ACORDE DETECTADO: Sol Mayor (G)"}
                    {['A', 'C', 'E'].every(n => detectedNotes.some(d => d.note.includes(n))) && "🎯 ACORDE DETECTADO: La Menor (Am)"}
                    {['D', 'F#', 'A'].every(n => detectedNotes.some(d => d.note.includes(n))) && "🎯 ACORDE DETECTADO: Re Mayor (D)"}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: 600, marginTop: '32px' }}>Librería de Acordes</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {chords.map((chord, idx) => {
            const minFret = Math.min(...chord.positions.map(p => p.fret));
            const startFret = minFret > 3 ? minFret - 1 : 1;
            return (
              <motion.div 
                key={idx} 
                className="card" 
                whileHover={{ scale: 1.02, rotateY: 2, rotateX: 2 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{ margin: 0, padding: '16px', opacity: chord.unlocked ? 1 : 0.5, perspective: '1000px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {chord.unlocked ? <Star size={18} color="#eab308" /> : <Lock size={18} color="var(--text-secondary)" />}
                    {chord.name}
                  </h4>
                  <span className="badge" style={{ backgroundColor: chord.unlocked ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)', color: chord.unlocked ? '#60a5fa' : 'var(--text-secondary)' }}>
                    {chord.level}
                  </span>
                </div>
                
                <div style={{ pointerEvents: 'none', filter: chord.unlocked ? 'none' : 'grayscale(100%)' }}>
                  <FretboardVisualizer 
                    positions={chord.positions as Position[]} 
                    startFret={startFret} 
                    fretCount={5} 
                    mutedStrings={chord.mutedStrings}
                    openStrings={chord.openStrings}
                  />
                </div>

                {chord.unlocked && (
                  <button 
                    onClick={() => audioEngine.playChord(chord.positions as Position[])}
                    className="btn btn-secondary" 
                    style={{ marginTop: '16px', width: '100%', padding: '8px', fontSize: '0.9rem', gap: '8px' }}
                  >
                    <Volume2 size={16} color="#60a5fa" />
                    Escuchar Acorde
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Gym;
