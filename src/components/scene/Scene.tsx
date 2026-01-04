import React, { useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { Vector3 } from 'three';
import * as THREE from 'three';
import { usePhysicsStore, physicsStats } from '../../store/physicsStore';
import { CelestialBody } from './CelestialBody';
import { usePhysicsLoop } from '../../hooks/usePhysicsLoop';
import { OrbitPrediction } from './OrbitPrediction';
import { DateDisplay } from '../ui/DateDisplay';
import type { CelestialBody as BodyType } from '../../types/physics';
import { GravityHeatmap } from './GravityHeatmap';
import { HabitableZoneMap } from './HabitableZoneMap';
import { EffectsLayer } from '../effects/EffectsLayer';
import { calculateSingleStarHZ } from '../../utils/habitableZone';
import { DISTANCE_SCALES } from '../../utils/solarSystem';
import { EffectComposer, BrightnessContrast } from '@react-three/postprocessing';
import { GravitationalLensEffect } from '../effects/GravitationalLensEffect';
import { TidalDisruptionEffect } from '../effects/TidalDisruptionEffect';
import { ShockwaveEffect } from '../effects/ShockwaveEffect';
import { StarfieldBackground } from './StarfieldBackground';
import { transitionCamera } from '../../utils/cameraTransitions';
import { getPerformanceConfig } from '../../constants/performance';
import { PerformanceStats } from '../ui/PerformanceStats';

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
    const useRealisticDistances = usePhysicsStore((state) => state.useRealisticDistances);
    const { camera, controls } = useThree();

    // Store previous states to calculate deltas
    const prevBodyPos = React.useRef<Vector3 | null>(null);
    const prevSimulationTime = React.useRef<number>(0);
    const isFirstLockFrame = React.useRef(true);
    const lastUsedMode = React.useRef<string>('free');

    // Reset flags when target or mode changes
    // Initial Jump / Target Switch Logic with smooth transitions
    React.useEffect(() => {
        isFirstLockFrame.current = true;

        // Handle switching TO lock modes
        if (followingBodyId && controls) {
            const body = usePhysicsStore.getState().bodies.find(b => b.id === followingBodyId);
            if (body) {
                const bodyPos = new Vector3(body.position.x, body.position.y, body.position.z);
                const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void };

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

                        // Smooth transition to surface lock view
                        transitionCamera(camera, orbitControls, camPos, targetPos, {
                            duration: 1.0,
                            ease: 'power2.inOut'
                        });

                    } else {
                        // Free or Sun Lock: Target = Center of the body
                        // Calculate direction from body to camera (so camera looks at body)
                        const currentCameraPos = camera.position.clone();
                        const direction = currentCameraPos.sub(bodyPos).normalize();

                        // If camera is too close to body (nearly at same position), use default viewing angle
                        if (direction.lengthSq() < 0.001) {
                            direction.set(1, 0.8, 1).normalize(); // Diagonal view from upper-right-front
                        }

                        // Ideal distance: proportional to body radius for good framing
                        const idealDist = Math.max(body.radius * 5, 10); // At least 10 units away

                        // Calculate new camera position: body position + direction * distance
                        const newCamPos = bodyPos.clone().add(direction.multiplyScalar(idealDist));

                        // Smooth transition: camera moves to new position while looking at body center
                        // Use dynamicTarget to continuously track the moving body during animation
                        transitionCamera(camera, orbitControls, newCamPos, bodyPos, {
                            duration: 0.8,
                            ease: 'power2.inOut',
                            dynamicTarget: () => {
                                // Return current body position every frame
                                const currentBody = usePhysicsStore.getState().bodies.find(b => b.id === followingBodyId);
                                if (currentBody) {
                                    return new Vector3(
                                        currentBody.position.x,
                                        currentBody.position.y,
                                        currentBody.position.z
                                    );
                                }
                                return bodyPos; // Fallback to initial position
                            }
                        });
                    }
                }
            }
        }
        lastUsedMode.current = cameraMode;
    }, [followingBodyId, cameraMode, controls, camera]);

    // Handle distance scale changes to prevent camera drift
    React.useEffect(() => {
        // When scale mode changes, force a reset of the tracking logic
        // This ensures the next frame (with new coordinates) doesn't calculate a huge delta
        prevBodyPos.current = null;
    }, [useRealisticDistances]);

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
            const controls = state.controls as unknown as { target: THREE.Vector3; update: () => void };
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
                const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void };
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
                const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void };
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

// Gravitational lens post-processing wrapper (always enabled for compact objects)
const GravitationalLensPostProcess = () => {
    const bodies = usePhysicsStore((state) => state.bodies);
    const { camera } = useThree();

    // Find compact objects (black holes)
    const compactObjects = useMemo(() => bodies.filter(b => b.isCompactObject), [bodies]);
    const hasBlackHole = compactObjects.length > 0;

    // Only render when black holes exist
    if (!hasBlackHole) {
        return null;
    }

    // For now, only apply effect to the first compact object
    const blackHole = compactObjects[0];
    const bhPosition = new Vector3(blackHole.position.x, blackHole.position.y, blackHole.position.z);

    return (
        <EffectComposer key="gravitational-lens-composer" enableNormalPass={false} multisampling={0}>
            <GravitationalLensEffect
                blackHolePosition={bhPosition}
                schwarzschildRadius={blackHole.radius}
                strength={1.5}
                camera={camera}
                enabled={true}
            />
            <BrightnessContrast brightness={-0.2} contrast={0.1} />
        </EffectComposer>
    );
};

const SimulationContent = () => {
    usePhysicsLoop();
    const bodies = usePhysicsStore((state) => state.bodies);
    const showHabitableZone = usePhysicsStore((state) => state.showHabitableZone);
    const useRealisticDistances = usePhysicsStore((state) => state.useRealisticDistances);
    const tidallyDisruptedEvents = usePhysicsStore((state) => state.tidallyDisruptedEvents);
    const removeTidalDisruptionEvent = usePhysicsStore((state) => state.removeTidalDisruptionEvent);
    const collisionEvents = usePhysicsStore((state) => state.collisionEvents);
    const removeCollisionEvent = usePhysicsStore((state) => state.removeCollisionEvent);

    // Find all stars and determine if we should show habitable zone
    const stars = useMemo(() => bodies.filter(b => b.isStar), [bodies]);
    const isSingleStarSystem = stars.length === 1;
    const isMultiStarSystem = stars.length > 1;
    const primaryStar = isSingleStarSystem ? stars[0] : undefined;

    // Dynamic habitable zone calculation based on star's mass/luminosity
    const scale = useRealisticDistances ? DISTANCE_SCALES.REALISTIC.AU_UNIT : DISTANCE_SCALES.COMPRESSED.AU_UNIT;

    const habitableZone = useMemo(() => {
        if (!primaryStar) return null;
        return calculateSingleStarHZ(primaryStar, scale);
    }, [primaryStar, scale]);

    return (
        <>
            <CameraController />
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 0]} intensity={2} decay={0} distance={1000} />



            {/* Single star system: Ring-based habitable zone */}
            {showHabitableZone && habitableZone && primaryStar && isSingleStarSystem && (
                <mesh
                    position={[primaryStar.position.x, primaryStar.position.y, primaryStar.position.z]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <ringGeometry args={[habitableZone.inner, habitableZone.outer, 64]} />
                    <meshBasicMaterial color="#22aa44" opacity={0.15} transparent side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
            )}

            {/* Multi-star system: 2D heatmap-based habitable zone */}
            {showHabitableZone && isMultiStarSystem && <HabitableZoneMap />}

            {/* Legacy: Tidal Disruption & Shockwave rendered directly here for Week 1 compatibility */}
            {tidallyDisruptedEvents.map(event => {
                const primary = bodies.find(b => b.id === event.primaryId);
                const body = bodies.find(b => b.id === event.bodyId);
                const primaryPos = primary ? primary.position : new THREE.Vector3(0, 0, 0);
                const primaryMass = primary ? primary.mass : 1000;
                const radius = body ? body.radius : 10;
                const color = body ? body.color : '#aaaaaa';

                return (
                    <TidalDisruptionEffect
                        key={event.bodyId + '_' + event.startTime}
                        position={new THREE.Vector3(event.position.x, event.position.y, event.position.z)}
                        primaryPosition={new THREE.Vector3(primaryPos.x, primaryPos.y, primaryPos.z)}
                        bodyRadius={radius}
                        bodyColor={color}
                        primaryMass={primaryMass}
                        startTime={event.startTime}
                        duration={event.duration}
                        onComplete={() => removeTidalDisruptionEvent(event.bodyId)}
                    />
                );
            })}

            {collisionEvents.map(event => (
                <ShockwaveEffect
                    key={event.id}
                    position={new THREE.Vector3(event.position.x, event.position.y, event.position.z)}
                    startTime={event.startTime}
                    duration={2000}
                    maxRadius={50}
                    color={event.color}
                    onComplete={() => removeCollisionEvent(event.id)}
                />
            ))}

            {
                bodies.map((body) => {
                    return <CelestialBody key={body.id} body={body} />;
                })
            }

            <OrbitPredictionWrapper />

            <GravityHeatmap />

            {/* Visual effects layer (shockwaves, debris, etc.) */}
            <EffectsLayer />
        </>
    );
};

import { PerformanceStats } from '../ui/PerformanceStats';

const SceneGrid = () => {
    const showGrid = usePhysicsStore((state) => state.showGrid);
    const zenMode = usePhysicsStore((state) => state.zenMode);
    const useRealisticDistances = usePhysicsStore((state) => state.useRealisticDistances);

    // Check for black holes for grid brightness adjustment
    const bodies = usePhysicsStore((state) => state.bodies);
    const hasBlackHole = useMemo(() => bodies.some(b => b.isCompactObject), [bodies]);

    const gridConfig = useRealisticDistances
        ? { fadeDistance: 5000, sectionSize: 200, cellSize: 50 }
        : { fadeDistance: 2000, sectionSize: 50, cellSize: 10 };

    const sectionColor = hasBlackHole ? "#aaaaaa" : "#555555";
    const cellColor = hasBlackHole ? "#888888" : "#333333";

    // Always render Grid but control visibility to prevent EffectComposer unmounting
    const shouldShow = showGrid && !zenMode;

    return (
        <group visible={shouldShow}>
            <Grid
                infiniteGrid
                fadeDistance={gridConfig.fadeDistance}
                sectionColor={sectionColor}
                cellColor={cellColor}
                sectionSize={gridConfig.sectionSize}
                cellSize={gridConfig.cellSize}
                side={2}
            />
        </group>
    );
};

const SceneContent = () => {
    const zenMode = usePhysicsStore((state) => state.zenMode);
    const cameraMode = usePhysicsStore((state) => state.cameraMode);
    const useRealisticDistances = usePhysicsStore((state) => state.useRealisticDistances);
    const qualityLevel = usePhysicsStore((state) => state.qualityLevel);

    const isSurfaceLock = cameraMode === 'surface_lock';

    // Camera far value based on distance scale
    const cameraFar = useRealisticDistances ? 200000 : 50000;

    // Get performance config for pixel ratio
    const perfConfig = getPerformanceConfig(qualityLevel);
    const pixelRatio = typeof window !== 'undefined'
        ? Math.min(window.devicePixelRatio * perfConfig.pixelRatioMultiplier, 2)
        : 1;

    return (
        <Canvas
            camera={{ position: [0, 25, 50], fov: 45, near: 0.1, far: cameraFar }}
            dpr={pixelRatio}
        >
            <color attach="background" args={['#000000']} />
            <StarfieldBackground />
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

            <SceneGrid />

            {/* Gizmo: Hidden in Zen mode */}
            {!zenMode && (
                <GizmoHelper alignment="bottom-left" margin={[100, 100]}>
                    <GizmoViewport axisColors={['#ff3653', '#0adb50', '#2c8fdf']} labelColor="black" />
                </GizmoHelper>
            )}

            {/* Post-processing effects are rendered last to capture everything including the grid */}
            <GravitationalLensPostProcess />
        </Canvas>
    );
};

export const Scene = () => {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <SceneContent />
            <DateDisplay />
            {usePhysicsStore(state => state.showPerformance) && <PerformanceStats />}
        </div>
    );
};
