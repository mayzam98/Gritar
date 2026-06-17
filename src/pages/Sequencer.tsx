import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Pause, Plus, Trash2, GripVertical, Settings, Music, Zap, MoveRight, Volume2 } from 'lucide-react';
import FretboardVisualizer from '../components/ui/FretboardVisualizer';
import StrummingVisualizer from '../components/ui/StrummingVisualizer';
import { useAppStore } from '../core/application/store';
import { CORE_CHORDS } from '../core/domain/ChordDictionary';
import { analyzeTransition } from '../core/domain/TransitionAnalyzer';

interface SequenceBlock {
  id: string;
  chord: any;
  rhythm: any;
}

const Sequencer: React.FC = () => {
  const { savedSongs, discoveries, customRhythms, addCustomRhythm } = useAppStore();
  const location = useLocation();
  const initialState = location.state as any;

  // Extract chords from saved songs
  const repertoireChords: any[] = [];
  (savedSongs || []).forEach(song => {
    (song.chordDetails || []).forEach((detail: any) => {
      if (!repertoireChords.find(c => c.name === detail.chord)) {
        repertoireChords.push({
          id: `rep-${song.id}-${detail.chord}`,
          name: detail.chord,
          positions: detail.positions,
          startFret: detail.startFret || 1,
          bassString: detail.bassString,
          mutedStrings: detail.mutedStrings,
          openStrings: detail.openStrings,
        });
      }
    });
  });

  if (initialState && initialState.chordDetails) {
    initialState.chordDetails.forEach((detail: any) => {
      if (!repertoireChords.find(c => c.name === detail.chord)) {
        repertoireChords.push({
          id: `imported-${detail.chord}`,
          name: detail.chord,
          positions: detail.positions,
          startFret: detail.startFret || 1,
        });
      }
    });
  }

  const labChords: any[] = [];
  (discoveries || []).filter(d => d.type === 'chord').forEach(d => {
    labChords.push({
      id: d.id,
      name: d.title,
      positions: d.positions || [],
      startFret: 1, // Fallback defaults
    });
  });

  const allAvailableChords = [...CORE_CHORDS, ...repertoireChords, ...labChords];

  const DEFAULT_RHYTHMS = [
    { id: '4_simple', name: '4/4 Simple', pattern: ['↓', '↑', '↓', '↑'] },
    { id: '8_pop', name: 'Balada Pop', pattern: ['↓', '-', '↓', '↑', '-', '↑', '↓', '↑'] },
    { id: 'cumbia', name: 'Cumbia', pattern: ['B', '↓', 'X', '↓'] },
  ];

  let initialRhythms = [...DEFAULT_RHYTHMS, ...(customRhythms || [])];
  if (initialState && initialState.rhythm) {
    if (!initialRhythms.find(r => r.name === initialState.rhythm.name)) {
      initialRhythms = [{ id: 'imported_rhythm', name: initialState.rhythm.name, pattern: initialState.rhythm.pattern }, ...initialRhythms];
    }
  }

  const [blocks, setBlocks] = useState<SequenceBlock[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(80);
  const [activeBlockIndex, setActiveBlockIndex] = useState(-1);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeRhythmStep, setActiveRhythmStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'CHORDS' | 'RHYTHMS'>('CHORDS');
  
  const [showRhythmModal, setShowRhythmModal] = useState(false);
  const [newRhythmName, setNewRhythmName] = useState('');
  const [newRhythmPattern, setNewRhythmPattern] = useState<string[]>(Array(8).fill('-'));

  const audioCtxRef = useRef<AudioContext | null>(null);
  const playheadRef = useRef({ blockIdx: -1, stepIdx: 0 });
  const timelineRef = useRef<HTMLDivElement>(null);

  // Auto-scroll timeline to active block
  useEffect(() => {
    if (isPlaying && activeBlockIndex >= 0 && timelineRef.current) {
      const container = timelineRef.current;
      const activeElement = container.children[activeBlockIndex] as HTMLElement;
      if (activeElement) {
        container.scrollTo({
          left: activeElement.offsetLeft - container.offsetWidth / 2 + activeElement.offsetWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeBlockIndex, isPlaying]);

  // Initialize from Repertoire
  useEffect(() => {
    if (initialState && blocks.length === 0) {
      const initialBlocks: SequenceBlock[] = [];
      const defaultRhythm = initialState.rhythm ? { name: initialState.rhythm.name, pattern: initialState.rhythm.pattern } : initialRhythms[0];
      
      if (initialState.chords && Array.isArray(initialState.chords) && initialState.chords.length > 0) {
        initialState.chords.forEach((chordName: string) => {
          const chord = allAvailableChords.find(c => 
            c.name === chordName || 
            c.id.toLowerCase() === chordName.toLowerCase() || 
            c.name.includes(`(${chordName})`)
          ) || allAvailableChords[0];
          
          if (chord) {
            initialBlocks.push({ id: crypto.randomUUID(), chord, rhythm: defaultRhythm });
          }
        });
      } else {
        // Fallback to legacy chordA / chordB just in case
        if (initialState.chordA) {
          const chordA = allAvailableChords.find(c => c.name === initialState.chordA || c.name.includes(`(${initialState.chordA})`)) || allAvailableChords[0];
          initialBlocks.push({ id: crypto.randomUUID(), chord: chordA, rhythm: defaultRhythm });
        }
        if (initialState.chordB) {
          const chordB = allAvailableChords.find(c => c.name === initialState.chordB || c.name.includes(`(${initialState.chordB})`)) || allAvailableChords[0];
          initialBlocks.push({ id: crypto.randomUUID(), chord: chordB, rhythm: defaultRhythm });
        }
      }
      
      setBlocks(initialBlocks);
      if (initialBlocks.length > 0) {
        setSelectedBlockId(initialBlocks[0].id);
      }
    }
  }, [initialState]);

  const addChordBlock = (chord: any) => {
    // ALWAYS add a new block when clicking a chord
    const newBlock = { id: crypto.randomUUID(), chord, rhythm: initialRhythms[0] };
    setBlocks([...blocks, newBlock]);
    // Optionally select the newly added block so a subsequent rhythm click applies to it
    setSelectedBlockId(newBlock.id);
    
    // Automatically switch to Rhythms tab to encourage setting a rhythm
    setActiveTab('RHYTHMS');
  };

  const addRhythmBlock = (rhythm: any) => {
    if (selectedBlockId) {
      // Update existing block
      setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, rhythm } : b));
    } else if (blocks.length > 0) {
      // Update last block
      const lastId = blocks[blocks.length - 1].id;
      setBlocks(blocks.map(b => b.id === lastId ? { ...b, rhythm } : b));
      setSelectedBlockId(lastId);
    }
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const handleSaveRhythm = () => {
    if (!newRhythmName.trim()) return;
    addCustomRhythm({
      name: newRhythmName,
      pattern: newRhythmPattern,
    });
    setShowRhythmModal(false);
    setNewRhythmName('');
    setNewRhythmPattern(Array(8).fill('-'));
  };

  const toggleRhythmStep = (idx: number) => {
    const cycle = ['↓', '↑', '↓X', '↑X', 'X', 'B', 'P', '-'];
    const current = newRhythmPattern[idx];
    const nextIdx = (cycle.indexOf(current) + 1) % cycle.length;
    const newPattern = [...newRhythmPattern];
    newPattern[idx] = cycle[nextIdx];
    setNewRhythmPattern(newPattern);
  };

  // Playback Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && blocks.length > 0) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const beatDuration = 60000 / bpm;
      
      interval = setInterval(() => {
        let { blockIdx, stepIdx } = playheadRef.current;
        if (blockIdx === -1) blockIdx = 0;
        
        let currentBlock = blocks[blockIdx];
        if (!currentBlock) {
          blockIdx = 0;
          stepIdx = 0;
          currentBlock = blocks[0];
        }

        // Play sound for current step
        const stepSymbol = currentBlock.rhythm.pattern[stepIdx];
        if (stepSymbol && stepSymbol !== '-' && audioCtxRef.current) {
          playTick(audioCtxRef.current, stepSymbol);
        }

        // Update UI State
        setActiveBlockIndex(blockIdx);
        setActiveRhythmStep(stepIdx);

        // Advance playhead
        stepIdx++;
        if (stepIdx >= currentBlock.rhythm.pattern.length) {
          stepIdx = 0;
          blockIdx = (blockIdx + 1) % blocks.length;
        }

        playheadRef.current = { blockIdx, stepIdx };

      }, beatDuration);
    }
    // When not playing, we DO NOT reset the playhead. This creates a "Pause" behavior.
    
    return () => clearInterval(interval);
  }, [isPlaying, bpm, blocks]);

  const handleStop = () => {
    setIsPlaying(false);
    playheadRef.current = { blockIdx: -1, stepIdx: 0 };
    setActiveBlockIndex(-1);
    setActiveRhythmStep(0);
  };

  const playTick = (ctx: AudioContext, symbol: string) => {
    const isBass = symbol === 'B';
    const isMute = symbol === 'X' || symbol === '↓X' || symbol === '↑X';
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (isMute) {
      // Percussive "chuck" sound for mute
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } else {
      // Standard sounds
      osc.type = isBass ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(isBass ? 110 : 880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(isBass ? 55 : 440, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(isBass ? 0.8 : 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (isBass ? 0.3 : 0.1));
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + (isBass ? 0.3 : 0.1));
    }
  };

  const activeChord = blocks[activeBlockIndex]?.chord || (selectedBlockId ? blocks.find(b => b.id === selectedBlockId)?.chord : blocks[0]?.chord) || CORE_CHORDS[0];

  return (
    <div className="page-container" style={{ paddingBottom: '120px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Premium */}
      <header className="page-header" style={{ marginBottom: '20px', padding: '20px 20px 0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}>
            <Music size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Song Builder
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Secuenciador Multipista</p>
          </div>
        </div>
      </header>

      {/* Visualizador Principal Gigante */}
      <div style={{ padding: '0 20px', marginBottom: '24px' }}>
        <div style={{ 
          background: 'radial-gradient(circle at top, #1e293b, #0f172a)', 
          borderRadius: '24px', 
          padding: '30px 20px',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Fondo neón abstracto */}
          {isPlaying && (
            <motion.div 
              animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', background: '#3b82f6', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }}
            />
          )}

          <div style={{ zIndex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.h2 
              key={activeChord?.name}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ fontSize: '3rem', margin: '0 0 20px 0', color: '#10b981', textShadow: '0 0 20px rgba(16, 185, 129, 0.4)', fontWeight: 900, letterSpacing: '-1px' }}
            >
              {activeChord?.name || '---'}
            </motion.h2>
            
            <div style={{ transform: 'scale(1.3)', transformOrigin: 'top center', pointerEvents: 'none', height: '220px' }}>
              {(() => {
                const isCurrentlyPlaying = isPlaying && blocks.length > 1 && activeBlockIndex >= 0;
                let tLines = undefined;
                let nextPos = undefined;
                
                if (isCurrentlyPlaying) {
                  const nextBlockIdx = (activeBlockIndex + 1) % blocks.length;
                  const nextChord = blocks[nextBlockIdx]?.chord;
                  
                  if (activeChord && nextChord && activeChord.name !== nextChord.name) {
                    nextPos = nextChord.positions || [];
                    
                    const posA = [...(activeChord.positions || [])];
                    const posB = [...nextPos];
                    tLines = [];
                    
                    // 1. First, perfectly match by finger number (respect actual fingering)
                    for (let i = posA.length - 1; i >= 0; i--) {
                      const fingerA = posA[i].finger;
                      if (fingerA) {
                        const matchIndexB = posB.findIndex(p => p.finger === fingerA);
                        if (matchIndexB !== -1) {
                          const from = posA[i];
                          const to = posB[matchIndexB];
                          
                          if (from.string !== to.string || from.fret !== to.fret) {
                            tLines.push({
                              fromString: from.string, fromFret: from.fret,
                              toString: to.string, toFret: to.fret,
                              color: 'rgba(59, 130, 246, 0.6)'
                            });
                          }
                          // Remove matched dots
                          posA.splice(i, 1);
                          posB.splice(matchIndexB, 1);
                        }
                      }
                    }
                    
                    // 2. For any remaining dots (either missing finger numbers, or mismatched), 
                    // we map them by shortest visual distance just to keep the animation clean.
                    while(posA.length > 0 && posB.length > 0) {
                      let best = { a: 0, b: 0, d: Infinity };
                      for(let i=0; i<posA.length; i++) {
                        for(let j=0; j<posB.length; j++) {
                          const dStr = Math.abs(posA[i].string - posB[j].string);
                          const dFret = Math.abs(posA[i].fret - posB[j].fret);
                          const d = (dStr * 3) + dFret;
                          if(d < best.d) best = { a: i, b: j, d };
                        }
                      }
                      const from = posA[best.a];
                      const to = posB[best.b];
                      
                      if (from.string !== to.string || from.fret !== to.fret) {
                        tLines.push({
                          fromString: from.string, fromFret: from.fret,
                          toString: to.string, toFret: to.fret,
                          color: 'rgba(59, 130, 246, 0.6)'
                        });
                      }
                      
                      posA.splice(best.a, 1);
                      posB.splice(best.b, 1);
                    }
                  }
                }

                return (
                  <FretboardVisualizer 
                    positions={activeChord?.positions || []}
                    startFret={activeChord?.startFret || 1}
                    fretCount={5}
                    bassString={activeChord?.bassString}
                    mutedStrings={activeChord?.mutedStrings}
                    openStrings={activeChord?.openStrings}
                    transitionLines={tLines}
                    nextPositions={nextPos}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Transport Controls & Timeline */}
      <div style={{ padding: '0 20px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={blocks.length === 0}
              style={{ 
                width: '50px', height: '50px', 
                borderRadius: '50%', 
                border: 'none',
                background: isPlaying ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: blocks.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: isPlaying ? '0 0 20px rgba(245, 158, 11, 0.4)' : '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
                opacity: blocks.length === 0 ? 0.5 : 1
              }}
              title={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} style={{ marginLeft: '4px' }} />}
            </button>
            <button 
              onClick={handleStop}
              disabled={blocks.length === 0}
              style={{ 
                width: '40px', height: '40px', 
                borderRadius: '50%', 
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: blocks.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 5px 15px -3px rgba(239, 68, 68, 0.3)',
                opacity: blocks.length === 0 ? 0.5 : 1
              }}
              title="Detener (Reset)"
            >
              <Square fill="currentColor" size={16} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Tempo</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="number" 
                  value={bpm} 
                  onChange={(e) => setBpm(Math.max(40, Math.min(200, Number(e.target.value))))}
                  style={{ width: '48px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', fontWeight: 800, fontSize: '1rem', padding: '4px 8px', textAlign: 'center' }}
                />
                <input 
                  type="range" 
                  min="40" 
                  max="200" 
                  value={bpm} 
                  onChange={(e) => setBpm(Number(e.target.value))}
                  style={{ width: '80px', accentColor: '#3b82f6' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Track */}
        <div 
          ref={timelineRef}
          style={{ 
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '16px',
          minHeight: '150px',
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          alignItems: 'center',
          position: 'relative',
          paddingBottom: '24px' // Extra space for selection styling
        }}>
          {blocks.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b' }}>
              <Zap size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>La pista está vacía.<br/>Selecciona un acorde abajo para añadir un bloque.</p>
            </div>
          ) : (
            <AnimatePresence>
              {blocks.map((block, idx) => {
                const isPlayingActive = isPlaying && activeBlockIndex === idx;
                const isSelected = selectedBlockId === block.id && !isPlaying;
                
                return (
                  <motion.div 
                    key={block.id}
                    onClick={() => { 
                      setSelectedBlockId(block.id);
                      setActiveBlockIndex(idx);
                      playheadRef.current = { blockIdx: idx, stepIdx: 0 };
                      setIsPlaying(true);
                    }}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: isSelected ? 1.05 : 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    style={{
                      minWidth: '180px',
                      height: '110px',
                      borderRadius: '16px',
                      background: isPlayingActive 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.4))' 
                        : (isSelected ? 'linear-gradient(135deg, #1e293b, #334155)' : 'rgba(255,255,255,0.03)'),
                      border: `2px solid ${isPlayingActive ? '#10b981' : (isSelected ? '#3b82f6' : 'rgba(255,255,255,0.1)')}`,
                      boxShadow: isPlayingActive ? '0 0 20px rgba(16, 185, 129, 0.3)' : (isSelected ? '0 10px 25px rgba(0,0,0,0.5)' : 'none'),
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      flexShrink: 0,
                      cursor: 'pointer',
                      transition: 'border 0.2s, background 0.2s'
                    }}
                  >
                    {/* Trash Button */}
                    {isSelected && !isPlaying && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                        style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    
                    {/* Selection Indicator */}
                    {isSelected && !isPlaying && (
                      <div style={{ position: 'absolute', bottom: '-18px', fontSize: '0.65rem', color: '#3b82f6', fontWeight: 'bold' }}>
                        EDITANDO BLOQUE
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', padding: '0 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: 900, color: isPlayingActive ? '#10b981' : 'white' }}>{block.chord.name}</span>
                      </div>
                      
                      <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 2 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: isPlayingActive ? '#c4b5fd' : '#a78bfa', marginBottom: '8px', textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{block.rhythm.name}</span>
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {block.rhythm.pattern.map((p: string, i: number) => {
                            const isStepActive = isPlayingActive && activeRhythmStep === i;
                            return (
                              <div key={i} style={{ 
                                width: '16px', height: '22px', 
                                background: isStepActive ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isStepActive ? 'white' : '#64748b',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                boxShadow: isStepActive ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none',
                                transition: 'all 0.1s'
                              }}>
                                {p === '-' ? '•' : p}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Bottom Toolbox Drawer */}
      <div style={{ 
        position: 'fixed', 
        bottom: '72px', // Height of bottom nav
        left: 0, 
        right: 0, 
        margin: '0 auto',
        maxWidth: '600px', // Match .app-container width
        background: 'rgba(15, 23, 42, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        padding: '16px 20px',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        zIndex: 40
      }}>
        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px' }}>
          <button 
            onClick={() => setActiveTab('CHORDS')}
            style={{ 
              flex: 1, padding: '8px', borderRadius: '8px', border: 'none', 
              background: activeTab === 'CHORDS' ? '#334155' : 'transparent',
              color: activeTab === 'CHORDS' ? 'white' : '#64748b',
              fontWeight: 'bold', fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            Añadir Acordes
          </button>
          <button 
            onClick={() => setActiveTab('RHYTHMS')}
            style={{ 
              flex: 1, padding: '8px', borderRadius: '8px', border: 'none', 
              background: activeTab === 'RHYTHMS' ? '#334155' : 'transparent',
              color: activeTab === 'RHYTHMS' ? 'white' : '#64748b',
              fontWeight: 'bold', fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            Añadir Ritmos
          </button>
        </div>

        {/* Toolbox Content */}
        <div style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }}>
          {activeTab === 'CHORDS' ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              {allAvailableChords.map((chord, idx) => {
                const match = chord.name.match(/\((.*?)\)/);
                const symbol = match ? match[1] : chord.name;
                const fullName = match ? chord.name.split(' (')[0] : '';
                
                return (
                  <button 
                    key={idx}
                    onClick={() => addChordBlock(chord)}
                    style={{ 
                      minWidth: '80px',
                      padding: '12px 8px', 
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02))', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px', 
                      color: 'white', 
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                      transition: 'transform 0.1s, background 0.2s',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                      flexShrink: 0
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>{symbol}</span>
                    {fullName && <span style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>{fullName}</span>}
                    <Plus size={14} color="rgba(255,255,255,0.5)" style={{ marginTop: '4px' }} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '10px' }}>
              {initialRhythms.map((rhythm, idx) => (
                <button 
                  key={idx}
                  onClick={() => addRhythmBlock(rhythm)}
                  style={{ 
                    padding: '12px 16px', 
                    background: 'linear-gradient(to right, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))', 
                    border: '1px solid rgba(139, 92, 246, 0.4)', 
                    borderRadius: '12px', 
                    color: 'white', 
                    cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'transform 0.1s',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 'bold', color: '#c4b5fd', marginBottom: '4px' }}>{rhythm.name}</span>
                    <span style={{ fontSize: '0.8rem', color: '#8b5cf6', letterSpacing: '2px' }}>{rhythm.pattern.join(' ')}</span>
                  </div>
                  <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '6px', borderRadius: '50%' }}>
                    <Plus size={16} color="#c4b5fd" />
                  </div>
                </button>
              ))}

              <button 
                onClick={() => setShowRhythmModal(true)}
                style={{ 
                  padding: '12px 16px', 
                  background: 'transparent', 
                  border: '2px dashed rgba(139, 92, 246, 0.5)', 
                  borderRadius: '12px', 
                  color: '#c4b5fd', 
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                  transition: 'background 0.2s',
                  marginTop: '8px'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <Plus size={18} /> Crear Ritmo Personalizado
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rhythm Creation Modal */}
      <AnimatePresence>
        {showRhythmModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
            >
              <h3 style={{ fontSize: '1.4rem', color: 'white', margin: '0 0 20px 0' }}>Crear Ritmo</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>Nombre del Ritmo</label>
                <input 
                  type="text" 
                  value={newRhythmName} 
                  onChange={e => setNewRhythmName(e.target.value)} 
                  placeholder="Ej: Rock Pesado"
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px', color: 'white', fontSize: '1rem' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px', display: 'block' }}>Patrón (Toca para cambiar)</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {newRhythmPattern.map((step, idx) => (
                    <button 
                      key={idx}
                      onClick={() => toggleRhythmStep(idx)}
                      style={{ 
                        width: '40px', height: '40px', 
                        background: step !== '-' ? '#8b5cf6' : '#334155', 
                        border: 'none', borderRadius: '8px', 
                        color: 'white', fontSize: '1.2rem', fontWeight: 'bold',
                        cursor: 'pointer', transition: 'all 0.1s'
                      }}
                    >
                      {step === '-' ? '•' : step}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                  <button onClick={() => {
                    if (newRhythmPattern.length > 4) setNewRhythmPattern(newRhythmPattern.slice(0, -1));
                  }} style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', padding: '4px 12px' }}>- Quitar Paso</button>
                  <button onClick={() => {
                    if (newRhythmPattern.length < 16) setNewRhythmPattern([...newRhythmPattern, '-']);
                  }} style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', padding: '4px 12px' }}>+ Añadir Paso</button>
                </div>
              </div>
              <div style={{ width: '100%', marginBottom: '24px', padding: '12px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Leyenda de Símbolos</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#eab308', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>↓</span> Abajo</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#eab308', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>↑</span> Arriba</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#ef4444', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>↓X</span> Mute Abajo</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#ef4444', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>↑X</span> Mute Arriba</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#ef4444', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>X</span> Chaskido</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#10b981', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>B</span> Bajo</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#06b6d4', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>P</span> Pellizco</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#64748b', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>-</span> Silencio</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowRhythmModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button onClick={handleSaveRhythm} className="btn btn-primary" style={{ flex: 1, background: '#8b5cf6' }} disabled={!newRhythmName.trim()}>Guardar Ritmo</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Sequencer;
