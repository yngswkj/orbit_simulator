import { useEffect, useRef } from 'react';
import { physicsStats } from '../../store/physicsStore';
import { useTranslation } from '../../utils/i18n';

export const PerformanceStats = () => {
    const statsRef = useRef<HTMLDivElement>(null);
    const fpsRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const frameCountRef = useRef(0);
    const { t, lang } = useTranslation();

    useEffect(() => {
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

            if (statsRef.current) {
                const { physicsDuration, bodyCount, mode, totalEnergy } = physicsStats;
                const energyDisplay = totalEnergy === 0 ? t('calculating') : totalEnergy.toExponential(4);
                const fps = fpsRef.current;

                // Direct DOM manipulation for minimal React overhead on high-frequency data
                statsRef.current.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 4px;">${t('perf_stats')}</div>
                    <div style="display: flex; justify-content: space-between; gap: 12px;">
                        <span>${t('perf_fps')}:</span> <span style="color: ${fps < 30 ? '#ff4444' : '#44ff44'}">${fps}</span>
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
                     <div style="display: flex; justify-content: space-between;">
                        <span>${t('perf_energy')}:</span> <span style="font-family: monospace; font-size: 0.9em;">${energyDisplay}</span>
                    </div>
                `;
            }

            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [t, lang]);

    return (
        <div
            ref={statsRef}
            style={{
                position: 'absolute',
                bottom: '250px',
                left: '10px',
                background: 'rgba(10, 10, 20, 0.8)',
                backdropFilter: 'blur(8px)',
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
