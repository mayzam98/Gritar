import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, Trash2, CheckCircle, Search, Lightbulb } from 'lucide-react';
import InteractiveFretboard from '../components/ui/InteractiveFretboard';
import type { Position } from '../core/domain/Exercise';
import { analyzeChord } from '../core/domain/ChordAnalyzer';
import { useAppStore } from '../core/application/store';

const Creations: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [creationStartFret, setCreationStartFret] = useState(1);
  const { discoveries, addDiscovery, deleteDiscovery } = useAppStore();

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
    addDiscovery({
      type: 'chord',
      title: analysis?.closestChord ? `Variación de ${analysis.closestChord}` : 'Acorde Desconocido',
      notes: analysis?.message || '',
      positions: [...positions],
      tags: analysis?.tags || []
    });
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Toca el diapasón para colocar los dedos.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                onClick={() => setCreationStartFret(prev => Math.max(1, prev - 1))}
                disabled={creationStartFret <= 1}
              >
                ◀ Arriba
              </button>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Traste {creationStartFret}</span>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                onClick={() => setCreationStartFret(prev => prev + 1)}
                disabled={creationStartFret >= 15}
              >
                Abajo ▶
              </button>
            </div>
          </div>

          <InteractiveFretboard 
            positions={positions} 
            onPositionToggle={togglePosition} 
            startFret={creationStartFret} 
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

        {(discoveries || []).length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: 600 }}>Tus Descubrimientos ({(discoveries || []).length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(discoveries || []).map(discovery => (
                <div key={discovery.id} className="card" style={{ margin: 0, padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Lightbulb size={16} color="#eab308" />
                      {discovery.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {discovery.positions?.length || 0} dedos
                      </span>
                      <button 
                        onClick={() => deleteDiscovery(discovery.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.8rem', padding: 0 }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div style={{ pointerEvents: 'none' }}>
                    <InteractiveFretboard 
                      positions={discovery.positions || []} 
                      onPositionToggle={() => {}} 
                      startFret={discovery.positions?.length ? Math.max(1, Math.min(...discovery.positions.map(p => p.fret)) - 1) : 1} 
                      fretCount={5} 
                    />
                  </div>
                  {discovery.tags && discovery.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      {discovery.tags.map(tag => (
                        <span key={tag} className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontSize: '0.75rem' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
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
