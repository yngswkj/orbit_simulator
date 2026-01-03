import React, { useState, useEffect } from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { TabNavigation, type TabId } from './TabNavigation';
import { TabContent } from './TabContent';
import './UnifiedSidePanel.css';
import { CompactControls } from './CompactControls';
import { HelpCircle } from 'lucide-react';
import { HelpModal } from './HelpModal';
import { useTranslation } from '../../utils/i18n';

interface UnifiedSidePanelProps {
    defaultTab?: TabId;
}

export const UnifiedSidePanel: React.FC<UnifiedSidePanelProps> = ({ defaultTab = 'controls' }) => {
    const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
    const [isOpen, setIsOpen] = useState(true);
    const [showHelp, setShowHelp] = useState(false);
    const zenMode = usePhysicsStore(state => state.zenMode);
    const selectedBodyId = usePhysicsStore(state => state.selectedBodyId);
    const { t } = useTranslation();

    // Auto-switch to inspector when a body is selected
    useEffect(() => {
        if (selectedBodyId) {
            setActiveTab('inspector');
            if (!isOpen) setIsOpen(true);
        }
    }, [selectedBodyId]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if user is typing in an input
            const activeElement = document.activeElement;
            const isTyping = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';

            // Alt+Number for tab switching
            if (e.altKey) {
                if (e.key === '1') { setActiveTab('controls'); e.preventDefault(); }
                if (e.key === '2') { setActiveTab('bodies'); e.preventDefault(); }
                if (e.key === '3') { setActiveTab('inspector'); e.preventDefault(); }
                if (e.key === 'f') {
                    setActiveTab('bodies');
                    e.preventDefault();
                    setTimeout(() => {
                        const searchInput = document.querySelector('.lab-search input') as HTMLInputElement;
                        if (searchInput) searchInput.focus();
                    }, 50);
                }
            }

            // Ctrl+Z / Ctrl+Shift+Z for Undo/Redo (only when not typing)
            if (!isTyping && (e.ctrlKey || e.metaKey)) {
                const store = usePhysicsStore.getState();
                if (e.key === 'z' && !e.shiftKey) {
                    store.undo();
                    e.preventDefault();
                }
                if (e.key === 'z' && e.shiftKey) {
                    store.redo();
                    e.preventDefault();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (zenMode) return null; // ZenMode handled elsewhere or completely hidden

    return (
        <>
            {/* Help Button (visible when panel is closed) */}
            <button
                onClick={() => setShowHelp(true)}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 70,
                    zIndex: 1001,
                    background: 'rgba(20, 20, 30, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '48px',
                    minHeight: '48px',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                    opacity: isOpen ? 0 : 1,
                    pointerEvents: isOpen ? 'none' : 'auto'
                }}
                title={t('help_title')}
            >
                <HelpCircle size={20} />
            </button>

            {!isOpen && (
                <CompactControls onOpenPanel={() => setIsOpen(true)} />
            )}

            <div className={`unified-side-panel ${!isOpen ? 'collapsed' : ''}`}>
                <div style={{ // Header bar with close button if needed
                    display: 'flex', justifyContent: 'flex-end', padding: '10px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)',
                            cursor: 'pointer', fontSize: '20px', lineHeight: 1
                        }}
                    >×</button>
                </div>

                <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
                <TabContent activeTab={activeTab} />
            </div>

            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </>
    );
};
