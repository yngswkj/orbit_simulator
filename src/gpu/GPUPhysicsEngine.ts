/**
 * GPUPhysicsEngine.ts
 * Handles N-body simulation using WebGPU Compute Shaders.
 */
import type { CelestialBody } from '../types/physics';

// Embedded WGSL Shader with two kernels for Velocity Verlet
const SHADER_CODE = `
struct Body {
    data0 : vec4<f32>, // pos(xyz), mass(w)
    data1 : vec4<f32>, // vel(xyz), radius(w)
    data2 : vec4<f32>, // acc(xyz), padding(w)
}

struct Params {
    dt : f32,
    bodyCount : u32,
    G : f32,
    softening : f32,
}

@group(0) @binding(0) var<storage, read> bodiesIn : array<Body>;
@group(0) @binding(1) var<storage, read_write> bodiesOut : array<Body>;
@group(0) @binding(2) var<uniform> params : Params;

// PASS 1: Integration (Kick1 + Drift)
// Read Old State (In), Write New Pos + Mid Vel (Out)
@compute @workgroup_size(64)
fn integrate(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    let index = GlobalInvocationID.x;
    if (index >= params.bodyCount) { return; }

    let myPos = bodiesIn[index].data0.xyz;
    let myMass = bodiesIn[index].data0.w;
    let oldVel = bodiesIn[index].data1.xyz;
    let oldAcc = bodiesIn[index].data2.xyz;

    let halfDt = params.dt * 0.5;

    // Kick 1
    let midVel = oldVel + oldAcc * halfDt;

    // Drift
    let newPos = myPos + midVel * params.dt;

    bodiesOut[index].data0 = vec4<f32>(newPos, myMass);
    bodiesOut[index].data1 = vec4<f32>(midVel, bodiesIn[index].data1.w);
    bodiesOut[index].data2 = vec4<f32>(0.0, 0.0, 0.0, 0.0); 
}

// PASS 2: Force Calculation + Kick2
// Read New Pos (In), Write Final Vel + New Acc (Out)
// NOTE: "In" here MUST be a copy of the "Out" from Pass 1.
@compute @workgroup_size(64)
fn calcForces(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    let index = GlobalInvocationID.x;
    if (index >= params.bodyCount) { return; }

    // Read from Input (Safe Read-Only)
    let myPos = bodiesIn[index].data0.xyz;
    var acc = vec3<f32>(0.0, 0.0, 0.0);

    // O(N^2) Force Calculation
    for (var i : u32 = 0u; i < params.bodyCount; i = i + 1u) {
        if (i == index) { continue; }

        let otherPos = bodiesIn[i].data0.xyz;
        let otherMass = bodiesIn[i].data0.w;

        let diff = otherPos - myPos;
        let distSq = dot(diff, diff) + params.softening;
        let invDist = inverseSqrt(distSq);
        let invDist3 = invDist * invDist * invDist;
        
        acc = acc + diff * (params.G * otherMass * invDist3);
    }

    // Kick 2
    let midVel = bodiesIn[index].data1.xyz;
    let halfDt = params.dt * 0.5;
    let newVel = midVel + acc * halfDt;

    // Write back Final Velocity and New Acceleration to Output
    bodiesOut[index].data1 = vec4<f32>(newVel, bodiesIn[index].data1.w);
    bodiesOut[index].data2 = vec4<f32>(acc, 0.0);
}
`;

export class GPUPhysicsEngine {
    private device: GPUDevice | null = null;
    private pipelineIntegrate: GPUComputePipeline | null = null;
    private pipelineForce: GPUComputePipeline | null = null;

    // Buffers
    private bufferA: GPUBuffer | null = null;
    private bufferB: GPUBuffer | null = null;
    private uniformBuffer: GPUBuffer | null = null;
    private stagingBuffer: GPUBuffer | null = null;

    private bindGroupA_Integrate: GPUBindGroup | null = null; // Read A, Write B
    private bindGroupB_Integrate: GPUBindGroup | null = null; // Read B, Write A

    // Force Bind Groups: Read Copy, Write Target
    private bindGroup_Force_ReadA_WriteB: GPUBindGroup | null = null; // Read A (Copy), Write B (Target)
    private bindGroup_Force_ReadB_WriteA: GPUBindGroup | null = null; // Read B (Copy), Write A (Target)

    private currentBufferIndex: 0 | 1 = 0;
    private maxBodies: number = 0;
    private _isReady: boolean = false; // Internal ready state

    public get isReady(): boolean {
        return this._isReady;
    }

    // Parameters
    private G: number = 1.0;
    private softening: number = 0.5 * 0.5;

    static async isSupported(): Promise<boolean> {
        if (!navigator.gpu) return false;
        try {
            const adapter = await navigator.gpu.requestAdapter();
            return !!adapter;
        } catch (e) {
            console.error('WebGPU check failed:', e);
            return false;
        }
    }

    constructor() { }

    async init(maxBodies: number): Promise<void> {
        if (!navigator.gpu) throw new Error('WebGPU not supported');
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) throw new Error('No GPUAdapter found');
        this.device = await adapter.requestDevice();
        this.maxBodies = maxBodies;

        await this.createPipelines();
        this.createBuffers(maxBodies);
        this._isReady = true;
        console.log('GPUPhysicsEngine initialized (Velocity Verlet).');
    }

    private async createPipelines() {
        if (!this.device) return;

        const shaderModule = this.device.createShaderModule({
            code: SHADER_CODE
        });

        // Pipeline 1: Integration
        this.pipelineIntegrate = this.device.createComputePipeline({
            layout: 'auto',
            compute: {
                module: shaderModule,
                entryPoint: 'integrate'
            }
        });

        // Pipeline 2: Force Calc
        this.pipelineForce = this.device.createComputePipeline({
            layout: 'auto',
            compute: {
                module: shaderModule,
                entryPoint: 'calcForces'
            }
        });
    }

    private createBuffers(count: number) {
        if (!this.device || !this.pipelineIntegrate || !this.pipelineForce) return;

        if (count > this.maxBodies) {
            console.warn('Body count exceeds GPU buffer capacity.');
        }

        // Struct Body is now 3 vec4s = 48 bytes
        const stride = 48; // 3 * 16
        const bufferSize = Math.max(count * stride, 128);

        const usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
        this.bufferA = this.device.createBuffer({ size: bufferSize, usage, label: 'Buffer A' });
        this.bufferB = this.device.createBuffer({ size: bufferSize, usage, label: 'Buffer B' });

        this.uniformBuffer = this.device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.stagingBuffer = this.device.createBuffer({
            size: bufferSize,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
        });

        // Create BindGroups
        // Integrate Layout: (read A, write B, uniforms)
        const integrateLayout = this.pipelineIntegrate.getBindGroupLayout(0);

        this.bindGroupA_Integrate = this.device.createBindGroup({
            layout: integrateLayout,
            entries: [
                { binding: 0, resource: { buffer: this.bufferA } },
                { binding: 1, resource: { buffer: this.bufferB } },
                { binding: 2, resource: { buffer: this.uniformBuffer } }
            ]
        });

        this.bindGroupB_Integrate = this.device.createBindGroup({
            layout: integrateLayout,
            entries: [
                { binding: 0, resource: { buffer: this.bufferB } }, // Read B
                { binding: 1, resource: { buffer: this.bufferA } }, // Write A
                { binding: 2, resource: { buffer: this.uniformBuffer } }
            ]
        });

        // Force Layout: (0: In, 1: Out, 2: Uniforms)
        const forceLayout = this.pipelineForce.getBindGroupLayout(0);

        this.bindGroup_Force_ReadA_WriteB = this.device.createBindGroup({
            layout: forceLayout,
            entries: [
                { binding: 0, resource: { buffer: this.bufferA } }, // Read A (Copy)
                { binding: 1, resource: { buffer: this.bufferB } }, // Write B (Target)
                { binding: 2, resource: { buffer: this.uniformBuffer } }
            ]
        });

        this.bindGroup_Force_ReadB_WriteA = this.device.createBindGroup({
            layout: forceLayout,
            entries: [
                { binding: 0, resource: { buffer: this.bufferB } }, // Read B (Copy)
                { binding: 1, resource: { buffer: this.bufferA } }, // Write A (Target)
                { binding: 2, resource: { buffer: this.uniformBuffer } }
            ]
        });
    }

    async setBodies(bodies: CelestialBody[]) {
        if (!this.device || !this.bufferA) return;

        // Pack data (stride 12 floats = 48 bytes)
        const data = new Float32Array(bodies.length * 12);
        for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i];
            const offset = i * 12;

            // data0
            data[offset + 0] = b.position.x;
            data[offset + 1] = b.position.y;
            data[offset + 2] = b.position.z;
            data[offset + 3] = b.mass;

            // data1
            data[offset + 4] = b.velocity.x;
            data[offset + 5] = b.velocity.y;
            data[offset + 6] = b.velocity.z;
            data[offset + 7] = b.radius;

            // data2 (acc) - Initialize to 0
            data[offset + 8] = 0;
            data[offset + 9] = 0;
            data[offset + 10] = 0;
            data[offset + 11] = 0;
        }

        this.device.queue.writeBuffer(this.bufferA, 0, data);

        // --- Initialize Acceleration (Critical for Velocity Verlet) ---
        // A is currently (pos, vel, 0). We need (pos, vel, acc) for the first step.
        // We use the 'calcForces' pipeline, but we must ensure it doesn't modify Velocity.
        // By setting dt=0 in params, the kick "v += a * 0.5 * dt" becomes "v += 0".

        // 1. Write Uniforms with dt=0
        const uniforms = new ArrayBuffer(16);
        new Float32Array(uniforms)[0] = 0; // dt = 0
        new Uint32Array(uniforms)[1] = bodies.length;
        new Float32Array(uniforms)[2] = this.G;
        new Float32Array(uniforms)[3] = this.softening;
        this.device.queue.writeBuffer(this.uniformBuffer!, 0, uniforms);

        // 2. Copy A -> B (A contains Init Pos/Vel)
        const commandEncoder = this.device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(this.bufferA, 0, this.bufferB!, 0, this.bufferA.size);

        // 3. Run Force Pass (Read B -> Write A)
        // We read the copy (B) and write back to A (Target).
        const pass = commandEncoder.beginComputePass({ label: 'Init Acc Pass' });
        pass.setPipeline(this.pipelineForce!);
        pass.setBindGroup(0, this.bindGroup_Force_ReadB_WriteA!);
        pass.dispatchWorkgroups(Math.ceil(bodies.length / 64));
        pass.end();

        this.device.queue.submit([commandEncoder.finish()]);

        // Final state is in A.
        this.currentBufferIndex = 0;
    }

    async step(dt: number, bodyCount: number) {
        if (!this.device || !this.pipelineIntegrate || !this.pipelineForce || !this.uniformBuffer) return;

        // Update Uniforms
        const uniforms = new ArrayBuffer(16);
        const floatView = new Float32Array(uniforms);
        const uintView = new Uint32Array(uniforms);
        floatView[0] = dt;
        uintView[1] = bodyCount;
        floatView[2] = this.G;
        floatView[3] = this.softening;
        this.device.queue.writeBuffer(this.uniformBuffer, 0, uniforms);

        const commandEncoder = this.device.createCommandEncoder();
        const bufferSize = this.bufferA!.size;
        const workgroupCount = Math.ceil(bodyCount / 64);

        if (this.currentBufferIndex === 0) {
            // Cycle: Read A -> Write B -> Copy B->A -> Read A -> Write B.

            // PASS 1: Integrate (Read A, Write B)
            // B gets NewPos, MidVel.
            const pass1 = commandEncoder.beginComputePass({ label: 'Integration Pass' });
            pass1.setPipeline(this.pipelineIntegrate);
            pass1.setBindGroup(0, this.bindGroupA_Integrate!);
            pass1.dispatchWorkgroups(workgroupCount);
            pass1.end();

            // COPY B -> A (Snapshot NewPos for Force Read)
            commandEncoder.copyBufferToBuffer(this.bufferB!, 0, this.bufferA!, 0, bufferSize);

            // PASS 2: Force (Read A, Write B)
            // Read A (Safe), Write B (Update Vel/Acc).
            const pass2 = commandEncoder.beginComputePass({ label: 'Force Pass' });
            pass2.setPipeline(this.pipelineForce);
            pass2.setBindGroup(0, this.bindGroup_Force_ReadA_WriteB!);
            pass2.dispatchWorkgroups(workgroupCount);
            pass2.end();

            // Result is in B. Next frame should read B.
            // currentBufferIndex will toggle to 1.

        } else {
            // Cycle: Read B -> Write A -> Copy A->B -> Read B -> Write A.

            // PASS 1: Integrate (Read B, Write A)
            const pass1 = commandEncoder.beginComputePass({ label: 'Integration Pass' });
            pass1.setPipeline(this.pipelineIntegrate);
            pass1.setBindGroup(0, this.bindGroupB_Integrate!);
            pass1.dispatchWorkgroups(workgroupCount);
            pass1.end();

            // COPY A -> B
            commandEncoder.copyBufferToBuffer(this.bufferA!, 0, this.bufferB!, 0, bufferSize);

            // PASS 2: Force (Read B, Write A)
            const pass2 = commandEncoder.beginComputePass({ label: 'Force Pass' });
            pass2.setPipeline(this.pipelineForce);
            pass2.setBindGroup(0, this.bindGroup_Force_ReadB_WriteA!);
            pass2.dispatchWorkgroups(workgroupCount);
            pass2.end();

            // Result is in A. Next frame should read A.
            // currentBufferIndex will toggle to 0.
        }

        this.device.queue.submit([commandEncoder.finish()]);

        // Swap to point to the valid buffer for next frame's READ
        this.currentBufferIndex = this.currentBufferIndex === 0 ? 1 : 0;
    }

    async getBodies(count: number): Promise<Float32Array | null> {
        if (!this.device || !this.stagingBuffer || !this.bufferA || !this.bufferB) return null;

        // Current buffer index points to the ONE TO BE READ NEXT (i.e., the one just written to).
        // Wait, logic check:
        // Start: current=0. 
        // Step: Pass1(A->B), Pass2(Update B). current becomes 1.
        // Next Step: Pass1(B->A), Pass2(Update A). current becomes 0.
        // So if current=1, B has data. If current=0, A has data.

        const sourceBuffer = this.currentBufferIndex === 1 ? this.bufferB : this.bufferA;

        // Stride is 48 bytes.
        // But we likely only want to read back position/velocity for rendering, or maybe just packed data?
        // To be simple, we read back everything. 
        const size = count * 48;

        const commandEncoder = this.device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(sourceBuffer, 0, this.stagingBuffer, 0, size);
        this.device.queue.submit([commandEncoder.finish()]);

        await this.stagingBuffer.mapAsync(GPUMapMode.READ, 0, size);
        const copyArrayBuffer = this.stagingBuffer.getMappedRange(0, size);
        const data = new Float32Array(copyArrayBuffer.slice(0));
        this.stagingBuffer.unmap();

        // Convert back to dense array? Or Component expects strided?
        // The physicsStore usage expects: 'getBodies' returns Float32Array
        // And then 'updateBodies' manually unpacks it?
        // Let's check physicsStore.ts logic. 
        // It likely assumes 8 floats per body (pos+mass, vel+rad). 
        // Now it is 12 floats (pos+mass, vel+rad, acc+pad).
        // We MUST update physicsStore.ts or unpack here.
        // Efficiency: unpack here? Or update store?
        // Updating store is better for strictness.

        return data;
    }

    dispose() {
        this.bufferA?.destroy();
        this.bufferB?.destroy();
        this.uniformBuffer?.destroy();
        this.stagingBuffer?.destroy();
        this.device?.destroy();
    }
}
