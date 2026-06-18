import React from 'react';
import { motion } from 'framer-motion';

interface NeonProgressRingProps {
  progress: number; // 0 to 100
  timeLeft: number;
  currentBpm: number;
  size?: number;
}

const NeonProgressRing: React.FC<NeonProgressRingProps> = ({ progress, timeLeft, currentBpm, size = 250 }) => {
  const radius = 100;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Change color based on progress (green -> orange -> red)
  let color = '#22c55e'; // green
  if (progress > 60) color = '#f59e0b'; // orange
  if (progress > 85) color = '#ef4444'; // red

  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, margin: '0 auto' }}>
      <svg viewBox="0 0 250 250" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
        <circle
          stroke="rgba(255,255,255,0.05)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="125"
          cy="125"
        />
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx="125"
          cy="125"
          animate={{ strokeDashoffset, stroke: color }}
          transition={{ duration: 0.5, ease: 'linear' }}
          filter="drop-shadow(0 0 10px currentColor)"
        />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <motion.div 
          animate={{ color: color }}
          style={{ fontSize: `${size * 0.28}px`, fontWeight: 900, textShadow: `0 0 10px ${color}` }}
        >
          {Math.ceil(timeLeft)}s
        </motion.div>
        <div style={{ fontSize: `${size * 0.1}px`, color: '#94a3b8', fontWeight: 'bold', marginTop: '-4px' }}>
          {Math.round(currentBpm)} <span style={{ fontSize: `${size * 0.07}px` }}>BPM</span>
        </div>
      </div>
    </div>
  );
};

export default NeonProgressRing;
