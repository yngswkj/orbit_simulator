import { Scene } from './components/scene/Scene';
import { ControlPanel } from './components/ui/ControlPanel';
import './App.css';

function App() {
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
        <h1 style={{ margin: 0, fontWeight: 300, fontSize: '2rem', letterSpacing: '-0.02em' }}>ORBIT <span style={{ fontWeight: 700 }}>SIMULATOR</span></h1>
        <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Interactive N-Body Gravity System</p>
      </div>

      <ControlPanel />
    </div>
  );
}

export default App;
