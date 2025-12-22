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

    addBody: (body: Omit<CelestialBody, 'id'>) => void;
    removeBody: (id: string) => void;
    updateBodies: () => void; // Called every frame
    loadSolarSystem: () => void;
    setSimulationState: (state: SimulationState) => void;
    setTimeScale: (scale: number) => void;
    togglePrediction: () => void;
    toggleGrid: () => void;
    toggleRealisticVisuals: () => void;
    reset: () => void;
}

const INITIAL_BODIES: CelestialBody[] = [
    {
        id: 'sun',
        name: 'Sun',
        mass: 333000,
        radius: 2.5, // Reduced from 5
        position: new Vector3(0, 0, 0),
        velocity: new Vector3(0, 0, 0),
        color: '#ffdd00',
        isFixed: false,
    },
    {
        id: 'earth',
        name: 'Earth',
        mass: 1.0,
        radius: 0.15, // Reduced from 1
        position: new Vector3(30, 0, 0), // Increased distance slightly for better scale
        velocity: new Vector3(0, 0, Math.sqrt(333000 / 30)), // v = sqrt(GM/r) = sqrt(333000/30) = sqrt(11100) ~ 105.3
        color: '#22aaff',
    }
];

export const usePhysicsStore = create<PhysicsStore>((set, get) => ({
    bodies: INITIAL_BODIES,
    simulationState: 'running',
    timeScale: 1.0,
    showPrediction: false,
    showGrid: false,
    showRealisticVisuals: false,

    addBody: (body) => set((state) => ({
        bodies: [...state.bodies, { ...body, id: uuidv4() }]
    })),

    removeBody: (id) => set((state) => ({
        bodies: state.bodies.filter(b => b.id !== id)
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
        timeScale: 0.02, // Slow down simulation because velocities are very high with realistic Sun mass
        simulationState: 'running'
    }),

    setTimeScale: (scale) => set({ timeScale: scale }),

    togglePrediction: () => set((state) => ({ showPrediction: !state.showPrediction })),
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    toggleRealisticVisuals: () => set((state) => ({ showRealisticVisuals: !state.showRealisticVisuals })),

    reset: () => set({ bodies: INITIAL_BODIES })
}));
