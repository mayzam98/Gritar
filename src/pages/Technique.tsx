import React, { useState } from 'react';
import { BookOpen, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GUITAR_GLOSSARY, GlossaryTerm } from '../core/domain/Glossary';

const Technique: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '20px' }}>
      <header className="page-header">
        <h1 className="page-title">Biblioteca de Técnica</h1>
        <p className="page-subtitle">Aprende la teoría detrás de la práctica</p>
      </header>

      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {GUITAR_GLOSSARY.map((term) => (
            <div 
              key={term.id} 
              className="card" 
              onClick={() => setSelectedTerm(term)}
              style={{ margin: 0, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px' }}>
                  <BookOpen color="#3b82f6" />
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
