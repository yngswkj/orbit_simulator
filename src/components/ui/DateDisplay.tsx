import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';

export const DateDisplay: React.FC = () => {
    const simulationTime = usePhysicsStore(state => state.simulationTime);

    // Initial Date: Jan 1, 2025
    // simulationTime is in Years
    // 1 Year = 365.25 Days
    const initialDate = new Date('2025-01-01T00:00:00');

    // Calculate current date
    const daysElapsed = simulationTime * 365.25;
    const currentDate = new Date(initialDate.getTime() + daysElapsed * 24 * 60 * 60 * 1000);

    // Format: YYYY/MM/DD
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}/${month}/${day}`;

    return (
        <div style={{
            position: 'absolute',
            bottom: '120px', // Just above Gizmo (which is at bottom-left)
            left: '20px',
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '1.2rem',
            userSelect: 'none',
            pointerEvents: 'none',
            zIndex: 10
        }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '2px' }}>DATE</div>
            {formattedDate}
        </div>
    );
};
