import { create } from 'zustand';
import type { CelestialBody, SimulationState, CameraMode, PhysicsState } from '../types/physics';
import type { StarSystemMode } from '../types/starSystem';
import { updatePhysicsSoA, createPhysicsState, syncStateToBodies, BASE_DT, calculateTotalEnergy, applyCollisions } from '../utils/physics';
import { Vector3 } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { createSolarSystem } from '../utils/solarSystem';
import { getPresetById } from '../utils/starSystems';
import { PhysicsWorkerManager } from '../workers/physicsWorkerManager';
import { GPUPhysicsEngine } from '../gpu/GPUPhysicsEngine';

import { BUFFER_LIMITS } from '../constants/physics';
import { DISTANCE_SCALE_FACTOR } from '../utils/solarSystem';

let _workerManager: PhysicsWorkerManager | null = null;
export const getWorkerManager = (): PhysicsWorkerManager => {
    if (!_workerManager) {
        _workerManager = new PhysicsWorkerManager(BUFFER_LIMITS.MAX_BODIES);
        _workerManager.initWorkers();
    }
    return _workerManager;
};

let _gpuEngine: GPUPhysicsEngine | null = null;
export const getGPUEngine = (): GPUPhysicsEngine => {
    if (!_gpuEngine) {
        _gpuEngine = new GPUPhysicsEngine();
    }
    return _gpuEngine;
};

export const physicsStats = {
    fps: 0,
    physicsDuration: 0,
    renderDuration: 0, // Assigned by Scene/Loop
    bodyCount: 0,
    mode: 'CPU',
    energy: {
        kinetic: 0,
        potential: 0,
        total: 0,
        initial: 0,
        drift: 0
    },
    lastEnergyCheck: 0,
    cameraPosition: [0, 0, 0]
};

const MAX_STABLE_DT = 0.02; // Threshold to split steps


interface PhysicsStore {
    bodies: CelestialBody[];
    physicsState: PhysicsState | null; // Persisted SoA state
    simulationState: SimulationState;
    timeScale: number;
    simulationTime: number; // Accumulated time for rotation sync
    showPrediction: boolean;
    showGrid: boolean;
    showRealisticVisuals: boolean;
    showHabitableZone: boolean;
    showPerformance: boolean;
    followingBodyId: string | null;
    selectedBodyId: string | null;
    cameraMode: CameraMode;
    gpuDataInvalidated: boolean; // Flag to trigger data upload to GPU
    zenMode: boolean;
    resetToken: number; // Increment to signal forced visual resets

    // Distance Scale
    useRealisticDistances: boolean;
    toggleRealisticDistances: () => void;
    toggleZenMode: () => void;

    // Multithreading
    useMultithreading: boolean;
    useGPU: boolean;
    isCalculating: boolean;
    isWorkerSupported: boolean;
    isGPUSupported: boolean | null; // null = checking
    toggleMultithreading: () => void;
    toggleGPU: () => void;
    checkGPUSupport: () => Promise<void>;

    // Star System
    currentSystemId: string | null;
    currentSystemMode: StarSystemMode | null;
    loadStarSystem: (systemId: string, mode?: StarSystemMode) => void;

    addBody: (body: Omit<CelestialBody, 'id'>) => void;
    removeBody: (id: string) => void;
    updateBodies: () => void;
    loadSolarSystem: () => void;
    setSimulationState: (state: SimulationState) => void;
    setTimeScale: (scale: number) => void;
    togglePrediction: () => void;
    toggleGrid: () => void;
    toggleRealisticVisuals: () => void;
    toggleHabitableZone: () => void;
    togglePerformance: () => void;
    setFollowingBody: (id: string | null) => void;
    selectBody: (id: string | null) => void;
    updateBody: (id: string, updates: Partial<CelestialBody>) => void;
    setCameraMode: (mode: CameraMode) => void;
    reset: () => void;
    cleanup: () => void;
}

// Use the shared solar system generator to ensure consistency between Initial Load and Reset
const INITIAL_BODIES: CelestialBody[] = createSolarSystem();

export const usePhysicsStore = create<PhysicsStore>((set, get) => ({
    bodies: INITIAL_BODIES,
    physicsState: null,
    simulationState: 'running',
    timeScale: 1.0,
    simulationTime: 0,
    showPrediction: false,
    showGrid: true,
    showRealisticVisuals: true,
    showHabitableZone: false,
    showPerformance: false,
    followingBodyId: null,
    selectedBodyId: null,
    cameraMode: 'free',
    gpuDataInvalidated: true,

    // Star System
    currentSystemId: 'solar-system',
    currentSystemMode: null,

    useRealisticDistances: false,

    zenMode: false,
    resetToken: 0,

    useMultithreading: false,
    useGPU: false,
    isCalculating: false,
    isWorkerSupported: typeof window !== 'undefined' && !!window.Worker && !!window.SharedArrayBuffer,
    isGPUSupported: null,

    checkGPUSupport: async () => {
        const supported = await GPUPhysicsEngine.isSupported();
        set({ isGPUSupported: supported });
    },

    cleanup: () => {
        if (_workerManager) {
            _workerManager.terminate();
            _workerManager = null;
        }
        if (_gpuEngine) {
            _gpuEngine.dispose();
            _gpuEngine = null;
        }
    },

    toggleMultithreading: () => {
        const { useMultithreading } = get();
        // If we are currently using MT, we are disabling it -> Clean up Worker
        if (useMultithreading) {
            if (_workerManager) {
                _workerManager.terminate();
                _workerManager = null;
            }
        }
        // If we are enabling MT, we must ensure GPU is off and cleaned up
        if (!useMultithreading) {
            if (_gpuEngine) {
                _gpuEngine.dispose();
                _gpuEngine = null;
            }
        }

        set((state) => ({
            useMultithreading: !state.useMultithreading,
            useGPU: false, // Ensure GPU off
            physicsState: null,
            gpuDataInvalidated: true
        }));
    },

    toggleGPU: () => {
        const { useGPU } = get();
        // If currently using GPU, disabling it -> Clean up GPU
        if (useGPU) {
            if (_gpuEngine) {
                _gpuEngine.dispose();
                _gpuEngine = null;
            }
        }
        // If enabling GPU, ensure Worker is off and cleaned up
        if (!useGPU) {
            if (_workerManager) {
                _workerManager.terminate();
                _workerManager = null;
            }
        }

        set((state) => ({
            useGPU: !state.useGPU,
            useMultithreading: false, // Ensure MT off
            physicsState: null,
            gpuDataInvalidated: true // Force upload when switching
        }));
    },

    toggleRealisticDistances: () => {
        const { useRealisticDistances, bodies } = get();
        const newScale = !useRealisticDistances;

        // Scale factor: REALISTIC (1AU=50) / COMPRESSED (1AU=20) = 2.5
        // NOTE: Updated constants make this 4.0 (200/50).
        const factor = newScale ? DISTANCE_SCALE_FACTOR : 1 / DISTANCE_SCALE_FACTOR;

        // Velocity scaling: v = sqrt(GM/r), so when r -> r*factor, v -> v/sqrt(factor)
        const velocityFactor = 1 / Math.sqrt(factor);

        // Auto-adjust time scale to keep visual pacing consistent
        // If distances x4, periods x8. To make it look "same speed", we speed up time x8.
        const newTimeScale = newScale ? 8.0 : 1.0;

        // Transform all body positions and velocities (except fixed bodies at origin)
        const scaledBodies = bodies.map(body => {
            // Skip fixed bodies (usually central star)
            if (body.isFixed) return body;

            return {
                ...body,
                position: new Vector3(
                    body.position.x * factor,
                    body.position.y * factor,
                    body.position.z * factor
                ),
                velocity: new Vector3(
                    body.velocity.x * velocityFactor,
                    body.velocity.y * velocityFactor,
                    body.velocity.z * velocityFactor
                )
            };
        });

        // Dispatch event for camera adjustment
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('distanceScaleChanged', {
                detail: { realistic: newScale, factor }
            }));
        }

        set({
            useRealisticDistances: newScale,
            timeScale: newTimeScale,
            bodies: scaledBodies,
            physicsState: null,
            gpuDataInvalidated: true
        });
    },

    addBody: (body) => {
        const { bodies } = get();
        const newBodies = [...bodies, { ...body, id: uuidv4() }];
        // Invalidate physics state so it rebuilds on next frame
        set({ bodies: newBodies, physicsState: null, gpuDataInvalidated: true });
    },

    removeBody: (id) => {
        const { bodies, followingBodyId, selectedBodyId } = get();
        const newBodies = bodies.filter(b => b.id !== id);
        set({
            bodies: newBodies,
            physicsState: null, // Invalidate state
            followingBodyId: followingBodyId === id ? null : followingBodyId,
            selectedBodyId: selectedBodyId === id ? null : selectedBodyId,
            gpuDataInvalidated: true
        });
    },



    updateBodies: async () => {
        const { bodies, simulationState, timeScale, simulationTime, physicsState, useMultithreading, useGPU, isCalculating, gpuDataInvalidated } = get();

        physicsStats.bodyCount = bodies.length;
        physicsStats.mode = useGPU ? 'GPU' : (useMultithreading ? 'Worker' : 'CPU');

        if (simulationState === 'paused') return;
        if ((useMultithreading || useGPU) && isCalculating) return;

        const start = performance.now();
        const dt = BASE_DT * timeScale;

        // Energy Calculation (Throttled 1Hz)
        const now = performance.now();
        if (!physicsStats.lastEnergyCheck || now - physicsStats.lastEnergyCheck > 1000) {
            physicsStats.lastEnergyCheck = now;

            const handleEnergyUpdate = (e: { kinetic: number, potential: number, total: number } | number) => {
                const current = typeof e === 'number' ? { kinetic: 0, potential: 0, total: e } : e;

                // Initialize Initial Energy if reset or first run
                if (simulationTime < 0.1 || physicsStats.energy.initial === 0) {
                    physicsStats.energy.initial = current.total;
                }

                const drift = physicsStats.energy.initial !== 0
                    ? (current.total - physicsStats.energy.initial) / Math.abs(physicsStats.energy.initial)
                    : 0;

                physicsStats.energy = {
                    ...current,
                    initial: physicsStats.energy.initial,
                    drift
                };
            };

            if (useMultithreading) {
                // Determine if worker returns object or number
                // Worker currently returns number, we will accept it for now or assume implementation plan allows simpler update
                // For now, let's treat worker result as total
                getWorkerManager().calculateEnergy(bodies.length).then((e: any) => {
                    // Temporarily handle both until worker is updated
                    handleEnergyUpdate(e);
                });
            } else {
                const energy = calculateTotalEnergy(bodies);
                handleEnergyUpdate(energy);
            }
        }

        if (useGPU) {
            set({ isCalculating: true });
            try {
                const navGPU = getGPUEngine();
                if (!navGPU.isReady) await navGPU.init(BUFFER_LIMITS.MAX_BODIES);

                const steps = Math.ceil(dt / MAX_STABLE_DT);
                const stepDt = dt / steps;

                // Optimization: Only upload bodies if invalidated or new
                if (gpuDataInvalidated || !navGPU.isReady) {
                    await navGPU.setBodies(bodies);
                    set({ gpuDataInvalidated: false });
                }

                for (let i = 0; i < steps; i++) {
                    await navGPU.step(stepDt, bodies.length);
                }
                const gpuData = await navGPU.getBodies(bodies.length);

                if (gpuData) {
                    let nextBodies = bodies.map((b, i) => {
                        const idx = i * 12;
                        return {
                            ...b,
                            position: new Vector3(gpuData[idx], gpuData[idx + 1], gpuData[idx + 2]),
                            velocity: new Vector3(gpuData[idx + 4], gpuData[idx + 5], gpuData[idx + 6])
                        };
                    });

                    // GPU Collision Sync/Resolution
                    const collisions = await navGPU.getCollisions();

                    if (collisions && collisions.length > 0) {
                        const { bodies: resolvedBodies, hasRemovals } = applyCollisions(nextBodies, collisions);
                        nextBodies = resolvedBodies;

                        if (hasRemovals) {
                            set({ physicsState: null, gpuDataInvalidated: true });
                        }
                    }

                    set({
                        bodies: nextBodies,
                        physicsState: null,
                        simulationTime: simulationTime + dt,
                        isCalculating: false
                    });
                }
            } catch (e) {
                // Ignore AbortError caused by buffer destruction during cleanup/dispose
                if (e instanceof Error && (e.name === 'AbortError' || e.message.includes('destroyed'))) {
                    return;
                }
                console.error("GPU Step Failed", e);
                set({ isCalculating: false, useGPU: false });
            }

        } else if (useMultithreading) {
            set({ isCalculating: true });

            const workerMgr = getWorkerManager();

            if (!physicsState || physicsState.count !== bodies.length) {
                workerMgr.setBodies(bodies);
            }

            // Capture collisions
            let collisions: [number, number][] = [];
            workerMgr.onCollision = (pairs: [number, number][]) => {
                collisions.push(...pairs);
            };

            await workerMgr.executeStep(bodies.length, dt);

            const workerState = workerMgr.getPhysicsState(bodies.length);
            workerState.ids = bodies.map(b => b.id);
            let nextBodies = syncStateToBodies(workerState, bodies);

            // Resolve Collisions (CPU Main Thread)
            if (collisions.length > 0) {
                const { bodies: resolvedBodies, hasRemovals } = applyCollisions(nextBodies, collisions);
                nextBodies = resolvedBodies;

                if (hasRemovals) {
                    set({ physicsState: null });
                }
            }

            set({
                bodies: nextBodies,
                physicsState: workerState,
                simulationTime: simulationTime + dt,
                isCalculating: false
            });


        } else {
            let currentState = physicsState;
            if (!currentState || currentState.count !== bodies.length) {
                currentState = createPhysicsState(bodies);
            }

            const steps = Math.ceil(dt / MAX_STABLE_DT);
            const stepDt = dt / steps;

            for (let i = 0; i < steps; i++) {
                updatePhysicsSoA(currentState, stepDt, false, true);
            }

            const nextBodies = syncStateToBodies(currentState, bodies);

            set({
                bodies: nextBodies,
                physicsState: currentState,
                simulationTime: simulationTime + dt
            });
        }

        physicsStats.physicsDuration = performance.now() - start;
    },

    setSimulationState: (state) => set({ simulationState: state }),

    loadSolarSystem: () => set({
        bodies: createSolarSystem(),
        physicsState: null,
        timeScale: 1.0,
        simulationState: 'running',
        simulationTime: 0,
        followingBodyId: null,
        selectedBodyId: null,
        cameraMode: 'free',
        gpuDataInvalidated: true,
        useRealisticDistances: false,
        currentSystemId: 'solar-system',
        currentSystemMode: null,
        resetToken: 0
    }),

    loadStarSystem: (systemId: string, mode?: StarSystemMode) => {
        const preset = getPresetById(systemId);
        if (!preset) return;

        const bodies = preset.createBodies(mode).map(body => ({
            ...body,
            id: uuidv4()
        }));

        // Get camera config: use mode-specific if available, otherwise default
        const cameraConfig = (mode && preset.getCameraForMode)
            ? preset.getCameraForMode(mode)
            : preset.initialCamera;

        // Dispatch event for camera reset
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('starSystemChanged', {
                detail: {
                    systemId,
                    mode,
                    camera: cameraConfig
                }
            }));
        }

        set({
            bodies,
            currentSystemId: systemId,
            currentSystemMode: mode || null,
            physicsState: null,
            timeScale: 1.0,
            simulationState: 'running',
            simulationTime: 0,
            followingBodyId: null,
            selectedBodyId: null,
            cameraMode: 'free',
            gpuDataInvalidated: true,
            useRealisticDistances: false,
            // Zen Mode
            zenMode: false,
            resetToken: 0
        });
    },

    toggleZenMode: () => set((state) => ({ zenMode: !state.zenMode })),

    setTimeScale: (scale) => set({ timeScale: scale }),

    togglePrediction: () => set((state) => ({ showPrediction: !state.showPrediction })),
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    toggleRealisticVisuals: () => set((state) => ({ showRealisticVisuals: !state.showRealisticVisuals })),
    toggleHabitableZone: () => set((state) => ({ showHabitableZone: !state.showHabitableZone })),
    togglePerformance: () => set((state) => ({ showPerformance: !state.showPerformance })),
    setFollowingBody: (id) => set({ followingBodyId: id }),
    selectBody: (id) => set({ selectedBodyId: id }),
    setCameraMode: (mode) => set({ cameraMode: mode }),

    updateBody: (id, updates) => {
        const { bodies } = get();
        const newBodies = bodies.map(b => b.id === id ? { ...b, ...updates } : b);
        set({ bodies: newBodies, physicsState: null, gpuDataInvalidated: true });
    },

    reset: () => {
        const { currentSystemId, currentSystemMode, bodies, resetToken } = get();

        // Determine which bodies to load
        let initialBodies = INITIAL_BODIES;
        if (currentSystemId && currentSystemId !== 'solar-system') {
            const preset = getPresetById(currentSystemId);
            if (preset) {
                initialBodies = preset.createBodies(currentSystemMode || undefined).map(body => ({
                    ...body,
                    id: uuidv4()
                }));
            }
        } else {
            initialBodies = createSolarSystem();
        }

        // PRESERVE IDs: Overwrite new IDs with existing ones for matching bodies
        // This ensures the Scene/Camera component doesn't see them as "new" objects
        const existingIdMap = new Map(bodies.map(b => [b.name, b.id]));

        const bodiesWithPreservedIds = initialBodies.map(newBody => {
            if (existingIdMap.has(newBody.name)) {
                return { ...newBody, id: existingIdMap.get(newBody.name)! };
            }
            return newBody;
        });

        // If realistic mode is on, we must re-apply the scaling to the freshly loaded bodies
        // becasue createSolarSystem/createBodies generates them at "Normal" (Compressed) scale.
        const useRealisticDistances = get().useRealisticDistances;
        let finalBodies = bodiesWithPreservedIds;

        if (useRealisticDistances) {
            const factor = DISTANCE_SCALE_FACTOR;
            const velocityFactor = 1 / Math.sqrt(factor);

            finalBodies = finalBodies.map(body => {
                if (body.isFixed) return body;
                return {
                    ...body,
                    position: new Vector3(
                        body.position.x * factor,
                        body.position.y * factor,
                        body.position.z * factor
                    ),
                    velocity: new Vector3(
                        body.velocity.x * velocityFactor,
                        body.velocity.y * velocityFactor,
                        body.velocity.z * velocityFactor
                    )
                };
            });
        }

        set({
            bodies: finalBodies,
            physicsState: null,
            simulationTime: 0,
            gpuDataInvalidated: true,
            resetToken: resetToken + 1,
            // We don't touch followingBodyId/cameraMode here, relying on ID preservation.
        });
    }
}));
