/**
 * Effects Store
 * Manages visual effects state (shockwaves, debris, heat glow, etc.)
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
    DebrisCloud,
    DebrisParticle,
    ShockwaveEffect,
    HeatGlowEffect,
    TidalDisruptionEvent,
    ExplosionEffect,
    CollisionEventData,
    SupernovaEffect,
    RadialRaysEffect,
    CameraShakeEffect,
    GammaRayBurstEffect
} from '../types/effects';
import { createTimeoutRegistry } from '../utils/timeoutRegistry';
import { buildSupernovaVisualProfile } from '../utils/supernova';
import type { QualityLevel } from '../utils/deviceDetection';

const effectTimeouts = createTimeoutRegistry();

const randomUnitVector = () => {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    const z = Math.random() * 2 - 1;
    const length = Math.hypot(x, y, z) || 1;

    return {
        x: x / length,
        y: y / length,
        z: z / length
    };
};

interface EffectsStore {
    // Effect collections
    shockwaves: ShockwaveEffect[];
    heatGlows: HeatGlowEffect[];
    debrisClouds: DebrisCloud[];
    tidalDisruptions: TidalDisruptionEvent[];
    explosions: ExplosionEffect[];
    supernovas: SupernovaEffect[];
    radialRays: RadialRaysEffect[];
    cameraShakes: CameraShakeEffect[];
    gammaRayBursts: GammaRayBurstEffect[];

    // Actions - Shockwaves
    addShockwave: (
        position: { x: number; y: number; z: number },
        maxRadius: number,
        color?: string,
        duration?: number,
        asymmetry?: number,
        directionBias?: { x: number; y: number; z: number }
    ) => string;
    removeShockwave: (id: string) => void;

    // Actions - Heat Glow
    addHeatGlow: (
        bodyId: string,
        position: { x: number; y: number; z: number },
        radius: number,
        intensity?: number,
        duration?: number
    ) => string;
    removeHeatGlow: (id: string) => void;

    // Actions - Debris
    addDebrisCloud: (
        sourceBodyId: string,
        position: { x: number; y: number; z: number },
        velocity: { x: number; y: number; z: number },
        color: string,
        particleCount: number,
        baseSize: number,
        spreadSpeed: number
    ) => string;
    removeExpiredDebris: () => void;
    removeDebrisCloud: (id: string) => void;

    // Actions - Tidal Disruption
    addTidalDisruption: (
        bodyId: string,
        primaryId: string,
        position: { x: number; y: number; z: number },
        primaryPosition: { x: number; y: number; z: number },
        bodyRadius: number,
        bodyColor: string,
        primaryMass: number,
        duration?: number
    ) => string;
    removeTidalDisruption: (id: string) => void;

    // Actions - Explosions
    addExplosion: (
        position: { x: number; y: number; z: number },
        size: number,
        color?: string,
        particleCount?: number,
        duration?: number
    ) => string;
    removeExplosion: (id: string) => void;

    // Actions - Supernova
    addSupernova: (
        starId: string,
        position: { x: number; y: number; z: number },
        maxRadius: number,
        color?: string,
        intensity?: number,
        duration?: number,
        coreRadius?: number,
        haloRadius?: number,
        shellCount?: number,
        biasDirection?: { x: number; y: number; z: number }
    ) => string;
    removeSupernova: (id: string) => void;
    triggerSupernova: (
        starId: string,
        position: { x: number; y: number; z: number },
        starMass: number,
        starRadius: number,
        starColor: string
    ) => void;

    // Actions - Radial Rays
    addRadialRays: (
        position: { x: number; y: number; z: number },
        maxLength: number,
        color?: string,
        duration?: number,
        rayCount?: number,
        spread?: number,
        pulseSpeed?: number
    ) => string;
    removeRadialRays: (id: string) => void;

    // Actions - Camera Shake
    addCameraShake: (
        intensity: number,
        duration?: number,
        falloff?: 'linear' | 'exponential'
    ) => string;
    removeCameraShake: (id: string) => void;

    // Actions - Gamma-Ray Burst
    addGammaRayBurst: (
        position: { x: number; y: number; z: number },
        length: number,
        duration?: number,
        axis?: { x: number; y: number; z: number },
        width?: number,
        coreIntensity?: number
    ) => string;
    removeGammaRayBurst: (id: string) => void;

    // High-level action - Trigger collision effects
    triggerCollisionEffects: (data: CollisionEventData) => void;

    // Cleanup
    cleanup: () => void;
    removeExpiredEffects: () => void;
}

export const useEffectsStore = create<EffectsStore>((set, get) => ({
    shockwaves: [],
    heatGlows: [],
    debrisClouds: [],
    tidalDisruptions: [],
    explosions: [],
    supernovas: [],
    radialRays: [],
    cameraShakes: [],
    gammaRayBursts: [],

    // Shockwave actions
    addShockwave: (position, maxRadius, color = '#ffaa00', duration = 2000, asymmetry = 0, directionBias) => {
        const id = uuidv4();
        set(state => ({
            shockwaves: [...state.shockwaves, {
                id,
                position,
                startTime: performance.now(),
                maxRadius,
                color,
                duration,
                asymmetry,
                directionBias
            }]
        }));
        return id;
    },

    removeShockwave: (id) => {
        set(state => ({
            shockwaves: state.shockwaves.filter(s => s.id !== id)
        }));
    },

    // Heat Glow actions
    addHeatGlow: (bodyId, position, radius, intensity = 1.0, duration = 4000) => {
        const id = uuidv4();
        set(state => ({
            heatGlows: [...state.heatGlows, {
                id,
                bodyId,
                position,
                radius,
                startTime: performance.now(),
                duration,
                intensity
            }]
        }));
        return id;
    },

    removeHeatGlow: (id) => {
        set(state => ({
            heatGlows: state.heatGlows.filter(h => h.id !== id)
        }));
    },

    // Debris actions
    addDebrisCloud: (sourceBodyId, position, velocity, color, particleCount, baseSize, spreadSpeed) => {
        const id = uuidv4();
        const now = performance.now();
        const particles: DebrisParticle[] = [];

        // Box-Muller transform for Gaussian random numbers
        const gaussianRandom = (): number => {
            let u = 0, v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };

        for (let i = 0; i < particleCount; i++) {
            // Random direction on sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            // Maxwell-Boltzmann-like speed distribution
            // Most particles have speeds near the mean, with a tail toward higher speeds
            const gaussianSpeed = Math.abs(gaussianRandom());
            const speed = spreadSpeed * (0.5 + gaussianSpeed * 0.3); // Mean at spreadSpeed * 0.5

            // Direction vector
            const dx = Math.sin(phi) * Math.cos(theta);
            const dy = Math.sin(phi) * Math.sin(theta);
            const dz = Math.cos(phi);

            particles.push({
                id: uuidv4(),
                position: { ...position },
                velocity: {
                    x: velocity.x * 0.5 + dx * speed,
                    y: velocity.y * 0.5 + dy * speed,
                    z: velocity.z * 0.5 + dz * speed
                },
                size: baseSize * (0.2 + Math.random() * 0.8),
                color,
                createdAt: now,
                lifetime: 8000 + Math.random() * 12000, // 8-20 seconds
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 5,
                    y: (Math.random() - 0.5) * 5,
                    z: (Math.random() - 0.5) * 5
                },
                rotation: {
                    x: Math.random() * Math.PI * 2,
                    y: Math.random() * Math.PI * 2,
                    z: Math.random() * Math.PI * 2
                }
            });
        }

        set(state => ({
            debrisClouds: [...state.debrisClouds, {
                id,
                sourceBodyId,
                particles,
                createdAt: now
            }]
        }));

        return id;
    },
    removeExpiredDebris: () => {
        const now = performance.now();
        set(state => ({
            debrisClouds: state.debrisClouds
                .map(cloud => ({
                    ...cloud,
                    particles: cloud.particles.filter(p =>
                        now - p.createdAt < p.lifetime
                    )
                }))
                .filter(cloud => cloud.particles.length > 0)
        }));
    },

    removeDebrisCloud: (id) => {
        set(state => ({
            debrisClouds: state.debrisClouds.filter(c => c.id !== id)
        }));
    },

    // Tidal Disruption actions
    addTidalDisruption: (bodyId, primaryId, position, primaryPosition, bodyRadius, bodyColor, primaryMass, duration = 6000) => {
        const id = uuidv4();
        set(state => ({
            tidalDisruptions: [...state.tidalDisruptions, {
                id,
                bodyId,
                primaryId,
                position,
                primaryPosition,
                bodyRadius,
                bodyColor,
                primaryMass,
                startTime: performance.now(),
                duration
            }]
        }));
        return id;
    },

    removeTidalDisruption: (id) => {
        set(state => ({
            tidalDisruptions: state.tidalDisruptions.filter(t => t.id !== id)
        }));
    },

    // Explosion actions
    addExplosion: (position, size, color = '#ff6600', particleCount = 500, duration = 2000) => {
        const id = uuidv4();
        set(state => ({
            explosions: [...state.explosions, {
                id,
                position,
                startTime: performance.now(),
                duration,
                size,
                color,
                particleCount
            }]
        }));
        return id;
    },

    removeExplosion: (id) => {
        set(state => ({
            explosions: state.explosions.filter(e => e.id !== id)
        }));
    },

    // Supernova actions
    addSupernova: (
        starId,
        position,
        maxRadius,
        color = '#aaccff',
        intensity = 3.0,
        duration = 15000,
        coreRadius = maxRadius * 0.12,
        haloRadius = maxRadius * 0.2,
        shellCount = 3,
        biasDirection = { x: 0, y: 1, z: 0 }
    ) => {
        const id = uuidv4();
        set(state => ({
            supernovas: [...state.supernovas, {
                id,
                starId,
                position,
                startTime: performance.now(),
                duration,
                maxRadius,
                color,
                intensity,
                phase: 'brightening',
                coreRadius,
                haloRadius,
                shellCount,
                biasDirection
            }]
        }));
        return id;
    },

    removeSupernova: (id) => {
        set(state => ({
            supernovas: state.supernovas.filter(s => s.id !== id)
        }));
    },

    // Radial rays actions
    addRadialRays: (
        position,
        maxLength,
        color = '#ffffff',
        duration = 8000,
        rayCount = 12,
        spread = 0.6,
        pulseSpeed = 6
    ) => {
        const id = uuidv4();
        set(state => ({
            radialRays: [...state.radialRays, {
                id,
                position,
                startTime: performance.now(),
                duration,
                rayCount,
                maxLength,
                color,
                spread,
                pulseSpeed
            }]
        }));
        return id;
    },

    removeRadialRays: (id) => {
        set(state => ({
            radialRays: state.radialRays.filter(r => r.id !== id)
        }));
    },

    // Camera shake actions
    addCameraShake: (intensity, duration = 3000, falloff = 'exponential') => {
        const id = uuidv4();
        set(state => ({
            cameraShakes: [...state.cameraShakes, {
                id,
                startTime: performance.now(),
                duration,
                intensity,
                falloff
            }]
        }));
        return id;
    },

    removeCameraShake: (id) => {
        set(state => ({
            cameraShakes: state.cameraShakes.filter(c => c.id !== id)
        }));
    },

    // Gamma-ray burst actions
    addGammaRayBurst: (
        position,
        length,
        duration = 8000,
        axis = { x: 0, y: 1, z: 0 },
        width = length * 0.08,
        coreIntensity = 1.0
    ) => {
        const id = uuidv4();
        set(state => ({
            gammaRayBursts: [...state.gammaRayBursts, {
                id,
                position,
                startTime: performance.now(),
                duration,
                length,
                axis,
                width,
                coreIntensity
            }]
        }));
        return id;
    },

    removeGammaRayBurst: (id) => {
        set(state => ({
            gammaRayBursts: state.gammaRayBursts.filter(g => g.id !== id)
        }));
    },

    // High-level supernova trigger with complete visual sequence
    triggerSupernova: (starId, position, starMass, starRadius, starColor) => {
        const { addSupernova, addDebrisCloud, addExplosion, addRadialRays, addCameraShake, addGammaRayBurst } = get();

        // Get quality level and camera shake intensity from physics store
        // Accessing physicsStore from effectsStore (circular dependency handled at runtime)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const physicsState = typeof window !== 'undefined' && (window as any).__physicsStore?.getState?.();
        const qualityLevel = (physicsState?.qualityLevel || 'medium') as QualityLevel;
        const cameraShakeIntensity = physicsState?.cameraShakeIntensity ?? 1.0;
        const profile = buildSupernovaVisualProfile(starMass, qualityLevel);

        // Calculate explosion parameters based on star mass
        const explosionScale = Math.pow(starMass / 100000, 0.4);
        const shockwaveRadius = starRadius * 100 * explosionScale;
        const biasDirection = randomUnitVector();
        const mainExplosionParticles = Math.max(80, Math.floor(profile.debrisBudget * 0.22));
        const lateExplosionParticles = Math.max(40, Math.floor(profile.debrisBudget * 0.12));

        // Determine if this will form a black hole (very massive stars)
        const willFormBlackHole = profile.useJets;

        // 1. Persistent supernova core / halo / shell effect
        addSupernova(
            starId,
            position,
            shockwaveRadius,
            '#d9e6ff',
            3.4,
            15000,
            starRadius * profile.coreRadiusScale,
            starRadius * profile.haloRadiusScale,
            profile.shellCount,
            biasDirection
        );

        // 2. Early camera shock
        addCameraShake(
            3.0 * cameraShakeIntensity,
            2600,
            'exponential'
        );

        // 3. Shock breakout flash
        effectTimeouts.schedule(() => {
            addExplosion(
                position,
                starRadius * 3,
                '#ffffff',
                mainExplosionParticles,
                1100
            );
        }, 1800);

        // 4. Radial light burst
        effectTimeouts.schedule(() => {
            addRadialRays(
                position,
                shockwaveRadius * 1.2,
                '#ccddff',
                10000,
                profile.rayCount,
                profile.raySpread,
                profile.rayPulseSpeed
            );
        }, 2100);

        // 5. Secondary corona surge
        if (profile.useSecondaryGlow) {
            effectTimeouts.schedule(() => {
                addExplosion(
                    position,
                    starRadius * 2.4,
                    '#9dc8ff',
                    lateExplosionParticles,
                    2200
                );
            }, 2800);
        }

        // 6. Debris ejecta burst
        effectTimeouts.schedule(() => {
            const debrisCount = Math.min(Math.floor(starMass / 110) + 360, profile.debrisBudget);
            addDebrisCloud(
                starId,
                position,
                { x: 0, y: 0, z: 0 },
                starColor,
                debrisCount,
                starRadius * 0.2,
                starRadius * 2.4
            );
        }, 3200);

        // 7. Residual camera vibration
        effectTimeouts.schedule(() => {
            addCameraShake(
                1.4 * cameraShakeIntensity,
                2000,
                'linear'
            );
        }, 4200);

        // 8. Cooling envelope flare
        effectTimeouts.schedule(() => {
            addExplosion(
                position,
                starRadius * 4.2,
                '#ff8d5d',
                lateExplosionParticles,
                3200
            );
        }, 5400);

        // 9. Late asymmetric ejecta
        effectTimeouts.schedule(() => {
            const lateDebrisCount = Math.min(
                Math.floor(starMass / 150) + 150,
                Math.floor(profile.debrisBudget * 0.55)
            );
            addDebrisCloud(
                starId,
                position,
                { x: 0, y: 0, z: 0 },
                '#ffaa66',
                lateDebrisCount,
                starRadius * 0.15,
                starRadius * 1.6
            );
        }, 6800);

        // 10. Polar jets for black hole remnant
        if (willFormBlackHole) {
            effectTimeouts.schedule(() => {
                const jetLength = shockwaveRadius * 3;
                addGammaRayBurst(
                    position,
                    jetLength,
                    10000,
                    biasDirection,
                    starRadius * profile.gammaRayWidthScale,
                    profile.gammaRayCoreIntensity
                );
            }, 10800);
        }
    },

    // High-level collision effect trigger
    triggerCollisionEffects: (data) => {
        const { addShockwave, addHeatGlow, addDebrisCloud, addExplosion } = get();

        // 1. Main shockwave (orange/yellow)
        addShockwave(
            data.collisionPoint,
            data.smallerBodyRadius * 8,
            '#ffaa00',
            2000
        );

        // 2. Secondary shockwave (white, faster)
        effectTimeouts.schedule(() => {
            addShockwave(
                data.collisionPoint,
                data.smallerBodyRadius * 5,
                '#ffffff',
                1000
            );
        }, 100);

        // 3. Heat glow on the larger body
        addHeatGlow(
            data.largerBodyId,
            data.collisionPoint,
            data.smallerBodyRadius * 1.5,
            1.2,
            5000
        );

        // 4. Debris cloud
        const debrisCount = Math.min(Math.floor(data.combinedMass / 50) + 50, 800);
        addDebrisCloud(
            data.smallerBodyId,
            data.collisionPoint,
            { x: 0, y: 0, z: 0 },
            data.smallerBodyColor,
            debrisCount,
            data.smallerBodyRadius * 0.03,
            data.relativeVelocity * 0.3 + data.smallerBodyRadius * 0.2
        );

        // 5. Explosion flash
        addExplosion(
            data.collisionPoint,
            data.smallerBodyRadius * 2,
            '#ffff88',
            300,
            800
        );
    },

    // Remove all expired effects
    removeExpiredEffects: () => {
        const now = performance.now();
        const { removeExpiredDebris } = get();

        set(state => ({
            shockwaves: state.shockwaves.filter(s =>
                now - s.startTime < s.duration
            ),
            heatGlows: state.heatGlows.filter(h =>
                now - h.startTime < h.duration
            ),
            tidalDisruptions: state.tidalDisruptions.filter(t =>
                now - t.startTime < t.duration
            ),
            explosions: state.explosions.filter(e =>
                now - e.startTime < e.duration
            ),
            supernovas: state.supernovas.filter(s =>
                now - s.startTime < s.duration
            ),
            radialRays: state.radialRays.filter(r =>
                now - r.startTime < r.duration
            ),
            cameraShakes: state.cameraShakes.filter(c =>
                now - c.startTime < c.duration
            ),
            gammaRayBursts: state.gammaRayBursts.filter(g =>
                now - g.startTime < g.duration
            )
        }));

        removeExpiredDebris();
    },

    // Full cleanup
    cleanup: () => {
        effectTimeouts.clearAll();
        set({
            shockwaves: [],
            heatGlows: [],
            debrisClouds: [],
            tidalDisruptions: [],
            explosions: [],
            supernovas: [],
            radialRays: [],
            cameraShakes: [],
            gammaRayBursts: []
        });
    }
}));
