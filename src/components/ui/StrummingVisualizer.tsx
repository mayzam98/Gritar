import React from 'react';

export interface StrummingVisualizerProps {
  steps: string[];
  currentBeat?: number; // 1-indexed, optional. If provided, highlights the beat.
  size?: 'sm' | 'md' | 'lg';
}

const StrummingVisualizer: React.FC<StrummingVisualizerProps> = ({ steps, currentBeat = 0, size = 'md' }) => {
  const containerStyle = {
    display: 'flex', 
    gap: size === 'sm' ? '8px' : '12px', 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    padding: size === 'sm' ? '8px 16px' : '12px 24px', 
    borderRadius: '16px',
    flexWrap: 'wrap' as const,
    alignItems: 'center'
  };

  const getFontSize = (step: string) => {
    if (size === 'sm') return step === 'B' || step === 'X' ? '1.2rem' : '1.5rem';
    return step === 'B' || step === 'X' ? '1.5rem' : '2rem';
  };

  return (
    <div style={containerStyle}>
      {steps.map((step, i) => {
        // currentBeat === 0 means no active beat is highlighted, so we show them all at full opacity.
        const isActive = currentBeat === 0 || currentBeat === i + 1;
        const isSilent = step === '-';
        
        let stepColor = '#94a3b8'; // Default grey
        if (isActive) {
          if (step === 'B') stepColor = '#10b981'; // Emerald for Bass
          else if (step === 'X') stepColor = '#ef4444'; // Red for Mute/Slap
          else if (i === 0) stepColor = '#3b82f6'; // Blue for first beat
          else stepColor = '#eab308'; // Yellow for others
        }

        return (
          <div key={i} style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', 
            opacity: isActive && !isSilent ? 1 : 0.3,
            transform: isActive && !isSilent ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.1s'
          }}>
            <span style={{ 
              fontSize: getFontSize(step), 
              color: stepColor, 
              fontWeight: 'bold',
              height: size === 'sm' ? '24px' : '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isSilent ? '•' : step}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px' }}>Beat {i + 1}</span>
          </div>
        );
      })}
    </div>
  );
};

export default StrummingVisualizer;
