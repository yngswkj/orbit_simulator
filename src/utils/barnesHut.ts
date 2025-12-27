import type { PhysicsState } from '../types/physics';
import { type OctreeNode, buildOctree } from './octree';

const G = 1;
const SOFTENING = 0.5;
const SOFTENING_SQ = SOFTENING * SOFTENING;
const THETA = 0.5; // Barnes-Hut threshold

/**
 * Calculates accelerations using Barnes-Hut algorithm.
 */
export const calculateAccelerationsBarnesHut = (state: PhysicsState): void => {
    const { count, positions, accelerations } = state;

    // 1. Build Octree
    // Loop over all bodies to determine global bounds and insert is handled by buildOctree
    const root = buildOctree(state);

    if (!root) return;

    // Reset accelerations
    accelerations.fill(0, 0, count * 3);

    // 2. Calculate Force for each body
    for (let i = 0; i < count; i++) {
        // Skip massless bodies if they are just visual particles? Maybe not.
        // Even massless bodies are attracted by gravity.

        // Starting points
        const i3 = i * 3;
        const px = positions[i3];
        const py = positions[i3 + 1];
        const pz = positions[i3 + 2];

        // Recursive tree traversal
        calculateForceOnBody(i, px, py, pz, root, state);
    }
};

const calculateForceOnBody = (
    bodyIdx: number,
    px: number, py: number, pz: number,
    node: OctreeNode,
    state: PhysicsState
): void => {
    // 1. If leaf node
    if (!node.hasChildren) {
        if (node.bodyIndex !== null && node.bodyIndex !== bodyIdx) {
            // Direct interaction
            applyForce(bodyIdx, px, py, pz, node.bodyIndex, state);
        }
        return;
    }

    // 2. Internal node
    // Check s/d < theta
    const dx = node.centerOfMass.x - px;
    const dy = node.centerOfMass.y - py;
    const dz = node.centerOfMass.z - pz;
    const distSq = dx * dx + dy * dy + dz * dz;
    const dist = Math.sqrt(distSq);

    if (node.size / dist < THETA) {
        // Far away: Approx interaction (use Center of Mass)
        applyForceFromNode(bodyIdx, px, py, pz, node.totalMass, node.centerOfMass.x, node.centerOfMass.y, node.centerOfMass.z, state.accelerations);
    } else {
        // Too close: Recurse
        for (let i = 0; i < 8; i++) {
            const child = node.children[i];
            if (child && child.totalMass > 0) {
                calculateForceOnBody(bodyIdx, px, py, pz, child, state);
            }
        }
    }
};

const applyForce = (
    targetIdx: number,
    px: number, py: number, pz: number,
    sourceIdx: number,
    state: PhysicsState
): void => {
    const s3 = sourceIdx * 3;
    const dx = state.positions[s3] - px;
    const dy = state.positions[s3 + 1] - py;
    const dz = state.positions[s3 + 2] - pz;

    const distSq = dx * dx + dy * dy + dz * dz;
    const distWithSoftSq = distSq + SOFTENING_SQ;
    const distWithSoft = Math.sqrt(distWithSoftSq);
    const f_base = G * state.masses[sourceIdx] / (distWithSoftSq * distWithSoft);

    const t3 = targetIdx * 3;
    state.accelerations[t3] += dx * f_base;
    state.accelerations[t3 + 1] += dy * f_base;
    state.accelerations[t3 + 2] += dz * f_base;
};

const applyForceFromNode = (
    targetIdx: number,
    px: number, py: number, pz: number,
    mass: number, comX: number, comY: number, comZ: number,
    accelerations: Float64Array
): void => {
    const dx = comX - px;
    const dy = comY - py;
    const dz = comZ - pz;

    const distSq = dx * dx + dy * dy + dz * dz;
    const distWithSoftSq = distSq + SOFTENING_SQ;
    const distWithSoft = Math.sqrt(distWithSoftSq);
    const f_base = G * mass / (distWithSoftSq * distWithSoft);

    const t3 = targetIdx * 3;
    accelerations[t3] += dx * f_base;
    accelerations[t3 + 1] += dy * f_base;
    accelerations[t3 + 2] += dz * f_base;
};
