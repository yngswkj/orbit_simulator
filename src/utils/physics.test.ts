import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { applyCollisions, BASE_DT, createPhysicsState, getSimulationStepDt } from './physics';

const createBody = (
    id: string,
    mass: number,
    radius: number,
    position: [number, number, number],
    velocity: [number, number, number]
) => ({
    id,
    name: id,
    mass,
    radius,
    position: new Vector3(...position),
    velocity: new Vector3(...velocity),
    color: '#ffffff'
});

describe('physics utilities', () => {
    it('calculates the simulation timestep consistently across distance modes', () => {
        expect(getSimulationStepDt(2, false)).toBeCloseTo(BASE_DT * 2);
        expect(getSimulationStepDt(2, true)).toBeCloseTo(BASE_DT * 16);
    });

    it('initializes accelerations when creating a physics state', () => {
        const bodies = [
            createBody('a', 10, 1, [-1, 0, 0], [0, 0, 0]),
            createBody('b', 20, 1, [1, 0, 0], [0, 0, 0])
        ];

        const state = createPhysicsState(bodies);
        const distSq = 4 + 0.25;
        const dist = Math.sqrt(distSq);
        const fBase = 1 / (distSq * dist);
        const expectedAx0 = 2 * fBase * 20;
        const expectedAx1 = -2 * fBase * 10;

        expect(state.accelerations[0]).toBeCloseTo(expectedAx0);
        expect(state.accelerations[1]).toBeCloseTo(0);
        expect(state.accelerations[2]).toBeCloseTo(0);
        expect(state.accelerations[3]).toBeCloseTo(expectedAx1);
        expect(state.accelerations[4]).toBeCloseTo(0);
        expect(state.accelerations[5]).toBeCloseTo(0);
    });

    it('merges collisions while preserving total mass and momentum', () => {
        const bodies = [
            createBody('a', 2, 1, [0, 0, 0], [1, 0, 0]),
            createBody('b', 3, 2, [1, 0, 0], [-1, 0, 0])
        ];

        const result = applyCollisions(bodies, [[0, 1]]);

        expect(result.hasRemovals).toBe(true);
        expect(result.bodies).toHaveLength(1);
        expect(result.collisionEvents).toHaveLength(1);
        expect(result.bodies[0].mass).toBeCloseTo(5);
        expect(result.bodies[0].velocity.x).toBeCloseTo(-0.2);
        expect(result.bodies[0].radius).toBeCloseTo(Math.cbrt(9));
    });
});
