import { Vector3 } from 'three';
import type { CelestialBody, PhysicsState } from '../types/physics';
import { calculateAccelerationsBarnesHut } from './barnesHut';

// Physics constants
const G = 1;
const SOFTENING = 0.5;
const SOFTENING_SQ = SOFTENING * SOFTENING;
export const BASE_DT = 0.001; // Base time step

// Object Pool for Vector3 to reduce GC overhead
const vectorPool = {
    diff: new Vector3(),
    temp: new Vector3(),
    acc: new Vector3()
};

/**
 * Initializes a PhysicsState from an array of CelestialBody objects.
 */
export const createPhysicsState = (bodies: CelestialBody[]): PhysicsState => {
    const maxCount = Math.max(bodies.length * 2, 1000); // Buffer for growth
    const count = bodies.length;

    const state: PhysicsState = {
        count,
        maxCount,
        positions: new Float64Array(maxCount * 3),
        velocities: new Float64Array(maxCount * 3),
        accelerations: new Float64Array(maxCount * 3),
        masses: new Float64Array(maxCount),
        radii: new Float64Array(maxCount),
        ids: new Array(maxCount),
        idToIndex: new Map()
    };

    bodies.forEach((body, i) => {
        state.positions[i * 3] = body.position.x;
        state.positions[i * 3 + 1] = body.position.y;
        state.positions[i * 3 + 2] = body.position.z;

        state.velocities[i * 3] = body.velocity.x;
        state.velocities[i * 3 + 1] = body.velocity.y;
        state.velocities[i * 3 + 2] = body.velocity.z;

        state.masses[i] = body.mass;
        state.radii[i] = body.radius;
        state.ids[i] = body.id;
        state.idToIndex.set(body.id, i);
    });

    return state;
};

/**
 * Synchronizes PhysicsState back to CelestialBody objects for rendering/UI.
 */
export const syncStateToBodies = (state: PhysicsState, bodies: CelestialBody[]): CelestialBody[] => {
    const nextBodies = new Array(state.count);

    for (let i = 0; i < state.count; i++) {
        const id = state.ids[i];
        const existing = bodies.find(b => b.id === id); // Optimization opportunity: use Map

        if (existing) {
            nextBodies[i] = {
                ...existing,
                position: new Vector3(
                    state.positions[i * 3],
                    state.positions[i * 3 + 1],
                    state.positions[i * 3 + 2]
                ),
                velocity: new Vector3(
                    state.velocities[i * 3],
                    state.velocities[i * 3 + 1],
                    state.velocities[i * 3 + 2]
                ),
                mass: state.masses[i],
                radius: state.radii[i]
            };
        } else {
            nextBodies[i] = {
                id,
                name: 'Unknown',
                mass: state.masses[i],
                radius: state.radii[i],
                position: new Vector3(state.positions[i * 3], state.positions[i * 3 + 1], state.positions[i * 3 + 2]),
                velocity: new Vector3(state.velocities[i * 3], state.velocities[i * 3 + 1], state.velocities[i * 3 + 2]),
                color: '#fff'
            };
        }
    }
    return nextBodies;
};

// Debug Global
export let debugInteractionCount = 0;
export const resetDebugCount = () => { debugInteractionCount = 0; };

/**
 * Calculates all accelerations for the current state (SoA).
 */
const calculateAccelerationsSoA = (state: PhysicsState): void => {
    const { count, positions, accelerations, masses } = state;

    // Reset accelerations
    accelerations.fill(0, 0, count * 3);

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const pi_x = positions[i3];
        const pi_y = positions[i3 + 1];
        const pi_z = positions[i3 + 2];

        // Newton's 3rd law optimization
        for (let j = i + 1; j < count; j++) {
            debugInteractionCount++; // Verify Iterations

            const j3 = j * 3;
            const dx = positions[j3] - pi_x;
            const dy = positions[j3 + 1] - pi_y;
            const dz = positions[j3 + 2] - pi_z;

            const distSq = dx * dx + dy * dy + dz * dz;

            // Optimized Math
            const distWithSoftSq = distSq + SOFTENING_SQ;
            const distWithSoft = Math.sqrt(distWithSoftSq);
            // F_scalar = G / (dist^3)
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
};

const removeBodyAt = (state: PhysicsState, index: number): void => {
    const last = state.count - 1;
    if (index !== last) {
        // Swap components with last
        const i3 = index * 3;
        const l3 = last * 3;

        state.positions[i3] = state.positions[l3];
        state.positions[i3 + 1] = state.positions[l3 + 1];
        state.positions[i3 + 2] = state.positions[l3 + 2];

        state.velocities[i3] = state.velocities[l3];
        state.velocities[i3 + 1] = state.velocities[l3 + 1];
        state.velocities[i3 + 2] = state.velocities[l3 + 2];

        state.accelerations[i3] = state.accelerations[l3];
        state.accelerations[i3 + 1] = state.accelerations[l3 + 1];
        state.accelerations[i3 + 2] = state.accelerations[l3 + 2];

        state.masses[index] = state.masses[last];
        state.radii[index] = state.radii[last];
        state.ids[index] = state.ids[last];

        state.idToIndex.set(state.ids[index], index);
    }

    state.idToIndex.delete(state.ids[last]);
    state.count--;
};

const resolveCollisionsSoA = (state: PhysicsState): void => {
    const { count, positions, velocities, masses, radii } = state;

    for (let i = 0; i < count; i++) {
        if (masses[i] <= 0) continue;

        for (let j = i + 1; j < count; j++) {
            if (masses[j] <= 0) continue;

            const i3 = i * 3;
            const j3 = j * 3;

            const dx = positions[i3] - positions[j3];
            const dy = positions[i3 + 1] - positions[j3 + 1];
            const dz = positions[i3 + 2] - positions[j3 + 2];

            const distSq = dx * dx + dy * dy + dz * dz;
            const radSum = radii[i] + radii[j];

            if (distSq < (radSum * 0.8) ** 2) {
                const mi = masses[i];
                const mj = masses[j];
                const totalMass = mi + mj;

                // New Velocity (momentum conservation)
                const vx = (velocities[i3] * mi + velocities[j3] * mj) / totalMass;
                const vy = (velocities[i3 + 1] * mi + velocities[j3 + 1] * mj) / totalMass;
                const vz = (velocities[i3 + 2] * mi + velocities[j3 + 2] * mj) / totalMass;

                // New Position (center of mass)
                const px = (positions[i3] * mi + positions[j3] * mj) / totalMass;
                const py = (positions[i3 + 1] * mi + positions[j3 + 1] * mj) / totalMass;
                const pz = (positions[i3 + 2] * mi + positions[j3 + 2] * mj) / totalMass;

                const newRadius = Math.cbrt(radii[i] ** 3 + radii[j] ** 3);

                // Update 'i'
                masses[i] = totalMass;
                radii[i] = newRadius;
                positions[i3] = px; positions[i3 + 1] = py; positions[i3 + 2] = pz;
                velocities[i3] = vx; velocities[i3 + 1] = vy; velocities[i3 + 2] = vz;

                // Remove 'j'
                removeBodyAt(state, j);
                j--;
            }
        }
    }
};

/**
 * Updates physics using SoA state (Velocity Verlet)
 */
export const updatePhysicsSoA = (state: PhysicsState, dt: number, useBarnesHut: boolean = false, enableCollisions: boolean = true): void => {
    const { count, positions, velocities, accelerations } = state;
    const halfDt = 0.5 * dt;

    // 1. First Half-Step: v += 0.5 * a * dt, r += v * dt
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        velocities[i3] += accelerations[i3] * halfDt;
        velocities[i3 + 1] += accelerations[i3 + 1] * halfDt;
        velocities[i3 + 2] += accelerations[i3 + 2] * halfDt;

        positions[i3] += velocities[i3] * dt;
        positions[i3 + 1] += velocities[i3 + 1] * dt;
        positions[i3 + 2] += velocities[i3 + 2] * dt;
    }

    // 2. Calculate new forces/accelerations
    if (useBarnesHut) {
        calculateAccelerationsBarnesHut(state);
    } else {
        calculateAccelerationsSoA(state);
    }

    // 3. Second Half-Step: v += 0.5 * a_new * dt
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        velocities[i3] += accelerations[i3] * halfDt;
        velocities[i3 + 1] += accelerations[i3 + 1] * halfDt;
        velocities[i3 + 2] += accelerations[i3 + 2] * halfDt;
    }

    // 4. Collision Detection
    if (enableCollisions) {
        resolveCollisionsSoA(state);
    }
};

/**
 * Optimized acceleration calculation using object pooling (Legacy support).
 */
export const calculateAcceleration = (
    body: CelestialBody,
    allBodies: CelestialBody[],
    outAcceleration: Vector3
): void => {
    outAcceleration.set(0, 0, 0);

    for (const other of allBodies) {
        if (body.id === other.id) continue;

        vectorPool.diff.subVectors(other.position, body.position);
        const distanceSq = vectorPool.diff.lengthSq();

        const distWithSoftSq = distanceSq + SOFTENING_SQ;
        const distWithSoft = Math.sqrt(distWithSoftSq);
        const forceScalar = (G * other.mass) / (distWithSoftSq * distWithSoft);

        outAcceleration.addScaledVector(vectorPool.diff, forceScalar);
    }
};

/**
 * Main update function (Legacy wrapper).
 * NOTE: Using this wrapper is inefficient because it converts format every frame.
 * The store should switch to managing PhysicsState directly.
 */
export const updatePhysics = (
    bodies: CelestialBody[],
    timeScale: number
): CelestialBody[] => {
    // 1. Convert to SoA (One-off cost per frame if using this wrapper)
    const state = createPhysicsState(bodies);

    // 2. Update SoA
    updatePhysicsSoA(state, BASE_DT * timeScale, false);

    // 3. Convert back to objects
    return syncStateToBodies(state, bodies);
};
