// Physics Worker
// Handles SoA physics updates in parallel using SharedArrayBuffer

// Shared Views
let sharedPositions: Float64Array;
let sharedVelocities: Float64Array;
let sharedAccelerations: Float64Array;
let sharedMasses: Float64Array;

let syncCounter: Int32Array;

// Worker State
let workerId: number;
let workerCount: number;
let maxBodies: number;

const G = 1;
const SOFTENING_SQ = 0.5 * 0.5;

function waitBarrier(targetCount: number) {
    // Increment counter
    Atomics.add(syncCounter, 0, 1);

    // Busy-wait until all workers reach this point
    // Note: This relies on all workers being active and stepping.
    // If a worker crashes, this freezes.
    while (Atomics.load(syncCounter, 0) < targetCount) {
        // Spin
    }
}

self.onmessage = (e: MessageEvent) => {
    const { type } = e.data;

    if (type === 'init') {
        const { sharedBuffer, workerId: wid, workerCount: wc, maxBodies: mb } = e.data;
        workerId = wid;
        workerCount = wc;
        maxBodies = mb;

        let offset = 0;

        sharedPositions = new Float64Array(sharedBuffer, offset, maxBodies * 3);
        offset += maxBodies * 3 * 8;

        sharedVelocities = new Float64Array(sharedBuffer, offset, maxBodies * 3);
        offset += maxBodies * 3 * 8;

        sharedAccelerations = new Float64Array(sharedBuffer, offset, maxBodies * 3);
        offset += maxBodies * 3 * 8;

        sharedMasses = new Float64Array(sharedBuffer, offset, maxBodies);
        offset += maxBodies * 8;



        syncCounter = new Int32Array(sharedBuffer, offset, 1);

        console.log(`Worker ${workerId} initialized.`);
    }

    if (type === 'step') {
        const { count, dt } = e.data;
        const halfDt = 0.5 * dt;

        // Partition range
        const bodiesPerWorker = Math.ceil(count / workerCount);
        const startIdx = workerId * bodiesPerWorker;
        const endIdx = Math.min(startIdx + bodiesPerWorker, count);

        // 1. First Half-Step: v += 0.5a, r += v
        for (let i = startIdx; i < endIdx; i++) {
            const i3 = i * 3;

            sharedVelocities[i3] += sharedAccelerations[i3] * halfDt;
            sharedVelocities[i3 + 1] += sharedAccelerations[i3 + 1] * halfDt;
            sharedVelocities[i3 + 2] += sharedAccelerations[i3 + 2] * halfDt;

            sharedPositions[i3] += sharedVelocities[i3] * dt;
            sharedPositions[i3 + 1] += sharedVelocities[i3 + 1] * dt;
            sharedPositions[i3 + 2] += sharedVelocities[i3 + 2] * dt;
        }

        // BARRIER
        waitBarrier(workerCount);

        // 2. Force Calculation (All pairs)
        // Reset accelerations for my range
        // Since we are parallelizing, we can compute forces acting ON my bodies
        // from ALL OTHER bodies.

        // Clear accelerations for my range
        for (let i = startIdx; i < endIdx; i++) {
            const i3 = i * 3;
            sharedAccelerations[i3] = 0;
            sharedAccelerations[i3 + 1] = 0;
            sharedAccelerations[i3 + 2] = 0;
        }

        // Compute Forces
        for (let i = startIdx; i < endIdx; i++) {
            const i3 = i * 3;
            const pi_x = sharedPositions[i3];
            const pi_y = sharedPositions[i3 + 1];
            const pi_z = sharedPositions[i3 + 2];

            let ax = 0;
            let ay = 0;
            let az = 0;

            for (let j = 0; j < count; j++) {
                if (i === j) continue;

                const j3 = j * 3;
                const dx = sharedPositions[j3] - pi_x;
                const dy = sharedPositions[j3 + 1] - pi_y;
                const dz = sharedPositions[j3 + 2] - pi_z;

                const distSq = dx * dx + dy * dy + dz * dz;
                const distWithSoftSq = distSq + SOFTENING_SQ;
                const distWithSoft = Math.sqrt(distWithSoftSq);

                // F = G * m_j / (dist^3)
                const f_base = (G * sharedMasses[j]) / (distWithSoftSq * distWithSoft);

                ax += dx * f_base;
                ay += dy * f_base;
                az += dz * f_base;
            }

            sharedAccelerations[i3] = ax;
            sharedAccelerations[i3 + 1] = ay;
            sharedAccelerations[i3 + 2] = az;
        }

        // Note: No barrier needed here because Step 3 only needs local accelerations.

        // 3. Second Half-Step: v += 0.5a_new
        for (let i = startIdx; i < endIdx; i++) {
            const i3 = i * 3;
            sharedVelocities[i3] += sharedAccelerations[i3] * halfDt;
            sharedVelocities[i3 + 1] += sharedAccelerations[i3 + 1] * halfDt;
            sharedVelocities[i3 + 2] += sharedAccelerations[i3 + 2] * halfDt;
        }

        self.postMessage({ type: 'done' });
    }
};

export default {}; // Module export
