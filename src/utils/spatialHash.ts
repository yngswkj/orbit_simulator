/**
 * spatialHash.ts
 * Spatial hash grid for efficient collision detection
 * Reduces collision checking from O(N²) to O(N) expected time
 */

import type { PhysicsState } from '../types/physics';

interface GridCell {
    bodies: number[]; // Body indices
}

/**
 * Spatial hash grid for broad-phase collision detection
 */
export class SpatialHashGrid {
    private cellSize: number;
    private grid: Map<string, GridCell>;

    constructor(cellSize: number) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    /**
     * Clear the grid
     */
    clear(): void {
        this.grid.clear();
    }

    /**
     * Insert all bodies into the spatial hash grid
     */
    build(state: PhysicsState): void {
        this.clear();

        const { count, positions, radii } = state;

        for (let i = 0; i < count; i++) {
            const x = positions[i * 3];
            const y = positions[i * 3 + 1];
            const z = positions[i * 3 + 2];
            const r = radii[i];

            // Insert into all cells that the body's bounding box overlaps
            const minX = x - r;
            const maxX = x + r;
            const minY = y - r;
            const maxY = y + r;
            const minZ = z - r;
            const maxZ = z + r;

            const minCellX = Math.floor(minX / this.cellSize);
            const maxCellX = Math.floor(maxX / this.cellSize);
            const minCellY = Math.floor(minY / this.cellSize);
            const maxCellY = Math.floor(maxY / this.cellSize);
            const minCellZ = Math.floor(minZ / this.cellSize);
            const maxCellZ = Math.floor(maxZ / this.cellSize);

            for (let cx = minCellX; cx <= maxCellX; cx++) {
                for (let cy = minCellY; cy <= maxCellY; cy++) {
                    for (let cz = minCellZ; cz <= maxCellZ; cz++) {
                        const key = `${cx},${cy},${cz}`;
                        let cell = this.grid.get(key);

                        if (!cell) {
                            cell = { bodies: [] };
                            this.grid.set(key, cell);
                        }

                        cell.bodies.push(i);
                    }
                }
            }
        }
    }

    /**
     * Get all potential collision pairs using the spatial hash
     * Returns array of [indexA, indexB] pairs
     */
    getPotentialCollisionPairs(): [number, number][] {
        const pairs: [number, number][] = [];
        const checked = new Set<string>();

        // Iterate through all cells
        for (const cell of this.grid.values()) {
            const bodies = cell.bodies;

            // Check all pairs within this cell
            for (let i = 0; i < bodies.length; i++) {
                for (let j = i + 1; j < bodies.length; j++) {
                    const idxA = bodies[i];
                    const idxB = bodies[j];

                    // Create a unique pair key (smaller index first)
                    const pairKey = idxA < idxB ? `${idxA},${idxB}` : `${idxB},${idxA}`;

                    // Skip if already checked
                    if (checked.has(pairKey)) continue;
                    checked.add(pairKey);

                    pairs.push([idxA, idxB]);
                }
            }
        }

        return pairs;
    }

    /**
     * Find collision pairs with actual distance check
     */
    findCollisions(state: PhysicsState, threshold: number = 0.8): [number, number][] {
        const potentialPairs = this.getPotentialCollisionPairs();
        const collisions: [number, number][] = [];

        const { positions, radii, masses } = state;

        for (const [i, j] of potentialPairs) {
            // Skip invalid bodies
            if (masses[i] <= 0 || masses[j] <= 0) continue;

            const i3 = i * 3;
            const j3 = j * 3;

            const dx = positions[i3] - positions[j3];
            const dy = positions[i3 + 1] - positions[j3 + 1];
            const dz = positions[i3 + 2] - positions[j3 + 2];

            const distSq = dx * dx + dy * dy + dz * dz;
            const radSum = radii[i] + radii[j];

            if (distSq < (radSum * threshold) ** 2) {
                collisions.push([i, j]);
            }
        }

        return collisions;
    }

    /**
     * Get statistics about the spatial hash grid
     */
    getStats(): { cellCount: number; avgBodiesPerCell: number; maxBodiesPerCell: number } {
        const cellCount = this.grid.size;
        let totalBodies = 0;
        let maxBodies = 0;

        for (const cell of this.grid.values()) {
            totalBodies += cell.bodies.length;
            maxBodies = Math.max(maxBodies, cell.bodies.length);
        }

        return {
            cellCount,
            avgBodiesPerCell: cellCount > 0 ? totalBodies / cellCount : 0,
            maxBodiesPerCell: maxBodies
        };
    }
}

/**
 * Helper function to determine optimal cell size based on average body radius
 */
export function calculateOptimalCellSize(state: PhysicsState): number {
    const { count, radii } = state;

    if (count === 0) return 10; // Default fallback

    // Calculate average radius
    let sumRadius = 0;
    for (let i = 0; i < count; i++) {
        sumRadius += radii[i];
    }
    const avgRadius = sumRadius / count;

    // Cell size should be ~2-4x the average radius for optimal performance
    // Larger = fewer cells but more bodies per cell
    // Smaller = more cells but fewer bodies per cell
    return avgRadius * 3;
}
