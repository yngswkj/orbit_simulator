import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { useTranslation } from '../../utils/i18n';

export const BodyInspector: React.FC = () => {
    const bodies = usePhysicsStore(state => state.bodies);
    const selectedBodyId = usePhysicsStore(state => state.selectedBodyId);
    const updateBody = usePhysicsStore(state => state.updateBody);
    const selectBody = usePhysicsStore(state => state.selectBody);
    const setFollowingBody = usePhysicsStore(state => state.setFollowingBody);
    const followingBodyId = usePhysicsStore(state => state.followingBodyId);
    const { t } = useTranslation();

    const selectedBody = bodies.find(b => b.id === selectedBodyId);

    if (!selectedBody) return null;

    const sun = bodies.find(b => b.name === 'Sun');
    const distanceToSun = sun && selectedBody.id !== sun.id
        ? selectedBody.position.distanceTo(sun.position).toFixed(1)
        : '0.0';

    const velocity = selectedBody.velocity.length().toFixed(3);

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '280px',
            backgroundColor: 'rgba(20, 20, 30, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '20px',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease',
            fontFamily: "'Inter', sans-serif",
            zIndex: 2000
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{selectedBody.name}</h3>
                <button
                    onClick={() => selectBody(null)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        fontSize: '20px',
                        lineHeight: 1
                    }}
                >×</button>
            </div>

            <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
                {/* Properties Display */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>{t('distance_sun')}:</span>
                    <span>{distanceToSun} AU</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>{t('orbital_speed')}:</span>
                    <span>{velocity} km/s</span>
                </div>

                <hr style={{ borderColor: 'rgba(255,255,255,0.1)', width: '100%', margin: '10px 0' }} />

                {/* Editing Controls */}
                <div style={{ marginBottom: '5px' }}>
                    <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Name</label>
                    <input
                        type="text"
                        value={selectedBody.name}
                        onChange={(e) => updateBody(selectedBody.id, { name: e.target.value })}
                        style={{
                            width: '100%',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            padding: '6px',
                            color: 'white'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '5px' }}>
                    <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>{t('mass')} (Earth = 1)</label>
                    <input
                        type="number"
                        value={selectedBody.mass}
                        onChange={(e) => updateBody(selectedBody.id, { mass: parseFloat(e.target.value) })}
                        step="0.1"
                        style={{
                            width: '100%',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            padding: '6px',
                            color: 'white'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '5px' }}>
                    <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>{t('color')}</label>
                    <input
                        type="color"
                        value={selectedBody.color}
                        onChange={(e) => updateBody(selectedBody.id, { color: e.target.value })}
                        style={{
                            width: '100%',
                            height: '30px',
                            border: 'none',
                            borderRadius: '4px',
                            padding: 0,
                            cursor: 'pointer'
                        }}
                    />
                </div>

                <div style={{ marginTop: '10px' }}>
                    <button
                        onClick={() => setFollowingBody(followingBodyId === selectedBody.id ? null : selectedBody.id)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: followingBodyId === selectedBody.id ? 'rgba(34, 170, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                            border: `1px solid ${followingBodyId === selectedBody.id ? '#22aaff' : 'rgba(255, 255, 255, 0.2)'}`,
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontWeight: 500
                        }}
                    >
                        {followingBodyId === selectedBody.id ? t('stop_following') : t('camera_follow')}
                    </button>
                </div>
            </div>
        </div>
    );
};
