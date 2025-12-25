import { Vector3 } from 'three';
import type { CelestialBody } from '../types/physics';

// Physics constants
const G = 1;
const SOFTENING = 0.5;
export const BASE_DT = 0.001; // Base time step (adjusted for desired 1x speed)

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
    // Adjusted base time step: 0.002 is approx 1/8th of 60fps (0.016),
    // satisfying the request to make "1x" much slower (approx 0.1x of the previous 0.02 scale relative to 1.0).
    const dt = BASE_DT * timeScale;

    // --- Velocity Verlet Integration ---

    // 1. First Acceleration Step: a(t)
    // We need to calculate acceleration based on current positions r(t)
    const acc1 = bodies.map(body => calculateAcceleration(body, bodies));

    // 2. First Half-Step: 
    // v(t + 0.5*dt) = v(t) + 0.5 * a(t) * dt
    // r(t + dt)     = r(t) + v(t + 0.5*dt) * dt
    const intermediateBodies = bodies.map((body, i) => {
        if (body.isFixed) return body;

        const halfVel = body.velocity.clone().add(acc1[i].multiplyScalar(0.5 * dt));
        const nextPos = body.position.clone().add(halfVel.clone().multiplyScalar(dt));

        return {
            ...body,
            velocity: halfVel, // Temporarily store half-step velocity
            position: nextPos,
        };
    });

    // 3. Second Acceleration Step: a(t + dt)
    // Calculate acceleration based on new positions r(t + dt)
    const acc2 = intermediateBodies.map(body => calculateAcceleration(body, intermediateBodies));

    // 4. Second Half-Step:
    // v(t + dt) = v(t + 0.5*dt) + 0.5 * a(t + dt) * dt
    let nextBodies = intermediateBodies.map((body, i) => {
        if (body.isFixed) return body;

        const fullVel = body.velocity.clone().add(acc2[i].multiplyScalar(0.5 * dt));

        return {
            ...body,
            velocity: fullVel,
        };
    });

    // --- Collision Detection & Resolution ---
    // Simple iterative merging.
    // We restart the check after every merge to handle multi-body pileups simply.
    let merged = true;
    while (merged) {
        merged = false;
        for (let i = 0; i < nextBodies.length; i++) {
            for (let j = i + 1; j < nextBodies.length; j++) {
                const b1 = nextBodies[i];
                const b2 = nextBodies[j];
                const dist = b1.position.distanceTo(b2.position);

                // Check overlap
                if (dist < (b1.radius + b2.radius) * 0.8) { // 0.8 factor to allow slight overlap before snap
                    // Merge b2 into b1 (or bigger one eats smaller one)
                    const big = b1.mass >= b2.mass ? b1 : b2;
                    const small = b1.mass >= b2.mass ? b2 : b1;

                    // Conservation of Momentum: (m1v1 + m2v2) / (m1+m2)
                    const totalMass = big.mass + small.mass;
                    const momentum1 = big.velocity.clone().multiplyScalar(big.mass);
                    const momentum2 = small.velocity.clone().multiplyScalar(small.mass);
                    const newVelocity = momentum1.add(momentum2).divideScalar(totalMass);

                    // Center of Mass for Position: (m1r1 + m2r2) / (m1+m2)
                    // (Though usually sticking to the bigger one's position looks smoother for visual dominance)
                    // Let's use weighted position for realism
                    const pos1 = big.position.clone().multiplyScalar(big.mass);
                    const pos2 = small.position.clone().multiplyScalar(small.mass);
                    const newPosition = pos1.add(pos2).divideScalar(totalMass);

                    // Volume conservation for Radius: r_new = cbrt(r1^3 + r2^3)
                    const newRadius = Math.cbrt(Math.pow(big.radius, 3) + Math.pow(small.radius, 3));

                    const newBody: CelestialBody = {
                        ...big, // Keep ID/Name/Color of the bigger one usually
                        mass: totalMass,
                        radius: newRadius,
                        position: big.isFixed ? big.position : newPosition, // Fixed bodies don't move
                        velocity: big.isFixed ? new Vector3(0, 0, 0) : newVelocity,
                    };

                    // Replace the two old bodies with the new one
                    // We remove j first (index higher), then i, then push newBody
                    // Actually clearer to just filter them out and add newBody
                    nextBodies = nextBodies.filter(b => b.id !== b1.id && b.id !== b2.id);
                    nextBodies.push(newBody);

                    merged = true;
                    break; // Restart loop
                }
            }
            if (merged) break; // Restart loop
        }
    }

    return nextBodies;
};
