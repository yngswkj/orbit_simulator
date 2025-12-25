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
const CameraController = () => {
    const bodies = usePhysicsStore((state) => state.bodies);
    const followingBodyId = usePhysicsStore((state) => state.followingBodyId);
    const cameraMode = usePhysicsStore((state) => state.cameraMode);
    const simulationTime = usePhysicsStore(state => state.simulationTime);
    const { camera, controls } = useThree();

    // Store previous target position to calculate delta
    const prevTargetPos = React.useRef<Vector3 | null>(null);

    // Initial Jump / Target Switch Logic
    React.useEffect(() => {
        if (!followingBodyId || !controls) {
            prevTargetPos.current = null;
            return;
        }

        const currentBodies = usePhysicsStore.getState().bodies;
        const body = currentBodies.find(b => b.id === followingBodyId);

        if (body) {
            const bodyPos = new Vector3(body.position.x, body.position.y, body.position.z);
            const orbitControls = controls as any;

            // Only do the "Maintain Angle" jump if in Free mode or first time
            if (cameraMode === 'free') {
                const direction = camera.position.clone().sub(orbitControls.target).normalize();
                if (direction.lengthSq() < 0.001) direction.set(0, 50, 50).normalize();
                const idealDist = body.radius * 12 + 5;
                const newCamPos = bodyPos.clone().add(direction.multiplyScalar(idealDist));
                camera.position.copy(newCamPos);
            }

            // For lock modes, useFrame will handle the position immediately

            orbitControls.target.copy(bodyPos);
            orbitControls.update();
            prevTargetPos.current = bodyPos;
        }
    }, [followingBodyId, camera, controls, cameraMode]);

    // Continuous Follow Logic
    useFrame((state) => {
        if (!followingBodyId) return;

        const body = bodies.find(b => b.id === followingBodyId);
        const sun = bodies.find(b => b.name === 'Sun');

        if (body && state.controls) {
            const controls = state.controls as any;
            const currentTargetPos = new Vector3(body.position.x, body.position.y, body.position.z);

            // Default Target: Center of the body
            let desiredControlTarget = currentTargetPos.clone();

            // 2. Camera Positioning Strategy
            if (cameraMode === 'free') {
                // Classic Follow: Maintain relative position
                if (prevTargetPos.current) {
                    const delta = currentTargetPos.clone().sub(prevTargetPos.current);
                    state.camera.position.add(delta);
                }
            } else if (cameraMode === 'sun_lock' && sun) {
                // Sun-Lock / Fixed View (Sun)
                const sunPos = new Vector3(sun.position.x, sun.position.y, sun.position.z);
                const sunToBodyDir = currentTargetPos.clone().sub(sunPos).normalize();

                // Preserve current zoom distance (radius from target)
                const currentDist = state.camera.position.distanceTo(currentTargetPos);

                // Calculate new position strictly along the vector, at the same distance
                const targetCamPos = currentTargetPos.clone().add(sunToBodyDir.multiplyScalar(currentDist));

                // Apply
                state.camera.position.lerp(targetCamPos, 0.1);

            } else if (cameraMode === 'surface_lock') {
                // Surface Lock / Fixed View (Surface)
                const surfaceHeight = body.radius * 1.05;
                const baseOffset = new Vector3(surfaceHeight, 0, 0);

                // Apply Rotation
                // rotationSpeed is now calibrated to Rad/Time
                const rotationY = (body.rotationSpeed || 0) * simulationTime;
                baseOffset.applyAxisAngle(new Vector3(0, 1, 0), rotationY);
                baseOffset.applyAxisAngle(new Vector3(0, 0, 1), (body.axialTilt || 0) * (Math.PI / 180));

                const cameraSurfacePos = currentTargetPos.clone().add(baseOffset);
                state.camera.position.copy(cameraSurfacePos);

                // Force Look Outward
                // Controls.target should be far away in direction of baseOffset
                const outwardDir = baseOffset.clone().normalize();

                // Set target far out
                desiredControlTarget = cameraSurfacePos.clone().add(outwardDir.multiplyScalar(100));
            }

            // Apply Target 
            controls.target.copy(desiredControlTarget);
            controls.update();

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
                    <GizmoHelper alignment="bottom-left" margin={[100, 100]}>
                        <GizmoViewport axisColors={['#ff3653', '#0adb50', '#2c8fdf']} labelColor="black" />
                    </GizmoHelper>
                </>
            )}
        </Canvas>
    );
};
