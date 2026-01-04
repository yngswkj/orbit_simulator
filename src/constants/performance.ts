/**
 * Performance Constants by Quality Level
 * Defines particle counts, geometry detail, and rendering settings
 */

import type { QualityLevel } from '../utils/deviceDetection';

export interface PerformanceConfig {
    // Particle counts
    accretionDiskParticles: number;
    maxDebrisParticles: number;
    maxExplosionParticles: number;
    maxTidalParticles: number;

    // Trail settings
    trailRecentPoints: number;
    trailCompressedPoints: number;
    trailCompressionRatio: number;

    // Starfield
    starfieldSegments: [number, number]; // [width, height]
    starfieldFBMOctaves: number;
    starfieldRadius: number;

    // Rendering
    pixelRatioMultiplier: number; // Multiply devicePixelRatio
    shadowsEnabled: boolean;
    postProcessingEnabled: boolean;

    // Physics
    maxPredictionSteps: number;

    // Effects
    enableAccretionDisk: boolean;
    enableStarfield: boolean;
    enableGlow: boolean;
    enablePostProcessing: boolean;
}

export const PERFORMANCE_CONFIGS: Record<QualityLevel, PerformanceConfig> = {
    low: {
        // Particle counts (heavily reduced)
        accretionDiskParticles: 5000,
        maxDebrisParticles: 500,
        maxExplosionParticles: 50,
        maxTidalParticles: 500,

        // Trail settings (reduced)
        trailRecentPoints: 30,
        trailCompressedPoints: 60,
        trailCompressionRatio: 6,

        // Starfield (minimal)
        starfieldSegments: [24, 24],
        starfieldFBMOctaves: 2,
        starfieldRadius: 30000,

        // Rendering (reduced resolution)
        pixelRatioMultiplier: 0.75,
        shadowsEnabled: false,
        postProcessingEnabled: false,

        // Physics
        maxPredictionSteps: 600,

        // Effects
        enableAccretionDisk: true,
        enableStarfield: true,
        enableGlow: false,
        enablePostProcessing: false,
    },

    medium: {
        // Particle counts (moderate)
        accretionDiskParticles: 15000,
        maxDebrisParticles: 1000,
        maxExplosionParticles: 100,
        maxTidalParticles: 1000,

        // Trail settings
        trailRecentPoints: 45,
        trailCompressedPoints: 90,
        trailCompressionRatio: 5,

        // Starfield
        starfieldSegments: [32, 32],
        starfieldFBMOctaves: 3,
        starfieldRadius: 35000,

        // Rendering
        pixelRatioMultiplier: 1.0,
        shadowsEnabled: false,
        postProcessingEnabled: false,

        // Physics
        maxPredictionSteps: 900,

        // Effects
        enableAccretionDisk: true,
        enableStarfield: true,
        enableGlow: true,
        enablePostProcessing: false,
    },

    high: {
        // Particle counts (full quality)
        accretionDiskParticles: 30000,
        maxDebrisParticles: 2000,
        maxExplosionParticles: 200,
        maxTidalParticles: 2000,

        // Trail settings
        trailRecentPoints: 60,
        trailCompressedPoints: 120,
        trailCompressionRatio: 4,

        // Starfield
        starfieldSegments: [64, 64],
        starfieldFBMOctaves: 4,
        starfieldRadius: 40000,

        // Rendering
        pixelRatioMultiplier: 1.0,
        shadowsEnabled: true,
        postProcessingEnabled: true,

        // Physics
        maxPredictionSteps: 1200,

        // Effects
        enableAccretionDisk: true,
        enableStarfield: true,
        enableGlow: true,
        enablePostProcessing: true,
    },

    // Auto will be resolved to one of the above based on device detection
    auto: {
        accretionDiskParticles: 15000,
        maxDebrisParticles: 1000,
        maxExplosionParticles: 100,
        maxTidalParticles: 1000,
        trailRecentPoints: 45,
        trailCompressedPoints: 90,
        trailCompressionRatio: 5,
        starfieldSegments: [32, 32],
        starfieldFBMOctaves: 3,
        starfieldRadius: 35000,
        pixelRatioMultiplier: 1.0,
        shadowsEnabled: false,
        postProcessingEnabled: false,
        maxPredictionSteps: 900,
        enableAccretionDisk: true,
        enableStarfield: true,
        enableGlow: true,
        enablePostProcessing: false,
    },
};

/**
 * Get performance config for a given quality level
 * If 'auto', returns recommended config based on device
 */
export const getPerformanceConfig = (quality: QualityLevel): PerformanceConfig => {
    if (quality === 'auto') {
        // Will be resolved by deviceDetection.recommendQualityLevel()
        // For now, return medium as fallback
        return PERFORMANCE_CONFIGS.medium;
    }
    return PERFORMANCE_CONFIGS[quality];
};
