import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Star, Lock } from 'lucide-react';
import FretboardVisualizer from '../components/ui/FretboardVisualizer';

const Gym: React.FC = () => {
  const chords = [
    { name: 'Mi Menor (Em)', level: 'Básico', positions: [{ string: 5, fret: 2, finger: 2 }, { string: 4, fret: 2, finger: 3 }], unlocked: true },
    { name: 'Do Mayor (C)', level: 'Básico', positions: [{ string: 5, fret: 3, finger: 3 }, { string: 4, fret: 2, finger: 2 }, { string: 2, fret: 1, finger: 1 }], unlocked: true },
    { name: 'Fa Mayor (F)', level: 'Intermedio', positions: [{ string: 6, fret: 1, finger: 1 }, { string: 5, fret: 3, finger: 3 }, { string: 4, fret: 3, finger: 4 }, { string: 3, fret: 2, finger: 2 }, { string: 2, fret: 1, finger: 1 }, { string: 1, fret: 1, finger: 1 }], unlocked: false },
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '20px' }}>
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
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>2 de 24 acordes básicos</p>
            </div>
          </div>
          <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '8%', backgroundColor: '#22c55e', borderRadius: '4px' }}></div>
          </div>
        </motion.div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: 600, marginTop: '24px' }}>Librería de Acordes</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {chords.map((chord, idx) => (
            <div key={idx} className="card" style={{ margin: 0, padding: '16px', opacity: chord.unlocked ? 1 : 0.5 }}>
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
                <FretboardVisualizer positions={chord.positions} startFret={1} fretCount={4} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gym;
