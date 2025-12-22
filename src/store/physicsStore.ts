import { create } from 'zustand';
import type { CelestialBody, SimulationState } from '../types/physics';
import { updatePhysics } from '../utils/physics';
import { Vector3 } from 'three';
import { v4 as uuidv4 } from 'uuid';
import { createSolarSystem, SOLAR_SYSTEM_DATA } from '../utils/solarSystem';

interface PhysicsStore {
    bodies: CelestialBody[];
    simulationState: SimulationState;
    timeScale: number;
    showPrediction: boolean;
    showGrid: boolean;
    showRealisticVisuals: boolean;
    followingBodyId: string | null;

    addBody: (body: Omit<CelestialBody, 'id'>) => void;
    removeBody: (id: string) => void;
    updateBodies: () => void; // Called every frame
    loadSolarSystem: () => void;
    setSimulationState: (state: SimulationState) => void;
    setTimeScale: (scale: number) => void;
    togglePrediction: () => void;
    toggleGrid: () => void;
    toggleRealisticVisuals: () => void;
    setFollowingBody: (id: string | null) => void;
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
        texturePath: '/textures/sun_texture.png',
        isFixed: false,
    },
    {
        id: 'earth',
        name: 'Earth',
        mass: 1.0,
        radius: 0.15,
        position: new Vector3(30, 0, 0),
        velocity: new Vector3(0, 0, Math.sqrt(333000 / 30)),
        color: '#22aaff',
        texturePath: '/textures/earth_texture.png',
    }
];

export const usePhysicsStore = create<PhysicsStore>((set, get) => ({
    bodies: INITIAL_BODIES,
    simulationState: 'running',
    timeScale: 1.0,
    showPrediction: false,
    showGrid: false,
    showRealisticVisuals: false,
    followingBodyId: null,

    addBody: (body) => set((state) => ({
        bodies: [...state.bodies, { ...body, id: uuidv4() }]
    })),

    removeBody: (id) => set((state) => ({
        bodies: state.bodies.filter(b => b.id !== id),
        followingBodyId: state.followingBodyId === id ? null : state.followingBodyId
    })),

    updateBodies: () => {
        const { bodies, simulationState, timeScale } = get();
        if (simulationState === 'paused') return;

        const nextBodies = updatePhysics(bodies, timeScale);
        set({ bodies: nextBodies });
    },

    setSimulationState: (state) => set({ simulationState: state }),

    loadSolarSystem: () => set({
        bodies: createSolarSystem(),
        timeScale: 0.02,
        simulationState: 'running',
        followingBodyId: null
    }),

    setTimeScale: (scale) => set({ timeScale: scale }),

    togglePrediction: () => set((state) => ({ showPrediction: !state.showPrediction })),
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    toggleRealisticVisuals: () => set((state) => ({ showRealisticVisuals: !state.showRealisticVisuals })),
    setFollowingBody: (id) => set({ followingBodyId: id }),

    reset: () => set({ bodies: INITIAL_BODIES, followingBodyId: null })
}));
