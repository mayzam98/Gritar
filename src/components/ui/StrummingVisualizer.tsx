import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface StrummingVisualizerProps {
  steps: string[];
  currentBeat?: number; // 1-indexed, optional. If provided, highlights the beat.
  size?: 'sm' | 'md' | 'lg';
  isEditable?: boolean;
  onChange?: (newSteps: string[]) => void;
}

const SYMBOLS = ['↓', '↑', 'X', 'B', '-', '↓X'];

const StrummingVisualizer: React.FC<StrummingVisualizerProps> = ({ steps, currentBeat = 0, size = 'md', isEditable = false, onChange }) => {
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
    if (size === 'sm') return step === 'B' || step === 'X' || step === '↓X' ? '1.2rem' : '1.5rem';
    return step === 'B' || step === 'X' || step === '↓X' ? '1.5rem' : '2rem';
  };

  const handleCycleSymbol = (idx: number) => {
    if (!isEditable || !onChange) return;
    const currentSymbol = steps[idx];
    let currentIndex = SYMBOLS.indexOf(currentSymbol);
    if (currentIndex === -1) currentIndex = 0; // Fallback
    const nextIndex = (currentIndex + 1) % SYMBOLS.length;
    const newSteps = [...steps];
    newSteps[idx] = SYMBOLS[nextIndex];
    onChange(newSteps);
  };

  const handleRemove = (idx: number) => {
    if (!isEditable || !onChange) return;
    const newSteps = steps.filter((_, i) => i !== idx);
    onChange(newSteps);
  };

  const handleAdd = () => {
    if (!isEditable || !onChange) return;
    onChange([...steps, '↓']);
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
          else if (step === 'X' || step === '↓X') stepColor = '#ef4444'; // Red for Mute/Slap
          else if (i === 0) stepColor = '#3b82f6'; // Blue for first beat
          else stepColor = '#eab308'; // Yellow for others
        }

        return (
          <div key={i} style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', 
            opacity: isActive && !isSilent ? 1 : (isEditable ? 0.7 : 0.3),
            transform: isActive && !isSilent && !isEditable ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.1s',
            position: 'relative'
          }}>
            <button 
              onClick={() => handleCycleSymbol(i)}
              disabled={!isEditable}
              style={{ 
                background: 'none', border: 'none', padding: 0, margin: 0,
                cursor: isEditable ? 'pointer' : 'default',
                fontSize: getFontSize(step), 
                color: stepColor, 
                fontWeight: 'bold',
                height: size === 'sm' ? '24px' : '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none'
              }}
              title={isEditable ? "Haz clic para cambiar el ritmo" : undefined}
            >
              {isSilent ? '•' : step}
            </button>
            <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px' }}>Beat {i + 1}</span>
            {isEditable && (
              <button 
                onClick={() => handleRemove(i)}
                style={{ 
                  background: 'none', border: 'none', padding: '2px', marginTop: '4px',
                  cursor: 'pointer', color: '#ef4444', opacity: 0.7
                }}
                title="Eliminar este beat"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        );
      })}
      
      {isEditable && (
        <button 
          onClick={handleAdd}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: '1px dashed #475569', borderRadius: '8px', 
            width: size === 'sm' ? '24px' : '32px', height: size === 'sm' ? '24px' : '32px',
            cursor: 'pointer', color: '#94a3b8', padding: 0
          }}
          title="Agregar un nuevo beat"
        >
          <Plus size={size === 'sm' ? 14 : 18} />
        </button>
      )}
    </div>
  );
};

export default StrummingVisualizer;
