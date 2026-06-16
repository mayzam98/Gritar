import React from 'react';
import { BookOpen, Video, ChevronRight } from 'lucide-react';

const Technique: React.FC = () => {
  const articles = [
    { title: '¿Cómo sostener la púa correctamente?', type: 'Video', time: '3 min' },
    { title: 'El secreto del Hammer-on', type: 'Artículo', time: '5 min' },
    { title: 'Evita el dolor de muñeca', type: 'Salud', time: '4 min' },
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '20px' }}>
      <header className="page-header">
        <h1 className="page-title">Biblioteca de Técnica</h1>
        <p className="page-subtitle">Aprende la teoría detrás de la práctica</p>
      </header>

      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {articles.map((art, idx) => (
            <div key={idx} className="card" style={{ margin: 0, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px' }}>
                  {art.type === 'Video' ? <Video color="#3b82f6" /> : <BookOpen color="#3b82f6" />}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600 }}>{art.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{art.type} • {art.time}</p>
                </div>
              </div>
              <ChevronRight color="var(--text-secondary)" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Technique;
