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
    SupernovaEffect
} from '../types/effects';

interface EffectsStore {
    // Effect collections
    shockwaves: ShockwaveEffect[];
    heatGlows: HeatGlowEffect[];
    debrisClouds: DebrisCloud[];
    tidalDisruptions: TidalDisruptionEvent[];
    explosions: ExplosionEffect[];
    supernovas: SupernovaEffect[];

    // Actions - Shockwaves
    addShockwave: (
        position: { x: number; y: number; z: number },
        maxRadius: number,
        color?: string,
        duration?: number
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
    updateDebris: (dt: number) => void;
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
        duration?: number
    ) => string;
    removeSupernova: (id: string) => void;
    triggerSupernova: (
        starId: string,
        position: { x: number; y: number; z: number },
        starMass: number,
        starRadius: number,
        starColor: string
    ) => void;

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

    // Shockwave actions
    addShockwave: (position, maxRadius, color = '#ffaa00', duration = 2000) => {
        const id = uuidv4();
        set(state => ({
            shockwaves: [...state.shockwaves, {
                id,
                position,
                startTime: performance.now(),
                maxRadius,
                color,
                duration
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

        for (let i = 0; i < particleCount; i++) {
            // Random direction on sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            // Speed varies
            const speed = spreadSpeed * (0.3 + Math.random() * 0.7);

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

    updateDebris: (dt) => {
        set(state => ({
            debrisClouds: state.debrisClouds.map(cloud => ({
                ...cloud,
                particles: cloud.particles.map(p => ({
                    ...p,
                    position: {
                        x: p.position.x + p.velocity.x * dt,
                        y: p.position.y + p.velocity.y * dt,
                        z: p.position.z + p.velocity.z * dt
                    },
                    // Gradual slowdown (drag effect)
                    velocity: {
                        x: p.velocity.x * 0.998,
                        y: p.velocity.y * 0.998,
                        z: p.velocity.z * 0.998
                    }
                }))
            }))
        }));
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
    addSupernova: (starId, position, maxRadius, color = '#aaccff', intensity = 3.0, duration = 15000) => {
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
                phase: 'brightening'
            }]
        }));
        return id;
    },

    removeSupernova: (id) => {
        set(state => ({
            supernovas: state.supernovas.filter(s => s.id !== id)
        }));
    },

    // High-level supernova trigger with complete visual sequence
    triggerSupernova: (starId, position, starMass, starRadius, starColor) => {
        const { addSupernova, addShockwave, addDebrisCloud, addExplosion } = get();

        // Calculate explosion parameters based on star mass
        const explosionScale = Math.pow(starMass / 100000, 0.4); // Scale with mass
        const shockwaveRadius = starRadius * 100 * explosionScale;

        // 1. Add main supernova effect (brightening -> explosion -> fading)
        addSupernova(
            starId,
            position,
            shockwaveRadius,
            '#aaccff', // Blue-white supernova color
            3.0,
            15000 // 15 second total duration
        );

        // 2. Initial brightening flash (very bright, short duration)
        setTimeout(() => {
            addExplosion(
                position,
                starRadius * 3,
                '#ffffff',
                100,
                500
            );
        }, 2000); // After 2s brightening phase

        // 3. Main explosion shockwave (blue-white)
        setTimeout(() => {
            addShockwave(
                position,
                shockwaveRadius,
                '#88bbff',
                8000
            );
        }, 2500);

        // 4. Secondary shockwave (faster, brighter)
        setTimeout(() => {
            addShockwave(
                position,
                shockwaveRadius * 0.7,
                '#ffffff',
                5000
            );
        }, 3000);

        // 5. Debris ejection (stellar material)
        setTimeout(() => {
            const debrisCount = Math.min(Math.floor(starMass / 100) + 200, 1500);
            addDebrisCloud(
                starId,
                position,
                { x: 0, y: 0, z: 0 },
                starColor,
                debrisCount,
                starRadius * 0.2,
                starRadius * 2.0 // High-speed ejecta
            );
        }, 3500);

        // 6. Outer shock front (red/orange - hydrogen emission)
        setTimeout(() => {
            addShockwave(
                position,
                shockwaveRadius * 1.5,
                '#ff6633',
                10000
            );
        }, 5000);
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
        setTimeout(() => {
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
            )
        }));

        removeExpiredDebris();
    },

    // Full cleanup
    cleanup: () => {
        set({
            shockwaves: [],
            heatGlows: [],
            debrisClouds: [],
            tidalDisruptions: [],
            explosions: [],
            supernovas: []
        });
    }
}));
