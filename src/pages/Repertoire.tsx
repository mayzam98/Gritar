import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, PlayCircle, Heart, Video, Sparkles, Loader2, FileText, CheckCircle2, Key, Bot, Plus, ArrowRightLeft } from 'lucide-react';
import { AiProviderType } from '../core/domain/AiProvider';
import { AiFactory } from '../core/infrastructure/ai/AiFactory';
import { AnalyzeYouTubeTutorialUseCase } from '../core/application/AnalyzeYouTubeTutorialUseCase';
import InteractiveFretboard from '../components/ui/InteractiveFretboard';
import YouTubeSyncPlayer from '../components/ui/YouTubeSyncPlayer';
import StrummingVisualizer from '../components/ui/StrummingVisualizer';
import { useAppStore } from '../core/application/store';

const MemoryCard: React.FC<{ song: any, index: number, deleteSong: any, updateSong: any, navigate: any, onLoadMemory: any }> = ({ song, index, deleteSong, updateSong, navigate, onLoadMemory }) => {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
      <div 
        style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => onLoadMemory(song)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#60a5fa' }}>Memoria {index}</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>({new Date(song.createdAt).toLocaleDateString()})</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); deleteSong(song.id); }}
          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

const Repertoire: React.FC = () => {
  const navigate = useNavigate();
  const { savedSongs, saveSong, updateSong, deleteSong } = useAppStore();
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
        title: (result as any).title || "Tutorial Descifrado",
        originalVideo: url,
        videoId: videoId,
        ...result,
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
        seekTrigger: Math.random() 
      });
    }
  };

  const onLoadMemory = (song: any) => {
    setUrl(song.url);
    setAnalysisResult({
      ...song,
      originalVideo: song.url,
      // ensure videoId exists in case it was missed
      videoId: song.url.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/)?.[7] || '',
      currentSeekTime: 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                
                <h2 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: 'bold' }}>
                  {analysisResult.title}
                </h2>
                
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
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Patrones de Rasgueo:</strong>
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {analysisResult.strummingPatterns && analysisResult.strummingPatterns.length > 0 ? (
                      analysisResult.strummingPatterns.map((sp: any, idx: number) => (
                        <div key={idx} style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 'bold' }}>{sp.name}</span>
                            {sp.timeSeconds !== undefined && sp.timeSeconds !== null && (
                              <button 
                                onClick={() => handlePlayChord(sp.timeSeconds)}
                                title={`Ver ritmo en el minuto ${Math.floor(sp.timeSeconds / 60)}:${Math.floor(sp.timeSeconds % 60).toString().padStart(2, '0')}`}
                                style={{ 
                                  background: 'none', border: 'none', padding: 0, cursor: 'pointer', 
                                  display: 'flex', alignItems: 'center', color: '#93c5fd', transition: 'color 0.2s' 
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#93c5fd'}
                              >
                                <PlayCircle size={14} />
                              </button>
                            )}
                            <div style={{ flex: 1 }} />
                            <button
                              onClick={() => {
                                // Extract the unique chords from analysisResult.chords in order of appearance
                                const uniqueChords = Array.from(new Set(analysisResult.chords || []));
                                const chordA = uniqueChords[0] || 'C';
                                const chordB = uniqueChords[1] || 'G';
                                
                                navigate('/transiciones', {
                                  state: {
                                    chordA,
                                    chordB,
                                    chordDetails: analysisResult.chordDetails || [],
                                    rhythm: {
                                      name: sp.name,
                                      pattern: sp.pattern
                                    }
                                  }
                                });
                              }}
                              className="btn btn-primary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)' }}
                            >
                              <ArrowRightLeft size={12} /> Practicar Transiciones
                            </button>
                          </div>
                          <StrummingVisualizer 
                            steps={sp.pattern} 
                            size="sm" 
                            isEditable={true}
                            onChange={(newSteps) => {
                              const newResult = { ...analysisResult };
                              newResult.strummingPatterns[idx].pattern = newSteps;
                              setAnalysisResult(newResult);
                            }}
                          />
                        </div>
                      ))
                    ) : Array.isArray(analysisResult.strumming) ? (
                      <StrummingVisualizer 
                        steps={analysisResult.strumming} 
                        size="sm" 
                        isEditable={true}
                        onChange={(newSteps) => {
                          setAnalysisResult({ ...analysisResult, strumming: newSteps });
                        }}
                      />
                    ) : analysisResult.strumming ? (
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {analysisResult.strumming}
                      </p>
                    ) : null}
                    
                    <button
                      className="btn btn-secondary"
                      style={{ alignSelf: 'flex-start', fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center' }}
                      onClick={() => {
                        const newResult = { ...analysisResult };
                        if (!newResult.strummingPatterns) newResult.strummingPatterns = [];
                        newResult.strummingPatterns.push({ name: `Ritmo Manual ${newResult.strummingPatterns.length + 1}`, pattern: ['↓'] });
                        setAnalysisResult(newResult);
                      }}
                    >
                      <Plus size={14} style={{ marginRight: '4px' }} /> Añadir Patrón de Rasgueo Manual
                    </button>
                  </div>
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
                      title: analysisResult.title || `Tutorial Guardado - ${new Date().toLocaleDateString()}`,
                      chords: analysisResult.chords,
                      chordTimestamps: analysisResult.chordTimestamps,
                      chordDetails: analysisResult.chordDetails,
                      strumming: analysisResult.strumming,
                      strummingPatterns: analysisResult.strummingPatterns,
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

        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: 600 }}>Tus Canciones Guardadas ({Object.keys((savedSongs || []).reduce((acc: any, song) => { acc[song.url] = true; return acc; }, {})).length})</h3>

        <div style={{ display: 'grid', gap: '16px' }}>
          {Object.values((savedSongs || []).reduce((acc: any, song) => {
            if (!acc[song.url]) {
              acc[song.url] = { url: song.url, title: song.title, memories: [] };
            }
            if (song.title && !song.title.startsWith('Tutorial Guardado - ')) {
              acc[song.url].title = song.title;
            }
            acc[song.url].memories.push(song);
            return acc;
          }, {})).map((group: any) => (
            <div key={group.url} className="card" style={{ margin: 0, padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700 }}>{group.title}</h3>
                  <a href={group.url} target="_blank" rel="noreferrer" style={{ margin: 0, fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none' }}>Ver en YouTube</a>
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                {group.memories.map((song: any, idx: number) => (
                  <MemoryCard 
                    key={song.id} 
                    song={song} 
                    index={idx + 1} 
                    deleteSong={deleteSong} 
                    updateSong={updateSong} 
                    navigate={navigate}
                    onLoadMemory={onLoadMemory}
                  />
                ))}
              </div>

              <button 
                className="btn btn-secondary" 
                style={{ padding: '8px 16px', fontSize: '0.9rem', width: '100%', marginTop: '8px' }}
                onClick={() => {
                  setUrl(group.url);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <PlayCircle size={16} /> Analizar de nuevo (Nueva Memoria)
              </button>
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
