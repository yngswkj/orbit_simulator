import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { Play, Pause, RefreshCw, Camera, Maximize, Menu, Orbit, HelpCircle } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';
import { StarSystemGallery } from './StarSystemGallery';
import { HelpModal } from './HelpModal';
import './CompactControls.css';

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
    const [showHelp, setShowHelp] = React.useState(false);
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
            </div>

            <StarSystemGallery
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
            />
            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    );
};
