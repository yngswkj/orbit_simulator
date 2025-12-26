import React, { useState } from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { Vector3 } from 'three';

import { useTranslation } from '../../utils/i18n';

export const BodyCreator: React.FC = () => {
    const addBody = usePhysicsStore((state) => state.addBody);
    const { t } = useTranslation();

    const [isExpanded, setIsExpanded] = useState(false);
    const [newBody, setNewBody] = useState({
        name: 'New Planet',
        mass: 1.0,
        radius: 0.5,
        color: '#ffffff',
        position: { x: 10, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 2 }
    });

    const handleAdd = () => {
        addBody({
            name: newBody.name,
            mass: newBody.mass,
            radius: newBody.radius,
            color: newBody.color,
            position: new Vector3(newBody.position.x, newBody.position.y, newBody.position.z),
            velocity: new Vector3(newBody.velocity.x, newBody.velocity.y, newBody.velocity.z)
        });
        setIsExpanded(false);
    };

    const handleRandom = () => {
        const distance = 10 + Math.random() * 200;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.sqrt(500 / distance); // Rough orbital speed for stability

        addBody({
            name: `Asteroid ${Math.floor(Math.random() * 1000)}`,
            mass: 0.1 + Math.random() * 0.9,
            radius: 0.2 + Math.random() * 0.3,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            position: new Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance),
            velocity: new Vector3(-Math.sin(angle) * speed, 0, Math.cos(angle) * speed)
        });
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
            marginTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '16px'
        }}>
            {!isExpanded ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setIsExpanded(true)}
                        style={{
                            flex: 1,
                            padding: '8px',
                            background: '#3b82f6',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        + {t('add_body')}
                    </button>
                    <button
                        onClick={handleRandom}
                        style={{
                            padding: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                        title={t('add_random')}
                    >
                        🎲
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '12px',
                    borderRadius: '8px'
                }}>
                    <input
                        type="text"
                        value={newBody.name}
                        onChange={e => setNewBody({ ...newBody, name: e.target.value })}
                        placeholder={t('name')}
                        style={{ padding: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#aaa' }}>{t('mass')}</label>
                            <input
                                type="number"
                                value={newBody.mass}
                                onChange={e => setNewBody({ ...newBody, mass: parseFloat(e.target.value) })}
                                style={{ width: '100%', padding: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#aaa' }}>{t('radius')}</label>
                            <input
                                type="number"
                                value={newBody.radius}
                                onChange={e => setNewBody({ ...newBody, radius: parseFloat(e.target.value) })}
                                style={{ width: '100%', padding: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#aaa' }}>{t('position')} (x, y, z)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                            <input type="number" value={newBody.position.x} onChange={e => setNewBody({ ...newBody, position: { ...newBody.position, x: parseFloat(e.target.value) } })} style={{ width: '100%', padding: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', borderRadius: '4px' }} />
                            <input type="number" value={newBody.position.y} onChange={e => setNewBody({ ...newBody, position: { ...newBody.position, y: parseFloat(e.target.value) } })} style={{ width: '100%', padding: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', borderRadius: '4px' }} />
                            <input type="number" value={newBody.position.z} onChange={e => setNewBody({ ...newBody, position: { ...newBody.position, z: parseFloat(e.target.value) } })} style={{ width: '100%', padding: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', borderRadius: '4px' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#aaa' }}>{t('velocity')} (vx, vy, vz)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                            <input type="number" value={newBody.velocity.x} onChange={e => setNewBody({ ...newBody, velocity: { ...newBody.velocity, x: parseFloat(e.target.value) } })} style={{ width: '100%', padding: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', borderRadius: '4px' }} />
                            <input type="number" value={newBody.velocity.y} onChange={e => setNewBody({ ...newBody, velocity: { ...newBody.velocity, y: parseFloat(e.target.value) } })} style={{ width: '100%', padding: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', borderRadius: '4px' }} />
                            <input type="number" value={newBody.velocity.z} onChange={e => setNewBody({ ...newBody, velocity: { ...newBody.velocity, z: parseFloat(e.target.value) } })} style={{ width: '100%', padding: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', borderRadius: '4px' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#aaa' }}>{t('color')}</label>
                        <input
                            type="color"
                            value={newBody.color}
                            onChange={e => setNewBody({ ...newBody, color: e.target.value })}
                            style={{ width: '100%', height: '30px', border: 'none', cursor: 'pointer' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                            onClick={() => setIsExpanded(false)}
                            style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={handleAdd}
                            style={{ flex: 1, padding: '8px', background: '#3b82f6', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {t('create')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
