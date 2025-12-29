import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { Vector3 } from 'three';
import * as THREE from 'three';
import { usePhysicsStore, physicsStats } from '../../store/physicsStore';
import { CelestialBody } from './CelestialBody';
import { usePhysicsLoop } from '../../hooks/usePhysicsLoop';
import { OrbitPrediction } from './OrbitPrediction';
import { DateDisplay } from '../ui/DateDisplay';
import type { CelestialBody as BodyType } from '../../types/physics';

// Helper to find the primary star (most massive star body)
const findPrimaryStar = (bodies: BodyType[]): BodyType | undefined => {
    const stars = bodies.filter(b => b.isStar);
    if (stars.length === 0) return undefined;
    return stars.reduce((max, star) => star.mass > max.mass ? star : max, stars[0]);
};

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
                        // Use Star-Body vector to derive tangent, ensuring validity even if velocity is 0
                        const primaryStar = findPrimaryStar(usePhysicsStore.getState().bodies);
                        let forwardDir = new Vector3(0, 0, -1);
                        let radialDir = new Vector3(1, 0, 0);

                        if (primaryStar) {
                            const starPos = new Vector3(primaryStar.position.x, primaryStar.position.y, primaryStar.position.z);
                            const toStar = starPos.clone().sub(bodyPos).normalize();
                            radialDir = toStar.clone().negate(); // Radial Out (Midnight)

                            // Tangent = toStar x Up (for CCW orbit)
                            forwardDir = toStar.clone().cross(new Vector3(0, 1, 0)).normalize();
                        } else {
                            // Fallback to Velocity if no star
                            const v = new Vector3(body.velocity.x, body.velocity.y, body.velocity.z);
                            if (v.lengthSq() > 0.0001) forwardDir = v.normalize();
                        }

                        // Position: "Midnight" (Outer Edge)
                        // Radial Outwards from Star
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
        // Update stats (Always run this, even if not following)
        physicsStats.cameraPosition = [
            state.camera.position.x,
            state.camera.position.y,
            state.camera.position.z
        ];

        if (!followingBodyId) return;

        const body = bodies.find(b => b.id === followingBodyId);
        const primaryStar = findPrimaryStar(bodies);

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
                // Orbit Fixed View: Lock camera orientation relative to primary star
                // The only difference is the initial distance/position (handled in useEffect).

                if (primaryStar) {
                    // 1. Calculate the rotation of the Star->Body vector
                    const starPos = new Vector3(primaryStar.position.x, primaryStar.position.y, primaryStar.position.z);

                    const prevRel = prevBodyPos.current.clone().sub(starPos);
                    const currRel = currentBodyPos.clone().sub(starPos);

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

                        // 4. Update target (rotate Target-Body vector to keep viewing direction fixed)
                        const targetToBody = controls.target.clone().sub(prevBodyPos.current);
                        targetToBody.applyQuaternion(quaternion);
                        controls.target.copy(currentBodyPos.clone().add(targetToBody));

                    } else {
                        const deltaMove = currentBodyPos.clone().sub(prevBodyPos.current);
                        state.camera.position.add(deltaMove);
                        controls.target.add(deltaMove);
                    }
                } else {
                    // Fallback if no star (Simple Translation)
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

// Component to handle camera adjustment when distance scale changes
const CameraScaleAdjuster = () => {
    const { camera, controls } = useThree();

    React.useEffect(() => {
        const handleScaleChange = (e: Event) => {
            const customEvent = e as CustomEvent<{ realistic: boolean; factor: number }>;
            const { factor } = customEvent.detail;

            // Scale camera position
            camera.position.multiplyScalar(factor);

            // Scale OrbitControls target
            if (controls) {
                const orbitControls = controls as any;
                orbitControls.target.multiplyScalar(factor);
                orbitControls.update();
            }

            // Update camera far value dynamically
            camera.far = customEvent.detail.realistic ? 100000 : 50000;
            camera.updateProjectionMatrix();
        };

        const handleSystemChange = (e: Event) => {
            const customEvent = e as CustomEvent<{
                systemId: string;
                mode?: string;
                camera: { position: [number, number, number]; target: [number, number, number] };
            }>;

            const { camera: camConfig } = customEvent.detail;

            // Reset camera to preset position
            camera.position.set(camConfig.position[0], camConfig.position[1], camConfig.position[2]);

            if (controls) {
                const orbitControls = controls as any;
                orbitControls.target.set(camConfig.target[0], camConfig.target[1], camConfig.target[2]);
                orbitControls.update();
            }
        };

        window.addEventListener('distanceScaleChanged', handleScaleChange);
        window.addEventListener('starSystemChanged', handleSystemChange);
        return () => {
            window.removeEventListener('distanceScaleChanged', handleScaleChange);
            window.removeEventListener('starSystemChanged', handleSystemChange);
        };
    }, [camera, controls]);

    return null;
};

const SimulationContent = () => {
    usePhysicsLoop();
    const bodies = usePhysicsStore((state) => state.bodies);
    const showHabitableZone = usePhysicsStore((state) => state.showHabitableZone);
    const useRealisticDistances = usePhysicsStore((state) => state.useRealisticDistances);

    // Find all stars and determine if we should show habitable zone
    // Only show for single-star systems (multi-star habitable zones are complex)
    const stars = bodies.filter(b => b.isStar);
    const isSingleStarSystem = stars.length === 1;
    const primaryStar = isSingleStarSystem ? stars[0] : undefined;

    // Habitable zone distances (0.95 AU to 1.4 AU)
    const scale = useRealisticDistances ? DISTANCE_SCALES.REALISTIC.AU_UNIT : DISTANCE_SCALES.COMPRESSED.AU_UNIT;
    const habitableInner = 0.95 * scale;
    const habitableOuter = 1.4 * scale;

    return (
        <>
            <CameraController />
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 0]} intensity={2} decay={0} distance={1000} />

            <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {showHabitableZone && primaryStar && (
                <mesh position={[primaryStar.position.x, primaryStar.position.y, primaryStar.position.z]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[habitableInner, habitableOuter, 64]} />
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
import { DISTANCE_SCALES } from '../../utils/solarSystem';

export const Scene = () => {
    const showPerformance = usePhysicsStore((state) => state.showPerformance);
    const showGrid = usePhysicsStore((state) => state.showGrid);
    const cameraMode = usePhysicsStore((state) => state.cameraMode);
    const useRealisticDistances = usePhysicsStore((state) => state.useRealisticDistances);
    const isSurfaceLock = cameraMode === 'surface_lock';

    // Grid settings based on distance scale
    // Standard: 1AU=50 -> Grid 50
    // Wide: 1AU=200 -> Grid 200
    const gridConfig = useRealisticDistances
        ? { fadeDistance: 5000, sectionSize: 200, cellSize: 50 }
        : { fadeDistance: 2000, sectionSize: 50, cellSize: 10 };

    // Camera far value based on distance scale
    // Compressed: Neptune at ~1500 (30AU * 50) -> Far 10000 -> 50000 safe
    // Realistic: Neptune at ~6000 (30AU * 200) -> Far 50000 -> 100000 safe
    const cameraFar = useRealisticDistances ? 200000 : 50000;

    // Camera tuned to see Neptune (r=250) at 12 o'clock (-Z) from 6 o'clock (+Z)
    // User requested return to original distance feeling
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 25, 50], fov: 45, near: 0.1, far: cameraFar }}>
                <color attach="background" args={['#050510']} />
                <SimulationContent />
                <CameraScaleAdjuster />
                <OrbitControls
                    makeDefault
                    enablePan={true}
                    minDistance={0.001}
                    maxDistance={100000}
                    enableZoom={!isSurfaceLock}
                    enableDamping={true}
                    dampingFactor={0.1}
                    zoomSpeed={1.5}
                    panSpeed={1.2}
                    rotateSpeed={0.8}
                />

                {showGrid && !usePhysicsStore(state => state.zenMode) && (
                    <>
                        <Grid
                            infiniteGrid
                            fadeDistance={gridConfig.fadeDistance}
                            sectionColor="#555555"
                            cellColor="#333333"
                            sectionSize={gridConfig.sectionSize}
                            cellSize={gridConfig.cellSize}
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
