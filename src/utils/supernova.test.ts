import { Vector3 } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePhysicsStore } from '../store/physicsStore'
import { useEffectsStore } from '../store/effectsStore'
import { getPresetById } from './starSystems'
import {
    TIDAL_DISRUPTION_SCENARIO_TIMINGS,
    evaluateScriptedScenarioFrame
} from './scriptedScenarios'
import { buildSupernovaVisualProfile, findMostMassiveStar } from './supernova'

const applyScenarioEvaluation = () => {
    const store = usePhysicsStore.getState()
    const scenario = store.scriptedScenario
    const preset = scenario.active && usePhysicsStore.getState().currentSystemId
        ? getPresetById(usePhysicsStore.getState().currentSystemId!)
        : null
    const config = preset?.scenario

    if (!config) {
        return
    }

    const evaluation = evaluateScriptedScenarioFrame(
        scenario,
        config,
        usePhysicsStore.getState().bodies,
        performance.now()
    )

    if (evaluation.nextPhase === 'complete') {
        store.completeScriptedScenario(store.scriptedScenario.outcomeBodyId, {
            ...evaluation.updates,
            focusBodyId: store.scriptedScenario.outcomeBodyId
        })
    } else if (evaluation.nextPhase) {
        store.advanceScriptedScenario(evaluation.nextPhase, evaluation.updates)
    } else if (evaluation.updates) {
        store.advanceScriptedScenario(store.scriptedScenario.phase, evaluation.updates)
    }

    for (const effect of evaluation.effects) {
        switch (effect) {
            case 'trigger-supernova':
                if (store.scriptedScenario.primaryBodyId) {
                    store.triggerSupernova(store.scriptedScenario.primaryBodyId)
                }
                break
            case 'trigger-tidal-disruption':
                if (
                    store.scriptedScenario.primaryBodyId &&
                    store.scriptedScenario.targetBodyId &&
                    config.kind === 'tidal-disruption'
                ) {
                    store.triggerScriptedTidalDisruption(
                        store.scriptedScenario.primaryBodyId,
                        store.scriptedScenario.targetBodyId,
                        config.disruptionDurationMs
                    )
                }
                break
            case 'finalize-tidal-disruption':
                if (store.scriptedScenario.primaryBodyId && store.scriptedScenario.targetBodyId) {
                    store.finalizeScriptedTidalDisruption(
                        store.scriptedScenario.primaryBodyId,
                        store.scriptedScenario.targetBodyId
                    )
                }
                break
            default:
                break
        }
    }
}

describe('supernova scenario and profile utilities', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        useEffectsStore.getState().cleanup()
        usePhysicsStore.getState().loadSolarSystem()
    })

    afterEach(() => {
        useEffectsStore.getState().cleanup()
        usePhysicsStore.getState().loadSolarSystem()
        vi.runOnlyPendingTimers()
        vi.useRealTimers()
    })

    it('builds more elaborate visual profiles for higher quality levels', () => {
        const low = buildSupernovaVisualProfile(333000 * 20, 'low')
        const high = buildSupernovaVisualProfile(333000 * 20, 'high')

        expect(high.shellCount).toBeGreaterThan(low.shellCount)
        expect(high.rayCount).toBeGreaterThan(low.rayCount)
        expect(high.useJets).toBe(true)
    })

    it('auto-starts the supernova preset scenario and triggers only once', () => {
        const store = usePhysicsStore.getState()

        store.loadStarSystem('supernova')
        expect(usePhysicsStore.getState().scriptedScenario.phase).toBe('intro')
        expect(usePhysicsStore.getState().scriptedScenario.kind).toBe('supernova')

        vi.advanceTimersByTime(800)
        applyScenarioEvaluation()
        expect(usePhysicsStore.getState().scriptedScenario.phase).toBe('countdown')

        vi.advanceTimersByTime(3000)
        applyScenarioEvaluation()

        expect(usePhysicsStore.getState().scriptedScenario.phase).toBe('shock-breakout')
        expect(usePhysicsStore.getState().supernovaEvents).toHaveLength(1)
        expect(useEffectsStore.getState().supernovas).toHaveLength(1)

        vi.advanceTimersByTime(5000)
        expect(usePhysicsStore.getState().supernovaEvents).toHaveLength(1)
    })

    it('clears scripted scenario state and active effects when switching presets', () => {
        const store = usePhysicsStore.getState()
        const preset = getPresetById('tidal-disruption')

        if (!preset?.scenario || preset.scenario.kind !== 'tidal-disruption') {
            throw new Error('tidal-disruption preset missing scenario config')
        }

        store.loadStarSystem('tidal-disruption')
        vi.advanceTimersByTime(preset.scenario.autoStartDelayMs)
        applyScenarioEvaluation()

        const scenario = usePhysicsStore.getState().scriptedScenario
        const primary = usePhysicsStore.getState().bodies.find(body => body.id === scenario.primaryBodyId)
        expect(primary).toBeTruthy()

        const forcedPosition = new Vector3(20, 0, 0)
        store.updateBody(scenario.targetBodyId!, { position: forcedPosition })
        applyScenarioEvaluation()

        expect(usePhysicsStore.getState().tidallyDisruptedEvents).toHaveLength(1)
        expect(useEffectsStore.getState().explosions.length).toBeGreaterThan(0)
        expect(useEffectsStore.getState().cameraShakes.length).toBeGreaterThan(0)
        expect(useEffectsStore.getState().shockwaves.length).toBeGreaterThan(0)
        expect(useEffectsStore.getState().heatGlows.length).toBeGreaterThan(0)

        store.loadSolarSystem()
        vi.advanceTimersByTime(30000)

        expect(usePhysicsStore.getState().scriptedScenario.active).toBe(false)
        expect(usePhysicsStore.getState().tidallyDisruptedEvents).toHaveLength(0)
        expect(usePhysicsStore.getState().supernovaEvents).toHaveLength(0)
        expect(useEffectsStore.getState().explosions).toHaveLength(0)
        expect(useEffectsStore.getState().cameraShakes).toHaveLength(0)
        expect(useEffectsStore.getState().shockwaves).toHaveLength(0)
        expect(useEffectsStore.getState().heatGlows).toHaveLength(0)
        expect(useEffectsStore.getState().debrisClouds).toHaveLength(0)
        expect(useEffectsStore.getState().supernovas).toHaveLength(0)
    })

    it('resolves the supernova preset into a black hole remnant', () => {
        const store = usePhysicsStore.getState()

        store.loadStarSystem('supernova')
        store.clearScriptedScenario()

        const starId = findMostMassiveStar(usePhysicsStore.getState().bodies)
        expect(starId).not.toBeNull()

        store.triggerSupernova(starId!)
        vi.advanceTimersByTime(15000)

        const remnant = usePhysicsStore.getState().bodies.find(body => body.id === starId)
        expect(remnant?.isCompactObject).toBe(true)
        expect(remnant?.hasJets).toBe(true)
        expect(remnant?.hasAccretionDisk).toBe(true)
        expect(usePhysicsStore.getState().supernovaEvents).toHaveLength(0)
    })

    it('breaches the tidal threshold once and completes with the black hole as outcome', () => {
        const store = usePhysicsStore.getState()
        const preset = getPresetById('tidal-disruption')

        expect(preset?.scenario?.kind).toBe('tidal-disruption')
        if (!preset?.scenario || preset.scenario.kind !== 'tidal-disruption') {
            throw new Error('tidal-disruption preset missing scenario config')
        }

        store.loadStarSystem('tidal-disruption')
        expect(usePhysicsStore.getState().scriptedScenario.phase).toBe('intro')

        vi.advanceTimersByTime(preset.scenario.autoStartDelayMs)
        applyScenarioEvaluation()

        expect(usePhysicsStore.getState().scriptedScenario.phase).toBe('approach')
        expect(usePhysicsStore.getState().scriptedScenario.metricKind).toBe('distance-ratio')
        expect(usePhysicsStore.getState().scriptedScenario.metricValue).not.toBeNull()

        const scenario = usePhysicsStore.getState().scriptedScenario
        const primary = usePhysicsStore.getState().bodies.find(body => body.id === scenario.primaryBodyId)
        expect(primary).toBeTruthy()

        store.updateBody(
            scenario.targetBodyId!,
            {
                position: new Vector3(primary!.position.x + 20, primary!.position.y, primary!.position.z)
            }
        )

        applyScenarioEvaluation()
        expect(usePhysicsStore.getState().scriptedScenario.phase).toBe('breach')
        expect(usePhysicsStore.getState().tidallyDisruptedEvents).toHaveLength(1)

        applyScenarioEvaluation()
        expect(usePhysicsStore.getState().tidallyDisruptedEvents).toHaveLength(1)

        vi.advanceTimersByTime(TIDAL_DISRUPTION_SCENARIO_TIMINGS.breachHoldMs)
        applyScenarioEvaluation()
        expect(usePhysicsStore.getState().scriptedScenario.phase).toBe('debris-capture')

        vi.advanceTimersByTime(preset.scenario.disruptionDurationMs)
        applyScenarioEvaluation()

        expect(usePhysicsStore.getState().scriptedScenario.phase).toBe('aftermath')
        expect(usePhysicsStore.getState().scriptedScenario.outcomeBodyId).toBe(scenario.primaryBodyId)
        expect(usePhysicsStore.getState().bodies.some(body => body.id === scenario.targetBodyId)).toBe(false)

        vi.advanceTimersByTime(TIDAL_DISRUPTION_SCENARIO_TIMINGS.aftermathHoldMs)
        applyScenarioEvaluation()

        expect(usePhysicsStore.getState().scriptedScenario.phase).toBe('complete')
        expect(usePhysicsStore.getState().scriptedScenario.outcomeBodyId).toBe(scenario.primaryBodyId)
    })
})
