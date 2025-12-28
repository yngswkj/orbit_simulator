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
                        // Initialize at "Noon" position (facing Sun)
                        // Target = Surface Point nearest Sun
                        // Camera = Slightly outward

                        const sun = usePhysicsStore.getState().bodies.find(b => b.name === 'Sun');
                        let surfaceOffset = new Vector3(body.radius, 0, 0);

                        if (sun) {
                            const sunPos = new Vector3(sun.position.x, sun.position.y, sun.position.z);
                            // Direction from Center to Sun
                            const dirToSun = sunPos.clone().sub(bodyPos).normalize();
                            surfaceOffset = dirToSun.multiplyScalar(body.radius);
                        }

                        // Apply tilt to surface offset if we want to be on equator of tilted body?
                        // If we just use SunDir, we are at sub-solar point. Safe enough.

                        const surfacePoint = bodyPos.clone().add(surfaceOffset);
                        orbitControls.target.copy(surfacePoint);

                        // Position camera slightly outwards (FPS eye level)
                        const camOffset = surfaceOffset.clone().normalize().multiplyScalar(0.05);
                        const camPos = surfacePoint.clone().add(camOffset);

                        camera.position.copy(camPos);

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
            const dt = simulationTime - prevSimulationTime.current;

            if (cameraMode === 'free') {
                // Classic Follow: Just move camera by the same amount the body moved (Translation only)
                const deltaMove = currentBodyPos.clone().sub(prevBodyPos.current);
                state.camera.position.add(deltaMove);
                controls.target.add(deltaMove);

            } else if (cameraMode === 'sun_lock' && sun) {
                // Sun-Lock: Rotate camera around the body matching the body's orbit around the sun
                // 1. Calculate the rotation of the Sun->Body vector
                const sunPos = new Vector3(sun.position.x, sun.position.y, sun.position.z);

                const prevRel = prevBodyPos.current.clone().sub(sunPos);
                const currRel = currentBodyPos.clone().sub(sunPos);

                // Avoid division by zero or unstable rotation if extremely close to sun
                if (prevRel.lengthSq() > 0.0001 && currRel.lengthSq() > 0.0001) {
                    prevRel.normalize();
                    currRel.normalize();

                    const quaternion = new THREE.Quaternion().setFromUnitVectors(prevRel, currRel);

                    // 2. Apply this rotation to the (Camera - Body) vector
                    // This keeps the camera at the same "local time" (e.g. noon, midnight) relative to the body
                    const camToBody = state.camera.position.clone().sub(prevBodyPos.current);
                    camToBody.applyQuaternion(quaternion);

                    // 3. Move camera to new position relative to new body position
                    state.camera.position.copy(currentBodyPos.clone().add(camToBody));

                    // 4. Update target to new body position
                    controls.target.copy(currentBodyPos);
                } else {
                    // Fallback to simple follow if vectors are degenerate
                    const deltaMove = currentBodyPos.clone().sub(prevBodyPos.current);
                    state.camera.position.add(deltaMove);
                    controls.target.add(deltaMove);
                }

            } else if (cameraMode === 'surface_lock') {
                // Surface Lock: Rotate camera matching the body's axial rotation
                // And follow the body's translation

                // 1. Calculate Rotation Angle (Delta)
                // rotationSpeed is relative to Earth=1.0 (where 1.0 = 1 rotation/day)
                // 1 Sim Year (2PI) = 365.25 Days.
                // So Earth Speed (Rad/Year) = 2300
                const EARTH_YEAR_RAD = 2300;
                const rotationDelta = (body.rotationSpeed || 0) * EARTH_YEAR_RAD * dt;

                // 2. Define Axis of Rotation (Taking Axial Tilt into account)
                // Axial tilt is usually around Z axis first, then Y rotation? 
                // Typically axial tilt rotates the Y-axis (spin axis) in the X-Z plane.
                // Let's assume standard obliquity where tilt is rotation around X or Z.
                // The body's visual mesh usually handles this. 
                // In `CelestialBody.tsx` (not visible here but inferred), tilt applies to the mesh group.
                // We need to match that.
                // Assuming tilt is a fixed rotation around Z axis for simplicity or consistent with `Scene` logic:
                // "baseOffset.applyAxisAngle(new Vector3(0, 0, 1), (body.axialTilt || 0) * (Math.PI / 180));" from old code
                // implies the axis of rotation is the Y-axis *tilted* by Z-rotation.

                const tiltRad = (body.axialTilt || 0) * (Math.PI / 180);
                const spinAxis = new Vector3(0, 1, 0).applyAxisAngle(new Vector3(0, 0, 1), tiltRad).normalize();

                // 3. Rotate (Camera - BodyCenter) and (Target - BodyCenter) around SpinAxis
                // Why Target? Because for drone view, we want to look at the same spot on the ground.
                // The "Spot on the ground" rotates.

                // However, `controls.target` might be anywhere if user panned. 
                // If we want to LOCK to surface, we should force target to surface IF simple follow. 
                // But we want "Drone mode" (freedom). 
                // So we just rotate the user's current ViewState (Camera & Target) around the BodyCenter.

                // Camera Rotation
                const camRel = state.camera.position.clone().sub(prevBodyPos.current);
                camRel.applyAxisAngle(spinAxis, rotationDelta);
                state.camera.position.copy(currentBodyPos.clone().add(camRel));

                // Target Rotation
                const targetRel = controls.target.clone().sub(prevBodyPos.current);
                targetRel.applyAxisAngle(spinAxis, rotationDelta);
                controls.target.copy(currentBodyPos.clone().add(targetRel));

                // If this is the VERY FIRST frame of surface lock, we might want to snap to a default location?
                // The `useEffect` above sets target to body center. 
                // Maybe better to set it to a surface point?
                // For now, centering on core and rotating with it allows "Synchronous Orbit" view.
                // To get true "Surface View" (standing on ground), user zooms in.
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
    const cameraMode = usePhysicsStore((state) => state.cameraMode);
    const followingBodyId = usePhysicsStore((state) => state.followingBodyId);
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
                // If in surface view, do not render the body we are standing on (to avoid mesh obstruction)
                const isStandingOn = cameraMode === 'surface_lock' && followingBodyId === body.id;
                if (isStandingOn) return null;

                return <CelestialBody key={body.id} body={body} />;
            })}

            <OrbitPredictionWrapper />
        </>
    );
};

export const Scene = () => {
    const showGrid = usePhysicsStore((state) => state.showGrid);

    // Camera tuned to see Neptune (r=250) at 12 o'clock (-Z) from 6 o'clock (+Z)
    // User requested return to original distance feeling
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 25, 50], fov: 45, near: 0.1, far: 50000 }}>
                <color attach="background" args={['#050510']} />
                <SimulationContent />
                <OrbitControls makeDefault enablePan={true} minDistance={0.001} />

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
        </div>
    );
};
