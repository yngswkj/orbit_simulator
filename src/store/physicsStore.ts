import { create } from 'zustand';
import type { CelestialBody, SimulationState, CameraMode, PhysicsState } from '../types/physics';
import { updatePhysicsSoA, createPhysicsState, syncStateToBodies, BASE_DT } from '../utils/physics';
import { Vector3 } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { createSolarSystem } from '../utils/solarSystem';
import { PhysicsWorkerManager } from '../workers/physicsWorkerManager';

export const workerManager = new PhysicsWorkerManager(20000); // Max 20k bodies
workerManager.initWorkers(); // Start workers immediately

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
    isCalculating: boolean;
    isWorkerSupported: boolean;
    toggleMultithreading: () => void;

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
    isCalculating: false,
    isWorkerSupported: workerManager.isSupported,

    toggleMultithreading: () => {
        set((state) => ({ useMultithreading: !state.useMultithreading }));
        // Reset physics state to ensure sync
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
        const { bodies, simulationState, timeScale, simulationTime, physicsState, useMultithreading, isCalculating } = get();
        if (simulationState === 'paused') return;
        if (useMultithreading && isCalculating) return; // Drop frame if worker busy

        const dt = BASE_DT * timeScale;

        if (useMultithreading) {
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
