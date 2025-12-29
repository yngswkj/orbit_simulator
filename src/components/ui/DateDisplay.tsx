import React from 'react';
import { usePhysicsStore } from '../../store/physicsStore';


// Date Display Overlay (JAXA/NASA Style)
// Date Display Overlay (JAXA/NASA Style)
export const DateDisplay: React.FC = () => {
    const simulationTime = usePhysicsStore((state) => state.simulationTime);
    const zenMode = usePhysicsStore(state => state.zenMode);

    const useRealisticDistances = usePhysicsStore(state => state.useRealisticDistances);

    // Calibration:
    // Earth (r=50, M=333000) takes ~3.85 simulation units to orbit.
    // We want this to display as 365.25 days.
    // Factor = 365.25 / 3.85 ≈ 94.88 days per unit.
    const DAYS_PER_UNIT = 94.88;

    // Calculate "Calendar Days" elapsed
    let totalDays = simulationTime * DAYS_PER_UNIT;

    // If in Realistic Mode:
    // Distances are x4.0. Physics Period increases by x8.0 (Kepler's 3rd Law).
    // We also auto-scaled timeScale by x8.0 so visual speed matches.
    // Because simulationTime runs 8x faster per "visual orbit", we must divide by 8
    // to map back to a standard "1 Orbit = 1 Year" calendar progression.
    if (useRealisticDistances) {
        totalDays /= 8.0;
    }

    // Calculate Years and Days
    const years = Math.floor(totalDays / 365.25);
    const days = Math.floor(totalDays % 365.25);

    if (zenMode) return null;

    return (
        <div style={{
            position: 'absolute',
            bottom: '160px', // Above Gizmo (margin 100 + size)
            left: '20px',
            width: '200px',
            pointerEvents: 'none',
            zIndex: 900,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            // Minimal style as requested? Reverting to previous style implies maybe simpler?
            // User asked for "Format to Days (Years)"
        }}>
            <div style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '4px',
                fontFamily: 'Inter, sans-serif'
            }}>
                MISSION TIME
            </div>
            <div style={{
                color: '#fff',
                fontSize: '1.5rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 300,
                fontVariantNumeric: 'tabular-nums'
            }}>
                {days} <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>DAYS</span>
            </div>
            <div style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.9rem',
                fontFamily: 'Inter, sans-serif'
            }}>
                ({years} YEARS)
            </div>
        </div>
    );
};
