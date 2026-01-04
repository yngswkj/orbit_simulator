import { useEffect, useState } from 'react';
import { Scene } from './components/scene/Scene';
import { UnifiedSidePanel } from './components/ui/UnifiedSidePanel';
// PropertyInspector removed (merged into BodyInspector)
import { Onboarding } from './components/ui/Onboarding';
import { useTranslation } from './utils/i18n';
import { usePhysicsStore } from './store/physicsStore';
import './App.css';
import { runBenchmark, runGPUBenchmark } from './utils/benchmark';
import { ToastProvider } from './components/ui/common/Toast';

// Expose runBenchmark to window for testing
declare global {
  interface Window {
    runBenchmark: typeof runBenchmark;
    runGPUBenchmark: typeof runGPUBenchmark;
  }
}
window.runBenchmark = runBenchmark;
window.runGPUBenchmark = runGPUBenchmark;

function App() {
  const { t } = useTranslation();

  // Keyboard Shortcuts
  const simulationState = usePhysicsStore(state => state.simulationState);
  const setSimulationState = usePhysicsStore(state => state.setSimulationState);
  const bodies = usePhysicsStore(state => state.bodies);
  const followingBodyId = usePhysicsStore(state => state.followingBodyId);
  const setFollowingBody = usePhysicsStore(state => state.setFollowingBody);
  const setCameraMode = usePhysicsStore(state => state.setCameraMode);

  // Get name securely to avoid re-renders on every physics frame
  const followedBodyName = usePhysicsStore(state =>
    state.followingBodyId
      ? state.bodies.find(b => b.id === state.followingBodyId)?.name
      : null
  );

  const [overlayName, setOverlayName] = useState<string | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0);

  const checkGPUSupport = usePhysicsStore(state => state.checkGPUSupport);

  useEffect(() => {
    checkGPUSupport(); // Check if WebGPU is available

    // Cleanup physics resources on unmount
    return () => {
      usePhysicsStore.getState().cleanup();
    };
  }, [checkGPUSupport]);

  useEffect(() => {
    if (followedBodyName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOverlayName(followedBodyName);
      setOverlayOpacity(1);

      const timer = setTimeout(() => {
        setOverlayOpacity(0);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setOverlayOpacity(0);
    }
  }, [followedBodyName]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      // Ignore if typing in input or textarea
      if (activeTag === 'input' || activeTag === 'textarea') return;

      // Spacebar: Toggle Pause/Resume
      if (e.code === 'Space') {
        e.preventDefault();
        setSimulationState(simulationState === 'running' ? 'paused' : 'running');
      }

      // Undo/Redo
      if (e.ctrlKey && !e.shiftKey && e.code === 'KeyZ') {
        e.preventDefault();
        usePhysicsStore.getState().undo();
      }
      if ((e.ctrlKey && e.code === 'KeyY') || (e.ctrlKey && e.shiftKey && e.code === 'KeyZ')) {
        e.preventDefault();
        usePhysicsStore.getState().redo();
      }

      // Shift + Number: Camera Modes
      if (e.shiftKey) {
        if (e.code === 'Digit1') setCameraMode('free');
        if (e.code === 'Digit2' && followingBodyId) setCameraMode('sun_lock');
        if (e.code === 'Digit3' && followingBodyId) setCameraMode('surface_lock');
      }
      // Number (1-9): Toggle Follow Body
      else if (e.code.startsWith('Digit') && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const num = Number(e.code.replace('Digit', ''));
        // Only handle 1-9
        if (!isNaN(num) && num >= 1 && num <= 9) {
          const index = num - 1;
          if (index >= 0 && index < bodies.length) {
            const targetBody = bodies[index];
            if (followingBodyId === targetBody.id) {
              setFollowingBody(null);
            } else {
              setFollowingBody(targetBody.id);
              // Sync Inspector if it's open (selectedBodyId is set)
              if (usePhysicsStore.getState().selectedBodyId) {
                usePhysicsStore.getState().selectBody(targetBody.id);
              }
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [simulationState, setSimulationState, bodies, followingBodyId, setFollowingBody, setCameraMode]);

  return (
    <ToastProvider>
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <Scene />

        <div className="app-header" style={{
          position: 'absolute',
          top: 20,
          left: 20,
          color: 'white',
          fontFamily: "'Inter', sans-serif",
          pointerEvents: 'none',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          opacity: usePhysicsStore(state => state.zenMode) ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out'
        }}>
          <h1 style={{ margin: 0, fontWeight: 300, fontSize: '2rem', letterSpacing: '-0.02em' }}>{t('app_title')}</h1>
          <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>{t('app_subtitle')}</p>

          <div style={{
            marginTop: '10px',
            fontSize: '2.5rem',
            fontWeight: 300,
            opacity: overlayOpacity,
            transition: 'opacity 0.5s ease-in-out',
            color: '#3b82f6',
            textShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
            letterSpacing: '-0.02em'
          }}>
            {overlayName}
          </div>
        </div>

        <UnifiedSidePanel />

        <Onboarding />
      </div>
    </ToastProvider>
  );
}

export default App;
