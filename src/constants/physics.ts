export const PHYSICS_CONSTANTS = {
    G: 1.0,
    SOFTENING_SQ: 0.25, // 0.5 * 0.5
    BASE_DT: 0.005, // Reduced from 0.01 for better stability
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
