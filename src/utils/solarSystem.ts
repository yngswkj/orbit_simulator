import { Vector3 } from 'three';
import type { CelestialBody } from '../types/physics';
import { v4 as uuidv4 } from 'uuid';

// Physics Constants
// Accurate Ratios where Earth = 1.0
// Sun Mass = 333,000 * Earth

const SUN_MASS = 333000;

export const SOLAR_SYSTEM_DATA: Omit<CelestialBody, 'id'>[] = [
    {
        name: 'Sun',
        mass: SUN_MASS,
        radius: 3.0,
        position: new Vector3(0, 0, 0),
        velocity: new Vector3(0, 0, 0),
        color: '#ffdd00',
        texturePath: '/textures/sun_texture.png',
        isFixed: true,
    },
    {
        name: 'Mercury',
        mass: 0.055,
        radius: 0.08,
        position: new Vector3(10, 0, 0),
        velocity: new Vector3(0, 0, Math.sqrt(SUN_MASS / 10)),
        color: '#a1a1a1',
    },
    {
        name: 'Venus',
        mass: 0.815,
        radius: 0.12,
        position: new Vector3(15, 0, 0),
        velocity: new Vector3(0, 0, Math.sqrt(SUN_MASS / 15)),
        color: '#e3bb76',
    },
    {
        name: 'Earth',
        mass: 1.0,
        radius: 0.13,
        position: new Vector3(20, 0, 0),
        velocity: new Vector3(0, 0, Math.sqrt(SUN_MASS / 20)),
        color: '#22aaff',
        texturePath: '/textures/earth_texture.png',
    },
    {
        name: 'Mars',
        mass: 0.107,
        radius: 0.09,
        position: new Vector3(30, 0, 0),
        velocity: new Vector3(0, 0, Math.sqrt(SUN_MASS / 30)),
        color: '#ff4400',
    },
    {
        name: 'Jupiter',
        mass: 317.8,
        radius: 0.8,
        position: new Vector3(60, 0, 0),
        velocity: new Vector3(0, 0, Math.sqrt(SUN_MASS / 60)),
        color: '#d9a066',
    },
    {
        name: 'Saturn',
        mass: 95.2,
        radius: 0.7,
        position: new Vector3(100, 0, 0),
        velocity: new Vector3(0, 0, Math.sqrt(SUN_MASS / 100)),
        color: '#eaddb1',
    },
    {
        name: 'Uranus',
        mass: 14.5,
        radius: 0.4,
        position: new Vector3(180, 0, 0),
        velocity: new Vector3(0, 0, Math.sqrt(SUN_MASS / 180)),
        color: '#b2f0ff',
    },
    {
        name: 'Neptune',
        mass: 17.1,
        radius: 0.4,
        position: new Vector3(250, 0, 0),
        velocity: new Vector3(0, 0, Math.sqrt(SUN_MASS / 250)),
        color: '#3366ff',
    }
];

export const createSolarSystem = (): CelestialBody[] => {
    return SOLAR_SYSTEM_DATA.map(body => ({
        ...body,
        id: uuidv4()
    }));
};
