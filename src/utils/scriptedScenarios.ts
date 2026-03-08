import type { ScriptedScenarioConfig, SupernovaScenarioConfig, TidalDisruptionScenarioConfig } from '../types/starSystem'

export type ScriptedScenarioKind = 'supernova' | 'tidal-disruption'

export type ScriptedScenarioMetricKind = 'countdown' | 'distance-ratio' | null

export type SupernovaScenarioPhase =
    | 'idle'
    | 'intro'
    | 'countdown'
    | 'shock-breakout'
    | 'ejecta'
    | 'remnant'
    | 'complete'

export type TidalDisruptionScenarioPhase =
    | 'idle'
    | 'intro'
    | 'approach'
    | 'breach'
    | 'debris-capture'
    | 'aftermath'
    | 'complete'

export type ScriptedScenarioPhase =
    | SupernovaScenarioPhase
    | TidalDisruptionScenarioPhase

export interface ScriptedScenarioSnapshot {
    active: boolean
    kind: ScriptedScenarioKind | null
    phase: ScriptedScenarioPhase
    startedAt: number | null
    phaseStartedAt: number | null
    autoStarted: boolean
    primaryBodyId: string | null
    targetBodyId: string | null
    focusBodyId: string | null
    outcomeBodyId: string | null
    countdownRemainingMs: number
    metricValue: number | null
    metricKind: ScriptedScenarioMetricKind
}

export interface ScenarioBodyLike {
    id: string
    name: string
    mass: number
    radius: number
    isStar?: boolean
    isCompactObject?: boolean
    type?: string
    position: {
        x: number
        y: number
        z: number
    }
}

export interface ScriptedScenarioActors {
    primaryBodyId: string | null
    targetBodyId: string | null
    focusBodyId: string | null
}

export type ScriptedScenarioEffect =
    | 'trigger-supernova'
    | 'trigger-tidal-disruption'
    | 'finalize-tidal-disruption'

export interface ScriptedScenarioEvaluation {
    nextPhase?: ScriptedScenarioPhase
    updates?: Partial<ScriptedScenarioSnapshot>
    effects: ScriptedScenarioEffect[]
}

export const SUPERNOVA_SCENARIO_TIMINGS = {
    introMs: 800,
    countdownMs: 3000,
    shockBreakoutMs: 1200,
    ejectaMs: 15000,
    remnantHoldMs: 2500
} as const

export const TIDAL_DISRUPTION_SCENARIO_TIMINGS = {
    breachHoldMs: 1800,
    aftermathHoldMs: 3800
} as const

const TIDAL_STRETCH_START_RATIO = 1.65
const TIDAL_STRETCH_FULL_RATIO = 1.0
const TIDAL_LATE_APPROACH_RATIO = 1.4
const TIDAL_CAPTURE_STRETCH_HOLD_FRACTION = 0.5
export const TIDAL_APPROACH_WIDE_RATIO = 1.45

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

export const isLateTidalApproach = (ratio: number | null) => {
    return ratio !== null && ratio <= TIDAL_LATE_APPROACH_RATIO
}

export const getTidalStretchAmount = (
    phase: ScriptedScenarioPhase,
    ratio: number | null,
    phaseElapsedMs: number,
    disruptionDurationMs: number
) => {
    if (phase === 'approach') {
        if (ratio === null) {
            return 0
        }

        return clamp01((TIDAL_STRETCH_START_RATIO - ratio) / (TIDAL_STRETCH_START_RATIO - TIDAL_STRETCH_FULL_RATIO))
    }

    if (phase === 'breach') {
        return 1
    }

    if (phase === 'debris-capture') {
        if (disruptionDurationMs <= 0) {
            return 0
        }

        const progress = clamp01(phaseElapsedMs / disruptionDurationMs)

        if (progress <= TIDAL_CAPTURE_STRETCH_HOLD_FRACTION) {
            return 1
        }

        const decayProgress = (progress - TIDAL_CAPTURE_STRETCH_HOLD_FRACTION) / (1 - TIDAL_CAPTURE_STRETCH_HOLD_FRACTION)
        return clamp01(1 - Math.pow(decayProgress, 1.15))
    }

    return 0
}

export const createEmptyScriptedScenario = (): ScriptedScenarioSnapshot => ({
    active: false,
    kind: null,
    phase: 'idle',
    startedAt: null,
    phaseStartedAt: null,
    autoStarted: false,
    primaryBodyId: null,
    targetBodyId: null,
    focusBodyId: null,
    outcomeBodyId: null,
    countdownRemainingMs: 0,
    metricValue: null,
    metricKind: null
})

const getBodyById = (bodies: ScenarioBodyLike[], id: string | null) => {
    if (!id) {
        return null
    }

    return bodies.find(body => body.id === id) ?? null
}

const findMostMassiveStarId = (bodies: ScenarioBodyLike[]) => {
    let current: ScenarioBodyLike | null = null

    for (const body of bodies) {
        if (!body.isStar) {
            continue
        }

        if (!current || body.mass > current.mass) {
            current = body
        }
    }

    return current?.id ?? null
}

export const resolveScriptedScenarioActors = (
    config: ScriptedScenarioConfig,
    bodies: ScenarioBodyLike[]
): ScriptedScenarioActors => {
    if (config.kind === 'supernova') {
        const starId = findMostMassiveStarId(bodies)

        return {
            primaryBodyId: starId,
            targetBodyId: starId,
            focusBodyId: starId
        }
    }

    const primary = bodies.find(body => body.name === config.primaryBodyName) ?? null
    const target = bodies.find(body => body.name === config.targetBodyName) ?? null

    return {
        primaryBodyId: primary?.id ?? null,
        targetBodyId: target?.id ?? null,
        focusBodyId: target?.id ?? primary?.id ?? null
    }
}

const getDistanceBetweenBodies = (
    bodies: ScenarioBodyLike[],
    primaryBodyId: string | null,
    targetBodyId: string | null
) => {
    const primary = getBodyById(bodies, primaryBodyId)
    const target = getBodyById(bodies, targetBodyId)

    if (!primary || !target) {
        return null
    }

    const dx = primary.position.x - target.position.x
    const dy = primary.position.y - target.position.y
    const dz = primary.position.z - target.position.z

    return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export const getTidalDisruptionRatio = (
    bodies: ScenarioBodyLike[],
    primaryBodyId: string | null,
    targetBodyId: string | null,
    breachDistance: number
) => {
    const distance = getDistanceBetweenBodies(bodies, primaryBodyId, targetBodyId)

    if (distance === null || breachDistance <= 0) {
        return null
    }

    return distance / breachDistance
}

const getPhaseElapsedMs = (scenario: ScriptedScenarioSnapshot, now: number) => {
    const startedAt = scenario.phaseStartedAt ?? scenario.startedAt

    if (startedAt === null) {
        return 0
    }

    return Math.max(0, now - startedAt)
}

const roundDistanceRatio = (ratio: number | null) => {
    if (ratio === null) {
        return null
    }

    return Number(ratio.toFixed(2))
}

const evaluateSupernovaFrame = (
    scenario: ScriptedScenarioSnapshot,
    config: SupernovaScenarioConfig,
    now: number
): ScriptedScenarioEvaluation => {
    const phaseElapsedMs = getPhaseElapsedMs(scenario, now)

    switch (scenario.phase) {
        case 'intro':
            if (phaseElapsedMs >= config.autoStartDelayMs) {
                return {
                    nextPhase: 'countdown',
                    updates: {
                        countdownRemainingMs: config.countdownMs,
                        metricKind: 'countdown',
                        metricValue: config.countdownMs
                    },
                    effects: []
                }
            }
            return { effects: [] }
        case 'countdown': {
            const remainingMs = Math.max(0, config.countdownMs - phaseElapsedMs)
            const roundedRemainingMs = Math.ceil(remainingMs / 100) * 100
            const updates = roundedRemainingMs !== scenario.countdownRemainingMs
                ? {
                    countdownRemainingMs: roundedRemainingMs,
                    metricKind: 'countdown' as const,
                    metricValue: roundedRemainingMs
                }
                : undefined

            if (remainingMs <= 0) {
                return {
                    nextPhase: 'shock-breakout',
                    updates: {
                        countdownRemainingMs: 0,
                        metricKind: null,
                        metricValue: null
                    },
                    effects: ['trigger-supernova']
                }
            }

            return {
                updates,
                effects: []
            }
        }
        case 'shock-breakout':
            if (phaseElapsedMs >= SUPERNOVA_SCENARIO_TIMINGS.shockBreakoutMs) {
                return {
                    nextPhase: 'ejecta',
                    effects: []
                }
            }
            return { effects: [] }
        case 'ejecta':
            if (phaseElapsedMs >= SUPERNOVA_SCENARIO_TIMINGS.ejectaMs) {
                return {
                    nextPhase: 'remnant',
                    effects: []
                }
            }
            return { effects: [] }
        case 'remnant':
            if (phaseElapsedMs >= SUPERNOVA_SCENARIO_TIMINGS.remnantHoldMs) {
                return {
                    nextPhase: 'complete',
                    effects: []
                }
            }
            return { effects: [] }
        default:
            return { effects: [] }
    }
}

const evaluateTidalDisruptionFrame = (
    scenario: ScriptedScenarioSnapshot,
    config: TidalDisruptionScenarioConfig,
    bodies: ScenarioBodyLike[],
    now: number
): ScriptedScenarioEvaluation => {
    const phaseElapsedMs = getPhaseElapsedMs(scenario, now)

    switch (scenario.phase) {
        case 'intro':
            if (phaseElapsedMs >= config.autoStartDelayMs) {
                const ratio = roundDistanceRatio(
                    getTidalDisruptionRatio(
                        bodies,
                        scenario.primaryBodyId,
                        scenario.targetBodyId,
                        config.breachDistance
                    )
                )

                return {
                    nextPhase: 'approach',
                    updates: {
                        metricKind: 'distance-ratio',
                        metricValue: ratio
                    },
                    effects: []
                }
            }
            return { effects: [] }
        case 'approach': {
            const ratio = roundDistanceRatio(
                getTidalDisruptionRatio(
                    bodies,
                    scenario.primaryBodyId,
                    scenario.targetBodyId,
                    config.breachDistance
                )
            )

            const updates = ratio !== scenario.metricValue || scenario.metricKind !== 'distance-ratio'
                ? {
                    metricKind: 'distance-ratio' as const,
                    metricValue: ratio
                }
                : undefined

            if ((ratio !== null && ratio <= 1) || phaseElapsedMs >= config.breachFallbackMs) {
                return {
                    nextPhase: 'breach',
                    updates,
                    effects: ['trigger-tidal-disruption']
                }
            }

            return {
                updates,
                effects: []
            }
        }
        case 'breach':
            if (phaseElapsedMs >= TIDAL_DISRUPTION_SCENARIO_TIMINGS.breachHoldMs) {
                return {
                    nextPhase: 'debris-capture',
                    updates: {
                        metricKind: null,
                        metricValue: null
                    },
                    effects: []
                }
            }
            return { effects: [] }
        case 'debris-capture':
            if (phaseElapsedMs >= config.disruptionDurationMs) {
                return {
                    nextPhase: 'aftermath',
                    effects: ['finalize-tidal-disruption']
                }
            }
            return { effects: [] }
        case 'aftermath':
            if (phaseElapsedMs >= TIDAL_DISRUPTION_SCENARIO_TIMINGS.aftermathHoldMs) {
                return {
                    nextPhase: 'complete',
                    effects: []
                }
            }
            return { effects: [] }
        default:
            return { effects: [] }
    }
}

export const evaluateScriptedScenarioFrame = (
    scenario: ScriptedScenarioSnapshot,
    config: ScriptedScenarioConfig | null | undefined,
    bodies: ScenarioBodyLike[],
    now: number
): ScriptedScenarioEvaluation => {
    if (!scenario.active || !scenario.kind || !config) {
        return { effects: [] }
    }

    if (scenario.kind === 'supernova' && config.kind === 'supernova') {
        return evaluateSupernovaFrame(scenario, config, now)
    }

    if (scenario.kind === 'tidal-disruption' && config.kind === 'tidal-disruption') {
        return evaluateTidalDisruptionFrame(scenario, config, bodies, now)
    }

    return { effects: [] }
}
