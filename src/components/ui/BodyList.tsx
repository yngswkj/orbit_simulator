import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { Trash2 } from 'lucide-react';

export const BodyList: React.FC = () => {
    const bodies = usePhysicsStore((state) => state.bodies);
    const removeBody = usePhysicsStore((state) => state.removeBody);

    if (bodies.length === 0) return null;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
            marginTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '16px',
            maxHeight: 'none',
            overflowY: 'visible'
        }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 500, letterSpacing: '0.05em' }}>OBJECTS ({bodies.length})</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {bodies.map((body) => (
                    <div key={body.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '8px',
                        borderRadius: '6px',
                        borderLeft: `3px solid ${body.color}`
                    }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{body.name}</span>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Mass: {body.mass}</div>
                        </div>

                        {!body.isFixed && (
                            <button
                                onClick={() => removeBody(body.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ff4050',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0.7
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                                onMouseOut={(e) => (e.currentTarget.style.opacity = '0.7')}
                                title="Remove Object"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
