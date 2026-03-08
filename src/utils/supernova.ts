import type { CelestialBody, SupernovaEvent } from '../types/physics';
import { getPerformanceConfig } from '../constants/performance';
import type { QualityLevel } from './deviceDetection';

export type SupernovaScenarioPhase =
    | 'idle'
    | 'intro'
    | 'countdown'
    | 'shock-breakout'
    | 'ejecta'
    | 'remnant'
    | 'complete';

export interface SupernovaVisualProfile {
    coreRadiusScale: number;
    haloRadiusScale: number;
    shellCount: number;
    rayCount: number;
    raySpread: number;
    rayPulseSpeed: number;
    debrisBudget: number;
    useSecondaryGlow: boolean;
    useJets: boolean;
    gammaRayWidthScale: number;
    gammaRayCoreIntensity: number;
}

export const SUPERNOVA_SCENARIO_TIMINGS = {
    introMs: 800,
    countdownMs: 3000,
    shockBreakoutMs: 1200,
    ejectaMs: 15000,
    remnantHoldMs: 2500
} as const;

export const getSupernovaRemnantType = (
    starMass: number
): SupernovaEvent['remnantType'] => {
    if (starMass > 200000) {
        return 'black-hole';
    }

    if (starMass > 100000) {
        return 'neutron-star';
    }

    return 'none';
};

export const findMostMassiveStar = (
    bodies: Array<Pick<CelestialBody, 'id' | 'isStar' | 'mass'>>
): string | null => {
    let current: Pick<CelestialBody, 'id' | 'isStar' | 'mass'> | null = null;

    for (const body of bodies) {
        if (!body.isStar) {
            continue;
        }

        if (!current || body.mass > current.mass) {
            current = body;
        }
    }

    return current?.id ?? null;
};

export const buildSupernovaVisualProfile = (
    starMass: number,
    quality: QualityLevel
): SupernovaVisualProfile => {
    const perf = getPerformanceConfig(quality);
    const intensityScale = Math.max(0.85, Math.min(1.45, Math.pow(starMass / 100000, 0.12)));
    const remnantType = getSupernovaRemnantType(starMass);

    return {
        coreRadiusScale: 1.2 * intensityScale,
        haloRadiusScale: 2.6 * intensityScale,
        shellCount: perf.supernovaShellLayers,
        rayCount: perf.supernovaRayCount,
        raySpread: perf.supernovaUseSecondaryGlow ? 0.65 : 0.45,
        rayPulseSpeed: perf.supernovaUseSecondaryGlow ? 6.5 : 4.5,
        debrisBudget: perf.supernovaDebrisBudget,
        useSecondaryGlow: perf.supernovaUseSecondaryGlow,
        useJets: perf.supernovaUseJets && remnantType === 'black-hole',
        gammaRayWidthScale: remnantType === 'black-hole' ? 0.18 : 0.1,
        gammaRayCoreIntensity: remnantType === 'black-hole' ? 1.4 : 0.9
    };
};
