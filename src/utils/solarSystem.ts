import { Vector3 } from 'three';
import type { CelestialBody } from '../types/physics';
import { v4 as uuidv4 } from 'uuid';

// Physics Constants
// Accurate Ratios where Earth = 1.0
// Sun Mass = 333,000 * Earth

const SUN_MASS = 333000;

// Helper to calculate initial state with inclination
const getOrbitState = (distance: number, inclinationDeg: number) => {
    const speed = Math.sqrt(SUN_MASS / distance);
    const incRad = (inclinationDeg * Math.PI) / 180;

    // Start at Ascending Node (on X-axis) for simplicity
    // Position is just along X
    const position = new Vector3(distance, 0, 0);

    // Velocity is perpendicular to position (tangential)
    // In flat plane (XZ), velocity is (0, 0, speed)
    // Apply inclination by rotating velocity vector around the X-axis
    // (Since the node line is the X-axis, we tilt the plane around it)
    const velocity = new Vector3(0, -speed * Math.sin(incRad), speed * Math.cos(incRad));

    return { position, velocity };
};

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
    },
    {
        name: 'Mercury',
        mass: 0.055,
        radius: 0.08,
        ...getOrbitState(10, 7.0),
        color: '#a1a1a1',
        texturePath: 'textures/mercury_texture.png',
    },
    {
        name: 'Venus',
        mass: 0.815,
        radius: 0.12,
        ...getOrbitState(15, 3.4),
        color: '#e3bb76',
        texturePath: 'textures/venus_texture.png',
    },
    {
        name: 'Earth',
        mass: 1.0,
        radius: 0.13,
        ...getOrbitState(20, 0.0),
        color: '#22aaff',
        texturePath: 'textures/earth_texture.png',
    },
    {
        name: 'Mars',
        mass: 0.107,
        radius: 0.09,
        ...getOrbitState(30, 1.85),
        color: '#ff4400',
        texturePath: 'textures/mars_texture.png',
    },
    {
        name: 'Jupiter',
        mass: 317.8,
        radius: 0.8,
        ...getOrbitState(60, 1.3),
        color: '#d9a066',
        texturePath: 'textures/jupiter_texture.png',
    },
    {
        name: 'Saturn',
        mass: 95.2,
        radius: 0.7,
        ...getOrbitState(100, 2.49),
        color: '#eaddb1',
        texturePath: 'textures/saturn_texture.png',
    },
    {
        name: 'Uranus',
        mass: 14.5,
        radius: 0.4,
        ...getOrbitState(180, 0.77),
        color: '#b2f0ff',
        texturePath: 'textures/uranus_texture.png',
    },
    {
        name: 'Neptune',
        mass: 17.1,
        radius: 0.4,
        ...getOrbitState(250, 1.77),
        color: '#3366ff',
        texturePath: 'textures/neptune_texture.png',
    }
];

export const createSolarSystem = (): CelestialBody[] => {
    return SOLAR_SYSTEM_DATA.map(body => ({
        ...body,
        id: uuidv4()
    }));
};
