import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import FretboardVisualizer from './FretboardVisualizer';
import { motion, AnimatePresence } from 'framer-motion';

interface Timestamp {
  chord: string;
  timeSeconds: number;
}

interface YouTubeSyncPlayerProps {
  videoId: string;
  chordTimestamps: Timestamp[];
  chordDetails: any[];
  startSeconds?: number;
}

import { CORE_CHORDS } from '../../core/domain/ChordDictionary';

const YouTubeSyncPlayer: React.FC<YouTubeSyncPlayerProps> = ({ 
  videoId, 
  chordTimestamps, 
  chordDetails,
  startSeconds = 0 
}) => {
  const [player, setPlayer] = useState<any>(null);
  const [activeChordId, setActiveChordId] = useState<string | null>(null);
  const requestRef = useRef<number>(0);

  const onPlayerReady = (event: any) => {
    setPlayer(event.target);
    if (startSeconds > 0) {
      event.target.seekTo(startSeconds);
    }
  };

  const onStateChange = (event: any) => {
    // If player starts playing (state 1), start sync loop
    if (event.data === 1) {
      startSyncLoop();
    } else {
      stopSyncLoop();
    }
  };

  const startSyncLoop = () => {
    if (!player) return;

    const loop = () => {
      // YouTube API getCurrentTime might return a promise in some rare wrappers, 
      // but react-youtube uses the standard API which is sync.
      const currentTime = player.getCurrentTime() || 0;
      
      // Find the chord that should be playing at currentTime
      // We look for the latest timestamp that is <= currentTime
      let currentActive: string | null = null;
      
      if (chordTimestamps && chordTimestamps.length > 0) {
        const pastTimestamps = chordTimestamps.filter(t => currentTime >= t.timeSeconds);
        if (pastTimestamps.length > 0) {
          // Get the one with the highest timeSeconds
          const latest = pastTimestamps.reduce((prev, current) => (prev.timeSeconds > current.timeSeconds) ? prev : current);
          currentActive = latest.chord;
        }
      }

      if (currentActive !== activeChordId) {
        setActiveChordId(currentActive);
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
  };

  const stopSyncLoop = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  useEffect(() => {
    // If startSeconds changes externally, seek the player
    if (player && startSeconds > 0) {
      player.seekTo(startSeconds);
      player.playVideo();
    }
  }, [startSeconds, player]);

  useEffect(() => {
    return () => stopSyncLoop();
  }, []);

  // Find the details of the active chord (fallback to CORE_CHORDS if AI didn't provide it)
  let activeChordDef = activeChordId && chordDetails ? chordDetails.find(c => c.chord === activeChordId || c.id === activeChordId) : null;
  if (activeChordId && !activeChordDef) {
    const fallback = CORE_CHORDS.find(c => c.name.toLowerCase().includes(activeChordId.toLowerCase()) || c.id.toLowerCase() === activeChordId.toLowerCase());
    if (fallback) {
      activeChordDef = {
        ...fallback,
        chord: activeChordId,
        startFret: fallback.positions.length > 0 ? Math.max(1, Math.min(...fallback.positions.map(p => p.fret)) - 1) : 1
      };
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Video Player */}
      <div style={{ 
        position: 'relative', 
        paddingBottom: '56.25%', 
        height: 0, 
        overflow: 'hidden', 
        borderRadius: '12px',
        border: '2px solid #3b82f6',
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
      }}>
        <YouTube 
          videoId={videoId} 
          opts={{
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: 1,
              controls: 1,
              rel: 0,
              modestbranding: 1,
              origin: window.location.origin
            }
          }}
          onReady={onPlayerReady}
          onStateChange={onStateChange}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
      </div>

      {/* Synchronized Fretboard */}
      <div style={{ 
        backgroundColor: '#0f172a', 
        padding: '24px', 
        borderRadius: '16px', 
        border: '1px solid #1e293b',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            backgroundColor: activeChordId ? '#10b981' : '#ef4444',
            boxShadow: activeChordId ? '0 0 10px #10b981' : '0 0 10px #ef4444'
          }} />
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {activeChordId ? 'Sincronizado' : 'Esperando acorde...'}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {activeChordId ? (
            <motion.div
              key={activeChordId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <h3 style={{ 
                fontSize: '3rem', 
                margin: '0 0 24px 0', 
                color: '#10b981', 
                textShadow: '0 0 20px rgba(16, 185, 129, 0.4)' 
              }}>
                {activeChordId}
              </h3>
              
              {activeChordDef ? (
                <div style={{ transform: 'scale(1.2)', transformOrigin: 'top center', pointerEvents: 'none' }}>
                  <FretboardVisualizer 
                    positions={activeChordDef.positions || []}
                    startFret={activeChordDef.startFret || 1}
                    fretCount={5}
                    bassString={activeChordDef.bassString}
                    mutedStrings={activeChordDef.mutedStrings}
                    openStrings={activeChordDef.openStrings}
                  />
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '1.2rem', marginTop: '20px' }}>
                  Posición del acorde no detectada
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#475569',
                fontSize: '1.2rem',
                marginTop: '100px'
              }}
            >
              Reproduce el video para ver los acordes en tiempo real
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default YouTubeSyncPlayer;
