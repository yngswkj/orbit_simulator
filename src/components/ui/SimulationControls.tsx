import React, { useState } from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { Play, Pause, RefreshCw, AlertCircle, Trash2, Zap, LayoutGrid, Undo, Redo } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';
import { StarSystemGallery } from './StarSystemGallery';
import { ContextHelp } from './common/ContextHelp';
import { Button } from './common/Button';

export const SimulationControls: React.FC = () => {
    const simulationState = usePhysicsStore((state) => state.simulationState);
    const timeScale = usePhysicsStore((state) => state.timeScale);
    const setSimulationState = usePhysicsStore((state) => state.setSimulationState);
    const setTimeScale = usePhysicsStore((state) => state.setTimeScale);
    const reset = usePhysicsStore((state) => state.reset);
    const followingBodyId = usePhysicsStore((state) => state.followingBodyId);
    const removeBody = usePhysicsStore((state) => state.removeBody);
    const cameraMode = usePhysicsStore((state) => state.cameraMode);
    const setCameraMode = usePhysicsStore((state) => state.setCameraMode);
    const undo = usePhysicsStore((state) => state.undo);
    const redo = usePhysicsStore((state) => state.redo);
    const historyIndex = usePhysicsStore((state) => state.historyIndex);
    const history = usePhysicsStore((state) => state.history);
    const { t } = useTranslation();

    const [showGallery, setShowGallery] = useState(false);

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
            {/* Header */}
            <div style={{
                marginBottom: '4px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '8px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center'
            }}>
                <ContextHelp topic="controls" />
            </div>

            <div className="flex gap-sm">
                <Button
                    variant={simulationState === 'running' ? 'danger' : 'success'}
                    leftIcon={simulationState === 'running' ? Pause : Play}
                    onClick={togglePause}
                    fullWidth
                >
                    {simulationState === 'running' ? t('pause') : t('resume')}
                </Button>

                <Button
                    variant="secondary"
                    leftIcon={RefreshCw}
                    onClick={reset}
                    iconOnly
                    title={t('reset')}
                />
            </div>

            {/* Undo/Redo Controls */}
            <div className="flex gap-sm" style={{ marginTop: '4px' }}>
                <Button
                    variant="ghost"
                    leftIcon={Undo}
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    fullWidth
                    size="sm"
                    title="Undo (Ctrl+Z)"
                >
                    Undo
                </Button>
                <Button
                    variant="ghost"
                    leftIcon={Redo}
                    onClick={redo}
                    disabled={historyIndex >= history.length}
                    fullWidth
                    size="sm"
                    title="Redo (Ctrl+Shift+Z)"
                >
                    Redo
                </Button>
            </div>

            <Button
                variant="secondary"
                leftIcon={LayoutGrid}
                onClick={() => setShowGallery(true)}
                fullWidth
            >
                {t('star_system_gallery')}
            </Button>

            <StarSystemGallery
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>{t('time_scale')}: {timeScale.toFixed(1)}x</label>
                <input
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    value={timeScale}
                    onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }}
                />

                {/* Time Elapsed moved to DateDisplay Overlay */}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'white' }}>
                    <input
                        type="checkbox"
                        onChange={() => usePhysicsStore.getState().togglePrediction()}
                        checked={usePhysicsStore(s => s.showPrediction)}
                    />
                    {t('show_prediction')}
                    <div title="High performance cost / 重い処理です" style={{ display: 'flex', alignItems: 'center', color: '#ffb302' }}>
                        <AlertCircle size={14} />
                    </div>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'white' }}>
                    <input
                        type="checkbox"
                        checked={usePhysicsStore(state => state.useRealisticDistances)}
                        onChange={() => usePhysicsStore.getState().toggleRealisticDistances()}
                    />
                    {t('show_realistic_distances')}
                </label>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />


                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'white' }}>
                    <input
                        type="checkbox"
                        checked={usePhysicsStore(state => state.showGravityField)}
                        onChange={() => usePhysicsStore.getState().toggleGravityField()}
                    />
                    {t('show_gravity_field')}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'white' }}>
                    <input
                        type="checkbox"
                        checked={usePhysicsStore(state => state.useMultithreading)}
                        onChange={() => usePhysicsStore.getState().toggleMultithreading()}
                        disabled={!usePhysicsStore.getState().isWorkerSupported}
                    />
                    <span>{t('show_multithreading')}</span>
                    {!usePhysicsStore.getState().isWorkerSupported && <span style={{ fontSize: '0.7rem', color: '#ff4050' }}>(N/A)</span>}
                    {usePhysicsStore.getState().isWorkerSupported && <div style={{ color: '#00ce7c' }}><Zap size={14} fill="#00ce7c" /></div>}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'white' }}>
                    <input
                        type="checkbox"
                        checked={usePhysicsStore(state => state.useGPU)}
                        onChange={() => usePhysicsStore.getState().toggleGPU()}
                        disabled={!usePhysicsStore(s => s.isGPUSupported)}
                    />
                    <span>{t('show_gpu')}</span>
                    {usePhysicsStore(s => s.isGPUSupported) === false && <span style={{ fontSize: '0.7rem', color: '#ff4050' }}>(N/A)</span>}
                    {usePhysicsStore(s => s.isGPUSupported) === true && <div style={{ color: '#00ce7c' }}><Zap size={14} fill="#00ce7c" /></div>}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'white' }}>
                    <input
                        type="checkbox"
                        onChange={() => usePhysicsStore.getState().togglePerformance()}
                        checked={usePhysicsStore(s => s.showPerformance)}
                    />
                    {t('show_performance')}
                </label>
            </div>

            {/* Camera Mode Choice Chips */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                {[
                    { id: 'free', label: t('camera_mode_free') },
                    { id: 'sun_lock', label: t('camera_mode_sun') },
                    { id: 'surface_lock', label: t('camera_mode_surface') }
                ].map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => followingBodyId && setCameraMode(mode.id as any)}
                        disabled={!followingBodyId && mode.id !== 'free'}
                        style={{
                            flex: '1 0 80px',
                            padding: '4px 2px',
                            fontSize: '0.7rem',
                            background: cameraMode === mode.id ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: followingBodyId ? 'pointer' : 'not-allowed',
                            opacity: (!followingBodyId && mode.id !== 'free') ? 0.5 : 1,
                            transition: 'background 0.2s',
                            textAlign: 'center'
                        }}
                        title={mode.label}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>

            {/* Body List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {/* Removed label: {t('camera_follow')} */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    paddingRight: '4px'
                }}>
                    {usePhysicsStore(s => s.bodies).map(body => (
                        <div key={body.id} style={{ display: 'flex', gap: '4px' }}>
                            <button
                                onClick={() => {
                                    if (followingBodyId === body.id) {
                                        usePhysicsStore.getState().setFollowingBody(null);
                                    } else {
                                        usePhysicsStore.getState().setFollowingBody(body.id);
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 8px',
                                    background: followingBodyId === body.id ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                                    border: followingBodyId === body.id ? '1px solid #3b82f6' : '1px solid transparent',
                                    borderRadius: '4px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: body.color,
                                        boxShadow: `0 0 5px ${body.color}`
                                    }} />
                                    {body.name}
                                </span>
                                {followingBodyId === body.id && <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>On</span>}
                            </button>

                            {!body.isFixed && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeBody(body.id);
                                        // If following this body, stop following
                                        if (followingBodyId === body.id) {
                                            usePhysicsStore.getState().setFollowingBody(null);
                                        }
                                    }}
                                    style={{
                                        background: 'rgba(255, 64, 80, 0.1)',
                                        border: '1px solid rgba(255, 64, 80, 0.2)',
                                        borderRadius: '4px',
                                        color: '#ff4050',
                                        cursor: 'pointer',
                                        padding: '0 8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'background 0.2s'
                                    }}
                                    title={t('remove')}
                                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 64, 80, 0.3)')}
                                    onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 64, 80, 0.1)')}
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
