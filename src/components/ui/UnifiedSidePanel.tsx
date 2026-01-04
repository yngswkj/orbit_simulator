import React, { useState, useEffect } from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { TabNavigation, type TabId } from './TabNavigation';
import { TabContent } from './TabContent';
import './UnifiedSidePanel.css';
import { CompactControls } from './CompactControls';
import { CompactBodySwitcher } from './CompactBodySwitcher';

interface UnifiedSidePanelProps {
    defaultTab?: TabId;
}

export const UnifiedSidePanel: React.FC<UnifiedSidePanelProps> = ({ defaultTab = 'controls' }) => {
    const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
    const [isOpen, setIsOpen] = useState(true);
    const zenMode = usePhysicsStore(state => state.zenMode);
    const selectedBodyId = usePhysicsStore(state => state.selectedBodyId);

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
            {!isOpen && (
                <>
                    <CompactControls onOpenPanel={() => setIsOpen(true)} />
                    <CompactBodySwitcher
                        isOpen={isOpen}
                        onOpenPanel={() => setIsOpen(true)}
                        onSwitchToBodiesTab={() => setActiveTab('bodies')}
                    />
                </>
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
        </>
    );
};
