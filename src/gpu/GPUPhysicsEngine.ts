/**
 * GPUPhysicsEngine.ts
 * Handles N-body simulation using WebGPU Compute Shaders.
 */
import type { CelestialBody } from '../types/physics';

// Embedded WGSL Shader to avoid loader issues
const SHADER_CODE = `
struct Body {
    position : vec3<f32>,
    mass : f32,
    velocity : vec3<f32>,
    radius : f32,
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

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    let index = GlobalInvocationID.x;
    if (index >= params.bodyCount) {
        return;
    }

    let myPos = bodiesIn[index].position;
    let myMass = bodiesIn[index].mass;
    var acc = vec3<f32>(0.0, 0.0, 0.0);

    // O(N^2) Force Calculation
    for (var i : u32 = 0u; i < params.bodyCount; i = i + 1u) {
        if (i == index) {
            continue;
        }

        let otherPos = bodiesIn[i].position;
        let otherMass = bodiesIn[i].mass;

        let diff = otherPos - myPos;
        let distSq = dot(diff, diff) + params.softening;
        let invDist = inverseSqrt(distSq);
        let invDist3 = invDist * invDist * invDist;
        
        acc = acc + diff * (params.G * otherMass * invDist3);
    }

    // Integration
    let oldVel = bodiesIn[index].velocity;
    let newVel = oldVel + acc * params.dt;
    let newPos = myPos + newVel * params.dt;

    bodiesOut[index].position = newPos;
    bodiesOut[index].velocity = newVel;
    bodiesOut[index].mass = myMass;
    bodiesOut[index].radius = bodiesIn[index].radius;
}
`;

export class GPUPhysicsEngine {
    private device: GPUDevice | null = null;
    private pipeline: GPUComputePipeline | null = null;

    // Buffers
    private bufferA: GPUBuffer | null = null; // Ping
    private bufferB: GPUBuffer | null = null; // Pong
    private uniformBuffer: GPUBuffer | null = null;
    private stagingBuffer: GPUBuffer | null = null; // For readback

    private bindGroupA: GPUBindGroup | null = null; // Read A, Write B
    private bindGroupB: GPUBindGroup | null = null; // Read B, Write A

    private currentBufferIndex: 0 | 1 = 0; // 0: Read A, Write B. 1: Read B, Write A.
    private maxBodies: number = 0;
    public isReady: boolean = false;

    // Parameters
    private G: number = 1.0;
    private softening: number = 0.5 * 0.5;

    /**
     * Checks if WebGPU is supported.
     */
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

        await this.createPipeline();
        this.createBuffers(maxBodies);
        this.isReady = true;
        console.log('GPUPhysicsEngine initialized.');
    }

    private async createPipeline() {
        if (!this.device) return;

        const shaderModule = this.device.createShaderModule({
            code: SHADER_CODE
        });

        this.pipeline = this.device.createComputePipeline({
            layout: 'auto',
            compute: {
                module: shaderModule,
                entryPoint: 'main'
            }
        });
    }

    private createBuffers(count: number) {
        if (!this.device || !this.pipeline) return;

        if (count > this.maxBodies) {
            console.warn('Body count exceeds GPU buffer capacity. Resizing not implemented yet.');
            // Future: Resize buffers
        }

        // 8 floats * 4 bytes = 32 bytes per body
        const bufferSize = Math.max(count * 32, 128);

        // Create Buffer A & B
        const usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
        this.bufferA = this.device.createBuffer({ size: bufferSize, usage, label: 'Buffer A' });
        this.bufferB = this.device.createBuffer({ size: bufferSize, usage, label: 'Buffer B' });

        // Uniform Buffer (dt, bodyCount, G, softening)
        // 4 floats = 16 bytes.
        this.uniformBuffer = this.device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        // Staging Buffer for Readback
        this.stagingBuffer = this.device.createBuffer({
            size: bufferSize,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
        });

        // Create BindGroups
        const layout = this.pipeline.getBindGroupLayout(0);

        this.bindGroupA = this.device.createBindGroup({
            layout,
            entries: [
                { binding: 0, resource: { buffer: this.bufferA } },
                { binding: 1, resource: { buffer: this.bufferB } },
                { binding: 2, resource: { buffer: this.uniformBuffer } }
            ]
        });

        this.bindGroupB = this.device.createBindGroup({
            layout,
            entries: [
                { binding: 0, resource: { buffer: this.bufferB } },
                { binding: 1, resource: { buffer: this.bufferA } },
                { binding: 2, resource: { buffer: this.uniformBuffer } }
            ]
        });
    }

    async setBodies(bodies: CelestialBody[]) {
        if (!this.device || !this.bufferA) return;

        // Pack data
        const data = new Float32Array(bodies.length * 8);
        for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i];
            const offset = i * 8;
            data[offset + 0] = b.position.x;
            data[offset + 1] = b.position.y;
            data[offset + 2] = b.position.z;
            data[offset + 3] = b.mass;
            data[offset + 4] = b.velocity.x;
            data[offset + 5] = b.velocity.y;
            data[offset + 6] = b.velocity.z;
            data[offset + 7] = b.radius;
        }

        // Upload to Buffer A (Starting state)
        this.device.queue.writeBuffer(this.bufferA, 0, data);

        this.currentBufferIndex = 0;
    }

    async step(dt: number, bodyCount: number) {
        if (!this.device || !this.pipeline || !this.uniformBuffer || !this.bindGroupA || !this.bindGroupB) return;

        // Update Uniforms
        const uniforms = new Float32Array([dt, bodyCount, this.G, this.softening]);
        this.device.queue.writeBuffer(this.uniformBuffer, 0, uniforms);

        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();

        passEncoder.setPipeline(this.pipeline);

        // Ping-Pong
        // If index 0: Read A, Write B. (BindGroup A)
        // If index 1: Read B, Write A. (BindGroup B)
        const bindGroup = this.currentBufferIndex === 0 ? this.bindGroupA : this.bindGroupB;
        passEncoder.setBindGroup(0, bindGroup);

        const workgroupSize = 64;
        const workgroupCount = Math.ceil(bodyCount / workgroupSize);
        passEncoder.dispatchWorkgroups(workgroupCount);

        passEncoder.end();
        this.device.queue.submit([commandEncoder.finish()]);

        // Swap for next frame
        this.currentBufferIndex = this.currentBufferIndex === 0 ? 1 : 0;
    }

    async getBodies(count: number): Promise<Float32Array | null> {
        if (!this.device || !this.stagingBuffer || !this.bufferA || !this.bufferB) return null;

        // We want to read the buffer that was just WRITTEN to.
        // If currentBufferIndex is 1, it means we plan to Read B next.
        // So the LAST op was A -> B. Thus B has the latest data.
        const sourceBuffer = this.currentBufferIndex === 0 ? this.bufferA : this.bufferB;

        const size = count * 32;

        const commandEncoder = this.device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(sourceBuffer, 0, this.stagingBuffer, 0, size);
        this.device.queue.submit([commandEncoder.finish()]);

        await this.stagingBuffer.mapAsync(GPUMapMode.READ, 0, size);
        const copyArrayBuffer = this.stagingBuffer.getMappedRange(0, size);
        const data = new Float32Array(copyArrayBuffer.slice(0));
        this.stagingBuffer.unmap();

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
