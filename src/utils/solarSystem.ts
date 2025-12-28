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

    // Start at 12 o'clock (Negative Z axis)
    // Applying -90 degree rotation around Y axis to previous (X-axis) setup
    const position = new Vector3(0, 0, -distance);

    // Velocity is perpendicular. For CCW orbit, at -Z (12h), velocity points Left (-X).
    // Inclination tilt was in Y (rotating around X axis). 
    // After migrating to Z-axis start, the node line is still X-axis?
    // Let's just rotate the previous velocity vector (0, -sin, cos) by -90 deg around Y.
    // V_old = (0, -v*sin, v*cos)
    // V_new_x = V_old_z * sin(-90) + V_old_x * cos(-90) = v*cos * (-1) = -v*cos
    // V_new_y = V_old_y = -v*sin
    // V_new_z = V_old_z * cos(-90) - V_old_x * sin(-90) = 0
    // So New Vel = (-speed * cos, -speed * sin, 0)

    // Actually, let's simplify.
    // If flat orbit: Pos(0,0,-d), Vel(-v,0,0).
    // With inclination 'inc':
    // Usually inclination is rotation around the line of nodes.
    // If we start at -Z, and line of nodes is X-axis.
    // Then we are at 90 degrees/max latitude.
    // Position z should be affected?
    // No, if we rotate the whole system, the node line rotates too.
    // That's fine. We simply want the "visual start" to be 12h.

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
        axialTilt: 7.25,
        rotationSpeed: 0.04, // 25 days (1/25)
    },
    {
        name: 'Mercury',
        mass: 0.055,
        radius: 0.08,
        ...getOrbitState(10, 7.0),
        color: '#a1a1a1',
        texturePath: 'textures/mercury_texture.png',
        axialTilt: 0.03,
        rotationSpeed: 0.017, // 58 days (1/58)
    },
    {
        name: 'Venus',
        mass: 0.815,
        radius: 0.12,
        ...getOrbitState(15, 3.4),
        color: '#e3bb76',
        texturePath: 'textures/venus_texture.png',
        axialTilt: 177.3,
        rotationSpeed: -0.004, // 243 days (Retrograde)
    },
    {
        name: 'Earth',
        mass: 1.0,
        radius: 0.13,
        ...getOrbitState(20, 0.0),
        color: '#22aaff',
        texturePath: 'textures/earth_texture.png',
        axialTilt: 23.4,
        rotationSpeed: 1.0, // 1 day
    },
    {
        name: 'Mars',
        mass: 0.107,
        radius: 0.09,
        ...getOrbitState(30, 1.85),
        color: '#ff4400',
        texturePath: 'textures/mars_texture.png',
        axialTilt: 25.2,
        rotationSpeed: 0.97, // 24.6 hours
    },
    {
        name: 'Jupiter',
        mass: 317.8,
        radius: 0.8,
        ...getOrbitState(60, 1.3),
        color: '#d9a066',
        texturePath: 'textures/jupiter_texture.png',
        axialTilt: 3.1,
        rotationSpeed: 2.4, // 9.9 hours
    },
    {
        name: 'Saturn',
        mass: 95.2,
        radius: 0.7,
        ...getOrbitState(100, 2.49),
        color: '#eaddb1',
        texturePath: 'textures/saturn_texture.png',
        axialTilt: 26.7,
        rotationSpeed: 2.2, // 10.7 hours
    },
    {
        name: 'Uranus',
        mass: 14.5,
        radius: 0.4,
        ...getOrbitState(180, 0.77),
        color: '#b2f0ff',
        texturePath: 'textures/uranus_texture.png',
        axialTilt: 97.8,
        rotationSpeed: -1.4, // 17 hours (Retrograde)
    },
    {
        name: 'Neptune',
        mass: 17.1,
        radius: 0.4,
        ...getOrbitState(250, 1.77),
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
