import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, Trash2, CheckCircle, Search, Lightbulb } from 'lucide-react';
import InteractiveFretboard from '../components/ui/InteractiveFretboard';
import type { Position } from '../core/domain/Exercise';
import { analyzeChord } from '../core/domain/ChordAnalyzer';

const Creations: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [savedCreations, setSavedCreations] = useState<{ id: string, name: string, positions: Position[] }[]>([]);

  const togglePosition = (string: number, fret: number) => {
    setPositions(prev => {
      const exists = prev.find(p => p.string === string && p.fret === fret);
      if (exists) {
        return prev.filter(p => !(p.string === string && p.fret === fret));
      } else {
        return [...prev, { string, fret }];
      }
    });
  };

  const analysis = analyzeChord(positions);

  const saveCreation = () => {
    if (positions.length === 0) return;
    const newCreation = {
      id: Date.now().toString(),
      name: analysis?.closestChord ? `Variación de ${analysis.closestChord}` : 'Acorde Desconocido',
      positions: [...positions]
    };
    setSavedCreations([newCreation, ...savedCreations]);
    setPositions([]);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '20px' }}>
      <header className="page-header">
        <h1 className="page-title">Mis Creaciones</h1>
        <p className="page-subtitle">Experimenta y descubre nuevos acordes</p>
      </header>

      <div style={{ padding: '0 20px' }}>
        <div className="card" style={{ margin: '0 0 24px 0' }}>
          <h2 className="card-title">
            <Plus color="#3b82f6" />
            Nuevo Acorde
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Toca el diapasón para colocar los dedos.
          </p>

          <InteractiveFretboard 
            positions={positions} 
            onPositionToggle={togglePosition} 
            startFret={1} 
            fretCount={5} 
          />

          <div style={{ marginTop: '24px' }}>
            {analysis ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  backgroundColor: analysis.matchPercentage >= 80 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                  padding: '16px', 
                  borderRadius: '12px',
                  border: `1px solid ${analysis.matchPercentage >= 80 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Search size={18} color={analysis.matchPercentage >= 80 ? '#22c55e' : '#3b82f6'} />
                  <strong style={{ color: analysis.matchPercentage >= 80 ? '#22c55e' : '#60a5fa' }}>Análisis Inteligente</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                  {analysis.message}
                </p>
              </motion.div>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', border: '1px dashed #334155', borderRadius: '12px' }}>
                Coloca al menos un dedo para analizar tu acorde.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button className="btn btn-secondary" onClick={() => setPositions([])} style={{ flex: 1 }}>
              <Trash2 size={18} />
              Limpiar
            </button>
            <button className="btn" onClick={saveCreation} disabled={positions.length === 0} style={{ flex: 2 }}>
              <Save size={18} />
              Guardar
            </button>
          </div>
        </div>

        {savedCreations.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: 600 }}>Tus Descubrimientos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {savedCreations.map(creation => (
                <div key={creation.id} className="card" style={{ margin: 0, padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Lightbulb size={16} color="#eab308" />
                      {creation.name}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {creation.positions.length} dedos
                    </span>
                  </div>
                  <div style={{ pointerEvents: 'none' }}>
                    <InteractiveFretboard 
                      positions={creation.positions} 
                      onPositionToggle={() => {}} 
                      startFret={1} 
                      fretCount={4} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Creations;
