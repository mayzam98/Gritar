import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat, ArrowRight, Activity, GitMerge, CheckCircle2 } from 'lucide-react';
import FretboardVisualizer from '../components/ui/FretboardVisualizer';
import StrummingVisualizer from '../components/ui/StrummingVisualizer';
import { analyzeTransition } from '../core/domain/TransitionAnalyzer';
import type { Position } from '../core/domain/Exercise';
import { useAppStore } from '../core/application/store';
import { CORE_CHORDS } from '../core/domain/ChordDictionary';
import RhythmModal from '../components/ui/modals/RhythmModal';

const Transitions: React.FC = () => {
  const { savedSongs, customRhythms, addCustomRhythm } = useAppStore();
  const [showRhythmModal, setShowRhythmModal] = useState(false);
  const location = useLocation();
  const initialState = location.state as any;

  // Extract chords from saved songs to allow practicing them
  const repertoireChords: any[] = [];
  (savedSongs || []).forEach(song => {
    (song.chordDetails || []).forEach((detail: any) => {
      repertoireChords.push({
        id: `rep-${song.id}-${detail.chord}`,
        name: detail.chord,
        positions: detail.positions
      });
    });
  });

  if (initialState && initialState.chordDetails) {
    initialState.chordDetails.forEach((detail: any) => {
      // Avoid duplicates if the exact chord is already imported
      if (!repertoireChords.find(c => c.id === `imported-${detail.chord}`)) {
        repertoireChords.push({
          id: `imported-${detail.chord}`,
          name: detail.chord,
          positions: detail.positions
        });
      }
    });
  }

  const allAvailableChords = [...CORE_CHORDS, ...repertoireChords];

  const [selectedChordA, setSelectedChordA] = useState<any>(() => {
    if (initialState && initialState.chordA) {
       return allAvailableChords.find(c => c.name === initialState.chordA) || CORE_CHORDS[0];
    }
    return CORE_CHORDS[0];
  });
  
  const [selectedChordB, setSelectedChordB] = useState<any>(() => {
    if (initialState && initialState.chordB) {
       // Try not to pick the exact same chord as A if possible
       const found = allAvailableChords.find(c => c.name === initialState.chordB);
       return found || CORE_CHORDS[1];
    }
    return CORE_CHORDS[1];
  });

  const analysis = analyzeTransition(selectedChordA.positions as Position[], selectedChordB.positions as Position[]);

  const minFretA = selectedChordA.positions?.length ? Math.min(...selectedChordA.positions.map((p: Position) => p.fret)) : 1;
  const startFretA = minFretA > 3 ? minFretA - 1 : 1;

  const minFretB = selectedChordB.positions?.length ? Math.min(...selectedChordB.positions.map((p: Position) => p.fret)) : 1;
  const startFretB = minFretB > 3 ? minFretB - 1 : 1;

  const RHYTHMS = [
    { id: '4_simple', name: '4/4 Simple', steps: ['↓', '↑', '↓', '↑'] },
    { id: '8_pop', name: 'Balada Pop', steps: ['↓', '-', '↓', '↑', '-', '↑', '↓', '↑'] },
    { id: '3_vals', name: 'Vals (3/4)', steps: ['B', '↓', '↓'] },
    { id: '4_rock', name: 'Rock Clásico', steps: ['↓', '↓', '↑', '↓'] },
    { id: 'corrido', name: 'Corrido / Ranchera', steps: ['B', '↓', 'B', '↓'] },
    { id: 'bachata', name: 'Bachata (8 Octavos)', steps: ['↓', '↑', '↓', 'X', '↓', '↑', '↓', 'X'] },
    { id: 'cumbia', name: 'Cumbia', steps: ['B', '↓', 'X', '↓'] },
    { id: 'bolero', name: 'Bolero', steps: ['B', '↓', '↑', '-', '↓', '↑'] },
  ];

  const mappedCustomRhythms = (customRhythms || []).map(r => ({
    id: r.id,
    name: r.name,
    steps: r.pattern
  }));

  let initialRhythms = [...RHYTHMS, ...mappedCustomRhythms];
  if (initialState && initialState.rhythm) {
      initialRhythms = [{ id: 'imported_rhythm', name: initialState.rhythm.name, steps: initialState.rhythm.pattern }, ...initialRhythms];
  }

  const [isPracticing, setIsPracticing] = useState(false);
  const [bpm, setBpm] = useState(60);
  const [activeChordToggle, setActiveChordToggle] = useState<'A' | 'B'>('A');
  const [availableRhythms, setAvailableRhythms] = useState(initialRhythms);
  const [selectedRhythm, setSelectedRhythm] = useState(initialRhythms[0]);
  const [currentBeat, setCurrentBeat] = useState(1);
  
  // AudioContext for Metronome
  const audioCtxRef = React.useRef<AudioContext | null>(null);

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPracticing) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // If it's an 8-step rhythm, we double the speed of the ticks so BPM represents quarter notes
      const isEighthNotes = selectedRhythm.steps.length === 8;
      const effectiveBpm = isEighthNotes ? bpm * 2 : bpm;
      const msPerBeat = 60000 / effectiveBpm;
      
      let localBeatCount = 1;
      
      interval = setInterval(() => {
        localBeatCount = localBeatCount >= selectedRhythm.steps.length ? 1 : localBeatCount + 1;
        setCurrentBeat(localBeatCount);
        
        // Play metronome sound (only play if it's not a silent rest '-')
        const currentStep = selectedRhythm.steps[localBeatCount - 1];
        if (audioCtxRef.current && currentStep !== '-') {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          
          if (currentStep === 'B') {
            // Bass sound (low and resonant)
            osc.type = 'triangle';
            osc.frequency.value = 110; 
            gain.gain.setValueAtTime(0.8, audioCtxRef.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.3);
            osc.start(audioCtxRef.current.currentTime);
            osc.stop(audioCtxRef.current.currentTime + 0.3);
          } else if (currentStep === 'X') {
            // Slap / Mute sound (short, percussive)
            osc.type = 'square';
            osc.frequency.value = 150;
            gain.gain.setValueAtTime(0.5, audioCtxRef.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.05);
            osc.start(audioCtxRef.current.currentTime);
            osc.stop(audioCtxRef.current.currentTime + 0.05);
          } else {
            // Normal metronome tick
            osc.type = 'sine';
            osc.frequency.value = localBeatCount === 1 ? 880 : (isEighthNotes && localBeatCount % 2 === 0 ? 330 : 440); 
            gain.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.1);
            osc.start(audioCtxRef.current.currentTime);
            osc.stop(audioCtxRef.current.currentTime + 0.1);
          }
        }

        // Switch chord exactly on beat 1
        if (localBeatCount === 1) {
          setActiveChordToggle(curr => curr === 'A' ? 'B' : 'A');
        }
      }, msPerBeat);
    } else {
      setCurrentBeat(1);
      setActiveChordToggle('A');
    }
    
    return () => clearInterval(interval);
  }, [isPracticing, bpm, selectedRhythm]);

  const activeChord = activeChordToggle === 'A' ? selectedChordA : selectedChordB;
  const activeStartFret = activeChordToggle === 'A' ? startFretA : startFretB;

  // Generate stable mapped positions for activeChord
  const mappedActiveChordPositions = activeChord.positions.map((pos: any) => ({ ...pos }));

  if (isPracticing) {
    analysis.steps.forEach((step, idx) => {
      const uniqueId = `anim-finger-${step.finger}-${idx}`;
      
      if (activeChordToggle === 'A' && step.fromString > 0) {
        const p = mappedActiveChordPositions.find((p: any) => p.finger === step.finger && p.string === step.fromString && p.fret === step.fromFret && !p.id);
        if (p) p.id = uniqueId;
      } else if (activeChordToggle === 'B' && step.toString > 0) {
        const p = mappedActiveChordPositions.find((p: any) => p.finger === step.finger && p.string === step.toString && p.fret === step.toFret && !p.id);
        if (p) p.id = uniqueId;
      }
    });
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <header className="page-header">
        <h1 className="page-title">Transiciones</h1>
        <p className="page-subtitle">Domina los cambios entre acordes</p>
      </header>

      <div style={{ padding: '0 20px' }}>
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 className="card-title" style={{ margin: 0 }}>
              <Activity color="#3b82f6" />
              Simulador Dinámico
            </h2>
            <button 
              onClick={() => setIsPracticing(!isPracticing)}
              className="btn"
              style={{ backgroundColor: isPracticing ? '#ef4444' : '#10b981', padding: '8px 16px', fontSize: '0.9rem' }}
            >
              {isPracticing ? '⏹ Detener Simulador' : '▶ Iniciar Metrónomo'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <select 
              className="search-input" 
              style={{ flex: 1, appearance: 'none', backgroundColor: '#1e293b', border: isPracticing && activeChordToggle === 'A' ? '2px solid #3b82f6' : '1px solid #334155', padding: '10px', color: 'white', borderRadius: '8px' }}
              value={selectedChordA.id}
              onChange={(e) => setSelectedChordA(allAvailableChords.find(c => c.id === e.target.value))}
              disabled={isPracticing}
            >
              <optgroup label="Básicos">
                {CORE_CHORDS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
              {repertoireChords.length > 0 && (
                <optgroup label="De tu Repertorio">
                  {repertoireChords.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </optgroup>
              )}
            </select>
            <Repeat color="var(--text-secondary)" size={24} style={{ alignSelf: 'center' }} />
            <select 
              className="search-input" 
              style={{ flex: 1, appearance: 'none', backgroundColor: '#1e293b', border: isPracticing && activeChordToggle === 'B' ? '2px solid #3b82f6' : '1px solid #334155', padding: '10px', color: 'white', borderRadius: '8px' }}
              value={selectedChordB.id}
              onChange={(e) => setSelectedChordB(allAvailableChords.find(c => c.id === e.target.value))}
              disabled={isPracticing}
            >
              <optgroup label="Básicos">
                {CORE_CHORDS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
              {repertoireChords.length > 0 && (
                <optgroup label="De tu Repertorio">
                  {repertoireChords.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </optgroup>
              )}
            </select>
          </div>

          {isPracticing && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>BPM (Velocidad)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="range" 
                      min="40" max="120" 
                      value={bpm} 
                      onChange={(e) => setBpm(Number(e.target.value))}
                      style={{ width: '100px' }}
                    />
                    <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{bpm}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '4px' }}>
                  {selectedRhythm.steps.map((_, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: currentBeat === i + 1 ? (i === 0 ? '#3b82f6' : '#94a3b8') : '#334155',
                        boxShadow: currentBeat === i + 1 ? `0 0 8px ${i === 0 ? '#3b82f6' : '#94a3b8'}` : 'none',
                        transition: 'all 0.1s'
                      }} 
                    />
                  ))}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Patrón de Ritmo</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <select 
                      value={selectedRhythm.id} 
                      onChange={e => setSelectedRhythm(availableRhythms.find(r => r.id === e.target.value) || availableRhythms[0])}
                      style={{ backgroundColor: 'transparent', color: '#60a5fa', border: 'none', fontWeight: 'bold' }}
                    >
                      {availableRhythms.map(r => (
                        <option key={r.id} value={r.id} style={{ color: 'black' }}>{r.name}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => setShowRhythmModal(true)}
                      style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#60a5fa', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      + Nuevo Ritmo
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', position: 'relative', flexWrap: 'wrap', gap: '16px' }}>
            {!isPracticing ? (
              <>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ pointerEvents: 'none' }}>
                    <FretboardVisualizer 
                      positions={selectedChordA.positions} 
                      startFret={startFretA} 
                      fretCount={5} 
                      bassString={selectedChordA.bassString}
                      mutedStrings={selectedChordA.mutedStrings}
                      openStrings={selectedChordA.openStrings}
                    />
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ pointerEvents: 'none' }}>
                    <FretboardVisualizer 
                      positions={selectedChordB.positions} 
                      startFret={startFretB} 
                      fretCount={5} 
                      bassString={selectedChordB.bassString}
                      mutedStrings={selectedChordB.mutedStrings}
                      openStrings={selectedChordB.openStrings}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '2rem', margin: '0 0 16px 0', color: '#10b981', textShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}>
                  {activeChord.name}
                </h3>
                
                {/* Rhythm / Strumming Pattern Visualizer */}
                <div style={{ marginBottom: '32px' }}>
                  <StrummingVisualizer steps={selectedRhythm.steps} currentBeat={currentBeat} size="lg" />
                </div>

                <div style={{ transform: 'scale(1.2)', transformOrigin: 'top center', pointerEvents: 'none' }}>
                  <FretboardVisualizer 
                    positions={mappedActiveChordPositions} 
                    startFret={activeStartFret} 
                    fretCount={5} 
                    bassString={activeChord.bassString}
                    mutedStrings={activeChord.mutedStrings}
                    openStrings={activeChord.openStrings}
                    transitionLines={isPracticing ? analysis.steps.filter(s => s.distance > 0 && s.fromString > 0 && s.toString > 0).map(s => ({
                      fromString: activeChordToggle === 'A' ? s.fromString : s.toString,
                      fromFret: activeChordToggle === 'A' ? s.fromFret : s.toFret,
                      toString: activeChordToggle === 'A' ? s.toString : s.fromString,
                      toFret: activeChordToggle === 'A' ? s.toFret : s.fromFret,
                      color: 'rgba(59, 130, 246, 0.6)'
                    })) : undefined}
                  />
                </div>
              </div>
            )}
          </div>

          {!isPracticing && (
            <div style={{ 
              backgroundColor: analysis.difficultyScore > 5 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
              border: `1px solid ${analysis.difficultyScore > 5 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`, 
              padding: '16px', borderRadius: '12px', textAlign: 'center' 
            }}>
              <h3 style={{ fontSize: '1rem', color: analysis.difficultyScore > 5 ? '#ef4444' : '#22c55e', margin: '0 0 8px 0' }}>
                Dificultad Calculada: {analysis.difficultyScore > 5 ? 'ALTA' : 'BAJA'} ({analysis.difficultyScore} movs)
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {analysis.recommendation}
              </p>
            </div>
          )}

          {!isPracticing && (
            <div style={{ marginTop: '24px', backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitMerge size={18} color="#eab308" />
                Paso a Paso
              </h4>
              <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {analysis.steps.map((step, i) => (
                  <li key={i} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {step.distance === 0 && <CheckCircle2 size={14} color="#22c55e" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />}
                    <span style={{ color: step.distance === 0 ? '#22c55e' : 'var(--text-primary)' }}>{step.instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>

      <RhythmModal 
        isOpen={showRhythmModal}
        onClose={() => setShowRhythmModal(false)}
        onSave={(name, pattern) => {
          const newRhythm = { name, pattern };
          addCustomRhythm(newRhythm);
          // Actualizar la lista local
          const mapped = { id: `custom_${Date.now()}`, name, steps: pattern };
          setAvailableRhythms([...availableRhythms, mapped]);
          setSelectedRhythm(mapped);
          setShowRhythmModal(false);
        }}
      />
    </div>
  );
};

export default Transitions;
