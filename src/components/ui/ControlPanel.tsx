import React, { useState } from 'react';
import { SimulationControls } from './SimulationControls';
import { BodyCreator } from './BodyCreator';
import { BodyList } from './BodyList';
import { ChevronRight, Menu } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';

export const ControlPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { t } = useTranslation();

    return (
        <>
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

            <div style={{
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
                overflowY: 'auto'
            }} className="control-panel-container">
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
                    <BodyList />
                    <BodyCreator />
                </div>
            </div>
        </>
    );
};
