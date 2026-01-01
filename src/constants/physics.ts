export const PHYSICS_CONSTANTS = {
    G: 1.0,
    SOFTENING_SQ: 0.25, // 0.5 * 0.5
    BASE_DT: 0.001, // Reverted to original value
    COLLISION_THRESHOLD: 0.8,
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

<<<<<<< HEAD
// Solar constants for habitable zone calculations
export const SOLAR_CONSTANTS = {
    SOLAR_MASS: 333000,        // Solar mass in simulation units (Earth mass = 1)
    export const SOLAR_CONSTANTS = {
        SOLAR_MASS: 333000, // Earth masses
        SOLAR_LUMINOSITY: 3.828e26, // Watts
        // Habitable zone boundaries approx (in AU)
        HZ_INNER_AU: 0.95,
        HZ_OUTER_AU: 1.37
    } as const;
