import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Flame, Trophy, Activity, Target, X, CheckCircle2, ChevronRight, FastForward, Rewind, Pause, Square, Info } from 'lucide-react';
import { GenerateWarmupRoutineUseCase } from '../core/application/GenerateWarmupRoutineUseCase';
import { Exercise } from '../core/domain/Exercise';
import type { GlossaryTerm } from '../core/domain/Glossary';
import FretboardVisualizer from '../components/ui/FretboardVisualizer';
import GlossaryHighlighter from '../components/ui/GlossaryHighlighter';

const useCase = new GenerateWarmupRoutineUseCase();

const PhysicalExercises: React.FC = () => {
  const [isWarmupModalOpen, setIsWarmupModalOpen] = useState(false);
  const [routine, setRoutine] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isWarmupFinished, setIsWarmupFinished] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [currentBPM, setCurrentBPM] = useState(120);

  // Warmup Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timeLeft === 0) {
      handleNextExercise();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const startWarmup = () => {
    const newRoutine = useCase.execute(5); // 5 minutes = 5 exercises
    setRoutine(newRoutine);
    setCurrentExerciseIndex(0);
    setShowInstructions(false);
    if (newRoutine.length > 0) {
      setTimeLeft(newRoutine[0].durationInSeconds);
      setIsWarmupFinished(false);
      setIsTimerRunning(true);
      setIsWarmupModalOpen(true);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < routine.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setTimeLeft(routine[currentExerciseIndex + 1].durationInSeconds);
      setShowInstructions(false);
      setIsTimerRunning(true);
    } else {
      setIsWarmupFinished(true); // Finished
      setIsTimerRunning(false);
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
      setTimeLeft(routine[currentExerciseIndex - 1].durationInSeconds);
      setShowInstructions(false);
      setIsTimerRunning(true);
    }
  };

  const endWarmup = () => {
    setIsTimerRunning(false);
    setIsWarmupFinished(false);
    setIsWarmupModalOpen(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentExercise = routine[currentExerciseIndex];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '20px' }}>
      <header className="page-header">
        <h1 className="page-title">Ejercicios Físicos</h1>
        <p className="page-subtitle">Desarrolla agilidad y precisión</p>
      </header>

      {/* Top Section: Calentamiento Diario */}
      <motion.div 
        className="card card-warmup"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 className="card-title">
              <Flame color="#3b82f6" />
              <span className="gradient-text">Calentamiento Diario</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              5 minutos para soltar los dedos antes de tocar.
            </p>
          </div>
          <span className="badge">1/5 min</span>
        </div>
        
        <button className="btn" onClick={startWarmup}>
          <Play fill="currentColor" size={20} />
          Iniciar Rutina
        </button>
      </motion.div>

      {/* Middle Section: Rutinas Específicas */}
      <div style={{ padding: '0 20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: 600 }}>Enfoque Técnico</h3>
        <div className="grid-2">
          <motion.div className="card" style={{ margin: 0, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '50%', marginBottom: '12px' }}>
              <Activity color="#3b82f6" size={28} />
            </div>
            <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>Mano Izquierda</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Independencia y fuerza</p>
          </motion.div>

          <motion.div className="card" style={{ margin: 0, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '50%', marginBottom: '12px' }}>
              <Target color="#22c55e" size={28} />
            </div>
            <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>Mano Derecha</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Precisión de púa</p>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section: Reto de Velocidad */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="card-title" style={{ margin: 0 }}>
            <Trophy color="#eab308" />
            Reto de Velocidad
          </h2>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#eab308' }}>120 <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>BPM</span></span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
          Spider Walk - Nivel Intermedio. ¡Supera tu récord actual!
        </p>
        <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ height: '100%', width: '70%', backgroundColor: '#eab308', borderRadius: '4px' }}></div>
        </div>
        <button className="btn btn-secondary" onClick={() => setIsChallengeModalOpen(true)}>
          Intentar Reto
        </button>
      </motion.div>

      {/* Warmup Modal */}
      <AnimatePresence>
        {isWarmupModalOpen && (
          <motion.div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.98)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {!isWarmupFinished ? (
              <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>
                    EJERCICIO {currentExerciseIndex + 1} DE {routine.length}
                  </div>
                  <button onClick={endWarmup} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Square size={20} /> <span style={{fontSize: '0.9rem'}}>Parar</span>
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
                  <h2 style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: 800 }}>
                    {currentExercise?.name}
                  </h2>
                  <p style={{ fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: '20px' }}>
                    <GlossaryHighlighter text={currentExercise?.description || ''} onTermClick={setSelectedTerm} />
                  </p>

                  {currentExercise?.fretboardData ? (
                    <div style={{ width: '100%', height: '180px', marginBottom: '20px', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '10px' }}>
                      <FretboardVisualizer 
                        positions={currentExercise.fretboardData} 
                        startFret={Math.max(1, Math.min(...currentExercise.fretboardData.map(p => p.fret)) - 1)}
                        fretCount={5}
                      />
                    </div>
                  ) : currentExercise?.imageUrl ? (
                    <div style={{ width: '100%', height: '200px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
                      <img src={currentExercise.imageUrl} alt={currentExercise.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : null}

                  <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Info size={18} color="#3b82f6" /> ¿Cómo se hace?
                      </h3>
                      <button onClick={() => {
                        const newShow = !showInstructions;
                        setShowInstructions(newShow);
                        setIsTimerRunning(!newShow);
                      }} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.9rem', cursor: 'pointer' }}>
                        {showInstructions ? 'Ocultar' : 'Ver pasos'}
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {showInstructions && (
                        <motion.ul 
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}
                        >
                          {currentExercise?.instructions.map((step, idx) => (
                            <li key={idx} style={{ lineHeight: '1.4' }}>
                              <GlossaryHighlighter text={step} onTermClick={setSelectedTerm} />
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>

                  <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <div style={{ fontSize: '4.5rem', fontWeight: 900, color: timeLeft <= 10 ? '#ef4444' : 'white', fontVariantNumeric: 'tabular-nums', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', paddingBottom: '20px', marginTop: 'auto' }}>
                  <button className="btn btn-secondary" style={{ padding: '12px 0' }} onClick={handlePrevExercise} disabled={currentExerciseIndex === 0}>
                    <Rewind size={20} />
                  </button>
                  <button className="btn" style={{ padding: '12px 0', backgroundColor: isTimerRunning ? '#eab308' : '#22c55e', color: isTimerRunning ? '#000' : '#fff' }} onClick={() => setIsTimerRunning(!isTimerRunning)}>
                    {isTimerRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '12px 0' }} onClick={handleNextExercise}>
                    <FastForward size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <CheckCircle2 size={80} color="#22c55e" style={{ margin: '0 auto 24px' }} />
                <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>¡Rutina Completada!</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Tus dedos ya están listos para la acción.</p>
                <button className="btn" onClick={endWarmup}>
                  Volver al menú
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed Challenge Modal */}
      <AnimatePresence>
        {isChallengeModalOpen && (
          <motion.div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.95)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
          >
            <div className="card" style={{ width: '100%', maxWidth: '400px', margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Spider Walk</h3>
                <button onClick={() => setIsChallengeModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>
              
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', textAlign: 'center' }}>
                Ajusta el metrónomo y registra tu nuevo récord de velocidad limpio.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '32px' }}>
                <button className="btn btn-secondary" style={{ width: '60px', height: '60px', borderRadius: '50%', fontSize: '1.5rem', padding: 0 }} onClick={() => setCurrentBPM(p => Math.max(40, p - 5))}>
                  -
                </button>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#eab308' }}>{currentBPM}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>BPM</div>
                </div>
                <button className="btn btn-secondary" style={{ width: '60px', height: '60px', borderRadius: '50%', fontSize: '1.5rem', padding: 0 }} onClick={() => setCurrentBPM(p => Math.min(300, p + 5))}>
                  +
                </button>
              </div>

              <button className="btn" onClick={() => {
                alert(`¡Récord de ${currentBPM} BPM guardado con éxito!`);
                setIsChallengeModalOpen(false);
              }}>
                <CheckCircle2 size={20} />
                Guardar Récord
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glossary Modal */}
      <AnimatePresence>
        {selectedTerm && (
          <motion.div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.95)', zIndex: 3000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="card" style={{ width: '100%', maxWidth: '400px', margin: 0, border: '1px solid #3b82f6', boxShadow: '0 10px 40px rgba(59, 130, 246, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#60a5fa' }}>{selectedTerm.title}</h3>
                <button onClick={() => setSelectedTerm(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>
              
              <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.5', marginBottom: '20px' }}>
                {selectedTerm.description}
              </p>
              
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '8px' }}>
                <strong style={{ color: '#60a5fa', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>💡 TIP DE ORO:</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{selectedTerm.tips}</p>
              </div>

              <button className="btn btn-secondary" style={{ marginTop: '24px' }} onClick={() => setSelectedTerm(null)}>
                Entendido
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhysicalExercises;
