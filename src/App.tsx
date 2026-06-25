import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/layout/BottomNav';
import PhysicalExercises from './pages/PhysicalExercises';
import Gym from './pages/Gym';
import Transitions from './pages/Transitions';
import Technique from './pages/Technique';
import Repertoire from './pages/Repertoire';
import Creations from './pages/Creations';
import Sequencer from './pages/Sequencer';
import { audioEngine } from './core/infrastructure/audio/AudioEngine';

function App() {
  React.useEffect(() => {
    const unlockAudio = () => {
      audioEngine.unlock();
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };

    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });

    return () => {
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/fisico" replace />} />
          <Route path="/gimnasio" element={<Gym />} />
          <Route path="/transiciones" element={<Transitions />} />
          <Route path="/fisico" element={<PhysicalExercises />} />
          <Route path="/creaciones" element={<Creations />} />
          <Route path="/tecnica" element={<Technique />} />
          <Route path="/repertorio" element={<Repertoire />} />
          <Route path="/secuenciador" element={<Sequencer />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
