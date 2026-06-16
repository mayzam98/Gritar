import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Star, Lock } from 'lucide-react';
import FretboardVisualizer from '../components/ui/FretboardVisualizer';
import type { Position } from '../core/domain/Exercise';
import { Link } from 'react-router-dom';
import { CORE_CHORDS } from '../core/domain/ChordDictionary';
import { audioEngine } from '../core/infrastructure/audio/AudioEngine';
import { Volume2 } from 'lucide-react';

const Gym: React.FC = () => {
  const chords = CORE_CHORDS;

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

        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: 600, marginTop: '24px' }}>Librería de Acordes</h3>
        
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
