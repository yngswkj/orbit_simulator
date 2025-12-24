import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { Vector3 } from 'three';
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
// Handles Camera Follow logic
// Handles Camera Follow logic
const CameraController = () => {
    const bodies = usePhysicsStore((state) => state.bodies);
    const followingBodyId = usePhysicsStore((state) => state.followingBodyId);
    const { camera, controls } = useThree();

    // Store previous target position to calculate delta
    const prevTargetPos = React.useRef<Vector3 | null>(null);

    // Initial Jump / Target Switch Logic
    React.useEffect(() => {
        if (!followingBodyId || !controls) {
            prevTargetPos.current = null;
            return;
        }

        // Access bodies directly from store state to avoid adding 'bodies' to dependency array
        const currentBodies = usePhysicsStore.getState().bodies;
        const body = currentBodies.find(b => b.id === followingBodyId);

        if (body) {
            const bodyPos = new Vector3(body.position.x, body.position.y, body.position.z);
            const orbitControls = controls as any;

            // Calculate direction from current target to camera to maintain angle
            const direction = camera.position.clone().sub(orbitControls.target).normalize();
            // Fallback if camera is exactly at target
            if (direction.lengthSq() < 0.001) direction.set(0, 50, 50).normalize();

            // Desired distance based on body size
            const idealDist = body.radius * 12 + 5;

            const newCamPos = bodyPos.clone().add(direction.multiplyScalar(idealDist));

            camera.position.copy(newCamPos);
            orbitControls.target.copy(bodyPos);
            orbitControls.update();

            prevTargetPos.current = bodyPos;
        }
    }, [followingBodyId, camera, controls]);

    // Continuous Follow Logic
    useFrame((state) => {
        if (!followingBodyId) return;

        const body = bodies.find(b => b.id === followingBodyId);
        if (body && state.controls) {
            const controls = state.controls as any;
            const currentTargetPos = new Vector3(body.position.x, body.position.y, body.position.z);

            if (prevTargetPos.current) {
                // Calculate how much the target moved
                const delta = currentTargetPos.clone().sub(prevTargetPos.current);

                // Move camera by same delta to maintain relative position
                state.camera.position.add(delta);

                // Update controls target (crucial for OrbitControls to rotate around new center)
                controls.target.copy(currentTargetPos);
                controls.update();
            }

            // Update ref for next frame
            prevTargetPos.current = currentTargetPos;
        }
    });

    return null;
};

const SimulationContent = () => {
    usePhysicsLoop();
    const bodies = usePhysicsStore((state) => state.bodies);
    const showHabitableZone = usePhysicsStore((state) => state.showHabitableZone);
    const sun = bodies.find(b => b.name === 'Sun');

    return (
        <>
            <CameraController />
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 0]} intensity={2} decay={0} distance={1000} />
            {/* Added decay=0 to ensure light reaches far planets like Earth without dimming too much */}

            <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {showHabitableZone && sun && (
                <mesh position={[sun.position.x, sun.position.y, sun.position.z]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[19, 28, 64]} />
                    <meshBasicMaterial color="#44ff44" opacity={0.15} transparent side={2} />
                </mesh>
            )}

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
            <OrbitControls makeDefault enablePan={true} />

            {/* Visual Helpers */}
            {showGrid && (
                <>
                    <Grid
                        infiniteGrid
                        fadeDistance={500}
                        sectionColor="#555555"
                        cellColor="#333333"
                        sectionSize={20}
                        cellSize={10}
                        // @ts-ignore
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
