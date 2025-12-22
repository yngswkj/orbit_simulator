import { Vector3 } from 'three';
import type { CelestialBody } from '../types/physics';

const G = 1; // Gravitational constant (simplified for visual simulation)
const SOFTENING = 0.5; // Softening parameter to prevent singularity

export const calculateAcceleration = (
    body: CelestialBody,
    allBodies: CelestialBody[]
): Vector3 => {
    const acceleration = new Vector3(0, 0, 0);

    for (const other of allBodies) {
        if (body.id === other.id) continue;

        const diff = new Vector3().subVectors(other.position, body.position);
        const distanceSq = diff.lengthSq();

        // F = G * m1 * m2 / r^2
        // a = F / m1 = G * m2 / r^2
        // Vector form: a = (G * m2 / r^3) * vector_r

        // Applying softening: r^3 becomes (r^2 + softening^2)^(3/2)
        const forceScalar = (G * other.mass) / Math.pow(distanceSq + SOFTENING * SOFTENING, 1.5);

        acceleration.add(diff.multiplyScalar(forceScalar));
    }

    return acceleration;
};

// Symplectic integrator (Velocity Verlet)
// This requires keeping track of previous acceleration or calculating it twice.
// For simplicity in this step-based simulation, we might use a slightly modified Euler or semi-implicit Euler
// But Velocity Verlet is better for energy conservation.

// Update Physics Step
export const updatePhysics = (
    bodies: CelestialBody[],
    timeScale: number // delta time multiplier
): CelestialBody[] => {
    const dt = 0.016 * timeScale; // Assuming ~60fps base, scaled

    // 1. Calculate forces/accelerations for current positions
    // To do Velocity Verlet properly, we need:
    // r(t+dt) = r(t) + v(t)dt + 0.5 * a(t) * dt^2
    // v(t+half_dt) = v(t) + 0.5 * a(t) * dt
    // a(t+dt) = forces(r(t+dt))
    // v(t+dt) = v(t+half_dt) + 0.5 * a(t+dt) * dt

    // However, updating strict Velocity Verlet in a reducer/store might be complex if we don't store acceleration.
    // We'll use Semi-Implicit Euler (Symplectic Euler) for simplicity and good-enough stability for visual sims:
    // v(t+dt) = v(t) + a(t) * dt
    // r(t+dt) = r(t) + v(t+dt) * dt

    const nextBodies = bodies.map(body => {
        if (body.isFixed) return body;

        const acceleration = calculateAcceleration(body, bodies);

        // Clone vectors to avoid mutating previous state directly if reused
        const newVelocity = body.velocity.clone().add(acceleration.multiplyScalar(dt));
        const newPosition = body.position.clone().add(newVelocity.clone().multiplyScalar(dt));

        return {
            ...body,
            velocity: newVelocity,
            position: newPosition,
        };
    });

    return nextBodies;
};
