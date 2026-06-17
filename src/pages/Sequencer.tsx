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
  
  const [showPickerModal, setShowPickerModal] = useState(false);
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
    if (selectedBlockId) {
      // Update existing
      setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, chord } : b));
    } else {
      // Add new
      const newBlock = { id: crypto.randomUUID(), chord, rhythm: initialRhythms[0] };
      setBlocks([...blocks, newBlock]);
      setSelectedBlockId(newBlock.id);
    }
    setActiveTab('RHYTHMS');
  };

  const addRhythmBlock = (rhythm: any) => {
    if (selectedBlockId) {
      setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, rhythm } : b));
    } else if (blocks.length > 0) {
      const lastId = blocks[blocks.length - 1].id;
      setBlocks(blocks.map(b => b.id === lastId ? { ...b, rhythm } : b));
      setSelectedBlockId(lastId);
    }
    setShowPickerModal(false);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const handleSaveRhythm = () => {
    if (!newRhythmName.trim()) return;
    
    const newRhythm = {
      name: newRhythmName,
      pattern: newRhythmPattern,
    };
    
    addCustomRhythm(newRhythm);
    
    // Auto-aplicar al bloque seleccionado si estamos editando
    if (selectedBlockId) {
      setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, rhythm: newRhythm } : b));
    }
    
    setShowRhythmModal(false);
    setShowPickerModal(true);
    setActiveTab('RHYTHMS');
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
    <div className="page-container" style={{ paddingBottom: '40px', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
      
      {/* Header Premium */}
      <header className="page-header" style={{ marginBottom: '30px', padding: '30px 30px 0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <Music size={24} color="#a78bfa" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: 'white', letterSpacing: '-0.5px' }}>
              Song Builder
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>Secuenciador Multipista</p>
          </div>
        </div>
      </header>

      {/* Visualizador Principal Gigante */}
      <div style={{ padding: '0 30px', marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ 
          width: '100%',
          maxWidth: '800px',
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(20px)',
          borderRadius: '32px', 
          padding: '40px 20px',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Fondo neón sutil */}
          {isPlaying && (
            <motion.div 
              animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: '#8b5cf6', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }}
            />
          )}

          <div style={{ zIndex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <motion.h2 
              key={activeChord?.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '3.5rem', margin: '0 0 30px 0', color: 'white', textShadow: '0 0 30px rgba(255,255,255,0.2)', fontWeight: 800, letterSpacing: '-2px' }}
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
      <div style={{ padding: '0 30px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Sleek Transport Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '100px',
          padding: '12px 24px',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={blocks.length === 0}
              style={{ 
                width: '48px', height: '48px', 
                borderRadius: '50%', 
                border: 'none',
                background: isPlaying ? 'rgba(255,255,255,0.1)' : '#8b5cf6',
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: blocks.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: isPlaying ? 'none' : '0 0 20px rgba(139, 92, 246, 0.4)',
                opacity: blocks.length === 0 ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
              title={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} style={{ marginLeft: '4px' }} />}
            </button>
            <button 
              onClick={handleStop}
              disabled={blocks.length === 0}
              style={{ 
                width: '36px', height: '36px', 
                borderRadius: '50%', 
                border: 'none',
                background: 'transparent',
                color: '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: blocks.length === 0 ? 'not-allowed' : 'pointer',
                opacity: blocks.length === 0 ? 0.5 : 1,
                transition: 'color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
              onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
              title="Detener (Reset)"
            >
              <Square fill="currentColor" size={14} />
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', letterSpacing: '1px' }}>TEMPO</span>
            <input 
              type="range" 
              min="40" 
              max="200" 
              value={bpm} 
              onChange={(e) => setBpm(Number(e.target.value))}
              style={{ width: '100px', accentColor: '#8b5cf6' }}
            />
            <span style={{ fontSize: '1rem', color: 'white', fontWeight: 800, width: '60px', textAlign: 'right' }}>{bpm} <span style={{fontSize: '0.65rem', color: '#64748b'}}>BPM</span></span>
          </div>
        </div>

        {/* Mini Progression View & Quick Add */}
        {blocks.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '12px',
            padding: '0 20px 20px 20px',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <div style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              scrollbarWidth: 'none', // hide scrollbar for cleaner look
              msOverflowStyle: 'none',
              maxWidth: 'calc(100vw - 120px)', // allow scrolling if many items
            }}>
              {blocks.map((block, idx) => {
                const isPlayingActive = isPlaying && activeBlockIndex === idx;
                const isSelected = selectedBlockId === block.id && !isPlaying;
                const isHighlighted = isPlayingActive || isSelected;

                // Extract abbreviation like "Gm" from "Sol Menor (Gm)"
                const match = block.chord.name.match(/\((.*?)\)/);
                const symbol = match ? match[1] : block.chord.name;

                return (
                  <div 
                    key={`mini-${block.id}-${idx}`}
                    onClick={() => {
                       setSelectedBlockId(block.id);
                       setActiveBlockIndex(idx);
                       playheadRef.current = { blockIdx: idx, stepIdx: 0 };
                       setIsPlaying(true);
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: isHighlighted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 23, 42, 0.6)', 
                      border: `1px solid ${isHighlighted ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                      color: isHighlighted ? '#fca5a5' : '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      boxShadow: isHighlighted ? '0 0 10px rgba(239, 68, 68, 0.2)' : 'none',
                      flexShrink: 0
                    }}
                    title={`Bloque ${idx + 1}: ${block.chord.name}`}
                  >
                    {symbol}
                  </div>
                );
              })}
            </div>
            
            <button
              onClick={() => { setSelectedBlockId(null); setShowPickerModal(true); setActiveTab('CHORDS'); }}
              style={{
                width: '32px', height: '32px',
                borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid #8b5cf6',
                color: '#c4b5fd',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 0 10px rgba(139, 92, 246, 0.2)',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.4)'; e.currentTarget.style.color = 'white'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'; e.currentTarget.style.color = '#c4b5fd'; }}
              title="Añadir Nuevo Bloque"
            >
              <Plus size={16} />
            </button>
          </div>
        )}

        {/* Timeline Track */}
        <div 
          ref={timelineRef}
          style={{ 
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            alignItems: 'center',
            padding: '15px 15px 30px 15px',
            position: 'relative'
        }}>
          {blocks.length === 0 ? (
            <div style={{ margin: '40px auto', textAlign: 'center', color: '#64748b' }}>
              <Zap size={32} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: '0.9rem', letterSpacing: '0.5px' }}>La pista está vacía.</p>
              <button 
                onClick={() => { setSelectedBlockId(null); setShowPickerModal(true); setActiveTab('CHORDS'); }}
                style={{ marginTop: '20px', padding: '12px 24px', background: '#8b5cf6', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                + Añadir Primer Acorde
              </button>
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
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: isSelected ? 1.05 : 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    style={{
                      minWidth: '220px',
                      height: '90px',
                      borderRadius: '20px',
                      background: isPlayingActive 
                        ? 'rgba(139, 92, 246, 0.15)' 
                        : (isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)'),
                      border: `1px solid ${isPlayingActive ? 'rgba(139, 92, 246, 0.5)' : (isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)')}`,
                      boxShadow: isPlayingActive ? '0 0 30px rgba(139, 92, 246, 0.2)' : (isSelected ? '0 10px 20px rgba(0,0,0,0.3)' : 'none'),
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative',
                      flexShrink: 0,
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      padding: '0 20px'
                    }}
                  >
                    {/* Action Buttons Hover */}
                    {isSelected && !isPlaying && (
                      <div style={{ position: 'absolute', top: '-12px', right: '-12px', display: 'flex', gap: '8px', zIndex: 10 }}>
                        <motion.button 
                          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                          onClick={(e) => { e.stopPropagation(); setShowPickerModal(true); setActiveTab('CHORDS'); }}
                          style={{ background: '#0f172a', border: '1px solid #3b82f6', color: '#60a5fa', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
                          title="Editar Bloque"
                        >
                          <Settings size={16} />
                        </motion.button>
                        <motion.button 
                          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                          onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                          style={{ background: '#0f172a', border: '1px solid #ef4444', color: '#f87171', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
                          title="Eliminar Bloque"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>{block.chord.name}</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isPlayingActive ? '#c4b5fd' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{block.rhythm.name}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {block.rhythm.pattern.map((p: string, i: number) => {
                          const isStepActive = isPlayingActive && activeRhythmStep === i;
                          return (
                              <div key={i} style={{ 
                                width: '22px', height: '28px', 
                                background: isStepActive ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                                borderRadius: '4px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isStepActive ? 'white' : 'rgba(255,255,255,0.4)',
                                fontSize: '0.95rem',
                                fontWeight: 'bold',
                                transition: 'all 0.1s'
                              }}>
                                {p === '-' ? '•' : p}
                              </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {blocks.length > 0 && (
            <button 
              onClick={() => { setSelectedBlockId(null); setShowPickerModal(true); setActiveTab('CHORDS'); }}
              style={{ 
                minWidth: '60px', height: '90px', 
                background: 'transparent', border: '2px dashed rgba(255,255,255,0.2)', 
                borderRadius: '20px', color: '#94a3b8', fontWeight: 'bold', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
              title="Añadir Siguiente Bloque"
            >
              <Plus size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen Picker Modal */}
      <AnimatePresence>
        {showPickerModal && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            style={{ 
              position: 'fixed', bottom: '72px', left: 0, right: 0, margin: '0 auto', maxWidth: '600px', 
              background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(30px)', 
              borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
              borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)',
              padding: '24px', boxShadow: '0 -20px 50px rgba(0,0,0,0.8)', zIndex: 100,
              maxHeight: '70vh', display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedBlockId ? 'Editar Bloque' : 'Añadir Bloque'}</h3>
              <button onClick={() => setShowPickerModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            {/* Tab Switcher - Pill Design */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '100px', padding: '6px', marginBottom: '20px', position: 'relative', flexShrink: 0 }}>
              <div style={{ 
                position: 'absolute', top: '6px', bottom: '6px', width: 'calc(50% - 6px)', background: '#334155', borderRadius: '100px',
                transform: activeTab === 'CHORDS' ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 0 
              }} />
              <button 
                onClick={() => setActiveTab('CHORDS')}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', color: activeTab === 'CHORDS' ? 'white' : '#94a3b8', fontWeight: 'bold', fontSize: '0.85rem', zIndex: 1, cursor: 'pointer', transition: 'color 0.3s' }}
              >
                Acordes
              </button>
              <button 
                onClick={() => setActiveTab('RHYTHMS')}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', color: activeTab === 'RHYTHMS' ? 'white' : '#94a3b8', fontWeight: 'bold', fontSize: '0.85rem', zIndex: 1, cursor: 'pointer', transition: 'color 0.3s' }}
              >
                Ritmos
              </button>
            </div>

            {/* Toolbox Content */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
              {activeTab === 'CHORDS' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px' }}>
                  {allAvailableChords.map((chord, idx) => {
                    const match = chord.name.match(/\((.*?)\)/);
                    const symbol = match ? match[1] : chord.name;
                    const fullName = match ? chord.name.split(' (')[0] : '';
                    
                    return (
                      <button 
                        key={idx}
                        onClick={() => addChordBlock(chord)}
                        style={{ 
                          padding: '16px 8px', 
                          background: 'linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02))', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '16px', 
                          color: 'white', 
                          cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                          transition: 'transform 0.1s, background 0.2s',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                        }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>{symbol}</span>
                        {fullName && <span style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{fullName}</span>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  {initialRhythms.map((rhythm, idx) => (
                    <button 
                      key={idx}
                      onClick={() => addRhythmBlock(rhythm)}
                      style={{ 
                        padding: '16px', 
                        background: 'linear-gradient(to right, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))', 
                        border: '1px solid rgba(139, 92, 246, 0.4)', 
                        borderRadius: '16px', 
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
                        <span style={{ fontWeight: 'bold', color: '#c4b5fd', marginBottom: '6px', fontSize: '1.1rem' }}>{rhythm.name}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {rhythm.pattern.map((p, i) => (
                            <span key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', color: '#8b5cf6' }}>{p === '-' ? '•' : p}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '8px', borderRadius: '50%' }}>
                        <Plus size={18} color="#c4b5fd" />
                      </div>
                    </button>
                  ))}

                  <button 
                    onClick={() => { setShowPickerModal(false); setShowRhythmModal(true); }}
                    style={{ 
                      padding: '16px', 
                      background: 'transparent', 
                      border: '2px dashed rgba(139, 92, 246, 0.5)', 
                      borderRadius: '16px', 
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
          </motion.div>
        )}
      </AnimatePresence>

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
                    if (newRhythmPattern.length > 1) setNewRhythmPattern(newRhythmPattern.slice(0, -1));
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
