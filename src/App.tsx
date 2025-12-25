import { useEffect } from 'react';
import { Scene } from './components/scene/Scene';
import { ControlPanel } from './components/ui/ControlPanel';
import { BodyInspector } from './components/ui/BodyInspector';
import { Tour } from './components/ui/Tour';
import { useTranslation } from './utils/i18n';
import { usePhysicsStore } from './store/physicsStore';
import './App.css';

function App() {
  const { t } = useTranslation();

  // Keyboard Shortcuts
  const simulationState = usePhysicsStore(state => state.simulationState);
  const setSimulationState = usePhysicsStore(state => state.setSimulationState);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar to toggle Pause/Resume
      if (e.code === 'Space') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        // Ignore if typing in input or textarea
        if (activeTag === 'input' || activeTag === 'textarea') return;

        e.preventDefault(); // Prevent scrolling
        setSimulationState(simulationState === 'running' ? 'paused' : 'running');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [simulationState, setSimulationState]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Scene />

      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        fontFamily: "'Inter', sans-serif",
        pointerEvents: 'none',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }}>
        <h1 style={{ margin: 0, fontWeight: 300, fontSize: '2rem', letterSpacing: '-0.02em' }}>{t('app_title')}</h1>
        <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>{t('app_subtitle')}</p>
      </div>

      <ControlPanel />
      <BodyInspector />
      <Tour />
    </div>
  );
}

export default App;
