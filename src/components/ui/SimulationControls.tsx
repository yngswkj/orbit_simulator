import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';

export const SimulationControls: React.FC = () => {
    const simulationState = usePhysicsStore((state) => state.simulationState);
    const timeScale = usePhysicsStore((state) => state.timeScale);
    const setSimulationState = usePhysicsStore((state) => state.setSimulationState);
    const setTimeScale = usePhysicsStore((state) => state.setTimeScale);
    const reset = usePhysicsStore((state) => state.reset);
    const loadSolarSystem = usePhysicsStore((state) => state.loadSolarSystem);
    const followingBodyId = usePhysicsStore((state) => state.followingBodyId);
    const cameraMode = usePhysicsStore((state) => state.cameraMode);
    const setCameraMode = usePhysicsStore((state) => state.setCameraMode);
    const { t } = useTranslation();

    const togglePause = () => {
        setSimulationState(simulationState === 'running' ? 'paused' : 'running');
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%'
        }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 500, letterSpacing: '0.05em' }}>{t('simulation_title')}</h3>

            <div style={{ display: 'flex', gap: '8px' }} className="sim-controls-buttons">
                <button
                    onClick={togglePause}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: simulationState === 'running' ? '#ff4050' : '#00ce7c',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {simulationState === 'running' ? <Pause size={16} /> : <Play size={16} />}
                    {simulationState === 'running' ? t('pause') : t('resume')}
                </button>

                <button
                    onClick={reset}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title={t('reset')}
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            <button
                onClick={loadSolarSystem}
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                }}
            >
                <span>🪐 {t('load_solar')}</span>
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'white' }}>
                    <input
                        type="checkbox"
                        onChange={() => usePhysicsStore.getState().togglePrediction()}
                        checked={usePhysicsStore(s => s.showPrediction)}
                    />
                    {t('show_prediction')}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'white' }}>
                    <input
                        type="checkbox"
                        onChange={() => usePhysicsStore.getState().toggleGrid()}
                        checked={usePhysicsStore(s => s.showGrid)}
                    />
                    {t('show_grid')}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'white' }}>
                    <input
                        type="checkbox"
                        onChange={() => usePhysicsStore.getState().toggleRealisticVisuals()}
                        checked={usePhysicsStore(s => s.showRealisticVisuals)}
                    />
                    {t('show_realistic')}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'white' }}>
                    <input
                        type="checkbox"
                        checked={usePhysicsStore(state => state.showHabitableZone)}
                        onChange={() => usePhysicsStore.getState().toggleHabitableZone()}
                    />
                    {t('show_habitable')}
                </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} className="camera-follow-select">
                <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>{t('camera_follow')}</label>
                <select
                    style={{
                        padding: '6px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                    value={usePhysicsStore(s => s.followingBodyId) || ''}
                    onChange={(e) => usePhysicsStore.getState().setFollowingBody(e.target.value || null)}
                >
                    <option value="">{t('free_camera')}</option>
                    {usePhysicsStore(s => s.bodies).map(body => (
                        <option
                            key={body.id}
                            value={body.id}
                            style={{ color: 'black', background: 'white' }}
                        >
                            {body.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Camera Mode Choice Chips (Only visible when following) */}
            {followingBodyId && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    {[
                        { id: 'free', label: t('camera_mode_free') },
                        { id: 'sun_lock', label: t('camera_mode_sun') },
                        { id: 'surface_lock', label: t('camera_mode_surface') }
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setCameraMode(mode.id as any)}
                            style={{
                                flex: '1 0 80px', // Grow, don't shrink below 80px
                                padding: '4px 2px',
                                fontSize: '0.7rem',
                                background: cameraMode === mode.id ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                textAlign: 'center'
                            }}
                            title={mode.label}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Time Scale: {timeScale.toFixed(1)}x</label>
                <input
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    value={timeScale}
                    onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }}
                />
            </div>
        </div>
    );
};
