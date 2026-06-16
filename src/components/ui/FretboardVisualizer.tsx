import React from 'react';
import type { Position } from '../../core/domain/Exercise';

interface FretboardVisualizerProps {
  positions: Position[];
  startFret?: number;
  fretCount?: number;
}

const FretboardVisualizer: React.FC<FretboardVisualizerProps> = ({ 
  positions, 
  startFret = 1, 
  fretCount = 5 
}) => {
  const height = 60;
  const marginTop = 10;
  const marginBottom = 10;
  const usableHeight = height - marginTop - marginBottom;
  const stringSpacing = usableHeight / 5; // 6 strings

  const fretWidth = 20; // Correct proportion relative to string spacing
  const marginLeft = startFret === 1 ? 4 : 10; // Less margin if it's the nut
  const marginRight = 10;
  const width = marginLeft + (fretCount * fretWidth) + marginRight;

  // string 1 (thin) is at top, string 6 (thick) is at bottom
  const getStringY = (str: number) => marginTop + (str - 1) * stringSpacing;

  const renderStrings = () => {
    return Array.from({ length: 6 }).map((_, i) => {
      const strNumber = i + 1;
      const y = getStringY(strNumber);
      const strokeWidth = 0.5 + ((strNumber - 1) * 0.15); // thicker for lower strings
      return (
        <line 
          key={`string-${strNumber}`} 
          x1={marginLeft} 
          y1={y} 
          x2={width - marginRight} 
          y2={y} 
          stroke="#475569" 
          strokeWidth={strokeWidth} 
        />
      );
    });
  };

  const renderFrets = () => {
    return Array.from({ length: fretCount + 1 }).map((_, i) => {
      const x = marginLeft + i * fretWidth;
      const isNut = startFret === 1 && i === 0;
      return (
        <line 
          key={`fret-${i}`} 
          x1={x} 
          y1={marginTop} 
          x2={x} 
          y2={height - marginBottom} 
          stroke={isNut ? "#cbd5e1" : "#334155"} 
          strokeWidth={isNut ? 3 : 1} 
        />
      );
    });
  };

  const renderMarkers = () => {
    const markerFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21];
    return markerFrets.map(fret => {
      if (fret >= startFret && fret < startFret + fretCount) {
        const relativeFret = fret - startFret;
        const cx = marginLeft + (relativeFret + 0.5) * fretWidth;
        const cy = height / 2;
        
        if (fret === 12) {
          return (
            <g key={`marker-${fret}`}>
              <circle cx={cx} cy={marginTop + stringSpacing * 1.5} r={1.5} fill="#334155" />
              <circle cx={cx} cy={marginTop + stringSpacing * 3.5} r={1.5} fill="#334155" />
            </g>
          );
        }
        return <circle key={`marker-${fret}`} cx={cx} cy={cy} r={1.5} fill="#334155" />;
      }
      return null;
    });
  };

  const renderPositions = () => {
    return positions.map((pos, idx) => {
      if (pos.fret >= startFret && pos.fret < startFret + fretCount) {
        const relativeFret = pos.fret - startFret;
        const x = marginLeft + (relativeFret + 0.5) * fretWidth;
        const y = getStringY(pos.string);

        return (
          <g key={`pos-${idx}`}>
            <circle cx={x} cy={y} r={3} fill={pos.color || "#3b82f6"} />
            {pos.finger && (
              <text 
                x={x} 
                y={y} 
                fill="white" 
                fontSize="3.5" 
                fontWeight="bold"
                textAnchor="middle" 
                dominantBaseline="central"
              >
                {pos.finger}
              </text>
            )}
          </g>
        );
      }
      return null;
    });
  };

  return (
    <div style={{ 
      width: '100%', 
      backgroundColor: '#1e293b', 
      borderRadius: '8px',
      padding: '10px',
      position: 'relative'
    }}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {renderFrets()}
        {renderStrings()}
        {renderMarkers()}
        {renderPositions()}
      </svg>
      {/* If not starting at fret 1, show the starting fret number */}
      {startFret > 1 && (
        <div style={{ position: 'absolute', bottom: '2px', left: '10px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold' }}>
          {startFret}fr
        </div>
      )}
    </div>
  );
};

export default FretboardVisualizer;
