import React from 'react';
import type { Position } from '../../core/domain/Exercise';

import { audioEngine } from '../../core/infrastructure/audio/AudioEngine';

interface InteractiveFretboardProps {
  positions: Position[];
  onPositionToggle?: (string: number, fret: number) => void;
  startFret?: number;
  fretCount?: number;
}



const InteractiveFretboard: React.FC<InteractiveFretboardProps> = ({ 
  positions, 
  onPositionToggle,
  startFret = 1, 
  fretCount = 5 
}) => {
  const height = 60;
  const marginTop = 10;
  const marginBottom = 10;
  const usableHeight = height - marginTop - marginBottom;
  const stringSpacing = usableHeight / 5;

  const fretWidth = 20; 
  const marginLeft = startFret === 1 ? 4 : 10;
  const marginRight = 10;
  const width = marginLeft + (fretCount * fretWidth) + marginRight;

  const getStringY = (str: number) => marginTop + (str - 1) * stringSpacing;

  const renderStrings = () => {
    return Array.from({ length: 6 }).map((_, i) => {
      const strNumber = i + 1;
      const y = getStringY(strNumber);
      const strokeWidth = 0.5 + ((strNumber - 1) * 0.15); 
      return <line key={`string-${strNumber}`} x1={marginLeft} y1={y} x2={width - marginRight} y2={y} stroke="#475569" strokeWidth={strokeWidth} />;
    });
  };

  const renderFrets = () => {
    return Array.from({ length: fretCount + 1 }).map((_, i) => {
      const x = marginLeft + i * fretWidth;
      const isNut = startFret === 1 && i === 0;
      return (
        <g key={`fret-${i}`}>
          <line x1={x} y1={marginTop} x2={x} y2={height - marginBottom} stroke={isNut ? "#cbd5e1" : "#334155"} strokeWidth={isNut ? 3 : 1} />
          {i < fretCount && (
            <text 
              x={x + fretWidth / 2} 
              y={height - 2} 
              fill="#64748b" 
              fontSize="4" 
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              {startFret + i}
            </text>
          )}
        </g>
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

  const renderInteractiveZones = () => {
    const zones = [];
    for (let string = 1; string <= 6; string++) {
      for (let f = 0; f < fretCount; f++) {
        const actualFret = startFret + f;
        const x = marginLeft + (f + 0.5) * fretWidth;
        const y = getStringY(string);
        
        const activePos = positions.find(p => p.string === string && p.fret === actualFret);
        const isActive = !!activePos;

        zones.push(
          <g 
            key={`zone-${string}-${actualFret}`} 
            onClick={() => {
              if (isActive) {
                audioEngine.playNote(string, actualFret);
              }
              if (onPositionToggle) {
                onPositionToggle(string, actualFret);
              }
            }} 
            style={{ cursor: onPositionToggle || isActive ? 'pointer' : 'default' }}
          >
            <rect 
              x={x - fretWidth/2} 
              y={y - stringSpacing/2} 
              width={fretWidth} 
              height={stringSpacing} 
              fill="transparent" 
            />
            {isActive && (
              <g>
                <circle cx={x} cy={y} r={3.5} fill="#3b82f6" />
                {activePos.finger && (
                  <text x={x} y={y + 1.2} fill="white" fontSize="4" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">
                    {activePos.finger}
                  </text>
                )}
              </g>
            )}
          </g>
        );
      }
    }
    return zones;
  };

  return (
    <div style={{ width: '100%', backgroundColor: '#1e293b', borderRadius: '8px', padding: '10px', position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: 'auto', display: 'block' }}>
        {renderFrets()}
        {renderStrings()}
        {renderMarkers()}
        {renderInteractiveZones()}
      </svg>
    </div>
  );
};

export default InteractiveFretboard;
