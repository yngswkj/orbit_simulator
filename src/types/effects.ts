/**
 * Effect system type definitions
 */

// Debris particle for collision effects
export interface DebrisParticle {
    id: string;
    position: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
    size: number;
    color: string;
    createdAt: number;
    lifetime: number; // ms
    rotationSpeed: { x: number; y: number; z: number };
}

// Collection of debris particles from a single event
export interface DebrisCloud {
    id: string;
    sourceBodyId: string;
    particles: DebrisParticle[];
    createdAt: number;
}

// Shockwave effect from collision
export interface ShockwaveEffect {
    id: string;
    position: { x: number; y: number; z: number };
    startTime: number;
    maxRadius: number;
    color: string;
    duration: number;
}

// Heat glow effect after collision/merger
export interface HeatGlowEffect {
    id: string;
    bodyId: string;
    position: { x: number; y: number; z: number };
    radius: number;
    startTime: number;
    duration: number;
    intensity: number;
}

// Tidal disruption event (Roche limit breach)
export interface TidalDisruptionEvent {
    id: string;
    bodyId: string;
    primaryId: string;
    position: { x: number; y: number; z: number };
    primaryPosition: { x: number; y: number; z: number };
    bodyRadius: number;
    bodyColor: string;
    primaryMass: number; // Mass of primary body for tidal force calculation
    startTime: number;
    duration: number;
}

// Explosion/flash effect
export interface ExplosionEffect {
    id: string;
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
    size: number;
    color: string;
    particleCount: number;
}

// Collision event data for triggering effects
export interface CollisionEventData {
    body1Id: string;
    body2Id: string;
    collisionPoint: { x: number; y: number; z: number };
    relativeVelocity: number;
    combinedMass: number;
    largerBodyId: string;
    smallerBodyId: string;
    smallerBodyColor: string;
    smallerBodyRadius: number;
}

// Supernova explosion effect
export interface SupernovaEffect {
    id: string;
    starId: string;
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
    maxRadius: number;
    color: string;
    intensity: number;
    phase: 'brightening' | 'explosion' | 'fading'; // Current phase of the supernova
}

// Radial rays effect
export interface RadialRaysEffect {
    id: string;
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
    rayCount: number;
    maxLength: number;
    color: string;
}

// Camera shake effect
export interface CameraShakeEffect {
    id: string;
    startTime: number;
    duration: number;
    intensity: number;
    falloff: 'linear' | 'exponential';
}

// Gamma-ray burst effect
export interface GammaRayBurstEffect {
    id: string;
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
    length: number;
}
