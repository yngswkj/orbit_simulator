import React, { useState, useEffect } from 'react';
import { CompactControls } from './CompactControls';
import { HelpCircle, Minimize, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';
import { HelpModal } from './HelpModal';
import { usePhysicsStore } from '../../store/physicsStore';
import { SimulationControls } from './SimulationControls';
import { BodyCreator } from './BodyCreator';

export const ControlPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const { t } = useTranslation();
    const zenMode = usePhysicsStore(state => state.zenMode);
    const toggleZenMode = usePhysicsStore(state => state.toggleZenMode);

    // Auto-collapse after 5 seconds of inactivity (no hover), BUT NOT if help is open
    useEffect(() => {
        let timer: number | undefined;
        if (isOpen && !isHovering && !showHelp) {
            timer = setTimeout(() => {
                setIsOpen(false);
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [isOpen, isHovering, showHelp]);

    if (zenMode) {
        return (
            <button
                onClick={toggleZenMode}
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    zIndex: 2000,
                    background: 'rgba(20, 20, 30, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.5)',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                }}
                className="zen-exit-btn"
                onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseOut={(e) => (e.currentTarget.style.opacity = '0.3')}
                title="Exit Zen Mode"
            >
                <Minimize size={20} />
            </button>
        );
    }

    if (!isOpen) {
        return <CompactControls onOpenPanel={() => setIsOpen(true)} />;
    }

    return (
        <>
            <button
                onClick={() => setShowHelp(true)}
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 340, // Left of the panel (320px + 20px padding)
                    zIndex: 1001,
                    background: 'rgba(20, 20, 30, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                }}
                className="help-toggle-btn"
                title={t('help_title')}
            >
                <HelpCircle size={20} />
            </button>

            <div
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    height: '100vh',
                    width: '320px',
                    maxWidth: '100vw',
                    background: 'rgba(10, 10, 15, 0.85)',
                    backdropFilter: 'blur(12px)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    boxSizing: 'border-box',
                    zIndex: 1000,
                    overflowY: 'auto',
                    scrollbarGutter: 'stable'
                }}
                className="control-panel-container"
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>{t('controls_title')}</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 4
                        }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
                    <SimulationControls />
                    <BodyCreator />
                </div>
            </div>

            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </>
    );
};
