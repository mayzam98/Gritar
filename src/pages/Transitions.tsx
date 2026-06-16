import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat, ArrowRight, Activity, GitMerge, CheckCircle2 } from 'lucide-react';
import FretboardVisualizer from '../components/ui/FretboardVisualizer';
import { analyzeTransition } from '../core/domain/TransitionAnalyzer';
import type { Position } from '../core/domain/Exercise';
import { useAppStore } from '../core/application/store';
import { CORE_CHORDS } from '../core/domain/ChordDictionary';

const Transitions: React.FC = () => {
  const { savedSongs } = useAppStore();
  const [selectedChordA, setSelectedChordA] = useState<any>(CORE_CHORDS[0]);
  const [selectedChordB, setSelectedChordB] = useState<any>(CORE_CHORDS[1]);

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

  const allAvailableChords = [...CORE_CHORDS, ...repertoireChords];

  const analysis = analyzeTransition(selectedChordA.positions as Position[], selectedChordB.positions as Position[]);

  const minFretA = selectedChordA.positions?.length ? Math.min(...selectedChordA.positions.map((p: Position) => p.fret)) : 1;
  const startFretA = minFretA > 3 ? minFretA - 1 : 1;

  const minFretB = selectedChordB.positions?.length ? Math.min(...selectedChordB.positions.map((p: Position) => p.fret)) : 1;
  const startFretB = minFretB > 3 ? minFretB - 1 : 1;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <header className="page-header">
        <h1 className="page-title">Transiciones</h1>
        <p className="page-subtitle">Domina los cambios entre acordes</p>
      </header>

      <div style={{ padding: '0 20px' }}>
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="card-title">
            <Activity color="#3b82f6" />
            Simulador de Dificultad
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Selecciona dos acordes para analizar qué tan difícil es pasar de uno a otro.
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <select 
              className="search-input" 
              style={{ flex: 1, appearance: 'none', backgroundColor: '#1e293b', border: '1px solid #334155', padding: '10px', color: 'white', borderRadius: '8px' }}
              value={selectedChordA.id}
              onChange={(e) => setSelectedChordA(allAvailableChords.find(c => c.id === e.target.value))}
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
            <ArrowRight color="var(--text-secondary)" size={24} style={{ alignSelf: 'center' }} />
            <select 
              className="search-input" 
              style={{ flex: 1, appearance: 'none', backgroundColor: '#1e293b', border: '1px solid #334155', padding: '10px', color: 'white', borderRadius: '8px' }}
              value={selectedChordB.id}
              onChange={(e) => setSelectedChordB(allAvailableChords.find(c => c.id === e.target.value))}
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ pointerEvents: 'none' }}>
                <FretboardVisualizer positions={selectedChordA.positions} startFret={startFretA} fretCount={5} />
              </div>
            </div>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ pointerEvents: 'none' }}>
                <FretboardVisualizer positions={selectedChordB.positions} startFret={startFretB} fretCount={5} />
              </div>
            </div>
          </div>

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
          
        </motion.div>
      </div>
    </div>
  );
};

export default Transitions;
