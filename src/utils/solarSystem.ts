import { Vector3 } from 'three';
import type { CelestialBody } from '../types/physics';
import { v4 as uuidv4 } from 'uuid';

// Physics Constants
// Accurate Ratios where Earth = 1.0
// Sun Mass = 333,000 * Earth

const SUN_MASS = 333000;

// Distance Scale Constants
// COMPRESSED: Standard "Normal" view (1 AU = 50 units) - Was 20
// REALISTIC: Expanded view (1 AU = 200 units) - Was 50
export const DISTANCE_SCALES = {
    COMPRESSED: {
        AU_UNIT: 50,
    },
    REALISTIC: {
        AU_UNIT: 200,
    }
} as const;

// Scale factor for converting between compressed and realistic distances
export const DISTANCE_SCALE_FACTOR = DISTANCE_SCALES.REALISTIC.AU_UNIT / DISTANCE_SCALES.COMPRESSED.AU_UNIT; // 4.0

// Helper to calculate initial state with inclination
// Distance is now in AU
const getOrbitState = (distanceAU: number, inclinationDeg: number) => {
    // Convert AU to Simulation Units based on "Compressed" (Default) scale
    const distanceSim = distanceAU * DISTANCE_SCALES.COMPRESSED.AU_UNIT;

    const speed = Math.sqrt(SUN_MASS / distanceSim);
    const incRad = (inclinationDeg * Math.PI) / 180;

    const position = new Vector3(0, 0, -distanceSim);

    const velocity = new Vector3(
        -speed * Math.cos(incRad),
        -speed * Math.sin(incRad),
        0
    );

    return { position, velocity };
};

// Physics are calibrated such that 1 Simulation Unit approx equals 1 Earth Year (due to G, Mass, Dist scaling).
// Rotation Speed is in Radians per Simulation Unit.
// Earth: 1 rotation / day = 365.25 rotations / year
// Omega = 365.25 * 2PI ~= 2294 rad/unit

export const SOLAR_SYSTEM_DATA: Omit<CelestialBody, 'id'>[] = [
    {
        name: 'Sun',
        mass: SUN_MASS,
        radius: 3.0,
        position: new Vector3(0, 0, 0),
        velocity: new Vector3(0, 0, 0),
        color: '#ffdd00',
        texturePath: 'textures/sun_texture.png',
        isFixed: true,
        isStar: true,
        axialTilt: 7.25,
        rotationSpeed: 0.04, // 25 days (1/25)
    },
    {
        name: 'Mercury',
        mass: 0.055,
        radius: 0.08,
        ...getOrbitState(0.39, 7.0), // 0.39 AU
        color: '#a1a1a1',
        texturePath: 'textures/mercury_texture.png',
        axialTilt: 0.03,
        rotationSpeed: 0.017, // 58 days (1/58)
    },
    {
        name: 'Venus',
        mass: 0.815,
        radius: 0.12,
        ...getOrbitState(0.72, 3.4), // 0.72 AU
        color: '#e3bb76',
        texturePath: 'textures/venus_texture.png',
        axialTilt: 177.3,
        rotationSpeed: -0.004, // 243 days (Retrograde)
    },
    {
        name: 'Earth',
        mass: 1.0,
        radius: 0.13,
        ...getOrbitState(1.0, 0.0), // 1.0 AU
        color: '#22aaff',
        texturePath: 'textures/earth_texture.png',
        axialTilt: 23.4,
        rotationSpeed: 1.0, // 1 day
    },
    {
        name: 'Mars',
        mass: 0.107,
        radius: 0.09,
        ...getOrbitState(1.52, 1.85), // 1.52 AU
        color: '#ff4400',
        texturePath: 'textures/mars_texture.png',
        axialTilt: 25.2,
        rotationSpeed: 0.97, // 24.6 hours
    },
    {
        name: 'Jupiter',
        mass: 317.8,
        radius: 0.8,
        ...getOrbitState(5.2, 1.3), // 5.2 AU
        color: '#d9a066',
        texturePath: 'textures/jupiter_texture.png',
        axialTilt: 3.1,
        rotationSpeed: 2.4, // 9.9 hours
    },
    {
        name: 'Saturn',
        mass: 95.2,
        radius: 0.7,
        ...getOrbitState(9.5, 2.49), // 9.5 AU
        color: '#eaddb1',
        texturePath: 'textures/saturn_texture.png',
        axialTilt: 26.7,
        rotationSpeed: 2.2, // 10.7 hours
    },
    {
        name: 'Uranus',
        mass: 14.5,
        radius: 0.4,
        ...getOrbitState(19.2, 0.77), // 19.2 AU
        color: '#b2f0ff',
        texturePath: 'textures/uranus_texture.png',
        axialTilt: 97.8,
        rotationSpeed: -1.4, // 17 hours (Retrograde)
    },
    {
        name: 'Neptune',
        mass: 17.1,
        radius: 0.4,
        ...getOrbitState(30.1, 1.77), // 30.1 AU
        color: '#3366ff',
        texturePath: 'textures/neptune_texture.png',
        axialTilt: 28.3,
        rotationSpeed: 1.5, // 16 hours
    }
];

export const createSolarSystem = (): CelestialBody[] => {
    return SOLAR_SYSTEM_DATA.map(body => ({
        ...body,
        id: uuidv4()
    }));
};
