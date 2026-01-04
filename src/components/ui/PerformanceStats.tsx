/* eslint-disable react-hooks/purity */
import { useEffect, useRef } from 'react';
import { physicsStats, usePhysicsStore } from '../../store/physicsStore';
import { useTranslation } from '../../utils/i18n';

// PhysicsStats component
export const PerformanceStats = () => {
    const zenMode = usePhysicsStore(state => state.zenMode);
    const statsRef = useRef<HTMLDivElement>(null);
    const fpsRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const frameCountRef = useRef(0);
    const { t, lang } = useTranslation();

    useEffect(() => {
        if (zenMode) return;

        let animationFrameId: number;

        const loop = () => {
            const now = performance.now();
            frameCountRef.current++;
            const elapsed = now - lastTimeRef.current;

            if (elapsed >= 500) { // Update 2 times per second
                fpsRef.current = Math.round((frameCountRef.current * 1000) / elapsed);
                frameCountRef.current = 0;
                lastTimeRef.current = now;
            }

            if (statsRef.current && !zenMode) {
                const { physicsDuration, bodyCount, mode, energy } = physicsStats;
                const fps = fpsRef.current;

                const absDrift = Math.abs(energy.drift);
                // Drift Color: < 0.01% Green, < 1% Yellow, > 1% Red
                const driftColor = absDrift < 0.0001 ? '#44ff44' : (absDrift < 0.01 ? '#ffff44' : '#ff4444');
                const driftText = (energy.drift * 100).toFixed(4) + '%';
                const totalText = energy.total.toExponential(4);

                // Correctly typed cameraPosition from the extended physicsStats object
                const camPos = physicsStats.cameraPosition || [0, 0, 0];
                const camText = `[${Math.round(camPos[0])}, ${Math.round(camPos[1])}, ${Math.round(camPos[2])}]`;

                // Direct DOM manipulation for minimal React overhead on high-frequency data
                statsRef.current.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 4px;">${t('perf_stats')}</div>
                    <div style="display: flex; justify-content: space-between; gap: 12px;">
                        <span>${t('perf_fps')}:</span> <span style="color: ${fps < 30 ? '#ff4444' : '#44ff44'}">${fps}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Cam:</span> <span style="font-family: monospace; color: #aaaaff;">${camText}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>${t('perf_mode')}:</span> <span style="color: #44aaff">${mode}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>${t('perf_bodies')}:</span> <span>${bodyCount}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>${t('perf_physics')}:</span> <span>${physicsDuration.toFixed(1)}ms</span>
                    </div>
                    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 4px 0;" />
                    <div style="display: flex; justify-content: space-between;">
                        <span>${t('perf_energy')}:</span> <span style="font-family: monospace; font-size: 0.9em;">${totalText}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>${t('perf_error')}:</span> <span style="font-family: monospace; font-size: 0.9em; color: ${driftColor}">${driftText}</span>
                    </div>
                    <div style="font-size: 0.85em; opacity: 0.7; margin-top: 4px; display: flex; flex-direction: column; gap: 2px;">
                       <div style="display: flex; justify-content: space-between;"><span>${t('perf_kinetic')}:</span> <span>${energy.kinetic.toExponential(2)}</span></div>
                       <div style="display: flex; justify-content: space-between;"><span>${t('perf_potential')}:</span> <span>${energy.potential.toExponential(2)}</span></div>
                    </div>
                `;
            }

            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [t, lang, zenMode]);

    if (zenMode) return null;

    return (
        <div
            ref={statsRef}
            style={{
                position: 'absolute',
                bottom: '250px',
                left: '10px',
                background: 'rgba(20, 30, 40, 0.1)', // More transparent
                backdropFilter: 'blur(4px)', // Glass effect
                padding: '12px',
                borderRadius: '8px',
                color: '#e0e0e0',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                width: '220px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                pointerEvents: 'none', // Allow clicking through
                zIndex: 1000,
                userSelect: 'none'
            }}
        />
    );
};
