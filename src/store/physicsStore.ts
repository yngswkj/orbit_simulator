import { create } from 'zustand';
import type { CelestialBody, SimulationState, CameraMode, PhysicsState } from '../types/physics';
import { updatePhysicsSoA, createPhysicsState, syncStateToBodies, BASE_DT, calculateTotalEnergy } from '../utils/physics';
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
            useGPU: false // Disable GPU if CPU multi-threading enabled
        }));
        set({ physicsState: null });
    },

    toggleGPU: () => {
        set((state) => ({
            useGPU: !state.useGPU,
            useMultithreading: false // Disable CPU multi-threading if GPU enabled
        }));
        set({ physicsState: null });
    },

    addBody: (body) => {
        const { bodies } = get();
        const newBodies = [...bodies, { ...body, id: uuidv4() }];
        // Invalidate physics state so it rebuilds on next frame
        set({ bodies: newBodies, physicsState: null });
    },

    removeBody: (id) => {
        const { bodies, followingBodyId, selectedBodyId } = get();
        const newBodies = bodies.filter(b => b.id !== id);
        set({
            bodies: newBodies,
            physicsState: null, // Invalidate state
            followingBodyId: followingBodyId === id ? null : followingBodyId,
            selectedBodyId: selectedBodyId === id ? null : selectedBodyId
        });
    },



    updateBodies: async () => {
        const { bodies, simulationState, timeScale, simulationTime, physicsState, useMultithreading, useGPU, isCalculating } = get();

        physicsStats.bodyCount = bodies.length;
        physicsStats.mode = useGPU ? 'GPU' : (useMultithreading ? 'Worker' : 'CPU');

        if (simulationState === 'paused') return;
        if ((useMultithreading || useGPU) && isCalculating) return;

        const start = performance.now();
        const dt = BASE_DT * timeScale;

        // M-01: Energy Calculation (Throttled 1Hz)
        // Note: Using a closure variable or module-level var for lastEnergyCheck would be cleaner, 
        // but here we use a static property on the function or check global.
        // Let's use performance.now() and a simplistic modulo/threshold check roughly?
        // Or store lastCheck in module scope (which I didn't add).
        // I'll add `lastEnergyCheck` to module scope in next edit if needed, or just let it fly every frame? 
        // No, N^2 every frame is bad.
        // Let's check `physicsStats.totalEnergy` timestamp? No.
        // Checking `Date.now()` here.
        if (start % 1000 < 20) { // Extremely crude 1Hz trigger attempt (prob won't work well with variable framerate)
            // Better: add `lastEnergyCheck` variable outside store.
        }

        // BETTER: Use module level var added in a previous edit? No, I only moved Stats/Consts.
        // I will assume `lastEnergyCheck` exists or add it.
        // Wait, I can't add a variable outside easily in this replacement.
        // Usage of `(window as any).lastEnergyCheck`? Hacky.
        // I will just use `Math.random() < 0.01` (approx 60fps -> 0.6Hz)?
        // Deterministic: `frame` counter in stats?
        // Let's use `physicsStats.frameId` if I added it? No.

        // OK, I'll use a local static check trick or just add the var in this replacement if I can catch enough context?
        // No, I'm replacing `updateBodies`.
        // I will put `lastEnergyCheck` logic here assuming I can't store state easily without editing interface.
        // ACTUALLY: `physicsStats` is global. I can add `lastCheck` to it.

        const now = performance.now();
        if (!physicsStats.lastEnergyCheck || now - physicsStats.lastEnergyCheck > 1000) {
            physicsStats.lastEnergyCheck = now;
            if (useMultithreading) {
                workerManager.calculateEnergy(bodies.length).then(e => {
                    physicsStats.totalEnergy = e;
                });
            } else {
                // CPU or GPU mode: calculate on main thread (throttled)
                // We use setTimeout to break the sync execution if needed, but here we just run it.
                // For very large N, this might stutter, but we are throttled to 1Hz.
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

                await gpuEngine.setBodies(bodies);
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
                    // We assume getCollisions is available on gpuEngine (added in previous step)
                    const collisions = await gpuEngine.getCollisions();

                    if (collisions && collisions.length > 0) {
                        const removals = new Set<number>();

                        collisions.forEach(([i, j]) => {
                            if (removals.has(i) || removals.has(j)) return;

                            const b1 = nextBodies[i];
                            const b2 = nextBodies[j];

                            const totalMass = b1.mass + b2.mass;
                            const v1 = b1.velocity.clone().multiplyScalar(b1.mass);
                            const v2 = b2.velocity.clone().multiplyScalar(b2.mass);
                            const newVel = v1.add(v2).divideScalar(totalMass);

                            const p1 = b1.position.clone().multiplyScalar(b1.mass);
                            const p2 = b2.position.clone().multiplyScalar(b2.mass);
                            const newPos = p1.add(p2).divideScalar(totalMass);

                            const newRadius = Math.cbrt(b1.radius ** 3 + b2.radius ** 3);

                            nextBodies[i] = {
                                ...b1,
                                mass: totalMass,
                                position: newPos,
                                velocity: newVel,
                                radius: newRadius
                            };

                            removals.add(j);
                        });

                        if (removals.size > 0) {
                            nextBodies = nextBodies.filter((_, idx) => !removals.has(idx));
                            // Force re-upload on next frame
                            set({ physicsState: null });
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
                const removals = new Set<number>();

                collisions.forEach(([i, j]) => {
                    if (removals.has(i) || removals.has(j)) return;

                    const b1 = nextBodies[i];
                    const b2 = nextBodies[j];

                    const totalMass = b1.mass + b2.mass;
                    const v1 = b1.velocity.clone().multiplyScalar(b1.mass);
                    const v2 = b2.velocity.clone().multiplyScalar(b2.mass);
                    const newVel = v1.add(v2).divideScalar(totalMass);

                    const p1 = b1.position.clone().multiplyScalar(b1.mass);
                    const p2 = b2.position.clone().multiplyScalar(b2.mass);
                    const newPos = p1.add(p2).divideScalar(totalMass);

                    const newRadius = Math.cbrt(b1.radius ** 3 + b2.radius ** 3);

                    nextBodies[i] = {
                        ...b1,
                        mass: totalMass,
                        position: newPos,
                        velocity: newVel,
                        radius: newRadius
                    };

                    removals.add(j);
                });

                if (removals.size > 0) {
                    nextBodies = nextBodies.filter((_, idx) => !removals.has(idx));
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
        cameraMode: 'free'
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
        set({ bodies: newBodies, physicsState: null });
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
        cameraMode: 'free'
    })
}));
