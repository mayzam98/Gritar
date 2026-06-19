import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Dumbbell, Star, Lock } from 'lucide-react';
import FretboardVisualizer from '../components/ui/FretboardVisualizer';
import type { Position } from '../core/domain/Exercise';
import { Link } from 'react-router-dom';
import { CORE_CHORDS } from '../core/domain/ChordDictionary';
import { audioEngine } from '../core/infrastructure/audio/AudioEngine';
import { dspEngine } from '../core/infrastructure/audio/PolyphonicDSP';
import { chordClassifier } from '../core/infrastructure/audio/ChordClassifier';
import { Volume2, Mic, Activity, BrainCircuit, X, Trash2 } from 'lucide-react';

const ChordCard = ({ chord, idx, startFret, isTraining, selectedTrainChord }: any) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(x, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = (e.clientY - rect.top) / rect.height;
    x.set(mouseX - 0.5);
    y.set(mouseY - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Efecto de neón y elevación en 3D
  return (
    <motion.div 
      className="card" 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      style={{ 
        margin: 0, 
        padding: '20px', 
        opacity: chord.unlocked ? 1 : 0.5, 
        perspective: '1200px',
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        boxShadow: isTraining && selectedTrainChord === chord.id ? '0 0 20px rgba(234, 179, 8, 0.3)' : '0 8px 30px rgba(0,0,0,0.5)',
        border: isTraining && selectedTrainChord === chord.id ? '1px solid #eab308' : '1px solid rgba(255,255,255,0.05)'
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Contenido Elevado en el eje Z */}
      <div style={{ transform: 'translateZ(30px)', transformStyle: "preserve-3d" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {chord.unlocked ? <Star size={20} color="#eab308" /> : <Lock size={20} color="var(--text-secondary)" />}
            {chord.name}
          </h4>
          <span className="badge" style={{ backgroundColor: chord.unlocked ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)', color: chord.unlocked ? '#60a5fa' : 'var(--text-secondary)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
            {chord.level}
          </span>
        </div>
        
        <div style={{ pointerEvents: 'none', filter: chord.unlocked ? 'none' : 'grayscale(100%)', transform: 'translateZ(20px)', backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
          <FretboardVisualizer 
            positions={chord.positions as Position[]} 
            startFret={startFret} 
            fretCount={5} 
            mutedStrings={chord.mutedStrings}
            openStrings={chord.openStrings}
            bassString={chord.bassString}
          />
        </div>

        {chord.unlocked && (
          <button 
            onClick={() => audioEngine.playChord(chord.positions as Position[])}
            className="btn btn-secondary" 
            style={{ marginTop: '20px', width: '100%', padding: '10px', fontSize: '1rem', gap: '8px', transform: 'translateZ(40px)', backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(96, 165, 250, 0.5)', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}
          >
            <Volume2 size={18} color="#60a5fa" />
            Sintetizar Acorde
          </button>
        )}
      </div>
    </motion.div>
  );
};

const Gym: React.FC = () => {
  const chords = CORE_CHORDS;
  const [isListening, setIsListening] = React.useState(false);
  const [isTraining, setIsTraining] = React.useState(false);
  const [selectedTrainChord, setSelectedTrainChord] = React.useState(chords[0].id);
  const [prediction, setPrediction] = React.useState<{chordName: string, confidence: number} | null>(null);
  const [detectedNotes, setDetectedNotes] = React.useState<{note: string, freq: number, amplitude: number}[]>([]);
  const [trainingMessage, setTrainingMessage] = React.useState<{text: string, type: 'success'|'error'} | null>(null);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const animationRef = React.useRef<number>();
  const predictionBufferRef = React.useRef<string[]>([]);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const toggleDSP = async () => {
    if (isListening) {
      dspEngine.stopMicrophone();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setIsListening(false);
      setDetectedNotes([]);
      predictionBufferRef.current = [];
    } else {
      try {
        await dspEngine.startMicrophone();
        setIsListening(true);
        const analyzeLoop = () => {
          const notes = dspEngine.analyzeCurrentSpectrum();
          setDetectedNotes(notes);
          
          if (notes.length > 2 && !isTraining) {
            const pred = chordClassifier.predict(notes);
            if (pred) {
              const buffer = predictionBufferRef.current;
              buffer.push(pred.chordName);
              if (buffer.length > 15) buffer.shift();
              
              const counts = buffer.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {} as Record<string, number>);
              const mostCommon = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
              
              // Histéresis: Para destronar al acorde actual, el nuevo debe dominar el buffer (>60% o 9/15 cuadros)
              setPrediction(prev => {
                if (!prev || counts[mostCommon] >= 9) {
                  return { chordName: mostCommon, confidence: pred.confidence };
                }
                return { chordName: prev.chordName, confidence: pred.confidence };
              });
            } else {
              setPrediction(null);
            }
          } else {
            setPrediction(null);
            predictionBufferRef.current = [];
          }

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
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
                {/* Training Mode UI */}
                {isTraining ? (
                  <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid #eab308', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h5 style={{ color: '#facc15', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BrainCircuit size={16} /> Modo Entrenamiento
                      </h5>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <button 
                          onClick={() => {
                            if (confirmDelete) {
                              chordClassifier.clearModel();
                              setTrainingMessage({ text: '🗑️ Modelo borrado desde cero.', type: 'success' });
                              setTimeout(() => setTrainingMessage(null), 3000);
                              setConfirmDelete(false);
                            } else {
                              setConfirmDelete(true);
                              setTimeout(() => setConfirmDelete(false), 3000);
                            }
                          }}
                          style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}
                        >
                          <Trash2 size={16} /> {confirmDelete ? '¿Seguro? Clic para borrar' : 'Borrar Todo'}
                        </button>
                        <button 
                          onClick={() => setIsTraining(false)}
                          style={{ backgroundColor: 'transparent', border: 'none', color: '#eab308', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <X size={18} /> Cerrar
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        value={selectedTrainChord}
                        onChange={(e) => setSelectedTrainChord(e.target.value)}
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #475569' }}
                      >
                        {chords.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => {
                          if (countdown !== null || trainingMessage) return;
                          
                          // Fase 1: Preparación (3 segundos)
                          setCountdown(3);
                          let count = 3;
                          
                          const prepInterval = setInterval(() => {
                            count -= 1;
                            setCountdown(count);
                            
                            if (count === 0) {
                              clearInterval(prepInterval);
                              // Fase 2: Captura (esperamos 3s para capturar el sustain)
                              setCountdown(-1); // Estado especial visual de captura
                              
                              let bestSpectrum: {note: string, freq: number, amplitude: number}[] = [];
                              let captureTime = 3;
                              
                              const captureInterval = setInterval(() => {
                                captureTime -= 0.5;
                                const current = dspEngine.analyzeCurrentSpectrum();
                                if (current.length > bestSpectrum.length) {
                                  bestSpectrum = current;
                                }
                                
                                if (captureTime <= 0) {
                                  clearInterval(captureInterval);
                                  setCountdown(null);
                                  
                                  const chordObj = chords.find(c => c.id === selectedTrainChord);
                                  if (chordObj && bestSpectrum.length > 2) {
                                    chordClassifier.train(chordObj.id, chordObj.name, bestSpectrum);
                                    setTrainingMessage({ text: `✅ ¡Huella aprendida para ${chordObj.name}!`, type: 'success' });
                                  } else {
                                    setTrainingMessage({ text: '⚠️ No se escucharon suficientes cuerdas. Asegúrate de rasguear fuerte y dejarlo sonar.', type: 'error' });
                                  }
                                  
                                  setTimeout(() => setTrainingMessage(null), 3000);
                                }
                              }, 500);
                            }
                          }, 1000);
                        }}
                        disabled={countdown !== null}
                        style={{ 
                          backgroundColor: countdown !== null ? (countdown === -1 ? '#ef4444' : '#475569') : '#eab308', 
                          color: countdown !== null ? (countdown === -1 ? 'white' : '#94a3b8') : 'black', 
                          border: 'none', 
                          padding: '8px 16px', 
                          borderRadius: '4px', 
                          fontWeight: 'bold', 
                          cursor: countdown !== null ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s'
                        }}
                      >
                        {countdown !== null ? 
                          (countdown === -1 ? '¡TOCA EL ACORDE AHORA!' : `Ubica tus dedos (${countdown})...`) : 
                         'Capturar Huella'}
                      </button>
                    </div>
                    {trainingMessage && (
                      <div className="animate-fade-in" style={{ 
                        marginTop: '12px', 
                        padding: '8px', 
                        backgroundColor: trainingMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                        color: trainingMessage.type === 'success' ? '#10b981' : '#ef4444', 
                        borderRadius: '4px', 
                        textAlign: 'center', 
                        fontWeight: 600,
                        border: `1px solid ${trainingMessage.type === 'success' ? '#10b981' : '#ef4444'}`
                      }}>
                        {trainingMessage.text}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsTraining(true)}
                      style={{ marginTop: '16px', width: '100%', backgroundColor: 'transparent', color: '#eab308', border: '1px dashed #eab308', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Entrenar Modelo (Mejorar precisión)
                    </button>
                    
                    {/* Machine Learning Guessing */}
                    {prediction ? (
                      <div style={{ 
                        marginTop: '16px', 
                        textAlign: 'center', 
                        color: prediction.confidence > 80 ? '#34d399' : prediction.confidence > 40 ? '#60a5fa' : '#ef4444', 
                        fontSize: '1.1rem', 
                        fontWeight: 800,
                        textShadow: prediction.confidence > 80 ? '0 0 10px rgba(52, 211, 153, 0.5)' : prediction.confidence > 40 ? '0 0 10px rgba(96, 165, 250, 0.5)' : '0 0 10px rgba(239, 68, 68, 0.5)',
                        padding: '8px',
                        borderTop: '1px solid rgba(255,255,255, 0.1)'
                      }}>
                        🧠 PREDICCIÓN IA: {prediction.chordName} ({prediction.confidence}% similitud)
                      </div>
                    ) : (
                      detectedNotes.length > 2 && (
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
                          {(() => {
                            const detectedClasses = Array.from(new Set(detectedNotes.map(d => d.note.replace(/\d+$/, ''))));
                            const BASIC_GUESS_CHORDS = [
                              { name: 'Do Mayor Séptima (Cmaj7)', notes: ['C', 'E', 'G', 'B'] },
                              { name: 'Do Séptima (C7)', notes: ['C', 'E', 'G', 'A#'] },
                              { name: 'Re Séptima (D7)', notes: ['D', 'F#', 'A', 'C'] },
                              { name: 'Mi Séptima (E7)', notes: ['E', 'G#', 'B', 'D'] },
                              { name: 'Sol Séptima (G7)', notes: ['G', 'B', 'D', 'F'] },
                              { name: 'La Séptima (A7)', notes: ['A', 'C#', 'E', 'G'] },
                              { name: 'Si Séptima (B7)', notes: ['B', 'D#', 'F#', 'A'] },
                              { name: 'Do Mayor (C)', notes: ['C', 'E', 'G'] },
                              { name: 'Re Mayor (D)', notes: ['D', 'F#', 'A'] },
                              { name: 'Mi Mayor (E)', notes: ['E', 'G#', 'B'] },
                              { name: 'Fa Mayor (F)', notes: ['F', 'A', 'C'] },
                              { name: 'Sol Mayor (G)', notes: ['G', 'B', 'D'] },
                              { name: 'La Mayor (A)', notes: ['A', 'C#', 'E'] },
                              { name: 'Si Mayor (B)', notes: ['B', 'D#', 'F#'] },
                              { name: 'Do Menor (Cm)', notes: ['C', 'D#', 'G'] },
                              { name: 'Do# Menor (C#m)', notes: ['C#', 'E', 'G#'] },
                              { name: 'Re Menor (Dm)', notes: ['D', 'F', 'A'] },
                              { name: 'Mi Menor (Em)', notes: ['E', 'G', 'B'] },
                              { name: 'Fa Menor (Fm)', notes: ['F', 'G#', 'C'] },
                              { name: 'Fa# Menor (F#m)', notes: ['F#', 'A', 'C#'] },
                              { name: 'Sol Menor (Gm)', notes: ['G', 'A#', 'D'] },
                              { name: 'La Menor (Am)', notes: ['A', 'C', 'E'] },
                              { name: 'Si Menor (Bm)', notes: ['B', 'D', 'F#'] }
                            ];
                            
                            const basicGuess = BASIC_GUESS_CHORDS.find(chord => chord.notes.every(n => detectedClasses.includes(n)));
                            
                            if (basicGuess) {
                              return `🎯 ACORDE DETECTADO: ${basicGuess.name} (Adivinanza Básica)`;
                            }
                            
                            return (
                              <span style={{ color: '#94a3b8', fontSize: '0.9rem', textShadow: 'none', fontWeight: 'normal' }}>
                                Escuchando... IA dudando (Confianza baja, {chordClassifier.getModelSize()} huellas guardadas)
                              </span>
                            );
                          })()}
                        </div>
                      )
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: 600, marginTop: '32px' }}>
          {isTraining ? 'Acorde en Entrenamiento' : 'Librería de Acordes'}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {chords.filter(c => !isTraining || c.id === selectedTrainChord).map((chord, idx) => {
            const minFret = Math.min(...chord.positions.map(p => p.fret));
            const startFret = minFret > 3 ? minFret - 1 : 1;
            return (
              <ChordCard 
                key={chord.id} 
                chord={chord} 
                idx={idx} 
                startFret={startFret} 
                isTraining={isTraining} 
                selectedTrainChord={selectedTrainChord} 
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Gym;
