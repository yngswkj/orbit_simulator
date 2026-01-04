import React from 'react';
import { Settings, Globe, Eye } from 'lucide-react';
import { usePhysicsStore } from '../../store/physicsStore';
import { useTranslation } from '../../utils/i18n';

export type TabId = 'controls' | 'bodies' | 'inspector';

interface TabNavigationProps {
    activeTab: TabId;
    onChange: (tab: TabId) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onChange }) => {
    const bodies = usePhysicsStore(state => state.bodies);
    const selectedBodyId = usePhysicsStore(state => state.selectedBodyId);
    const userMode = usePhysicsStore(state => state.userMode);
    const { t } = useTranslation();

    const isBeginnerMode = userMode === 'beginner';

    return (
        <div className="tab-navigation" role="tablist" aria-label="Simulation control tabs">
            <button
                role="tab"
                aria-selected={activeTab === 'controls'}
                aria-controls="controls-panel"
                id="controls-tab"
                onClick={() => onChange('controls')}
                className={`tab-btn ${activeTab === 'controls' ? 'active' : ''}`}
                tabIndex={activeTab === 'controls' ? 0 : -1}
            >
                <Settings size={18} aria-hidden="true" />
                <span>{t('tab_controls')}</span>
            </button>
            <button
                role="tab"
                aria-selected={activeTab === 'bodies'}
                aria-controls="bodies-panel"
                id="bodies-tab"
                onClick={() => onChange('bodies')}
                className={`tab-btn ${activeTab === 'bodies' ? 'active' : ''}`}
                tabIndex={activeTab === 'bodies' ? 0 : -1}
            >
                <Globe size={18} aria-hidden="true" />
                <span>{t('tab_bodies')}</span>
                <span className="badge" aria-label={`${bodies.length} bodies`}>{bodies.length}</span>
            </button>
            {/* Inspector tab - hidden in beginner mode */}
            {!isBeginnerMode && (
                <button
                    role="tab"
                    aria-selected={activeTab === 'inspector'}
                    aria-controls="inspector-panel"
                    id="inspector-tab"
                    onClick={() => onChange('inspector')}
                    className={`tab-btn ${activeTab === 'inspector' ? 'active' : ''}`}
                    disabled={!selectedBodyId}
                    title={!selectedBodyId ? t('select_body_msg') : t('tab_inspector')}
                    tabIndex={activeTab === 'inspector' ? 0 : -1}
                    aria-disabled={!selectedBodyId}
                >
                    <Eye size={18} aria-hidden="true" />
                    <span>{t('tab_inspector')}</span>
                </button>
            )}
        </div>
    );
};
