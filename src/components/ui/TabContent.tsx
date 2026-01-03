import React from 'react';
import type { TabId } from './TabNavigation';
import { UnifiedBodyCreator } from './UnifiedBodyCreator';
import { BodiesTab } from './tabs/BodiesTab';
import { InspectorTab } from './tabs/InspectorTab';
import { SimulationControls } from './SimulationControls';

const ControlsTab = () => (
    <div
        role="tabpanel"
        id="controls-panel"
        aria-labelledby="controls-tab"
        style={{ padding: '20px' }}
    >
        <SimulationControls />
        <UnifiedBodyCreator />
    </div>
);

interface TabContentProps {
    activeTab: TabId;
}

export const TabContent: React.FC<TabContentProps> = ({ activeTab }) => {
    return (
        <div className="tab-content custom-scrollbar">
            {activeTab === 'controls' && <ControlsTab />}
            {activeTab === 'bodies' && (
                <div
                    role="tabpanel"
                    id="bodies-panel"
                    aria-labelledby="bodies-tab"
                >
                    <BodiesTab />
                </div>
            )}
            {activeTab === 'inspector' && (
                <div
                    role="tabpanel"
                    id="inspector-panel"
                    aria-labelledby="inspector-tab"
                >
                    <InspectorTab />
                </div>
            )}
        </div>
    );
};
