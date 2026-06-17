import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, PlayCircle, Heart, Video, Sparkles, Loader2, FileText, CheckCircle2, Key, Bot } from 'lucide-react';
import { AiProviderType } from '../core/domain/AiProvider';
import { AiFactory } from '../core/infrastructure/ai/AiFactory';
import { AnalyzeYouTubeTutorialUseCase } from '../core/application/AnalyzeYouTubeTutorialUseCase';
import InteractiveFretboard from '../components/ui/InteractiveFretboard';
import YouTubeSyncPlayer from '../components/ui/YouTubeSyncPlayer';
import { useAppStore } from '../core/application/store';

const Repertoire: React.FC = () => {
  const { savedSongs, saveSong, deleteSong } = useAppStore();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [hoveredChordIdx, setHoveredChordIdx] = useState<number | null>(null);
  
  // Settings for real AI integration
  // Reads from .env file if available, otherwise defaults to Gemini and empty key
  const [aiProviderType, setAiProviderType] = useState<AiProviderType>(
    (import.meta.env.VITE_AI_PROVIDER as AiProviderType) || AiProviderType.GEMINI
  );
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_AI_API_KEY || '');
  const [errorMsg, setErrorMsg] = useState('');

  const songs = [
    { title: 'Wonderwall', artist: 'Oasis', chords: ['Em7', 'G', 'Dsus4', 'A7sus4'], difficulty: 'Fácil' },
    { title: 'Let It Be', artist: 'The Beatles', chords: ['C', 'G', 'Am', 'F'], difficulty: 'Fácil' },
    { title: 'Hotel California', artist: 'Eagles', chords: ['Bm', 'F#', 'A', 'E', 'G', 'D', 'Em'], difficulty: 'Difícil' },
  ];

  const handleAnalyze = async () => {
    if (!url) return;
    if (!apiKey) {
      setErrorMsg("Por favor, introduce tu clave API para continuar.");
      return;
    }
    
    setErrorMsg('');
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // 1. Instantiate the correct provider using the Factory
      const provider = AiFactory.createProvider(aiProviderType, apiKey);
      
      // 2. Initialize the Use Case
      const useCase = new AnalyzeYouTubeTutorialUseCase(provider);
      
      // 3. Execute the analysis (this calls the real API with the mock transcript)
      const result = await useCase.execute(url);
      
      // Extract video ID for iframe
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[7].length === 11) ? match[7] : '';
      
      setAnalysisResult({
        title: "Tutorial Descifrado",
        originalVideo: url,
        videoId: videoId,
        chords: result.chords,
        chordTimestamps: result.chordTimestamps,
        strumming: result.strumming,
        summary: result.summary,
        currentSeekTime: 0
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar con la IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlayChord = (timeSeconds: number) => {
    if (analysisResult) {
      // Add a random trigger to guarantee the state changes and the iframe remounts,
      // even if you click the exact same chord twice or if the time is 0.
      setAnalysisResult({ 
        ...analysisResult, 
        currentSeekTime: timeSeconds,
        playbackTrigger: Math.random() 
      });
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '20px' }}>
      <header className="page-header">
        <h1 className="page-title">Repertorio</h1>
        <p className="page-subtitle">Aprende cualquier canción desde YouTube</p>
      </header>

      <div style={{ padding: '0 20px' }}>
        
        {/* YouTube AI Feature */}
        <div className="card" style={{ marginBottom: '24px', border: '1px solid #3b82f6', background: 'linear-gradient(180deg, rgba(59,130,246,0.1) 0%, rgba(30,41,59,1) 100%)' }}>
          <h2 className="card-title" style={{ color: '#60a5fa' }}>
            <Sparkles color="#60a5fa" />
            Extracción Inteligente (IA Real)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Elige tu motor de IA e ingresa tu clave API para procesar el tutorial en tiempo real.
          </p>

          {/* AI Settings */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px', position: 'relative' }}>
              <label style={{display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px'}}>Motor de IA:</label>
              <Bot size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '36px', pointerEvents: 'none' }} />
              <select 
                value={aiProviderType}
                onChange={(e) => setAiProviderType(e.target.value as AiProviderType)}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 40px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  fontSize: '0.9rem',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={AiProviderType.GEMINI}>Google Gemini</option>
                <option value={AiProviderType.OPENAI}>OpenAI (ChatGPT)</option>
                <option value={AiProviderType.DEEPSEEK}>DeepSeek</option>
              </select>
            </div>
            <div style={{ flex: '2 1 300px', position: 'relative' }}>
              <label style={{display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px'}}>Tu API Key (secreta):</label>
              <Key size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '36px', pointerEvents: 'none' }} />
              <input 
                type="password" 
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 40px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{display: 'block', fontSize: '0.8rem', color: '#60a5fa', marginBottom: '8px', fontWeight: 'bold'}}>Enlace del Tutorial de YouTube:</label>
            <div style={{ position: 'relative' }}>
              <Video size={20} color="#ef4444" style={{ position: 'absolute', left: '12px', top: '10px', pointerEvents: 'none' }} />
              <input 
                type="text" 
                placeholder="Pega aquí el link (ej. https://youtube.com/watch?v=...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 40px',
                  borderRadius: '8px',
                  border: '1px solid #3b82f6',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>
          
          <button 
            className="btn" 
            onClick={handleAnalyze}
            disabled={!url || isAnalyzing}
            style={{ width: '100%', marginBottom: '24px', justifyContent: 'center', padding: '12px' }}
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : 'Analizar Tutorial'}
          </button>

          {errorMsg && (
            <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {errorMsg}
            </div>
          )}

          <AnimatePresence>
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', color: '#60a5fa' }}>
                  <Loader2 className="animate-spin" size={20} />
                  <span style={{ fontSize: '0.9rem' }}>La IA está procesando el audio y los subtítulos...</span>
                </div>
              </motion.div>
            )}

            {analysisResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: '16px', padding: '16px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}
              >
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={20} />
                  Análisis Completado
                </h3>
                
                {/* Embedded Video Player */}
                {analysisResult.videoId && (
                  <div style={{ marginBottom: '24px' }}>
                    <YouTubeSyncPlayer 
                      videoId={analysisResult.videoId}
                      chordTimestamps={analysisResult.chordTimestamps || []}
                      chordDetails={analysisResult.chordDetails || []}
                      startSeconds={analysisResult.currentSeekTime}
                    />
                  </div>
                )}
                
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Acordes Detectados:</strong>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {(() => {
                      return (analysisResult.chordTimestamps || []).map((ct: any, idx: number) => {
                        const c = ct.chord;
                        const chordTime = ct.timeSeconds;
                        const hasTime = chordTime !== undefined && chordTime !== null;
                        const chordDetails = analysisResult.chordDetails?.find((d: any) => d.chord === c);
                        
                      return (
                        <div key={`${c}-${chordTime}-${idx}`} style={{ position: 'relative' }} onMouseEnter={() => setHoveredChordIdx(idx)} onMouseLeave={() => setHoveredChordIdx(null)}>
                          <button 
                            onClick={() => hasTime ? handlePlayChord(chordTime) : null}
                            title={hasTime ? `Ver acorde ${c} en el minuto ${Math.floor(chordTime / 60)}:${Math.floor(chordTime % 60).toString().padStart(2, '0')}` : 'Acorde detectado'}
                            style={{ 
                              backgroundColor: '#1e293b', 
                              padding: '6px 12px', 
                              borderRadius: '4px', 
                              fontSize: '0.9rem', 
                              fontWeight: 600, 
                              border: '1px solid #3b82f6',
                              color: 'white',
                              cursor: hasTime ? 'pointer' : 'default',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { if(hasTime) e.currentTarget.style.backgroundColor = '#3b82f6' }}
                            onMouseOut={(e) => { if(hasTime) e.currentTarget.style.backgroundColor = '#1e293b' }}
                          >
                            {c}
                            {hasTime && <PlayCircle size={14} color="#93c5fd" />}
                          </button>

                          {/* Hover Chord Diagram */}
                          <AnimatePresence>
                            {hoveredChordIdx === idx && chordDetails && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                style={{ 
                                  position: 'absolute', 
                                  bottom: '100%', 
                                  left: '50%', 
                                  transform: 'translateX(-50%)', 
                                  marginBottom: '12px', 
                                  zIndex: 50, 
                                  width: '240px', 
                                  backgroundColor: '#0f172a', 
                                  padding: '12px', 
                                  borderRadius: '12px', 
                                  border: '1px solid #3b82f6', 
                                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)' 
                                }}
                              >
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', textAlign: 'center', fontWeight: 'bold' }}>Cómo tocar {c}</div>
                                <InteractiveFretboard 
                                  positions={chordDetails.positions || []}
                                  startFret={chordDetails.startFret || 1}
                                  fretCount={4}
                                />
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '8px', textAlign: 'center' }}>
                                  Mapeado por IA desde el video
                                </div>
                                {/* Triangle pointer */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: '-6px',
                                  left: '50%',
                                  transform: 'translateX(-50%) rotate(45deg)',
                                  width: '12px',
                                  height: '12px',
                                  backgroundColor: '#0f172a',
                                  borderBottom: '1px solid #3b82f6',
                                  borderRight: '1px solid #3b82f6'
                                }} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    });
                  })()}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', fontStyle: 'italic' }}>
                    Haz clic en los acordes con ícono de Play para saltar al momento exacto en el video.
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Patrón de Rasgueo:</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {analysisResult.strumming}
                  </p>
                </div>

                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Resumen del Tutorial:</strong>
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {analysisResult.summary.map((point: string, i: number) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
                
                <button 
                  className="btn" 
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={() => {
                    saveSong({
                      url: analysisResult.originalVideo,
                      title: `Tutorial Guardado - ${new Date().toLocaleDateString()}`,
                      chords: analysisResult.chords,
                      chordTimestamps: analysisResult.chordTimestamps,
                      chordDetails: analysisResult.chordDetails,
                      strumming: analysisResult.strumming,
                      summary: analysisResult.summary
                    });
                    alert("¡Tutorial guardado en tu repertorio!");
                  }}
                >
                  <FileText size={18} />
                  Guardar en mi Repertorio
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: 600 }}>Tus Canciones Guardadas ({(savedSongs || []).length})</h3>

        <div style={{ display: 'grid', gap: '16px' }}>
          {(savedSongs || []).map((song) => (
            <div key={song.id} className="card" style={{ margin: 0, padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700 }}>{song.title}</h3>
                  <a href={song.url} target="_blank" rel="noreferrer" style={{ margin: 0, fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none' }}>Ver en YouTube</a>
                </div>
                <button 
                  onClick={() => deleteSong(song.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.8rem' }}
                >
                  Eliminar
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {song.chords.map((c, idx) => (
                  <span key={`${c}-${idx}`} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {c}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  {new Date(song.createdAt).toLocaleDateString()}
                </span>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  onClick={() => {
                    setUrl(song.url);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <PlayCircle size={16} /> Analizar de nuevo
                </button>
              </div>
            </div>
          ))}
          
          {(savedSongs || []).length === 0 && (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>No tienes canciones guardadas aún. Analiza un tutorial y guárdalo.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Repertoire;
