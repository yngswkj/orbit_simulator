import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePhysicsStore } from '../store/physicsStore';
import { useEffectsStore } from '../store/effectsStore';
import { buildSupernovaVisualProfile, findMostMassiveStar } from './supernova';

describe('supernova scenario and profile utilities', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        useEffectsStore.getState().cleanup();
        usePhysicsStore.getState().loadSolarSystem();
    });

    afterEach(() => {
        useEffectsStore.getState().cleanup();
        usePhysicsStore.getState().loadSolarSystem();
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('builds more elaborate visual profiles for higher quality levels', () => {
        const low = buildSupernovaVisualProfile(333000 * 20, 'low');
        const high = buildSupernovaVisualProfile(333000 * 20, 'high');

        expect(high.shellCount).toBeGreaterThan(low.shellCount);
        expect(high.rayCount).toBeGreaterThan(low.rayCount);
        expect(high.useJets).toBe(true);
    });

    it('auto-starts the supernova preset scenario and triggers only once', () => {
        const store = usePhysicsStore.getState();

        store.loadStarSystem('supernova');
        expect(usePhysicsStore.getState().supernovaScenario.phase).toBe('intro');

        vi.advanceTimersByTime(800);
        expect(usePhysicsStore.getState().supernovaScenario.phase).toBe('countdown');

        vi.advanceTimersByTime(3000);

        expect(usePhysicsStore.getState().supernovaScenario.phase).toBe('shock-breakout');
        expect(usePhysicsStore.getState().supernovaEvents).toHaveLength(1);
        expect(useEffectsStore.getState().supernovas).toHaveLength(1);

        vi.advanceTimersByTime(5000);
        expect(usePhysicsStore.getState().supernovaEvents).toHaveLength(1);
    });

    it('clears pending supernova timers when switching presets', () => {
        const store = usePhysicsStore.getState();

        store.loadStarSystem('supernova');
        vi.advanceTimersByTime(1200);
        store.loadSolarSystem();
        vi.advanceTimersByTime(30000);

        expect(usePhysicsStore.getState().supernovaScenario.active).toBe(false);
        expect(usePhysicsStore.getState().supernovaEvents).toHaveLength(0);
        expect(useEffectsStore.getState().supernovas).toHaveLength(0);
        expect(useEffectsStore.getState().explosions).toHaveLength(0);
        expect(useEffectsStore.getState().radialRays).toHaveLength(0);
        expect(useEffectsStore.getState().gammaRayBursts).toHaveLength(0);
    });

    it('resolves the supernova preset into a black hole remnant', () => {
        const store = usePhysicsStore.getState();

        store.loadStarSystem('supernova');
        store.clearSupernovaScenario();

        const starId = findMostMassiveStar(usePhysicsStore.getState().bodies);
        expect(starId).not.toBeNull();

        store.triggerSupernova(starId!);
        vi.advanceTimersByTime(15000);

        const remnant = usePhysicsStore.getState().bodies.find(body => body.id === starId);
        expect(remnant?.isCompactObject).toBe(true);
        expect(remnant?.hasJets).toBe(true);
        expect(remnant?.hasAccretionDisk).toBe(true);
        expect(usePhysicsStore.getState().supernovaEvents).toHaveLength(0);
    });
});
