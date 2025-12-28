import { Vector3 } from 'three';
import { updatePhysicsSoA, createPhysicsState, resetDebugCount } from './physics';
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
/**
 * Runs a performance benchmark comparison
 */
import { getWorkerManager } from '../store/physicsStore';

/**
 * Runs a performance benchmark comparison
 */
export const runBenchmark = async (iterations: number = 600, bodyCounts: number[] = [100, 500, 1000]) => {
    console.log(`Starting Benchmark Comparison (${iterations} frames)...`);
    console.log('--------------------------------------------------');

    const results: Record<string, any> = {};

    for (const count of bodyCounts) {
        console.log(`Testing with ${count} bodies...`);
        let bodies = generateBodies(count);

        // Warmup
        const state = createPhysicsState(bodies);

        // 1. Measure SoA Direct (O(N^2))
        resetDebugCount();
        const startDirect = performance.now();
        for (let i = 0; i < iterations; i++) {
            updatePhysicsSoA(state, 1.0, false, false);
        }
        const timeDirect = performance.now() - startDirect;
        const countDirect = state.count;

        // Anti-DCE: Accumulate position check
        let checkDirect = 0;
        for (let k = 0; k < state.count; k++) checkDirect += state.positions[k * 3];

        // Reset state for BH (to be fair)
        const stateBH = createPhysicsState(bodies);

        // 2. Measure SoA Barnes-Hut (O(N log N))
        const startBH = performance.now();
        for (let i = 0; i < iterations; i++) {
            updatePhysicsSoA(stateBH, 1.0, true, false);
        }
        const timeBH = performance.now() - startBH;
        const countBH = stateBH.count;
        let checkBH = 0;
        for (let k = 0; k < stateBH.count; k++) checkBH += stateBH.positions[k * 3];

        const avgDirect = timeDirect / iterations;
        const avgBH = timeBH / iterations;
        const ratio = avgDirect / avgBH;

        console.log(`[${count} Bodies] -> Final: D=${countDirect}, BH=${countBH}`);
        console.log(`  Direct (N^2):   ${avgDirect.toFixed(3)}ms/frame (~${(1000 / avgDirect).toFixed(1)} FPS)`);
        console.log(`  Barnes-Hut:     ${avgBH.toFixed(3)}ms/frame (~${(1000 / avgBH).toFixed(1)} FPS)`);
        console.log(`  Speedup (BH):   ${ratio.toFixed(2)}x`);

        // 3. Measure Worker (Parallel N^2)
        let avgWorker = 0;
        let workerSpeedup = 0;

        const workerMgr = getWorkerManager();
        if (workerMgr.isSupported) {
            console.log('  Testing Worker...');
            workerMgr.setBodies(bodies);

            // Warmup Worker with 1 frame
            await workerMgr.executeStep(count, 1.0);

            const startWorker = performance.now();
            for (let i = 0; i < iterations; i++) {
                await workerMgr.executeStep(count, 1.0);
            }
            const timeWorker = performance.now() - startWorker;
            avgWorker = timeWorker / iterations;
            workerSpeedup = avgDirect / avgWorker;

            console.log(`  Worker (N^2):   ${avgWorker.toFixed(3)}ms/frame (~${(1000 / avgWorker).toFixed(1)} FPS)`);
            console.log(`  Speedup (Work): ${workerSpeedup.toFixed(2)}x`);
        } else {
            console.log('  Worker:         Not Supported');
        }

        // 4. Measure GPU (WebGPU)
        const { GPUPhysicsEngine } = await import('../gpu/GPUPhysicsEngine');
        const isGPUSupported = await GPUPhysicsEngine.isSupported();
        let avgGPU = 0;
        let gpuSpeedup = 0;

        if (isGPUSupported) {
            console.log('  Testing GPU...');
            const gpuEngine = new GPUPhysicsEngine();
            try {
                await gpuEngine.init(count);
                await gpuEngine.setBodies(bodies);

                // Warmup
                await gpuEngine.step(1.0, count);
                await gpuEngine.getBodies(count);

                const startGPU = performance.now();
                for (let i = 0; i < iterations; i++) {
                    await gpuEngine.step(1.0, count);
                    await gpuEngine.getBodies(count); // Include readback for fairness with Store usage
                }
                const timeGPU = performance.now() - startGPU;
                avgGPU = timeGPU / iterations;
                gpuSpeedup = avgDirect / avgGPU;

                console.log(`  GPU:            ${avgGPU.toFixed(3)}ms/frame (~${(1000 / avgGPU).toFixed(1)} FPS)`);
                console.log(`  Speedup (GPU):  ${gpuSpeedup.toFixed(2)}x`);

            } catch (e) {
                console.error('GPU Benchmark failed', e);
            } finally {
                gpuEngine.dispose();
            }
        } else {
            console.log('  GPU:            Not Supported');
        }

        console.log(`  Checksums:      Direct=${checkDirect.toFixed(2)} | BH=${checkBH.toFixed(2)}`);
        console.log('--------------------------------------------------');

        results[count] = { direct: avgDirect, bh: avgBH, worker: avgWorker };
    }

    return results;
};

/**
 * Runs ONLY GPU benchmark (skipping CPU/Worker for speed/stability)
 */
export const runGPUBenchmark = async (iterations: number = 600, bodyCounts: number[] = [5000, 10000]) => {
    console.log(`Starting GPU Benchmark (${iterations} frames)...`);
    const { GPUPhysicsEngine } = await import('../gpu/GPUPhysicsEngine');
    const isGPUSupported = await GPUPhysicsEngine.isSupported();

    if (!isGPUSupported) {
        console.error("WebGPU is not supported.");
        return;
    }

    for (const count of bodyCounts) {
        console.log(`Testing with ${count} bodies...`);
        let bodies = generateBodies(count);
        const gpuEngine = new GPUPhysicsEngine();

        try {
            await gpuEngine.init(count);
            await gpuEngine.setBodies(bodies);

            // Warmup
            await gpuEngine.step(1.0, count);
            await gpuEngine.getBodies(count);

            const startGPU = performance.now();
            for (let i = 0; i < iterations; i++) {
                await gpuEngine.step(1.0, count);
                await gpuEngine.getBodies(count);
            }
            const timeGPU = performance.now() - startGPU;
            const avgGPU = timeGPU / iterations;

            console.log(`  GPU:            ${avgGPU.toFixed(3)}ms/frame (~${(1000 / avgGPU).toFixed(1)} FPS)`);

        } catch (e) {
            console.error('GPU Benchmark failed', e);
        } finally {
            gpuEngine.dispose();
        }
    }
};

