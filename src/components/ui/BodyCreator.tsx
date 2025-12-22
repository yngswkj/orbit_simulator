import React, { useState } from 'react';
import { usePhysicsStore } from '../../store/physicsStore';
import { Vector3 } from 'three';
import { Plus } from 'lucide-react';

const COLORS = ['#ff4050', '#00ce7c', '#3b82f6', '#ffdd00', '#a855f7', '#ffffff'];

export const BodyCreator: React.FC = () => {
    const addBody = usePhysicsStore((state) => state.addBody);

    const [name, setName] = useState('New Planet');
    const [mass, setMass] = useState(10);
    const [radius, setRadius] = useState(0.5);
    const [color, setColor] = useState(COLORS[2]);
    const [posX, setPosX] = useState(10);
    const [posY, setPosY] = useState(0);
    const [posZ, setPosZ] = useState(0);
    const [velX, setVelX] = useState(0);
    const [velY, setVelY] = useState(0);
    const [velZ, setVelZ] = useState(5);

    const handleCreate = () => {
        addBody({
            name,
            mass,
            radius,
            color,
            position: new Vector3(posX, posY, posZ),
            velocity: new Vector3(velX, velY, velZ),
        });
    };

    const inputStyle = {
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        color: 'white',
        padding: '4px 8px',
        width: '100%',
        marginBottom: '8px'
    };

    const labelStyle = {
        fontSize: '0.75rem',
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: '2px',
        display: 'block'
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
            marginTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '16px'
        }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 500, letterSpacing: '0.05em' }}>ADD BODY</h3>

            <div>
                <label style={labelStyle}>Name</label>
                <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                    <label style={labelStyle}>Mass</label>
                    <input type="number" style={inputStyle} value={mass} onChange={(e) => setMass(parseFloat(e.target.value))} />
                </div>
                <div>
                    <label style={labelStyle}>Radius</label>
                    <input type="number" style={inputStyle} value={radius} onChange={(e) => setRadius(parseFloat(e.target.value))} />
                </div>
            </div>

            <div>
                <label style={labelStyle}>Color</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {COLORS.map((c) => (
                        <div
                            key={c}
                            onClick={() => setColor(c)}
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: c,
                                cursor: 'pointer',
                                border: color === c ? '2px solid white' : '2px solid transparent'
                            }}
                        />
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '8px' }}>
                <label style={labelStyle}>Position (X, Y, Z)</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="number" style={inputStyle} value={posX} onChange={(e) => setPosX(parseFloat(e.target.value))} placeholder="X" />
                    <input type="number" style={inputStyle} value={posY} onChange={(e) => setPosY(parseFloat(e.target.value))} placeholder="Y" />
                    <input type="number" style={inputStyle} value={posZ} onChange={(e) => setPosZ(parseFloat(e.target.value))} placeholder="Z" />
                </div>
            </div>

            <div>
                <label style={labelStyle}>Velocity (X, Y, Z)</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="number" style={inputStyle} value={velX} onChange={(e) => setVelX(parseFloat(e.target.value))} placeholder="VX" />
                    <input type="number" style={inputStyle} value={velY} onChange={(e) => setVelY(parseFloat(e.target.value))} placeholder="VY" />
                    <input type="number" style={inputStyle} value={velZ} onChange={(e) => setVelZ(parseFloat(e.target.value))} placeholder="VZ" />
                </div>
            </div>

            <button
                onClick={handleCreate}
                style={{
                    background: '#3b82f6',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px'
                }}
            >
                <Plus size={16} /> ADD OBJECT
            </button>
        </div>
    );
};
