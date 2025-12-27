import { Vector3 } from 'three';
import { updatePhysics, updatePhysicsSoA, createPhysicsState } from './physics';
import type { CelestialBody } from '../types/physics';

/**
 * Generates N random bodies for benchmarking
 */
const generateBodies = (count: number): CelestialBody[] => {
    const bodies: CelestialBody[] = [];
    for (let i = 0; i < count; i++) {
        bodies.push({
            id: `body-${i}`,
            name: `Body ${i}`,
            mass: Math.random() * 100 + 1,
            radius: Math.random() * 2 + 0.5,
            position: new Vector3(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            ),
            velocity: new Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ),
            color: '#ffffff',
            isFixed: false
        });
    }
    return bodies;
};

/**
 * Runs a performance benchmark comparison
 */
export const runBenchmark = (iterations: number = 600, bodyCounts: number[] = [100, 500, 1000]) => {
    console.log(`Starting Benchmark Comparison (${iterations} frames)...`);
    console.log('--------------------------------------------------');

    const results: Record<string, any> = {};

    for (const count of bodyCounts) {
        console.log(`Testing with ${count} bodies...`);
        let bodies = generateBodies(count);

        // --- Legacy Object Mode (via Wrapper) ---
        // Note: The wrapper now includes conversion overhead, which is what we want to measure avoiding!
        // But to measure pure Algo difference, we should look at updatePhysics vs updatePhysicsSoA(pure).
        // Since updatePhysics now wraps SoA, it effectively measures "SoA + Conversion Overhead".
        // To measure the REAL gain, we will compare "SoA Pure Update" vs "Full Loop (SoA + Conversion)"

        // Warmup
        const state = createPhysicsState(bodies);

        // 1. Measure Pure SoA (Kernel Speed)
        const startSoA = performance.now();
        for (let i = 0; i < iterations; i++) {
            updatePhysicsSoA(state, 1.0);
        }
        const timeSoA = performance.now() - startSoA;

        // 2. Measure "Legacy-style" usage (Creating state every frame + Syncing back)
        // This simulates the overhead if we didn't persist state.
        // Or if we had the old object-based function (which is now replaced).
        // Since I replaced the old function with a wrapper, let's measure the wrapper to see overhead cost.
        const startLegacy = performance.now();
        let tempBodies = [...bodies]; // clone
        for (let i = 0; i < iterations; i++) {
            tempBodies = updatePhysics(tempBodies, 1.0);
        }
        const timeLegacy = performance.now() - startLegacy;

        const avgSoA = timeSoA / iterations;
        const avgLegacy = timeLegacy / iterations;

        console.log(`[${count} Bodies]`);
        console.log(`  SoA Kernel: ${avgSoA.toFixed(3)}ms/frame (~${(1000 / avgSoA).toFixed(1)} FPS)`);
        console.log(`  Overhead:   ${(avgLegacy - avgSoA).toFixed(3)}ms/frame (Conversion Cost)`);
        console.log(`  Total (UI): ${avgLegacy.toFixed(3)}ms/frame (~${(1000 / avgLegacy).toFixed(1)} FPS)`);
        console.log('--------------------------------------------------');

        results[count] = { soa: avgSoA, total: avgLegacy };
    }

    return results;
};
