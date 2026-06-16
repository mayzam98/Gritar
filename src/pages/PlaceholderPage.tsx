import React from 'react';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="animate-fade-in" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
      <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '16px' }}>{title}</h1>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '300px' }}>
        Esta sección está en construcción. ¡Pronto habrá más contenido!
      </p>
    </div>
  );
};

export default PlaceholderPage;
