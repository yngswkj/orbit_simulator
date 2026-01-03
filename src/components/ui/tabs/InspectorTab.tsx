import React from 'react';
import { usePhysicsStore } from '../../../store/physicsStore';
import { BodyInspectorContent } from '../BodyInspectorContent';
import { Globe } from 'lucide-react';
import { useTranslation } from '../../../utils/i18n';

export const InspectorTab: React.FC = () => {
    const { t } = useTranslation();
    const selectedBodyId = usePhysicsStore(state => state.selectedBodyId);
    const bodies = usePhysicsStore(state => state.bodies);
    const selectedBody = bodies.find(b => b.id === selectedBodyId);

    if (!selectedBody) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', color: '#6b7280', textAlign: 'center', padding: '20px'
            }}>
                <Globe size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                <p style={{ fontSize: '0.9rem' }}>{t('select_body_msg')}</p>
            </div>
        );
    }

    return (
        <BodyInspectorContent body={selectedBody} />
    );
};
