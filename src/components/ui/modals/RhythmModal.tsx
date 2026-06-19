import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RhythmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, pattern: string[]) => void;
}

const RhythmModal: React.FC<RhythmModalProps> = ({ isOpen, onClose, onSave }) => {
  const [newRhythmName, setNewRhythmName] = useState('');
  const [newRhythmPattern, setNewRhythmPattern] = useState<string[]>(Array(8).fill('-'));

  const toggleRhythmStep = (idx: number) => {
    const cycle = ['↓', '↑', '↓X', '↑X', 'X', 'B', 'P', '-'];
    const current = newRhythmPattern[idx];
    const nextIdx = (cycle.indexOf(current) + 1) % cycle.length;
    const newPattern = [...newRhythmPattern];
    newPattern[idx] = cycle[nextIdx];
    setNewRhythmPattern(newPattern);
  };

  const handleSave = () => {
    if (!newRhythmName.trim()) return;
    onSave(newRhythmName, newRhythmPattern);
    setNewRhythmName('');
    setNewRhythmPattern(Array(8).fill('-'));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 999 }}
      />
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', pointerEvents: 'none' }}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', pointerEvents: 'auto' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'white', margin: 0 }}>Crear Ritmo</h3>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
          </div>
        
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

          <button 
            onClick={handleSave} 
            style={{ width: '100%', padding: '14px', background: newRhythmName.trim() ? '#10b981' : '#334155', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: newRhythmName.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}
            disabled={!newRhythmName.trim()}
          >
            Guardar Ritmo
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RhythmModal;
