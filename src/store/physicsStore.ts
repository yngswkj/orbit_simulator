import { create } from 'zustand';
import type { CelestialBody, SimulationState, CameraMode, PhysicsState } from '../types/physics';
import { updatePhysicsSoA, createPhysicsState, syncStateToBodies, BASE_DT, calculateTotalEnergy, applyCollisions } from '../utils/physics';
import { Vector3 } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { createSolarSystem } from '../utils/solarSystem';
import { PhysicsWorkerManager } from '../workers/physicsWorkerManager';
import { GPUPhysicsEngine } from '../gpu/GPUPhysicsEngine';

export const workerManager = new PhysicsWorkerManager(20000); // Max 20k bodies
workerManager.initWorkers(); // Start workers immediately

export const gpuEngine = new GPUPhysicsEngine();

export const physicsStats = {
    fps: 0,
    physicsDuration: 0,
    renderDuration: 0, // Assigned by Scene/Loop
    bodyCount: 0,
    mode: 'CPU',
    totalEnergy: 0,
    lastEnergyCheck: 0
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

    // Multithreading
    useMultithreading: boolean;
    useGPU: boolean;
    isCalculating: boolean;
    isWorkerSupported: boolean;
    isGPUSupported: boolean | null; // null = checking
    toggleMultithreading: () => void;
    toggleGPU: () => void;
    checkGPUSupport: () => Promise<void>;

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
    showPerformance: true,
    followingBodyId: null,
    selectedBodyId: null,
    cameraMode: 'free',
    gpuDataInvalidated: true,

    useMultithreading: false,
    useGPU: false,
    isCalculating: false,
    isWorkerSupported: workerManager.isSupported,
    isGPUSupported: null,

    checkGPUSupport: async () => {
        const supported = await GPUPhysicsEngine.isSupported();
        set({ isGPUSupported: supported });
    },

    toggleMultithreading: () => {
        set((state) => ({
            useMultithreading: !state.useMultithreading,
            useGPU: false, // Disable GPU if CPU multi-threading enabled
            physicsState: null,
            gpuDataInvalidated: true
        }));
    },

    toggleGPU: () => {
        set((state) => ({
            useGPU: !state.useGPU,
            useMultithreading: false, // Disable CPU multi-threading if GPU enabled
            physicsState: null,
            gpuDataInvalidated: true // Force upload when switching
        }));
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
            if (useMultithreading) {
                workerManager.calculateEnergy(bodies.length).then(e => {
                    physicsStats.totalEnergy = e;
                });
            } else {
                // CPU or GPU mode: calculate on main thread (throttled)
                const energy = calculateTotalEnergy(bodies);
                physicsStats.totalEnergy = energy;
            }
        }

        if (useGPU) {
            set({ isCalculating: true });
            try {
                if (!gpuEngine.isReady) await gpuEngine.init(20000);

                const steps = Math.ceil(dt / MAX_STABLE_DT);
                const stepDt = dt / steps;

                // Optimization: Only upload bodies if invalidated or new
                if (gpuDataInvalidated || !gpuEngine.isReady) {
                    await gpuEngine.setBodies(bodies);
                    set({ gpuDataInvalidated: false });
                }

                for (let i = 0; i < steps; i++) {
                    await gpuEngine.step(stepDt, bodies.length);
                }
                const gpuData = await gpuEngine.getBodies(bodies.length);

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
                    const collisions = await gpuEngine.getCollisions();

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
                console.error("GPU Step Failed", e);
                set({ isCalculating: false, useGPU: false });
            }

        } else if (useMultithreading) {
            set({ isCalculating: true });

            if (!physicsState || physicsState.count !== bodies.length) {
                workerManager.setBodies(bodies);
            }

            // Capture collisions
            let collisions: [number, number][] = [];
            workerManager.onCollision = (pairs) => {
                collisions.push(...pairs);
            };

            await workerManager.executeStep(bodies.length, dt);

            const workerState = workerManager.getPhysicsState(bodies.length);
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
        gpuDataInvalidated: true
    }),

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

    reset: () => set({
        bodies: INITIAL_BODIES,
        physicsState: null,
        followingBodyId: null,
        selectedBodyId: null,
        showHabitableZone: false,
        showGrid: true,
        showRealisticVisuals: true,
        simulationTime: 0,
        cameraMode: 'free',
        gpuDataInvalidated: true
    })
}));
