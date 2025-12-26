import React, { useState, useEffect } from 'react';
import { SimulationControls } from './SimulationControls';
import { BodyCreator } from './BodyCreator';
import { ChevronRight, Menu, HelpCircle } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';
import { HelpModal } from './HelpModal';

export const ControlPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const { t } = useTranslation();

    // Auto-collapse after 5 seconds of inactivity (no hover)
    useEffect(() => {
        let timer: number | undefined;
        if (isOpen && !isHovering) {
            timer = setTimeout(() => {
                setIsOpen(false);
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [isOpen, isHovering]);

    return (
        <>
            <button
                onClick={() => setShowHelp(true)}
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 70, // Left of the menu button
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
                    transition: 'all 0.2s',
                    opacity: isOpen ? 0 : 1, // Hide when panel is open? Or keep visible? 
                    // User said "next to menu button". 
                    // If panel is Open, the menu button is HIDDEN (`display: isOpen ? 'none' : 'flex'`).
                    // So wait, if panel is open, where should the help button be?
                    // User says "icon is not in control panel but next to menu button".
                    // The menu button (hamburger) is only visible when panel is CLOSED.
                    // So maybe the Help button should also only be visible when Closed?
                    // OR should it ALWAYS be visible?
                    // "？アイコンはコントロールパネルの中じゃなくて、メニューボタンの横に表示して。"
                    // Likely implies it should be a global floating button like the menu button.
                    pointerEvents: isOpen ? 'none' : 'auto'
                }}
                className="help-toggle-btn"
                title={t('help_title')}
            >
                <HelpCircle size={20} />
            </button>

            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    zIndex: 1001,
                    background: 'rgba(20, 20, 30, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: isOpen ? 'none' : 'flex'
                }}
            >
                <Menu size={20} />
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
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)',
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
