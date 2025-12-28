// Physics Worker
// Handles SoA physics updates in parallel using SharedArrayBuffer

// Shared Views
let sharedPositions: Float64Array;
let sharedVelocities: Float64Array;
let sharedAccelerations: Float64Array;
let sharedMasses: Float64Array;
let sharedRadii: Float64Array;

let syncCounter: Int32Array;

// Worker State
let workerId: number;
let workerCount: number;
let maxBodies: number;

const G = 1;
const SOFTENING_SQ = 0.5 * 0.5;

function waitBarrier(targetCount: number) {
    // Phase-based barrier to avoid race conditions
    // syncCounter[0] = arrival count
    // syncCounter[1] = phase generation

    const myPhase = Atomics.load(syncCounter, 1);
    const arrived = Atomics.add(syncCounter, 0, 1) + 1;

    if (arrived === targetCount) {
        // Last one here
        Atomics.store(syncCounter, 0, 0); // Reset count
        Atomics.add(syncCounter, 1, 1);   // Bump phase
        Atomics.notify(syncCounter, 1);   // Wake up others
    } else {
        // Wait for phase to change
        while (Atomics.load(syncCounter, 1) === myPhase) {
            Atomics.wait(syncCounter, 1, myPhase);
        }
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

        sharedRadii = new Float64Array(sharedBuffer, offset, maxBodies);
        offset += maxBodies * 8;

        // syncCounter (2 integers)
        syncCounter = new Int32Array(sharedBuffer, offset, 2);

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

        // 2. Force Calculation (All pairs) + Collision Detection
        // Reset accelerations for my range
        for (let i = startIdx; i < endIdx; i++) {
            const i3 = i * 3;
            sharedAccelerations[i3] = 0;
            sharedAccelerations[i3 + 1] = 0;
            sharedAccelerations[i3 + 2] = 0;
        }

        const collisions: [number, number][] = [];

        // Compute Forces
        for (let i = startIdx; i < endIdx; i++) {
            const i3 = i * 3;
            const pi_x = sharedPositions[i3];
            const pi_y = sharedPositions[i3 + 1];
            const pi_z = sharedPositions[i3 + 2];
            const r_i = sharedRadii[i];

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

                // Collision Detection
                // Only report if i < j to avoid duplicates (though i range is partitioned, j is global)
                // Since this loop runs for 'i' in local range, and 'j' in global,
                // we should only report if i < j to ensure uniqueness globally?
                // Actually, if I handle 'i', I can just report (i, j).
                // But another worker handling 'j' might report (j, i).
                // Let's rely on main thread to dedupe, or strictly i < j.
                // If i < j, report.

                if (i < j) {
                    const r_j = sharedRadii[j];
                    if (distSq < (r_i + r_j) ** 2) {
                        collisions.push([i, j]);
                    }
                }

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

        // Send collisions if any
        if (collisions.length > 0) {
            self.postMessage({ type: 'collisions', collisions });
        }

        // BARRIER (Wait for force calcs)
        // waitBarrier(workerCount); // Not strictly needed for Step 3?
        // Actually for pure Verlet, Step 3 uses new accelerations.
        // We write into sharedAccelerations.
        // Step 3 reads sharedAccelerations.
        // If Worker A is fast and starts Step 3 for body X, it reads Accel X.
        // Accel X is only written by Worker A. So no race on READ.
        // So no barrier needed.

        // 3. Second Half-Step: v += 0.5a_new
        for (let i = startIdx; i < endIdx; i++) {
            const i3 = i * 3;
            sharedVelocities[i3] += sharedAccelerations[i3] * halfDt;
            sharedVelocities[i3 + 1] += sharedAccelerations[i3 + 1] * halfDt;
            sharedVelocities[i3 + 2] += sharedAccelerations[i3 + 2] * halfDt;
        }

        self.postMessage({ type: 'done' });
    }

    if (type === 'energy') {
        // Only Worker 0 calculates energy
        if (workerId === 0) {
            const { count } = e.data;
            let kinetic = 0;
            let potential = 0;

            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                const vSq = sharedVelocities[i3] ** 2 + sharedVelocities[i3 + 1] ** 2 + sharedVelocities[i3 + 2] ** 2;
                kinetic += 0.5 * sharedMasses[i] * vSq;

                const pi_x = sharedPositions[i3];
                const pi_y = sharedPositions[i3 + 1];
                const pi_z = sharedPositions[i3 + 2];

                for (let j = i + 1; j < count; j++) {
                    const j3 = j * 3;
                    const dx = pi_x - sharedPositions[j3];
                    const dy = pi_y - sharedPositions[j3 + 1];
                    const dz = pi_z - sharedPositions[j3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;

                    potential -= (G * sharedMasses[i] * sharedMasses[j]) / dist;
                }
            }

            self.postMessage({ type: 'energyResult', totalEnergy: kinetic + potential });
        } else {
            // Other workers do nothing or could ack
            // self.postMessage({ type: 'energyResult', totalEnergy: 0 }); // Don't confuse manager
        }
    }
};

export default {}; // Module export
