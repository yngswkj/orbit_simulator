export const PHYSICS_CONSTANTS = {
    G: 1.0,
    SOFTENING_SQ: 0.25, // 0.5 * 0.5
    BASE_DT: 0.001, // Reverted to original value
    COLLISION_THRESHOLD: 0.8,
    ROCHE_LIMIT_COEFFICIENT: 2.44, // Rigid body Roche limit coefficient
} as const;

export const BUFFER_LIMITS = {
    MAX_BODIES: 20000,
    TRAIL_LENGTH: 500,
    PREDICTION_STEPS: 1200,
} as const;

export const GPU_CONFIG = {
    WORKGROUP_SIZE: 64,
    BYTES_PER_BODY: 32, // Simplified for now, actual struct alignments may vary in WGSL
} as const;

// Solar constants for habitable zone calculations
export const SOLAR_CONSTANTS = {
    SOLAR_MASS: 333000,        // Solar mass in simulation units (Earth mass = 1)
    SOLAR_LUMINOSITY: 1.0,     // Reference luminosity (Sun = 1)

    // Habitable zone boundaries (in AU, for solar luminosity = 1)
    HZ_INNER_AU: 0.95,         // Inner edge (too hot beyond this)
    HZ_OUTER_AU: 1.4,          // Outer edge (too cold beyond this)

    // Mass-Luminosity relation exponent for main sequence stars
    MASS_LUMINOSITY_EXPONENT: 3.5,
} as const;

// Effect constants
export const EFFECT_CONSTANTS = {
    // Particle counts
    MAX_TIDAL_PARTICLES: 2000,
    MAX_DEBRIS_PARTICLES: 2000,
    MAX_EXPLOSION_PARTICLES: 200,

    // Physics parameters
    PARTICLE_DRAG: 0.995,
    DEBRIS_LIFETIME_MIN: 8000,  // ms
    DEBRIS_LIFETIME_MAX: 20000, // ms

    // Visual parameters
    GAMMA_CORRECTION: 2.2,
    FRAME_TIME: 0.016, // Approximate frame time (60 FPS)
} as const;
