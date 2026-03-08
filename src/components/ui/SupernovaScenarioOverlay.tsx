import React, { useMemo } from 'react'
import { usePhysicsStore } from '../../store/physicsStore'
import { useTranslation } from '../../utils/i18n'
import { isLateTidalApproach } from '../../utils/scriptedScenarios'

const getPhaseTextKey = (kind: string | null, phase: string, ratio: number | null) => {
    if (kind === 'tidal-disruption') {
        switch (phase) {
            case 'intro':
                return 'scenario_tidal_phase_intro'
            case 'approach':
                return isLateTidalApproach(ratio)
                    ? 'scenario_tidal_phase_spaghettification'
                    : 'scenario_tidal_phase_approach'
            case 'breach':
                return 'scenario_tidal_phase_breach'
            case 'debris-capture':
                return 'scenario_tidal_phase_capture'
            case 'aftermath':
                return 'scenario_tidal_phase_aftermath'
            case 'complete':
                return 'scenario_tidal_phase_complete'
            default:
                return 'scenario_tidal_phase_intro'
        }
    }

    switch (phase) {
        case 'intro':
            return 'scenario_supernova_phase_intro'
        case 'countdown':
            return 'scenario_supernova_phase_countdown'
        case 'shock-breakout':
            return 'scenario_supernova_phase_breakout'
        case 'ejecta':
            return 'scenario_supernova_phase_ejecta'
        case 'remnant':
            return 'scenario_supernova_phase_remnant'
        case 'complete':
            return 'scenario_supernova_phase_complete'
        default:
            return 'scenario_supernova_phase_intro'
    }
}

const getCompletionTextKey = (kind: string | null, outcomeBody?: { type?: string; isCompactObject?: boolean } | null) => {
    if (kind === 'tidal-disruption') {
        return outcomeBody ? 'scenario_tidal_outcome_captured' : 'scenario_tidal_outcome_none'
    }

    if (!outcomeBody) {
        return 'scenario_supernova_outcome_none'
    }

    if (outcomeBody.type === 'black_hole') {
        return 'scenario_supernova_outcome_black_hole'
    }

    if (outcomeBody.isCompactObject) {
        return 'scenario_supernova_outcome_neutron_star'
    }

    return 'scenario_supernova_outcome_none'
}

export const SupernovaScenarioOverlay: React.FC = () => {
    const scenario = usePhysicsStore(state => state.scriptedScenario)
    const bodies = usePhysicsStore(state => state.bodies)
    const currentSystemId = usePhysicsStore(state => state.currentSystemId)
    const currentSystemMode = usePhysicsStore(state => state.currentSystemMode)
    const loadStarSystem = usePhysicsStore(state => state.loadStarSystem)
    const selectBody = usePhysicsStore(state => state.selectBody)
    const setFollowingBody = usePhysicsStore(state => state.setFollowingBody)
    const setCameraMode = usePhysicsStore(state => state.setCameraMode)
    const clearScriptedScenario = usePhysicsStore(state => state.clearScriptedScenario)
    const { t } = useTranslation()

    const countdown = useMemo(() => {
        if (scenario.metricKind !== 'countdown' || scenario.phase !== 'countdown') {
            return null
        }

        return Math.max(1, Math.ceil(scenario.countdownRemainingMs / 1000))
    }, [scenario.countdownRemainingMs, scenario.metricKind, scenario.phase])

    const distanceRatio = useMemo(() => {
        if (scenario.metricKind !== 'distance-ratio' || scenario.metricValue === null) {
            return null
        }

        return scenario.metricValue.toFixed(2)
    }, [scenario.metricKind, scenario.metricValue])

    const outcomeBody = scenario.outcomeBodyId
        ? bodies.find(body => body.id === scenario.outcomeBodyId) ?? null
        : null

    if (!scenario.active) {
        return null
    }

    const canInspectOutcome = scenario.phase === 'complete' && !!outcomeBody

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingTop: '32px'
        }}>
            <div style={{
                minWidth: '280px',
                maxWidth: 'min(520px, calc(100vw - 48px))',
                padding: '18px 22px',
                borderRadius: '18px',
                background: 'linear-gradient(180deg, rgba(5, 10, 20, 0.82), rgba(10, 18, 34, 0.68))',
                border: '1px solid rgba(186, 211, 255, 0.22)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(122, 165, 255, 0.08)',
                backdropFilter: 'blur(14px)',
                color: 'white',
                textAlign: 'center',
                pointerEvents: 'auto'
            }}>
                <div style={{
                    fontSize: '0.72rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#9fb9ff',
                    marginBottom: '8px'
                }}>
                    {t('scenario_overlay_kicker')}
                </div>

                <div style={{
                    fontSize: '1.35rem',
                    fontWeight: 600,
                    letterSpacing: '-0.02em'
                }}>
                    {t(getPhaseTextKey(scenario.kind, scenario.phase, scenario.metricValue))}
                </div>

                {countdown !== null && (
                    <div style={{
                        marginTop: '12px',
                        fontSize: '3rem',
                        fontWeight: 700,
                        lineHeight: 1,
                        color: '#f8fbff',
                        textShadow: '0 0 18px rgba(186, 221, 255, 0.45)'
                    }}>
                        T-{countdown}
                    </div>
                )}

                {distanceRatio !== null && (
                    <div style={{
                        marginTop: '14px',
                        display: 'grid',
                        gap: '4px'
                    }}>
                        <div style={{
                            fontSize: '0.78rem',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#9fb9ff'
                        }}>
                            {t('scenario_metric_distance_ratio')}
                        </div>
                        <div style={{
                            fontSize: '2.4rem',
                            fontWeight: 700,
                            lineHeight: 1,
                            color: '#f8fbff',
                            textShadow: '0 0 18px rgba(186, 221, 255, 0.25)'
                        }}>
                            {distanceRatio}x
                        </div>
                    </div>
                )}

                {scenario.phase === 'complete' && (
                    <div style={{
                        marginTop: '12px',
                        fontSize: '0.95rem',
                        color: '#d7e0f7'
                    }}>
                        {t(getCompletionTextKey(scenario.kind, outcomeBody))}
                    </div>
                )}

                {scenario.phase === 'complete' && (
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        marginTop: '18px'
                    }}>
                        <button
                            onClick={() => {
                                if (!currentSystemId) {
                                    return
                                }

                                loadStarSystem(currentSystemId, currentSystemMode ?? undefined)
                            }}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '999px',
                                border: '1px solid rgba(173, 196, 255, 0.35)',
                                background: 'rgba(104, 138, 255, 0.18)',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            {t('scenario_action_replay')}
                        </button>

                        {canInspectOutcome && (
                            <button
                                onClick={() => {
                                    if (!outcomeBody) {
                                        return
                                    }

                                    selectBody(outcomeBody.id)
                                    setFollowingBody(outcomeBody.id)
                                    setCameraMode('sun_lock')
                                    clearScriptedScenario()
                                }}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '999px',
                                    border: '1px solid rgba(255, 255, 255, 0.18)',
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                {t('scenario_action_inspect')}
                            </button>
                        )}

                        <button
                            onClick={() => {
                                setFollowingBody(null)
                                setCameraMode('free')
                                clearScriptedScenario()
                            }}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '999px',
                                border: '1px solid rgba(255, 255, 255, 0.14)',
                                background: 'transparent',
                                color: '#dce7ff',
                                cursor: 'pointer'
                            }}
                        >
                            {t('scenario_action_free_camera')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
