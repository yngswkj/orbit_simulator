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
import { SupernovaEffect } from './SupernovaEffect';
import { RadialRaysEffect } from './RadialRaysEffect';
import { CameraShakeEffect } from './CameraShakeEffect';
import { GammaRayBurst } from './GammaRayBurst';

export const EffectsLayer: React.FC = () => {
    const shockwaves = useEffectsStore(state => state.shockwaves);
    const heatGlows = useEffectsStore(state => state.heatGlows);
    const explosions = useEffectsStore(state => state.explosions);
    const supernovas = useEffectsStore(state => state.supernovas);
    const radialRays = useEffectsStore(state => state.radialRays);
    const cameraShakes = useEffectsStore(state => state.cameraShakes);
    const gammaRayBursts = useEffectsStore(state => state.gammaRayBursts);

    const removeShockwave = useEffectsStore(state => state.removeShockwave);
    const removeHeatGlow = useEffectsStore(state => state.removeHeatGlow);
    const removeExplosion = useEffectsStore(state => state.removeExplosion);
    const removeSupernova = useEffectsStore(state => state.removeSupernova);
    const removeRadialRays = useEffectsStore(state => state.removeRadialRays);
    const removeCameraShake = useEffectsStore(state => state.removeCameraShake);
    const removeGammaRayBurst = useEffectsStore(state => state.removeGammaRayBurst);
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

            {/* Supernovas */}
            {supernovas.map(sn => (
                <SupernovaEffect
                    key={sn.id}
                    position={sn.position}
                    startTime={sn.startTime}
                    duration={sn.duration}
                    maxRadius={sn.maxRadius}
                    color={sn.color}
                    intensity={sn.intensity}
                    onComplete={() => removeSupernova(sn.id)}
                />
            ))}

            {/* Radial Rays */}
            {radialRays.map(rr => (
                <RadialRaysEffect
                    key={rr.id}
                    position={rr.position}
                    startTime={rr.startTime}
                    duration={rr.duration}
                    rayCount={rr.rayCount}
                    maxLength={rr.maxLength}
                    color={rr.color}
                    onComplete={() => removeRadialRays(rr.id)}
                />
            ))}

            {/* Camera Shakes */}
            {cameraShakes.map(cs => (
                <CameraShakeEffect
                    key={cs.id}
                    startTime={cs.startTime}
                    duration={cs.duration}
                    intensity={cs.intensity}
                    falloff={cs.falloff}
                    onComplete={() => removeCameraShake(cs.id)}
                />
            ))}

            {/* Gamma-Ray Bursts */}
            {gammaRayBursts.map(grb => (
                <GammaRayBurst
                    key={grb.id}
                    position={grb.position}
                    startTime={grb.startTime}
                    duration={grb.duration}
                    length={grb.length}
                    onComplete={() => removeGammaRayBurst(grb.id)}
                />
            ))}

            {/* Debris */}
            <DebrisRenderer />
        </group>
    );
};
