import React, { useState } from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { Vector3 } from 'three';
import { useTranslation } from '../../utils/i18n';
import { Sun, Globe, Disc, Zap } from 'lucide-react';

export const UnifiedBodyCreator: React.FC = () => {
    const { t } = useTranslation();
    const addBody = usePhysicsStore((state) => state.addBody);
    const [mode, setMode] = useState<'preset' | 'custom'>('preset');

    // Custom Mode State
    const [newBody, setNewBody] = useState({
        name: 'New Planet',
        mass: 1.0,
        radius: 0.5,
        color: '#ffffff',
        position: { x: 10, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 2 }
    });

    const handlePresetAdd = (type: string) => {
        const offset = (Math.random() - 0.5) * 50;
        const position = new Vector3(offset, 0, (Math.random() - 0.5) * 50);
        let props: any = {
            position,
            velocity: new Vector3(0, 0, 0),
            name: `New ${type}`
        };

        switch (type) {
            case 'Star':
                props = { ...props, type: 'star', mass: 10000, radius: 20, color: '#ffaa00', name: 'New Star' };
                break;
            case 'Planet':
                props = { ...props, type: 'planet', mass: 1, radius: 1, color: '#3388ff', name: 'New Planet' };
                break;
            case 'Gas Giant':
                props = { ...props, type: 'planet', mass: 300, radius: 10, color: '#dcb159', name: 'Gas Giant' };
                break;
            case 'Black Hole':
                props = { ...props, type: 'black_hole', mass: 50000, radius: 2, color: '#000000', name: 'Black Hole', isCompactObject: true };
                break;
        }

        addBody(props);
    };

    const handleCustomAdd = () => {
        addBody({
            name: newBody.name,
            mass: newBody.mass,
            radius: newBody.radius,
            color: newBody.color,
            position: new Vector3(newBody.position.x, newBody.position.y, newBody.position.z),
            velocity: new Vector3(newBody.velocity.x, newBody.velocity.y, newBody.velocity.z)
        });
    };

    return (
        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('add_body')}
            </h3>

            <div style={{ display: 'flex', marginBottom: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '2px' }}>
                <button
                    onClick={() => setMode('preset')}
                    style={{
                        flex: 1, padding: '6px', borderRadius: '4px',
                        background: mode === 'preset' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: mode === 'preset' ? 'white' : 'rgba(255,255,255,0.4)',
                        border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    {t('preset_mode')}
                </button>
                <button
                    onClick={() => setMode('custom')}
                    style={{
                        flex: 1, padding: '6px', borderRadius: '4px',
                        background: mode === 'custom' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: mode === 'custom' ? 'white' : 'rgba(255,255,255,0.4)',
                        border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    {t('custom_mode')}
                </button>
            </div>

            {mode === 'preset' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                        { type: 'Star', icon: Sun, color: '#facc15' },
                        { type: 'Planet', icon: Globe, color: '#60a5fa' },
                        { type: 'Gas Giant', icon: Disc, color: '#fdba74' },
                        { type: 'Black Hole', icon: Zap, color: '#c084fc' }
                    ].map(item => (
                        <button
                            key={item.type}
                            onClick={() => handlePresetAdd(item.type)}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                padding: '12px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                color: 'white', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            <item.icon size={24} color={item.color} />
                            <span style={{ fontSize: '12px' }}>{item.type}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        type="text"
                        value={newBody.name}
                        onChange={e => setNewBody({ ...newBody, name: e.target.value })}
                        placeholder={t('name')}
                        className="lab-input" // Assuming utility class or keep inline
                        style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'white' }}
                    />

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '10px', color: '#888', display: 'block', marginBottom: '2px' }}>{t('mass')}</label>
                            <input
                                type="number"
                                value={newBody.mass}
                                onChange={e => setNewBody({ ...newBody, mass: parseFloat(e.target.value) })}
                                style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'white' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '10px', color: '#888', display: 'block', marginBottom: '2px' }}>{t('radius')}</label>
                            <input
                                type="number"
                                value={newBody.radius}
                                onChange={e => setNewBody({ ...newBody, radius: parseFloat(e.target.value) })}
                                style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'white' }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleCustomAdd}
                        style={{
                            width: '100%', padding: '10px', marginTop: '5px',
                            background: '#3b82f6', border: 'none', borderRadius: '6px',
                            color: 'white', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        {t('create_body')}
                    </button>
                </div>
            )}
        </div>
    );
};
