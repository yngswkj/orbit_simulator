import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';

export const DateDisplay: React.FC = () => {
    const simulationTime = usePhysicsStore(state => state.simulationTime);

    // Calculate cumulative days and years
    const totalDays = Math.floor(simulationTime * 365.25);
    const totalYears = simulationTime.toFixed(1);

    // Format: "X日 (N年)"
    const formattedDate = `${totalDays.toLocaleString()}日 (${totalYears}年)`;

    return (
        <div style={{
            position: 'absolute',
            bottom: '160px',
            left: '10px',
            width: '220px',
            background: 'rgba(20, 30, 40, 0.1)', // More transparent
            backdropFilter: 'blur(4px)', // Glass effect
            padding: '12px 18px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'white',
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif', // Clean sans-serif
            userSelect: 'none',
            pointerEvents: 'none',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
            <div style={{
                fontSize: '0.7rem',
                color: '#94a3b8',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 600
            }}>
                Simulation Date
            </div>
            <div style={{
                fontSize: '1.3rem',
                fontWeight: 300, // Light weight
                letterSpacing: '0.05em',
                fontVariantNumeric: 'tabular-nums', // Aligns numbers nicely
                background: 'linear-gradient(to right, #fff, #cbd5e1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                {formattedDate}
            </div>
        </div>
    );
};
