import React, { useMemo } from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { useTranslation } from '../../utils/i18n';

const getPhaseTextKey = (phase: string) => {
    switch (phase) {
        case 'intro':
            return 'supernova_phase_intro';
        case 'countdown':
            return 'supernova_phase_countdown';
        case 'shock-breakout':
            return 'supernova_phase_breakout';
        case 'ejecta':
            return 'supernova_phase_ejecta';
        case 'remnant':
            return 'supernova_phase_remnant';
        case 'complete':
            return 'supernova_phase_complete';
        default:
            return 'supernova_phase_intro';
    }
};

export const SupernovaScenarioOverlay: React.FC = () => {
    const scenario = usePhysicsStore(state => state.supernovaScenario);
    const loadStarSystem = usePhysicsStore(state => state.loadStarSystem);
    const selectBody = usePhysicsStore(state => state.selectBody);
    const setFollowingBody = usePhysicsStore(state => state.setFollowingBody);
    const setCameraMode = usePhysicsStore(state => state.setCameraMode);
    const clearSupernovaScenario = usePhysicsStore(state => state.clearSupernovaScenario);
    const { t } = useTranslation();

    const countdown = useMemo(() => {
        if (scenario.phase !== 'countdown') {
            return null;
        }

        return Math.max(1, Math.ceil(scenario.countdownRemainingMs / 1000));
    }, [scenario.countdownRemainingMs, scenario.phase]);

    if (!scenario.active) {
        return null;
    }

    const canInspectRemnant = scenario.phase === 'complete' && !!scenario.remnantBodyId;

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
                    {t('supernova_overlay_kicker')}
                </div>

                <div style={{
                    fontSize: '1.35rem',
                    fontWeight: 600,
                    letterSpacing: '-0.02em'
                }}>
                    {t(getPhaseTextKey(scenario.phase))}
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

                {scenario.phase === 'complete' && (
                    <div style={{
                        marginTop: '12px',
                        fontSize: '0.95rem',
                        color: '#d7e0f7'
                    }}>
                        {scenario.remnantType === 'black-hole' && t('supernova_remnant_black_hole')}
                        {scenario.remnantType === 'neutron-star' && t('supernova_remnant_neutron_star')}
                        {scenario.remnantType === 'none' && t('supernova_remnant_none')}
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
                            onClick={() => loadStarSystem('supernova')}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '999px',
                                border: '1px solid rgba(173, 196, 255, 0.35)',
                                background: 'rgba(104, 138, 255, 0.18)',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            {t('supernova_action_replay')}
                        </button>

                        {canInspectRemnant && (
                            <button
                                onClick={() => {
                                    if (!scenario.remnantBodyId) {
                                        return;
                                    }

                                    selectBody(scenario.remnantBodyId);
                                    setFollowingBody(scenario.remnantBodyId);
                                    setCameraMode('sun_lock');
                                    clearSupernovaScenario();
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
                                {t('supernova_action_inspect')}
                            </button>
                        )}

                        <button
                            onClick={() => {
                                setFollowingBody(null);
                                setCameraMode('free');
                                clearSupernovaScenario();
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
                            {t('supernova_action_free_camera')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
