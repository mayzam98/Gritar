import React from 'react';
import { motion } from 'framer-motion';
import type { Position } from '../../core/domain/Exercise';

export interface TransitionLine {
  fromString: number;
  fromFret: number;
  toString: number;
  toFret: number;
  color?: string;
}

interface FretboardVisualizerProps {
  positions: Position[];
  startFret?: number;
  fretCount?: number;
  mutedStrings?: number[];
  openStrings?: number[];
  bassString?: number;
  isAnimating?: boolean; // Used to trigger slower/smoother transitions if needed
  transitionLines?: TransitionLine[];
  nextPositions?: Position[];
}

const FretboardVisualizer: React.FC<FretboardVisualizerProps> = ({ 
  positions, 
  startFret = 1, 
  fretCount = 5,
  mutedStrings = [],
  openStrings = [],
  bassString,
  isAnimating = true,
  transitionLines = [],
  nextPositions = []
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
        <g key={`fret-${i}`}>
          <line 
            x1={x} 
            y1={marginTop} 
            x2={x} 
            y2={height - marginBottom} 
            stroke={isNut ? "#cbd5e1" : "#334155"} 
            strokeWidth={isNut ? 3 : 1} 
          />
          {/* Fret numbers printed below the fret space (not on the fret line itself) */}
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

  const renderPositions = () => {
    const fingerCounts: Record<string, number> = {};

    return positions.map((pos, idx) => {
      if (pos.fret >= startFret && pos.fret < startFret + fretCount) {
        const relativeFret = pos.fret - startFret;
        const x = marginLeft + (relativeFret + 0.5) * fretWidth;
        const y = getStringY(pos.string);
        
        let uniqueKey = pos.id || `pos-${idx}`;
        if (!pos.id && pos.finger) {
          fingerCounts[pos.finger] = (fingerCounts[pos.finger] || 0) + 1;
          uniqueKey = `finger-${pos.finger}-${fingerCounts[pos.finger]}`;
        }

        return (
          <g key={uniqueKey}>
            <motion.circle 
              initial={{ cx: x, cy: y, r: 0 }}
              animate={{ cx: x, cy: y, r: 3 }}
              exit={{ r: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              fill={pos.color || "#3b82f6"} 
            />
            {pos.finger && (
              <motion.text 
                initial={{ x, y, opacity: 0 }}
                animate={{ x, y, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                fill="white" 
                fontSize="3.5" 
                fontWeight="bold"
                textAnchor="middle" 
                dominantBaseline="central"
              >
                {pos.finger}
              </motion.text>
            )}
          </g>
        );
      }
      return null;
    });
  };

  const renderNextPositions = () => {
    if (!nextPositions || nextPositions.length === 0) return null;

    return nextPositions.map((pos, idx) => {
      if (pos.fret >= startFret && pos.fret < startFret + fretCount) {
        const relativeFret = pos.fret - startFret;
        const x = marginLeft + (relativeFret + 0.5) * fretWidth;
        const y = getStringY(pos.string);
        
        return (
          <g key={`next-pos-${idx}`}>
            <circle 
              cx={x} cy={y} r={3}
              fill="transparent" 
              stroke="rgba(234, 179, 8, 0.6)"
              strokeWidth="0.5"
              strokeDasharray="1,1"
            />
            {pos.finger && (
              <text 
                x={x} y={y} 
                fill="rgba(234, 179, 8, 0.6)" 
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

  const renderTransitionLines = () => {
    if (!transitionLines || transitionLines.length === 0) return null;

    return transitionLines.map((line, idx) => {
      // Solo renderizar si ambas posiciones están dentro del rango visible
      if (line.fromFret >= startFret && line.fromFret < startFret + fretCount &&
          line.toFret >= startFret && line.toFret < startFret + fretCount) {
        
        const relativeFromFret = line.fromFret - startFret;
        const relativeToFret = line.toFret - startFret;
        
        const x1 = marginLeft + (relativeFromFret + 0.5) * fretWidth;
        const y1 = getStringY(line.fromString);
        const x2 = marginLeft + (relativeToFret + 0.5) * fretWidth;
        const y2 = getStringY(line.toString);

        // Si la distancia es 0 (mismo lugar), no dibujamos línea
        if (x1 === x2 && y1 === y2) return null;

        // Calculamos un arco suave para la línea usando un path de Bézier
        const dx = x2 - x1;
        const dy = y2 - y1;
        const cx = x1 + dx / 2;
        const cy = y1 + dy / 2 - 10; // Curvar la línea hacia arriba

        return (
          <motion.path
            key={`transition-${idx}`}
            d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
            fill="transparent"
            stroke={line.color || "rgba(234, 179, 8, 0.6)"} // Amarillo tenue por defecto
            strokeWidth="1"
            strokeDasharray="2,2"
            markerEnd="url(#arrowhead)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        );
      }
      return null;
    });
  };

  const renderStringIndicators = () => {
    return Array.from({ length: 6 }).map((_, i) => {
      const strNumber = i + 1;
      const y = getStringY(strNumber);
      
      let indicator = '';
      let color = '#64748b';
      
      if (mutedStrings.includes(strNumber)) {
        indicator = 'X';
        color = '#ef4444'; // Red for muted
      } else if (openStrings.includes(strNumber)) {
        indicator = 'O';
        color = '#22c55e'; // Green for open
      }

      return (
        <g key={`ind-${strNumber}`}>
          {indicator && (
            <text 
              x={marginLeft - 4} 
              y={y} 
              fill={color} 
              fontSize="4" 
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {indicator}
            </text>
          )}
          {strNumber === bassString && (
            <text 
              x={marginLeft - (indicator ? 8 : 4)} 
              y={y} 
              fill="#f59e0b" 
              fontSize="4" 
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="central"
            >
              B
            </text>
          )}
        </g>
      );
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
        <defs>
          <marker 
            id="arrowhead" 
            markerWidth="4" 
            markerHeight="4" 
            refX="4" 
            refY="2" 
            orient="auto"
          >
            <path d="M 0 0 L 4 2 L 0 4 z" fill="rgba(234, 179, 8, 0.6)" />
          </marker>
        </defs>
        {renderStringIndicators()}
        {renderFrets()}
        {renderStrings()}
        {renderMarkers()}
        {renderNextPositions()}
        {renderTransitionLines()}
        {renderPositions()}
      </svg>
    </div>
  );
};

export default FretboardVisualizer;
