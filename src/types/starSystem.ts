import type { CelestialBody } from './physics';

export type StarSystemMode = 'stable' | 'chaotic';

export type StarSystemCategory = 'classic' | 'multi-star' | 'choreography' | 'catastrophic';

export interface StarSystemModeConfig {
    id: StarSystemMode;
    name: string;
    nameJa: string;
    description: string;
    descriptionJa: string;
}

export interface CameraConfig {
    position: [number, number, number];
    target: [number, number, number];
}

export interface StarSystemPreset {
    id: string;
    name: string;
    nameJa: string;
    description: string;
    descriptionJa: string;
    category: StarSystemCategory;

    // Initial camera configuration (default)
    initialCamera: CameraConfig;

    // Optional: Mode-specific camera overrides
    getCameraForMode?: (mode: StarSystemMode) => CameraConfig;

    // Mode configurations (for systems with multiple modes like Three-Body)
    modes?: StarSystemModeConfig[];

    // Creates body data (without IDs) for the system
    createBodies: (mode?: StarSystemMode) => Omit<CelestialBody, 'id'>[];
}
