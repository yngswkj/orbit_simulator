/**
 * EffectsLayer.tsx
 * Main component that renders all active visual effects
 */

import React, { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useEffectsStore } from '../../store/effectsStore';
import { ShockwaveEffect } from './ShockwaveEffect';
import { HeatGlowEffect } from './HeatGlowEffect';
import { ExplosionEffect } from './ExplosionEffect';
import { DebrisRenderer } from './DebrisRenderer';

export const EffectsLayer: React.FC = () => {
    const shockwaves = useEffectsStore(state => state.shockwaves);
    const heatGlows = useEffectsStore(state => state.heatGlows);
    const explosions = useEffectsStore(state => state.explosions);

    const removeShockwave = useEffectsStore(state => state.removeShockwave);
    const removeHeatGlow = useEffectsStore(state => state.removeHeatGlow);
    const removeExplosion = useEffectsStore(state => state.removeExplosion);
    const removeExpiredEffects = useEffectsStore(state => state.removeExpiredEffects);

    // Periodic cleanup of expired effects
    useFrame(() => {
        // Cleanup runs every ~2 seconds via internal timing in store
    });

    // Cleanup interval
    useEffect(() => {
        const interval = setInterval(() => {
            removeExpiredEffects();
        }, 2000);

        return () => clearInterval(interval);
    }, [removeExpiredEffects]);

    return (
        <group name="effects-layer">
            {/* Shockwaves */}
            {shockwaves.map(sw => (
                <ShockwaveEffect
                    key={sw.id}
                    position={sw.position}
                    startTime={sw.startTime}
                    duration={sw.duration}
                    maxRadius={sw.maxRadius}
                    color={sw.color}
                    onComplete={() => removeShockwave(sw.id)}
                />
            ))}

            {/* Heat Glows */}
            {heatGlows.map(hg => (
                <HeatGlowEffect
                    key={hg.id}
                    position={hg.position}
                    radius={hg.radius}
                    startTime={hg.startTime}
                    duration={hg.duration}
                    intensity={hg.intensity}
                    onComplete={() => removeHeatGlow(hg.id)}
                />
            ))}

            {/* Explosions */}
            {explosions.map(exp => (
                <ExplosionEffect
                    key={exp.id}
                    position={exp.position}
                    startTime={exp.startTime}
                    duration={exp.duration}
                    size={exp.size}
                    color={exp.color}
                    particleCount={exp.particleCount}
                    onComplete={() => removeExplosion(exp.id)}
                />
            ))}

            {/* Debris */}
            <DebrisRenderer />
        </group>
    );
};
