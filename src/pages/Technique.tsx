import React, { useState } from 'react';
import { BookOpen, ChevronRight, X, Layers, Hand, HandMetal, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GUITAR_GLOSSARY } from '../core/domain/Glossary';
import type { GlossaryTerm, GlossaryCategory } from '../core/domain/Glossary';

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

  const categories: GlossaryCategory[] = ['Fundamentos', 'Mano Izquierda', 'Mano Derecha', 'Teoría Aplicada'];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <header className="page-header">
        <h1 className="page-title">Biblioteca de Técnica</h1>
        <p className="page-subtitle">Aprende la teoría detrás de la práctica</p>
      </header>

      <div style={{ padding: '0 20px' }}>
        {categories.map(category => {
          const terms = GUITAR_GLOSSARY.filter(t => t.category === category);
          if (terms.length === 0) return null;
          
          return (
            <div key={category} style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getCategoryIcon(category)} {category}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {terms.map((term) => (
                  <div 
                    key={term.id} 
                    className="card" 
                    onClick={() => setSelectedTerm(term)}
                    style={{ margin: 0, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ backgroundColor: getCategoryColor(category), padding: '12px', borderRadius: '12px' }}>
                        <BookOpen size={20} color={category === 'Fundamentos' ? '#3b82f6' : category === 'Mano Izquierda' ? '#8b5cf6' : category === 'Mano Derecha' ? '#f59e0b' : '#10b981'} />
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600 }}>{term.title}</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Definición y Tips</p>
                      </div>
                    </div>
                    <ChevronRight color="var(--text-secondary)" />
                  </div>
                ))}
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
            <div className="card" style={{ width: '100%', maxWidth: '400px', margin: 0, border: '1px solid #3b82f6', boxShadow: '0 10px 40px rgba(59, 130, 246, 0.2)' }}>
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

              <button className="btn btn-secondary" style={{ marginTop: '24px', width: '100%' }} onClick={() => setSelectedTerm(null)}>
                Entendido
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Technique;
