import React, { useState } from 'react';
import { BookOpen, ChevronRight, X, Layers, Hand, HandMetal, BrainCircuit, CheckCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GUITAR_GLOSSARY } from '../core/domain/Glossary';
import type { GlossaryTerm, GlossaryCategory } from '../core/domain/Glossary';
import { useAppStore } from '../core/application/store';

const getCategoryIcon = (cat: GlossaryCategory) => {
  switch (cat) {
    case 'Fundamentos': return <Layers color="#3b82f6" />;
    case 'Mano Izquierda': return <Hand color="#8b5cf6" />;
    case 'Mano Derecha': return <HandMetal color="#f59e0b" />;
    case 'Teoría Aplicada': return <BrainCircuit color="#10b981" />;
  }
};

const getCategoryColor = (cat: GlossaryCategory) => {
  switch (cat) {
    case 'Fundamentos': return 'rgba(59, 130, 246, 0.1)';
    case 'Mano Izquierda': return 'rgba(139, 92, 246, 0.1)';
    case 'Mano Derecha': return 'rgba(245, 158, 11, 0.1)';
    case 'Teoría Aplicada': return 'rgba(16, 185, 129, 0.1)';
  }
};

const Technique: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const { masteredTechniques, markTechniqueAsMastered } = useAppStore();

  const categories: GlossaryCategory[] = ['Fundamentos', 'Mano Izquierda', 'Mano Derecha', 'Teoría Aplicada'];
  const progressPercentage = Math.round((masteredTechniques.length / GUITAR_GLOSSARY.length) * 100) || 0;

  const handleMaster = () => {
    if (selectedTerm) {
      if (!masteredTechniques.includes(selectedTerm.id)) {
        markTechniqueAsMastered(selectedTerm.id);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
      setTimeout(() => setSelectedTerm(null), 2200);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <header className="page-header" style={{ paddingBottom: '10px' }}>
        <h1 className="page-title">Academia Técnica</h1>
        <p className="page-subtitle">Aprende la teoría y domina los fundamentos</p>
      </header>

      <div style={{ padding: '0 20px 20px 20px' }}>
        <motion.div className="card" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px', background: 'linear-gradient(145deg, #1e293b, #0f172a)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc' }}>
              <Award color="#eab308" /> Progreso de Maestro
            </h2>
            <span style={{ fontWeight: 'bold', color: '#eab308' }}>{progressPercentage}%</span>
          </div>
          <div style={{ height: '12px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '6px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #f59e0b, #eab308)', borderRadius: '6px' }}
            />
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Has dominado {masteredTechniques.length} de {GUITAR_GLOSSARY.length} conceptos.
          </p>
        </motion.div>

        {categories.map(category => {
          const terms = GUITAR_GLOSSARY.filter(t => t.category === category);
          if (terms.length === 0) return null;
          
          return (
            <div key={category} style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getCategoryIcon(category)} {category}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {terms.map((term) => {
                  const isMastered = masteredTechniques.includes(term.id);
                  return (
                    <div 
                      key={term.id} 
                      className="card" 
                      onClick={() => setSelectedTerm(term)}
                      style={{ 
                        margin: 0, 
                        padding: '16px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s',
                        border: isMastered ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ backgroundColor: isMastered ? 'rgba(34, 197, 94, 0.1)' : getCategoryColor(category), padding: '12px', borderRadius: '12px' }}>
                          {isMastered ? <CheckCircle size={20} color="#22c55e" /> : <BookOpen size={20} color={category === 'Fundamentos' ? '#3b82f6' : category === 'Mano Izquierda' ? '#8b5cf6' : category === 'Mano Derecha' ? '#f59e0b' : '#10b981'} />}
                        </div>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600, color: isMastered ? '#a7f3d0' : 'var(--text-primary)' }}>{term.title}</h3>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: isMastered ? '#22c55e' : 'var(--text-secondary)' }}>
                            {isMastered ? 'Dominado' : 'Por aprender'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight color="var(--text-secondary)" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedTerm && (
          <motion.div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.95)', zIndex: 3000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="card" style={{ width: '100%', maxWidth: '400px', margin: 0, border: '1px solid #3b82f6', boxShadow: '0 10px 40px rgba(59, 130, 246, 0.2)', position: 'relative', overflow: 'hidden' }}>
              
              {showCelebration && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(34, 197, 94, 0.9)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: 'spring' }}>
                    <Award size={64} color="#fff" />
                  </motion.div>
                  <h2 style={{ color: 'white', marginTop: '16px', fontWeight: 800 }}>¡CONCEPTO DOMINADO!</h2>
                </motion.div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#60a5fa' }}>{selectedTerm.title}</h3>
                <button onClick={() => setSelectedTerm(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                  {selectedTerm.category}
                </span>
              </div>
              
              <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.5', marginBottom: '20px' }}>
                {selectedTerm.description}
              </p>
              
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '8px' }}>
                <strong style={{ color: '#60a5fa', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>💡 TIP DE ORO:</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{selectedTerm.tips}</p>
              </div>

              {masteredTechniques.includes(selectedTerm.id) ? (
                <button className="btn btn-secondary" style={{ marginTop: '24px', width: '100%', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid #22c55e' }} onClick={() => setSelectedTerm(null)}>
                  <CheckCircle size={18} /> Ya dominas esto
                </button>
              ) : (
                <button className="btn" style={{ marginTop: '24px', width: '100%', background: 'linear-gradient(90deg, #f59e0b, #eab308)', color: 'black', fontWeight: 'bold' }} onClick={handleMaster}>
                  ¡Dominado!
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Technique;
