export class PhysicsWorkerManager {
    private workers: Worker[] = [];
    private sharedBuffer: SharedArrayBuffer;

    // Views
    public positions: Float64Array;
    public velocities: Float64Array;
    public accelerations: Float64Array;
    public masses: Float64Array;
    public radii: Float64Array;
    public syncCounter: Int32Array;

    private workerCount: number;
    private maxBodies: number;
    public readonly isSupported: boolean;

    constructor(maxBodies: number, workerCount: number = navigator.hardwareConcurrency || 4) {
        this.maxBodies = maxBodies;
        this.workerCount = workerCount;
        this.isSupported = typeof SharedArrayBuffer !== 'undefined';

        if (!this.isSupported) {
            console.warn('SharedArrayBuffer is not supported. Falling back to main thread.');
            // Fallback initialization
            this.sharedBuffer = new ArrayBuffer(0) as any; // Cast to satisfy type
            this.positions = new Float64Array(0);
            this.velocities = new Float64Array(0);
            this.accelerations = new Float64Array(0);
            this.masses = new Float64Array(0);
            this.radii = new Float64Array(0);
            this.syncCounter = new Int32Array(0);
            return;
        }

        // Calculate size: (pos(3) + vel(3) + acc(3) + mass(1) + radius(1)) * 8 bytes * N + sync(4)
        const elementCountPerBody = 3 + 3 + 3 + 1 + 1; // 11 doubles
        const bufferSize = maxBodies * elementCountPerBody * 8 + 8; // +8 for Int32 counter (2 * 4 bytes)

        this.sharedBuffer = new SharedArrayBuffer(bufferSize);

        let offset = 0;

        // positions
        this.positions = new Float64Array(this.sharedBuffer, offset, maxBodies * 3);
        offset += maxBodies * 3 * 8;

        // velocities
        this.velocities = new Float64Array(this.sharedBuffer, offset, maxBodies * 3);
        offset += maxBodies * 3 * 8;

        // accelerations
        this.accelerations = new Float64Array(this.sharedBuffer, offset, maxBodies * 3);
        offset += maxBodies * 3 * 8;

        // masses
        this.masses = new Float64Array(this.sharedBuffer, offset, maxBodies);
        offset += maxBodies * 8;

        // radii
        this.radii = new Float64Array(this.sharedBuffer, offset, maxBodies);
        offset += maxBodies * 8;

        // syncCounter (Atomics) - [0]: arrival count, [1]: phase/generation
        this.syncCounter = new Int32Array(this.sharedBuffer, offset, 2);
    }

    public initWorkers(): void {
        if (!this.isSupported) return;

        for (let i = 0; i < this.workerCount; i++) {
            const worker = new Worker(new URL('./physics.worker.ts', import.meta.url), {
                type: 'module'
            });

            worker.postMessage({
                type: 'init',
                sharedBuffer: this.sharedBuffer,
                workerId: i,
                workerCount: this.workerCount,
                maxBodies: this.maxBodies
            });

            this.workers.push(worker);
        }
    }

    public executeStep(count: number, dt: number): Promise<void> {
        if (!this.isSupported) return Promise.resolve();

        // Reset sync counter
        Atomics.store(this.syncCounter, 0, 0);

        const promises = this.workers.map(worker =>
            new Promise<void>((resolve) => {
                // We use one-time event listener or assume correct order
                // For simplicity, let's wait for 'done' message
                const handler = (e: MessageEvent) => {
                    if (e.data.type === 'done') {
                        worker.removeEventListener('message', handler);
                        resolve();
                    }
                };
                worker.addEventListener('message', handler);

                worker.postMessage({
                    type: 'step',
                    count,
                    dt
                });
            })
        );

        return Promise.all(promises).then(() => { });
    }

    public terminate(): void {
        this.workers.forEach(w => w.terminate());
        this.workers = [];
    }

    public setBodies(bodies: any[]): void {
        if (!this.isSupported) return;

        const count = bodies.length;
        if (count > this.maxBodies) {
            console.error('Too many bodies for worker manager');
            return;
        }

        for (let i = 0; i < count; i++) {
            const body = bodies[i];
            const i3 = i * 3;

            this.positions[i3] = body.position.x;
            this.positions[i3 + 1] = body.position.y;
            this.positions[i3 + 2] = body.position.z;

            this.velocities[i3] = body.velocity.x;
            this.velocities[i3 + 1] = body.velocity.y;
            this.velocities[i3 + 2] = body.velocity.z;

            this.accelerations[i3] = 0;
            this.accelerations[i3 + 1] = 0;
            this.accelerations[i3 + 2] = 0;

            this.masses[i] = body.mass;
            this.radii[i] = body.radius;
        }
    }

    public getPhysicsState(count: number): any {
        return {
            count,
            maxCount: this.maxBodies,
            positions: this.positions,
            velocities: this.velocities,
            accelerations: this.accelerations,
            masses: this.masses,
            radii: this.radii,
            ids: [], // IDs not needed for calculation, handled by main thread map
            idToIndex: new Map() // Dummy
        };
    }
}
