/**
 * predictionWorker.ts
 * Web Worker for orbit prediction calculations.
 * Offloads heavy N-body simulation from main thread.
 */

import { PHYSICS_CONSTANTS } from '../constants/physics';

const { G, SOFTENING_SQ } = PHYSICS_CONSTANTS;

interface BodyData {
    id: string;
    position: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
    mass: number;
    radius: number;
    color: string;
}

interface PredictionRequest {
    type: 'predict';
    bodies: BodyData[];
    steps: number;
    dt: number;
    saveFrequency: number;
}

interface PredictionResult {
    type: 'result';
    paths: {
        id: string;
        points: number[][]; // [x, y, z][]
        color: string;
    }[];
}

// SoA state for efficient computation
interface WorkerPhysicsState {
    count: number;
    positions: Float64Array;
    velocities: Float64Array;
    accelerations: Float64Array;
    masses: Float64Array;
}

function createState(bodies: BodyData[]): WorkerPhysicsState {
    const count = bodies.length;
    const state: WorkerPhysicsState = {
        count,
        positions: new Float64Array(count * 3),
        velocities: new Float64Array(count * 3),
        accelerations: new Float64Array(count * 3),
        masses: new Float64Array(count),
    };

    for (let i = 0; i < count; i++) {
        const b = bodies[i];
        state.positions[i * 3] = b.position.x;
        state.positions[i * 3 + 1] = b.position.y;
        state.positions[i * 3 + 2] = b.position.z;
        state.velocities[i * 3] = b.velocity.x;
        state.velocities[i * 3 + 1] = b.velocity.y;
        state.velocities[i * 3 + 2] = b.velocity.z;
        state.masses[i] = b.mass;
    }

    return state;
}

function calculateAccelerations(state: WorkerPhysicsState): void {
    const { count, positions, accelerations, masses } = state;

    // Reset accelerations
    accelerations.fill(0);

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const pi_x = positions[i3];
        const pi_y = positions[i3 + 1];
        const pi_z = positions[i3 + 2];

        for (let j = i + 1; j < count; j++) {
            const j3 = j * 3;
            const dx = positions[j3] - pi_x;
            const dy = positions[j3 + 1] - pi_y;
            const dz = positions[j3 + 2] - pi_z;

            const distSq = dx * dx + dy * dy + dz * dz;
            const distWithSoftSq = distSq + SOFTENING_SQ;
            const distWithSoft = Math.sqrt(distWithSoftSq);
            const f_base = G / (distWithSoftSq * distWithSoft);

            const fx = dx * f_base;
            const fy = dy * f_base;
            const fz = dz * f_base;

            const mi = masses[i];
            const mj = masses[j];

            accelerations[i3] += fx * mj;
            accelerations[i3 + 1] += fy * mj;
            accelerations[i3 + 2] += fz * mj;

            accelerations[j3] -= fx * mi;
            accelerations[j3 + 1] -= fy * mi;
            accelerations[j3 + 2] -= fz * mi;
        }
    }
}

function updatePhysics(state: WorkerPhysicsState, dt: number): void {
    const { count, positions, velocities, accelerations } = state;
    const halfDt = 0.5 * dt;

    // Velocity Verlet: First half-step
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        velocities[i3] += accelerations[i3] * halfDt;
        velocities[i3 + 1] += accelerations[i3 + 1] * halfDt;
        velocities[i3 + 2] += accelerations[i3 + 2] * halfDt;

        positions[i3] += velocities[i3] * dt;
        positions[i3 + 1] += velocities[i3 + 1] * dt;
        positions[i3 + 2] += velocities[i3 + 2] * dt;
    }

    // Calculate new accelerations
    calculateAccelerations(state);

    // Second half-step
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        velocities[i3] += accelerations[i3] * halfDt;
        velocities[i3 + 1] += accelerations[i3 + 1] * halfDt;
        velocities[i3 + 2] += accelerations[i3 + 2] * halfDt;
    }
}

function runPrediction(bodies: BodyData[], steps: number, dt: number, saveFrequency: number): PredictionResult {
    const state = createState(bodies);
    const ids = bodies.map(b => b.id);
    const colors: Record<string, string> = {};
    bodies.forEach(b => { colors[b.id] = b.color; });

    // Initialize paths with current positions
    const paths: Record<string, number[][]> = {};
    for (let i = 0; i < state.count; i++) {
        paths[ids[i]] = [[
            state.positions[i * 3],
            state.positions[i * 3 + 1],
            state.positions[i * 3 + 2]
        ]];
    }

    // Run simulation
    for (let step = 0; step < steps; step++) {
        updatePhysics(state, dt);

        if (step % saveFrequency === 0) {
            for (let j = 0; j < state.count; j++) {
                const id = ids[j];
                if (paths[id]) {
                    paths[id].push([
                        state.positions[j * 3],
                        state.positions[j * 3 + 1],
                        state.positions[j * 3 + 2]
                    ]);
                }
            }
        }
    }

    return {
        type: 'result',
        paths: Object.keys(paths).map(id => ({
            id,
            points: paths[id],
            color: colors[id] || 'white'
        }))
    };
}

// Worker message handler
self.onmessage = (e: MessageEvent<PredictionRequest>) => {
    if (e.data.type === 'predict') {
        const { bodies, steps, dt, saveFrequency } = e.data;
        const result = runPrediction(bodies, steps, dt, saveFrequency);
        self.postMessage(result);
    }
};

export {};
