import { Vector3 } from 'three';
import type { PhysicsState } from '../types/physics';

const MAX_DEPTH = 32;

export interface OctreeNode {
    // Spatial bounds
    min: Vector3;
    max: Vector3;
    center: Vector3;  // Geometric center
    size: number;     // Side length

    // Data
    totalMass: number;
    centerOfMass: Vector3;

    // Structure
    children: Array<OctreeNode | null>; // 8 children
    bodyIndex: number | null; // Leaf node: index in PhysicsState. -1 or null if internal

    // Helpers
    hasChildren: boolean;
}

/**
 * Object Pool for OctreeNodes to avoid GC during reconstruction every frame
 */
class OctreeNodePool {
    private pool: OctreeNode[] = [];
    private index: number = 0;

    constructor(initialSize: number = 10000) {
        // Pre-allocate
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createEmptyNode());
        }
    }

    private createEmptyNode(): OctreeNode {
        return {
            min: new Vector3(),
            max: new Vector3(),
            center: new Vector3(),
            size: 0,
            totalMass: 0,
            centerOfMass: new Vector3(),
            children: [null, null, null, null, null, null, null, null],
            bodyIndex: null,
            hasChildren: false
        };
    }

    get(): OctreeNode {
        if (this.index >= this.pool.length) {
            // Expand
            const growth = Math.floor(this.pool.length * 0.5) || 100;
            for (let i = 0; i < growth; i++) {
                this.pool.push(this.createEmptyNode());
            }
        }
        const node = this.pool[this.index++];
        this.resetNode(node);
        return node;
    }

    reset(): void {
        this.index = 0;
    }

    private resetNode(node: OctreeNode): void {
        node.totalMass = 0;
        node.bodyIndex = null;
        node.hasChildren = false;
        node.children.fill(null);
    }
}

// Global Pool Instance
export const nodePool = new OctreeNodePool();

/**
 * Builds the Octree from the current PhysicsState.
 */
export const buildOctree = (state: PhysicsState): OctreeNode | null => {
    if (state.count === 0) return null;

    nodePool.reset();

    // 1. Calculate Bounds
    const min = new Vector3(Infinity, Infinity, Infinity);
    const max = new Vector3(-Infinity, -Infinity, -Infinity);

    for (let i = 0; i < state.count; i++) {
        const i3 = i * 3;
        const x = state.positions[i3];
        const y = state.positions[i3 + 1];
        const z = state.positions[i3 + 2];

        if (x < min.x) min.x = x;
        if (y < min.y) min.y = y;
        if (z < min.z) min.z = z;
        if (x > max.x) max.x = x;
        if (y > max.y) max.y = y;
        if (z > max.z) max.z = z;
    }

    // Make it a cube to simplify octree splitting
    const size = Math.max(max.x - min.x, max.y - min.y, max.z - min.z);

    // Add small epsilon to avoid boundary issues
    const epsilon = size * 0.001 || 1.0;
    max.x += epsilon; max.y += epsilon; max.z += epsilon;
    min.x -= epsilon; min.y -= epsilon; min.z -= epsilon;

    // Re-calc cubic size
    const cubicSize = Math.max(max.x - min.x, max.y - min.y, max.z - min.z);
    const center = min.clone().addScalar(cubicSize * 0.5);

    // 2. Create Root
    const root = nodePool.get();
    root.min.copy(min);
    root.max.copy(min).addScalar(cubicSize);
    root.center.copy(center);
    root.size = cubicSize;

    // 3. Insert Bodies
    for (let i = 0; i < state.count; i++) {
        if (state.masses[i] <= 0) continue; // Skip massless/deleted
        insert(root, i, state, 0);
    }

    // 4. Calculate Center of Mass (Bottom-Up)
    calculateCoM(root, state);

    return root;
};

const insert = (node: OctreeNode, bodyIdx: number, state: PhysicsState, depth: number): void => {
    if (depth > MAX_DEPTH) {
        return;
    }

    const bx = state.positions[bodyIdx * 3];
    const by = state.positions[bodyIdx * 3 + 1];
    const bz = state.positions[bodyIdx * 3 + 2];

    if (!node.hasChildren && node.bodyIndex === null) {
        // Empty leaf -> Store body
        node.bodyIndex = bodyIdx;
        return;
    }

    // If it's a leaf performing cell division (it holds a body), we must split it first
    if (!node.hasChildren && node.bodyIndex !== null) {
        const existingBodyIdx = node.bodyIndex;
        node.bodyIndex = null; // No longer a pure leaf
        node.hasChildren = true;

        // Push existing body down
        const octant = getOctant(node.center, state.positions[existingBodyIdx * 3], state.positions[existingBodyIdx * 3 + 1], state.positions[existingBodyIdx * 3 + 2]);
        if (!node.children[octant]) {
            node.children[octant] = createChild(node, octant);
        }
        insert(node.children[octant]!, existingBodyIdx, state, depth + 1);
    }

    // Mark as internal if not already
    node.hasChildren = true;

    // Insert new body
    const octant = getOctant(node.center, bx, by, bz);
    if (!node.children[octant]) {
        node.children[octant] = createChild(node, octant);
    }
    insert(node.children[octant]!, bodyIdx, state, depth + 1);
};

const getOctant = (center: Vector3, x: number, y: number, z: number): number => {
    let index = 0;
    if (x >= center.x) index |= 4; // 100
    if (y >= center.y) index |= 2; // 010
    if (z >= center.z) index |= 1; // 001
    return index;
};

const createChild = (parent: OctreeNode, octant: number): OctreeNode => {
    const child = nodePool.get();
    const halfSize = parent.size * 0.5;

    // Calculate new min based on octant
    child.size = halfSize;
    child.min.copy(parent.min);

    if (octant & 4) child.min.x += halfSize;
    if (octant & 2) child.min.y += halfSize;
    if (octant & 1) child.min.z += halfSize;

    child.max.copy(child.min).addScalar(halfSize);
    child.center.copy(child.min).addScalar(halfSize * 0.5);

    return child;
};

const calculateCoM = (node: OctreeNode, state: PhysicsState): void => {
    if (!node.hasChildren) {
        if (node.bodyIndex !== null) {
            const idx = node.bodyIndex;
            const m = state.masses[idx];
            node.totalMass = m;
            node.centerOfMass.set(
                state.positions[idx * 3],
                state.positions[idx * 3 + 1],
                state.positions[idx * 3 + 2]
            );
        } else {
            node.totalMass = 0;
            node.centerOfMass.set(0, 0, 0);
        }
        return;
    }

    let mSum = 0;
    let comX = 0, comY = 0, comZ = 0;

    for (let i = 0; i < 8; i++) {
        const child = node.children[i];
        if (child) {
            calculateCoM(child, state);

            const cm = child.totalMass;
            if (cm > 0) {
                mSum += cm;
                comX += child.centerOfMass.x * cm;
                comY += child.centerOfMass.y * cm;
                comZ += child.centerOfMass.z * cm;
            }
        }
    }

    node.totalMass = mSum;
    if (mSum > 0) {
        node.centerOfMass.set(comX / mSum, comY / mSum, comZ / mSum);
    } else {
        node.centerOfMass.set(0, 0, 0);
    }
};
