import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { Vector3 } from 'three';
import * as THREE from 'three';
import { usePhysicsStore } from '../../store/physicsStore';
import { CelestialBody } from './CelestialBody';
import { usePhysicsLoop } from '../../hooks/usePhysicsLoop';
import { OrbitPrediction } from './OrbitPrediction';
import { DateDisplay } from '../ui/DateDisplay';

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

    // Store previous states to calculate deltas
    const prevBodyPos = React.useRef<Vector3 | null>(null);
    const prevSimulationTime = React.useRef<number>(0);
    const isFirstLockFrame = React.useRef(true);
    const lastUsedMode = React.useRef<string>('free');

    // Reset flags when target or mode changes
    // Initial Jump / Target Switch Logic
    React.useEffect(() => {
        isFirstLockFrame.current = true;

        // Handle switching TO lock modes
        if (followingBodyId && controls) {
            const body = usePhysicsStore.getState().bodies.find(b => b.id === followingBodyId);
            if (body) {
                const bodyPos = new Vector3(body.position.x, body.position.y, body.position.z);
                const orbitControls = controls as any;

                // If switching mode or target, ensure we set up the view correctly
                if (cameraMode !== lastUsedMode.current || isFirstLockFrame.current) {

                    if (cameraMode === 'surface_lock') {
                        // FPS Setup for Surface View:
                        // Y-Neutral (Equatorial)
                        // Look at Direction of Motion (Tangent)

                        // 1. Calculate safe Forward direction (Tangent to Orbit)
                        // Use Sun-Body vector to derive tangent, ensuring validity even if velocity is 0
                        const sun = usePhysicsStore.getState().bodies.find(b => b.name === 'Sun');
                        let forwardDir = new Vector3(0, 0, -1);
                        let radialDir = new Vector3(1, 0, 0);

                        if (sun) {
                            const sunPos = new Vector3(sun.position.x, sun.position.y, sun.position.z);
                            const toSun = sunPos.clone().sub(bodyPos).normalize();
                            radialDir = toSun.clone().negate(); // Radial Out (Midnight)

                            // Tangent = Up x toSun (Assuming CCW orbit implies Left Hand Rule? or Right?)
                            // Standard: Counter-Clockwise.
                            // Radial In x Up = Tangent? 
                            // (1,0,0) x (0,1,0) = (0,0,1).
                            // If Orbit is in X-Z. Sun at 0. Earth at (1,0,0).
                            // Velocity is (0,0,-1) or (0,0,1)?
                            // Usually CCW viewed from Top (Y+).
                            // (1,0,0) -> (0,0,-1).
                            // toSun = (-1, 0, 0).
                            // (-1,0,0) x (0,1,0) = (0,0,-1).
                            // So Tangent = toSun x Up.
                            forwardDir = toSun.clone().cross(new Vector3(0, 1, 0)).normalize();
                        } else {
                            // Fallback to Velocity if no sun
                            const v = new Vector3(body.velocity.x, body.velocity.y, body.velocity.z);
                            if (v.lengthSq() > 0.0001) forwardDir = v.normalize();
                        }

                        // Position: "Midnight" (Outer Edge)
                        // Radial Outwards from Sun
                        const surfaceOffset = radialDir.multiplyScalar(body.radius * 1.05);
                        const camPos = bodyPos.clone().add(surfaceOffset);

                        // Target: Point ahead in tangent direction
                        const targetPos = camPos.clone().add(forwardDir.multiplyScalar(100));

                        camera.position.copy(camPos);
                        orbitControls.target.copy(targetPos);

                    } else {
                        // Free or Sun Lock: Target = Center
                        orbitControls.target.copy(bodyPos);

                        // Move Camera Closer if needed (Initial Jump)
                        // Logic: Maintain direction, change distance
                        const direction = camera.position.clone().sub(orbitControls.target).normalize();
                        if (direction.lengthSq() < 0.001) direction.set(0, 50, 50).normalize();

                        // New Closer Distance: Radius * 4 (was * 12)
                        const idealDist = body.radius * 4 + 2;

                        // Only snap position if we are "far" or switching modes freshly
                        // Or if user specifically requested "Closer". 
                        // Let's enforce the closer distance on mode switch to ensure user sees the change.
                        const newCamPos = bodyPos.clone().add(direction.multiplyScalar(idealDist));
                        camera.position.copy(newCamPos);
                    }

                    orbitControls.update();
                }
            }
        }
        lastUsedMode.current = cameraMode;
    }, [followingBodyId, cameraMode, controls]);

    // Continuous Follow Logic
    useFrame((state) => {
        if (!followingBodyId) return;

        const body = bodies.find(b => b.id === followingBodyId);
        const sun = bodies.find(b => b.name === 'Sun'); // Assuming Sun is named 'Sun' or has ID 'sun'

        if (body && state.controls) {
            const controls = state.controls as any;
            const currentBodyPos = new Vector3(body.position.x, body.position.y, body.position.z);

            // Initialization for the first frame of tracking
            if (isFirstLockFrame.current || !prevBodyPos.current) {
                prevBodyPos.current = currentBodyPos.clone();
                prevSimulationTime.current = simulationTime;
                isFirstLockFrame.current = false;

                // Initial jump if needed (simple centering)
                controls.target.copy(currentBodyPos);
                controls.update();
                return;
            }

            // Delta time for rotation calculations
            // Note: physicsStore simulationTime might be jumping if dt changes, but it's accumulated time.
            // We use the difference between frames.
            // const dt = simulationTime - prevSimulationTime.current; // Unused in new logic

            if (cameraMode === 'free') {
                // Classic Follow: Just move camera by the same amount the body moved (Translation only)
                const deltaMove = currentBodyPos.clone().sub(prevBodyPos.current);
                state.camera.position.add(deltaMove);
                controls.target.add(deltaMove);

            } else if (cameraMode === 'sun_lock' || cameraMode === 'surface_lock') {
                // Sun-Lock & Surface-Lock: Orbit Fixed View
                // Both modes lock the camera orientation relative to the Orbit (Sun direction).
                // The only difference is the initial distance/position (handled in useEffect).

                if (sun) {
                    // 1. Calculate the rotation of the Sun->Body vector
                    const sunPos = new Vector3(sun.position.x, sun.position.y, sun.position.z);

                    const prevRel = prevBodyPos.current.clone().sub(sunPos);
                    const currRel = currentBodyPos.clone().sub(sunPos);

                    // Avoid division by zero or unstable rotation
                    if (prevRel.lengthSq() > 0.0001 && currRel.lengthSq() > 0.0001) {
                        prevRel.normalize();
                        currRel.normalize();

                        const quaternion = new THREE.Quaternion().setFromUnitVectors(prevRel, currRel);

                        // 2. Apply this rotation to the (Camera - Body) vector
                        const camToBody = state.camera.position.clone().sub(prevBodyPos.current);
                        camToBody.applyQuaternion(quaternion);

                        // 3. Move camera to new position
                        state.camera.position.copy(currentBodyPos.clone().add(camToBody));

                        // 4. Update target
                        // For Surface Lock, we might want to rotate the target too if it's offset?
                        // If target is Body Center (default for sun_lock), this is fine.
                        // For Surface Lock init, target is set to Surface Point.
                        // We should rotate the Target vector (Target - Body) as well to keep viewing direction fixed relative to orbit.

                        const targetToBody = controls.target.clone().sub(prevBodyPos.current);
                        targetToBody.applyQuaternion(quaternion);
                        controls.target.copy(currentBodyPos.clone().add(targetToBody));

                    } else {
                        const deltaMove = currentBodyPos.clone().sub(prevBodyPos.current);
                        state.camera.position.add(deltaMove);
                        controls.target.add(deltaMove);
                    }
                } else {
                    // Fallback if no Sun (Simple Translation)
                    const deltaMove = currentBodyPos.clone().sub(prevBodyPos.current);
                    state.camera.position.add(deltaMove);
                    controls.target.add(deltaMove);
                }
            }

            controls.update();
            prevBodyPos.current.copy(currentBodyPos);
            prevSimulationTime.current = simulationTime; // Update stored time
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

            {bodies.map((body) => {
                return <CelestialBody key={body.id} body={body} />;
            })}

            <OrbitPredictionWrapper />
        </>
    );
};

import { PerformanceStats } from '../ui/PerformanceStats';

export const Scene = () => {
    const showPerformance = usePhysicsStore((state) => state.showPerformance);
    const showGrid = usePhysicsStore((state) => state.showGrid);
    const cameraMode = usePhysicsStore((state) => state.cameraMode);
    const isSurfaceLock = cameraMode === 'surface_lock';

    // Camera tuned to see Neptune (r=250) at 12 o'clock (-Z) from 6 o'clock (+Z)
    // User requested return to original distance feeling
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 25, 50], fov: 45, near: 0.1, far: 50000 }}>
                <color attach="background" args={['#050510']} />
                <SimulationContent />
                <OrbitControls
                    makeDefault
                    enablePan={true}
                    minDistance={0.001}
                    enableZoom={!isSurfaceLock} // Lock zoom in Surface View
                />

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
            <DateDisplay />
            {showPerformance && <PerformanceStats />}
        </div>
    );
};
