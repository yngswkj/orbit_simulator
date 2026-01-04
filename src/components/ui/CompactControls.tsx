import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { Play, Pause, RefreshCw, Camera, Maximize, Menu, Orbit, HelpCircle, MoreHorizontal } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';
import { StarSystemGallery } from './StarSystemGallery';
import { HelpModal } from './HelpModal';
import './CompactControls.css';

interface CompactControlsProps {
    onOpenPanel: () => void;
    onSwitchToBodiesTab: () => void;
}

export const CompactControls: React.FC<CompactControlsProps> = ({ onOpenPanel, onSwitchToBodiesTab }) => {
    const simulationState = usePhysicsStore((state) => state.simulationState);
    const setSimulationState = usePhysicsStore((state) => state.setSimulationState);
    const reset = usePhysicsStore((state) => state.reset);
    const cameraMode = usePhysicsStore((state) => state.cameraMode);
    const setCameraMode = usePhysicsStore((state) => state.setCameraMode);
    const toggleZenMode = usePhysicsStore((state) => state.toggleZenMode);
    const followingBodyId = usePhysicsStore((state) => state.followingBodyId);
    const setFollowingBody = usePhysicsStore((state) => state.setFollowingBody);
    const bodies = usePhysicsStore((state) => state.bodies);

    const [showGallery, setShowGallery] = React.useState(false);
    const [showHelp, setShowHelp] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);
    const { t } = useTranslation();

    // モバイル判定
    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // モバイル時は天体を表示しない、PC時は10個まで
    const MAX_VISIBLE_BODIES = isMobile ? 0 : 10;
    const visibleBodies = bodies.slice(0, MAX_VISIBLE_BODIES);
    const hasMore = isMobile ? bodies.length > 0 : bodies.length > MAX_VISIBLE_BODIES;

    const togglePause = () => {
        setSimulationState(simulationState === 'running' ? 'paused' : 'running');
    };

    const cycleCamera = () => {
        if (!followingBodyId) return;

        if (cameraMode === 'free') setCameraMode('sun_lock');
        else if (cameraMode === 'sun_lock') setCameraMode('surface_lock');
        else setCameraMode('free');
    };

    const handleMoreClick = () => {
        onSwitchToBodiesTab();
        onOpenPanel();
    };

    return (
        <div className="compact-controls-container">
            {/* Unified Tool Bar */}
            <div className="compact-toolbar">
                {/* Menu Button */}
                <button
                    onClick={onOpenPanel}
                    className="compact-button"
                    title={t('open_controls')}
                >
                    <Menu size={20} />
                    <span className="button-label">Menu</span>
                </button>

                {/* Help Button */}
                <button
                    onClick={() => setShowHelp(true)}
                    className="compact-button"
                    title={t('help_title')}
                >
                    <HelpCircle size={20} />
                    <span className="button-label">Help</span>
                </button>

                <div className="compact-divider" />

                {/* Play/Pause Button */}
                <button
                    onClick={togglePause}
                    className="compact-button"
                    style={{
                        color: simulationState === 'running' ? '#ff4050' : '#00ce7c',
                    }}
                    title={simulationState === 'running' ? t('pause') : t('resume')}
                >
                    {simulationState === 'running' ? <Pause size={20} /> : <Play size={20} />}
                    <span className="button-label">
                        {simulationState === 'running' ? 'Pause' : 'Play'}
                    </span>
                </button>

                {/* Reset Button */}
                <button
                    onClick={reset}
                    className="compact-button"
                    title={t('reset')}
                >
                    <RefreshCw size={18} />
                    <span className="button-label">Reset</span>
                </button>

                {/* Gallery Button */}
                <button
                    onClick={() => setShowGallery(true)}
                    className="compact-button"
                    style={{ color: '#44aaff' }}
                    title={t('star_system_gallery')}
                >
                    <Orbit size={20} />
                    <span className="button-label">Gallery</span>
                </button>

                {/* Camera Button */}
                <button
                    onClick={cycleCamera}
                    disabled={!followingBodyId}
                    className="compact-button"
                    style={{
                        color: cameraMode === 'free' ? 'white' : '#3b82f6',
                        cursor: followingBodyId ? 'pointer' : 'not-allowed',
                        opacity: followingBodyId ? 1 : 0.3,
                    }}
                    title={t('camera_mode')}
                >
                    <Camera size={20} />
                    <span className="button-label">Camera</span>
                </button>

                <div className="compact-divider" />

                {/* Zen Mode Button */}
                <button
                    onClick={toggleZenMode}
                    className="compact-button"
                    style={{ color: '#aaddff' }}
                    title="Zen Mode"
                >
                    <Maximize size={18} />
                    <span className="button-label">Zen</span>
                </button>

                <div className="compact-divider" />

                {/* Body Switcher Section (PC only) */}
                {!isMobile && (
                    <>
                        {/* Free Camera Button */}
                        <button
                            className={`compact-button body-button ${!followingBodyId ? 'active' : ''}`}
                            onClick={() => setFollowingBody(null)}
                            title="フリーカメラ"
                        >
                            <span className="body-indicator" style={{ background: '#666' }}>
                                <span className="body-name-short">Fr</span>
                            </span>
                            <span className="button-label">Free</span>
                        </button>

                        {/* Body Buttons (最大10個) */}
                        {visibleBodies.map(body => {
                            const shortName = body.name.length >= 2
                                ? body.name.charAt(0).toUpperCase() + body.name.charAt(1).toLowerCase()
                                : body.name.toUpperCase();

                            return (
                                <button
                                    key={body.id}
                                    className={`compact-button body-button ${followingBodyId === body.id ? 'active' : ''}`}
                                    onClick={() => setFollowingBody(body.id)}
                                    title={body.name}
                                >
                                    <span
                                        className="body-indicator"
                                        style={{
                                            background: body.color,
                                            boxShadow: `0 0 8px ${body.color}`,
                                        }}
                                    >
                                        <span className="body-name-short">{shortName}</span>
                                    </span>
                                    <span className="button-label">{body.name}</span>
                                </button>
                            );
                        })}
                    </>
                )}

                {/* More Button (モバイル時は常に表示、PC時は11個以上の場合のみ) */}
                {hasMore && (
                    <button
                        className="compact-button more-button"
                        onClick={handleMoreClick}
                        title={isMobile ? '天体リストを開く' : `${bodies.length - MAX_VISIBLE_BODIES}個の天体を表示`}
                    >
                        <MoreHorizontal size={16} />
                        <span className="button-label">{isMobile ? 'Bodies' : 'More'}</span>
                    </button>
                )}
            </div>

            <StarSystemGallery
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
            />
            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    );
};
