import { create } from 'zustand';
import type { CelestialBody, SimulationState, CameraMode, PhysicsState } from '../types/physics';
import { updatePhysicsSoA, createPhysicsState, syncStateToBodies, BASE_DT } from '../utils/physics';
import { Vector3 } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { createSolarSystem } from '../utils/solarSystem';
import { PhysicsWorkerManager } from '../workers/physicsWorkerManager';
import { GPUPhysicsEngine } from '../gpu/GPUPhysicsEngine';

export const workerManager = new PhysicsWorkerManager(20000); // Max 20k bodies
workerManager.initWorkers(); // Start workers immediately

export const gpuEngine = new GPUPhysicsEngine();


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
    setFollowingBody: (id: string | null) => void;
    selectBody: (id: string | null) => void;
    updateBody: (id: string, updates: Partial<CelestialBody>) => void;
    setCameraMode: (mode: CameraMode) => void;
    reset: () => void;
}

const INITIAL_BODIES: CelestialBody[] = [
    {
        id: 'sun',
        name: 'Sun',
        mass: 333000,
        radius: 2.5,
        position: new Vector3(0, 0, 0),
        velocity: new Vector3(0, 0, 0),
        color: '#ffdd00',
        texturePath: 'textures/sun_texture.png',
        isFixed: false,
        axialTilt: 7.25,
        rotationSpeed: 0.04
    },
    {
        id: 'earth',
        name: 'Earth',
        mass: 1.0,
        radius: 0.15,
        position: new Vector3(30, 0, 0),
        velocity: new Vector3(0, 0, Math.sqrt(333000 / 30)),
        color: '#22aaff',
        texturePath: 'textures/earth_texture.png',
        axialTilt: 23.4,
        rotationSpeed: 1.0
    }
];

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
        if (simulationState === 'paused') return;
        if ((useMultithreading || useGPU) && isCalculating) return; // Drop frame if busy

        const dt = BASE_DT * timeScale;

        if (useGPU) {
            set({ isCalculating: true });

            try {
                // Initialize if needed (using private property access hack or public getter ideally, 
                // but here we trust setBodies to handle lazy init or we check maxBodies match)
                // For now, assume engine handles lazy init internally or we call init explicitly.
                // Actually GPUPhysicsEngine needs explicit init.
                // Let's add a check logic here.

                // Note: We should ideally track 'isGPUInitialized' in store, but for now we'll do it inside engine or just call setBodies.
                // GPUPhysicsEngine.setBodies doesn't init. We need to call init.
                // Let's rely on setBodies checking initialization state or modifying engine.

                // We'll modify GPUPhysicsEngine later to accept init check or we assume init was called.
                // Let's call init if not ready.
                // Accessing private 'isReady' is not allowed. 
                // We'll add 'isReady' getter to GPUPhysicsEngine in next step if needed, or just call init blindly? No, init is async.

                // Quick fix: Attempt init if we haven't tracked it? 
                // Better: Just call setBodies and let it throw if not ready?
                // Or: Check a flag.

                // Let's assume we need to call init(maxBodies) once.
                // We'll add a helper in GPUPhysicsEngine to check readiness or auto-init.
                // For this step, I'll modify logic to initialization inside handle.

                // Temporary logic:
                // We need to initialize GPU engine.
                // Let's add a property to the store or rely on the engine.
                // I will add public isInitialized getter to engine in next step.
                // For now:

                if (!gpuEngine.isReady) {
                    await gpuEngine.init(20000);
                }

                await gpuEngine.setBodies(bodies);
                await gpuEngine.step(dt, bodies.length);
                const gpuData = await gpuEngine.getBodies(bodies.length);

                if (gpuData) {
                    // Sync back to bodies
                    // Stride is now 12 floats (48 bytes) due to 'acc' padding in GPU
                    const nextBodies = bodies.map((b, i) => {
                        const idx = i * 12; // Updated stride from 8 to 12
                        return {
                            ...b,
                            position: new Vector3(gpuData[idx], gpuData[idx + 1], gpuData[idx + 2]),
                            velocity: new Vector3(gpuData[idx + 4], gpuData[idx + 5], gpuData[idx + 6])
                        };
                    });

                    set({
                        bodies: nextBodies,
                        physicsState: null, // GPU handles state
                        simulationTime: simulationTime + dt,
                        isCalculating: false
                    });
                }
            } catch (e) {
                console.error("GPU Step Failed", e);
                set({ isCalculating: false, useGPU: false }); // Fallback
            }

        } else if (useMultithreading) {
            set({ isCalculating: true });

            // Initialize/Sync Worker if needed
            if (!physicsState || physicsState.count !== bodies.length) {
                workerManager.setBodies(bodies);
            }

            await workerManager.executeStep(bodies.length, dt);

            // Get updated views (pointers)
            const workerState = workerManager.getPhysicsState(bodies.length);

            // Restore IDs for sync
            workerState.ids = bodies.map(b => b.id);

            const nextBodies = syncStateToBodies(workerState, bodies);

            set({
                bodies: nextBodies,
                physicsState: workerState,
                simulationTime: simulationTime + dt,
                isCalculating: false
            });

        } else {
            // CPU Single Thread (Existing)
            let currentState = physicsState;
            if (!currentState || currentState.count !== bodies.length) {
                currentState = createPhysicsState(bodies);
            }

            updatePhysicsSoA(currentState, dt);
            const nextBodies = syncStateToBodies(currentState, bodies);

            set({
                bodies: nextBodies,
                physicsState: currentState,
                simulationTime: simulationTime + dt
            });
        }
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
