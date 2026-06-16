import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Repeat, ArrowRight, Activity } from 'lucide-react';
import FretboardVisualizer from '../components/ui/FretboardVisualizer';

const Transitions: React.FC = () => {
  const [chordA] = useState('Do Mayor (C)');
  const [chordB] = useState('Sol Mayor (G)');

  const posC = [{ string: 5, fret: 3, finger: 3 }, { string: 4, fret: 2, finger: 2 }, { string: 2, fret: 1, finger: 1 }];
  const posG = [{ string: 6, fret: 3, finger: 3 }, { string: 5, fret: 2, finger: 2 }, { string: 1, fret: 3, finger: 4 }];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '20px' }}>
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
            Calcula qué tan difícil es pasar de un acorde a otro basado en la distancia que deben recorrer tus dedos.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>{chordA}</div>
              <div style={{ pointerEvents: 'none' }}>
                <FretboardVisualizer positions={posC} startFret={1} fretCount={4} />
              </div>
            </div>

            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ArrowRight color="var(--text-secondary)" size={32} />
            </div>

            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>{chordB}</div>
              <div style={{ pointerEvents: 'none' }}>
                <FretboardVisualizer positions={posG} startFret={1} fretCount={4} />
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1rem', color: '#ef4444', margin: '0 0 8px 0' }}>Dificultad Calculada: ALTA</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Esta transición requiere que levantes todos los dedos y los muevas a cuerdas opuestas. Practica a 60 BPM.
            </p>
          </div>
          
          <button className="btn" style={{ marginTop: '24px', width: '100%' }}>
            <Repeat size={20} />
            Entrenar Transición
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Transitions;
