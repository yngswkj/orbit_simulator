import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { Play, Pause, RefreshCw, Camera, Maximize, Menu, Orbit } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';
import { StarSystemGallery } from './StarSystemGallery';

interface CompactControlsProps {
    onOpenPanel: () => void;
}

export const CompactControls: React.FC<CompactControlsProps> = ({ onOpenPanel }) => {
    const simulationState = usePhysicsStore((state) => state.simulationState);
    const setSimulationState = usePhysicsStore((state) => state.setSimulationState);
    const reset = usePhysicsStore((state) => state.reset);
    const cameraMode = usePhysicsStore((state) => state.cameraMode);
    const setCameraMode = usePhysicsStore((state) => state.setCameraMode);
    const toggleZenMode = usePhysicsStore((state) => state.toggleZenMode);
    const followingBodyId = usePhysicsStore((state) => state.followingBodyId);

    const [showGallery, setShowGallery] = React.useState(false);
    const { t } = useTranslation();

    const togglePause = () => {
        setSimulationState(simulationState === 'running' ? 'paused' : 'running');
    };

    const cycleCamera = () => {
        if (!followingBodyId) return;

        if (cameraMode === 'free') setCameraMode('sun_lock');
        else if (cameraMode === 'sun_lock') setCameraMode('surface_lock');
        else setCameraMode('free');
    };

    return (
        <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            alignItems: 'end',
            zIndex: 1000
        }} className="compact-controls-container">
            {/* Main Menu Button (Expands Panel) */}
            <button
                onClick={onOpenPanel}
                style={{
                    background: 'rgba(20, 20, 30, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '4px',
                    minWidth: '48px',
                    minHeight: '48px',
                    boxSizing: 'border-box'
                }}
                title={t('open_controls')}
            >
                <Menu size={20} />
            </button>

            {/* Compact Tool Bar */}
            <div className="compact-toolbar" style={{
                background: 'rgba(20, 20, 30, 0.85)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                padding: '8px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                alignItems: 'center',
                minWidth: '48px',
                boxSizing: 'border-box'
            }}>
                <button
                    onClick={togglePause}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: simulationState === 'running' ? '#ff4050' : '#00ce7c',
                        cursor: 'pointer',
                        padding: '8px',
                        display: 'flex',
                        minWidth: '44px',
                        minHeight: '44px',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title={simulationState === 'running' ? t('pause') : t('resume')}
                >
                    {simulationState === 'running' ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <button
                    onClick={reset}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '8px',
                        opacity: 0.8,
                        display: 'flex',
                        minWidth: '44px',
                        minHeight: '44px',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title={t('reset')}
                >
                    <RefreshCw size={18} />
                </button>

                <button
                    onClick={() => setShowGallery(true)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#44aaff',
                        cursor: 'pointer',
                        padding: '8px',
                        opacity: 0.9,
                        display: 'flex',
                        minWidth: '44px',
                        minHeight: '44px',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title={t('star_system_gallery')}
                >
                    <Orbit size={20} />
                </button>

                <button
                    onClick={cycleCamera}
                    disabled={!followingBodyId}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: cameraMode === 'free' ? 'white' : '#3b82f6',
                        cursor: followingBodyId ? 'pointer' : 'not-allowed',
                        padding: '8px',
                        opacity: followingBodyId ? 1 : 0.3,
                        display: 'flex',
                        minWidth: '44px',
                        minHeight: '44px',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title={t('camera_mode')}
                >
                    <Camera size={20} />
                </button>

                <div style={{ width: '80%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />

                <button
                    onClick={toggleZenMode}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#aaddff',
                        cursor: 'pointer',
                        padding: '8px',
                        opacity: 0.8,
                        display: 'flex',
                        minWidth: '44px',
                        minHeight: '44px',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Zen Mode"
                >
                    <Maximize size={18} />
                </button>
            </div>

            <StarSystemGallery
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
            />
        </div>
    );
};
