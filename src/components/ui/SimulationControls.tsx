import React, { useState } from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { Play, Pause, RefreshCw, LayoutGrid, Undo, Redo, Eye, Settings, Zap, GraduationCap, Rocket } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';
import { StarSystemGallery } from './StarSystemGallery';
import { ContextHelp } from './common/ContextHelp';
import { Button } from './common/Button';
import { Accordion } from './common/Accordion';
import { CheckboxGroup, type CheckboxItem } from './common/CheckboxGroup';
import { Tooltip } from './common/Tooltip';

export const SimulationControls: React.FC = () => {
    const simulationState = usePhysicsStore((state) => state.simulationState);
    const timeScale = usePhysicsStore((state) => state.timeScale);
    const setSimulationState = usePhysicsStore((state) => state.setSimulationState);
    const setTimeScale = usePhysicsStore((state) => state.setTimeScale);
    const reset = usePhysicsStore((state) => state.reset);
    const followingBodyId = usePhysicsStore((state) => state.followingBodyId);
    const cameraMode = usePhysicsStore((state) => state.cameraMode);
    const setCameraMode = usePhysicsStore((state) => state.setCameraMode);
    const undo = usePhysicsStore((state) => state.undo);
    const redo = usePhysicsStore((state) => state.redo);
    const historyIndex = usePhysicsStore((state) => state.historyIndex);
    const history = usePhysicsStore((state) => state.history);
    const userMode = usePhysicsStore((state) => state.userMode);
    const setUserMode = usePhysicsStore((state) => state.setUserMode);
    const { t } = useTranslation();

    const [showGallery, setShowGallery] = useState(false);

    const isBeginnerMode = userMode === 'beginner';

    const togglePause = () => {
        setSimulationState(simulationState === 'running' ? 'paused' : 'running');
    };

    // ========== 表示設定のチェックボックス項目 ==========
    const visualItems: CheckboxItem[] = [
        {
            id: 'grid',
            label: t('show_grid'),
            checked: usePhysicsStore(s => s.showGrid),
            onChange: () => usePhysicsStore.getState().toggleGrid(),
        },
        {
            id: 'prediction',
            label: t('show_prediction'),
            checked: usePhysicsStore(s => s.showPrediction),
            onChange: () => usePhysicsStore.getState().togglePrediction(),
            warning: true,
        },
        {
            id: 'realistic',
            label: t('show_realistic'),
            checked: usePhysicsStore(s => s.showRealisticVisuals),
            onChange: () => usePhysicsStore.getState().toggleRealisticVisuals(),
        },
    ];

    // ========== 詳細設定のチェックボックス項目 ==========
    const advancedItems: CheckboxItem[] = [
        {
            id: 'gravity',
            label: t('show_gravity_field'),
            checked: usePhysicsStore(s => s.showGravityField),
            onChange: () => usePhysicsStore.getState().toggleGravityField(),
        },
        {
            id: 'habitable',
            label: t('show_habitable'),
            checked: usePhysicsStore(s => s.showHabitableZone),
            onChange: () => usePhysicsStore.getState().toggleHabitableZone(),
        },
        {
            id: 'realistic_distances',
            label: t('show_realistic_distances'),
            checked: usePhysicsStore(s => s.useRealisticDistances),
            onChange: () => usePhysicsStore.getState().toggleRealisticDistances(),
        },
    ];

    // ========== パフォーマンス設定のチェックボックス項目 ==========
    const performanceItems: CheckboxItem[] = [
        {
            id: 'multithreading',
            label: t('show_multithreading'),
            checked: usePhysicsStore(s => s.useMultithreading),
            onChange: () => usePhysicsStore.getState().toggleMultithreading(),
            disabled: !usePhysicsStore.getState().isWorkerSupported,
            badge: usePhysicsStore.getState().isWorkerSupported ? 'Available' : 'N/A',
            badgeType: usePhysicsStore.getState().isWorkerSupported ? 'success' : undefined,
        },
        {
            id: 'gpu',
            label: t('show_gpu'),
            checked: usePhysicsStore(s => s.useGPU),
            onChange: () => usePhysicsStore.getState().toggleGPU(),
            disabled: !usePhysicsStore(s => s.isGPUSupported),
            badge: usePhysicsStore(s => s.isGPUSupported) ? 'Available' : 'N/A',
            badgeType: usePhysicsStore(s => s.isGPUSupported) ? 'success' : undefined,
        },
        {
            id: 'performance',
            label: t('show_performance'),
            checked: usePhysicsStore(s => s.showPerformance),
            onChange: () => usePhysicsStore.getState().togglePerformance(),
        },
    ];

    return (
        <div className="simulation-controls">
            {/* ヘッダー */}
            <div className="section-header">
                <ContextHelp topic="controls" />
            </div>

            {/* ========== モード切り替え ========== */}
            <div className="section" style={{ marginBottom: '12px' }}>
                <Tooltip content={isBeginnerMode ? '上級者モードに切り替え（全機能表示）' : '初心者モードに切り替え（基本機能のみ）'}>
                    <Button
                        variant="ghost"
                        leftIcon={isBeginnerMode ? Rocket : GraduationCap}
                        onClick={() => setUserMode(isBeginnerMode ? 'advanced' : 'beginner')}
                        fullWidth
                        size="sm"
                    >
                        {isBeginnerMode ? '上級者モード' : '初心者モード'}
                    </Button>
                </Tooltip>
            </div>

            {/* ========== 基本操作（常時表示） ========== */}
            <div className="section">
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

                {/* Undo/Redo */}
                <div className="flex gap-sm" style={{ marginTop: '8px' }}>
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

                {/* ギャラリー */}
                <Button
                    variant="secondary"
                    leftIcon={LayoutGrid}
                    onClick={() => setShowGallery(true)}
                    fullWidth
                    style={{ marginTop: '8px' }}
                >
                    {t('star_system_gallery')}
                </Button>

                {/* 時間スケール */}
                <div style={{ marginTop: '12px' }}>
                    <label className="text-sm text-secondary">
                        {t('time_scale')}: {timeScale.toFixed(1)}x
                    </label>
                    <input
                        type="range"
                        min="0.1"
                        max="5.0"
                        step="0.1"
                        value={timeScale}
                        onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-primary-500)', marginTop: '4px' }}
                    />
                </div>
            </div>

            {/* ========== 表示設定（折りたたみ可能） ========== */}
            <Accordion title="表示設定" icon={Eye} defaultOpen={true}>
                <CheckboxGroup items={visualItems} />
            </Accordion>

            {/* ========== 詳細設定（折りたたみ可能、上級者モードのみ） ========== */}
            {!isBeginnerMode && (
                <Accordion title="詳細設定" icon={Settings} defaultOpen={false}>
                    <CheckboxGroup items={advancedItems} />
                </Accordion>
            )}

            {/* ========== パフォーマンス（折りたたみ可能、上級者モードのみ） ========== */}
            {!isBeginnerMode && (
                <Accordion title="パフォーマンス" icon={Zap} defaultOpen={false}>
                    <CheckboxGroup items={performanceItems} />
                </Accordion>
            )}

            {/* ========== カメラモード ========== */}
            <div className="section" style={{ marginTop: '12px' }}>
                <div className="section-title" style={{ marginBottom: '8px' }}>カメラモード</div>
                <div className="flex gap-xs" style={{ flexWrap: 'wrap' }}>
                    {[
                        { id: 'free', label: t('camera_mode_free') },
                        { id: 'sun_lock', label: t('camera_mode_sun') },
                        { id: 'surface_lock', label: t('camera_mode_surface') }
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => followingBodyId && setCameraMode(mode.id as 'free' | 'sun_lock' | 'surface_lock')}
                            disabled={!followingBodyId && mode.id !== 'free'}
                            style={{
                                flex: '1 0 80px',
                                padding: '6px 8px',
                                fontSize: '0.75rem',
                                background: cameraMode === mode.id ? 'var(--color-primary-500)' : 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: cameraMode === mode.id ? '1px solid var(--color-primary-400)' : '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: followingBodyId ? 'pointer' : 'not-allowed',
                                opacity: (!followingBodyId && mode.id !== 'free') ? 0.5 : 1,
                                transition: 'all 0.2s',
                                textAlign: 'center',
                                fontWeight: cameraMode === mode.id ? 600 : 400,
                            }}
                            title={mode.label}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>


            {/* ギャラリーモーダル */}
            <StarSystemGallery
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
            />
        </div>
    );
};
