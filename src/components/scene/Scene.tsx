import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { usePhysicsStore } from '../../store/physicsStore';
import { CelestialBody } from './CelestialBody';
import { usePhysicsLoop } from '../../hooks/usePhysicsLoop';
import { OrbitPrediction } from './OrbitPrediction';

// Wrapper to avoid re-rendering entire Scene on toggle change if possible, 
// or just standard conditional render.
const OrbitPredictionWrapper = () => {
    const showPrediction = usePhysicsStore((state) => state.showPrediction);
    return showPrediction ? <OrbitPrediction /> : null;
};

// Internal component to hook into the R3F context
const SimulationContent = () => {
    usePhysicsLoop();
    const bodies = usePhysicsStore((state) => state.bodies);

    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 0]} intensity={2} /> {/* Sun-like light at center? Or ambient? */}
            {/* Maybe a light attached to the Sun body specifically would be better, but for now global light */}

            <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {bodies.map((body) => (
                <CelestialBody key={body.id} body={body} />
            ))}

            <OrbitPredictionWrapper />
        </>
    );
};

export const Scene = () => {
    const showGrid = usePhysicsStore((state) => state.showGrid);

    return (
        <Canvas camera={{ position: [0, 50, 50], fov: 45 }}>
            <color attach="background" args={['#050510']} />
            <SimulationContent />
            <OrbitControls makeDefault />

            {/* Visual Helpers */}
            {showGrid && (
                <>
                    <Grid
                        infiniteGrid
                        fadeDistance={500}
                        sectionColor="rgba(255, 255, 255, 0.4)"
                        cellColor="rgba(255, 255, 255, 0.2)"
                        sectionSize={20}
                        cellSize={10}
                        depthWrite={false}
                        // @ts-ignore
                        side={2}
                    />
                    <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                        <GizmoViewport axisColors={['#ff3653', '#0adb50', '#2c8fdf']} labelColor="black" />
                    </GizmoHelper>
                </>
            )}
        </Canvas>
    );
};
