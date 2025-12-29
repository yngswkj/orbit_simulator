import { Vector3 } from 'three';
import { v4 as uuidv4 } from 'uuid';
import type { CelestialBody } from '../types/physics';
import type { StarSystemPreset, StarSystemMode } from '../types/starSystem';
import { SOLAR_SYSTEM_DATA } from './solarSystem';

// ============================================
// SOLAR SYSTEM
// ============================================

export const SOLAR_SYSTEM: StarSystemPreset = {
    id: 'solar-system',
    name: 'Solar System',
    nameJa: '太陽系',
    description: 'Our home solar system with 8 planets orbiting the Sun.',
    descriptionJa: '太陽を中心に8つの惑星が周回する私たちの太陽系。',
    category: 'classic',
    initialCamera: {
        position: [0, 25, 50],
        target: [0, 0, 0]
    },
    createBodies: () => SOLAR_SYSTEM_DATA
};

// ============================================
// THREE-BODY SYSTEM (三体問題)
// ============================================

const SUN_MASS = 333000;

export const THREE_BODY_SYSTEM: StarSystemPreset = {
    id: 'three-body',
    name: 'Three-Body Problem',
    nameJa: '三体問題',
    description: 'Three stars in chaotic gravitational dance. Inspired by the novel "The Three-Body Problem".',
    descriptionJa: '3つの恒星がカオス的な重力相互作用を行う。小説「三体」にインスパイア。',
    category: 'multi-star',
    initialCamera: {
        position: [-100, 60, 0],
        target: [0, 0, 0]
    },
    getCameraForMode: (mode) => {
        if (mode === 'chaotic') {
            // Chaotic mode: Camera far enough to see Trisolaris at ~200-250 units
            return {
                position: [0, 350, 400],
                target: [0, 0, 0]
            };
        }
        // Stable mode: Closer view of the hierarchical system
        return {
            position: [-100, 60, 0],
            target: [0, 0, 0]
        };
    },
    modes: [
        {
            id: 'stable',
            name: 'Era of Stability',
            nameJa: '恒紀',
            description: 'A scientifically stable hierarchical triple system. Trisolaris orbits Star A safely.',
            descriptionJa: '科学的に安定した階層的三連星。Trisolarisは主星Aの周りを安全に周回する。'
        },
        {
            id: 'chaotic',
            name: 'Chaotic Era',
            nameJa: '乱紀',
            description: 'Unpredictable stellar movements with extreme gravitational chaos.',
            descriptionJa: '予測不能な恒星の動きと極端な重力カオス。'
        }
    ],
    createBodies: (mode: StarSystemMode = 'stable') => {
        // Alpha Centauri inspired masses
        const STAR_A_MASS = SUN_MASS * 1.1;   // Yellow star (G-type)
        const STAR_B_MASS = SUN_MASS * 0.9;   // Orange star (K-type)
        const STAR_C_MASS = SUN_MASS * 0.12;  // Red dwarf (M-type)
        const INNER_MASS = STAR_A_MASS + STAR_B_MASS;
        const TOTAL_STAR_MASS = INNER_MASS + STAR_C_MASS;

        // Scaling factor for "Normal" mode (approx 2x previous)
        const SCALE = 2.0;

        // Helper to resolve texture path with base URL
        const getTexture = (filename: string) => `${import.meta.env.BASE_URL}textures/${filename}`;

        if (mode === 'stable') {
            // Hierarchical Triple Configuration (Legacy of Alpha Centauri)
            // A and B form a close binary
            // C orbits the A-B center of mass from far away

            const abDistance = 25 * SCALE; // Close binary separation (was 25 -> 50)
            const cDistance = 120 * SCALE; // Distant third star (was 120 -> 240)

            // 1. Calculate A-B Binary Orbits
            // Center of mass is at (0,0,0) for the A-B system initially
            const distA = abDistance * (STAR_B_MASS / INNER_MASS);
            const distB = abDistance * (STAR_A_MASS / INNER_MASS);

            // Precise circular velocity: v = sqrt(G*M_other / r) ? No, v_orbit = sqrt(G*M_total / r) relative.
            // Individual vA = v_rel * (M_B / M_tot)
            // Velocity scales with 1/sqrt(SCALE)
            const vRel = Math.sqrt(INNER_MASS / abDistance);
            const speedA = vRel * (STAR_B_MASS / INNER_MASS);
            const speedB = vRel * (STAR_A_MASS / INNER_MASS);

            // 2. Calculate C's Orbit around AB Center of Mass
            // C is at +cDistance, AB-CoM is at -distABCoM
            // M_C vs M_AB.
            const distC = cDistance * (INNER_MASS / TOTAL_STAR_MASS);
            const distABCoM = cDistance * (STAR_C_MASS / TOTAL_STAR_MASS); // Very small displacement for AB pair

            const speedOuter = Math.sqrt(TOTAL_STAR_MASS / cDistance);
            const speedC = speedOuter * (INNER_MASS / TOTAL_STAR_MASS);
            const speedABSystem = speedOuter * (STAR_C_MASS / TOTAL_STAR_MASS);

            // 3. Trisolaris Orbit (Around Star A)
            // Hill Sphere check: r_hill ≈ a * (m/3M)^(1/3)
            // For A in AB binary: a=25, m=A, M=B. r_hill ~ 25 * (1.1/2.7)^(1/3) ~ 18.
            // Safety: < 1/2 or 1/3 Hill radius. 6 is safe.
            const planetOrbitRadius = 7 * SCALE; // (was 7 -> 14)
            const planetSpeed = Math.sqrt(STAR_A_MASS / planetOrbitRadius) * 0.9; // Slightly elliptic

            return [
                {
                    name: 'α Centauri A',
                    mass: STAR_A_MASS,
                    radius: 3.3,
                    position: new Vector3(-distA - distABCoM, 0, 0),
                    velocity: new Vector3(0, 0, speedA - speedABSystem),
                    color: '#ffffaa',
                    texturePath: getTexture('alpha_centauri_a.png'),
                    isStar: true,
                    isFixed: false,
                },
                {
                    name: 'α Centauri B',
                    mass: STAR_B_MASS,
                    radius: 2.7,
                    position: new Vector3(distB - distABCoM, 0, 0),
                    velocity: new Vector3(0, 0, -speedB - speedABSystem),
                    color: '#ffcc66',
                    texturePath: getTexture('alpha_centauri_b.png'),
                    isStar: true,
                    isFixed: false,
                },
                {
                    name: 'Proxima Centauri',
                    mass: STAR_C_MASS,
                    radius: 1.2,
                    position: new Vector3(distC, 20 * SCALE, 0), // Inclined orbit (was 20 -> 40)
                    velocity: new Vector3(0, 0, speedC),
                    color: '#ff6644',
                    texturePath: getTexture('proxima_centauri.png'),
                    isStar: true,
                    isFixed: false,
                },
                // Trisolaris: Orbiting Star A
                {
                    name: 'Trisolaris',
                    mass: 0.001, // Negligible mass
                    radius: 0.3,
                    position: new Vector3(-distA - distABCoM + planetOrbitRadius, 0, 0),
                    velocity: new Vector3(0, 0, speedA - speedABSystem + planetSpeed),
                    color: '#4488ff',
                    texturePath: getTexture('trisolaris.png'),
                    isStar: false,
                }
            ];
        } else {
            // Chaotic configuration - highly unstable with strong randomization
            const orbitRadius = 80;
            const baseSpeed = Math.sqrt(TOTAL_STAR_MASS / orbitRadius) * 0.5;

            // Random helpers with larger variation
            const randRange = (min: number, max: number) => min + Math.random() * (max - min);
            const randAngle = () => Math.random() * Math.PI * 2;

            // Generate random positions for each star
            const angle1 = randAngle();
            const angle2 = randAngle();
            const angle3 = randAngle();

            const r1 = randRange(40, 100);
            const r2 = randRange(40, 100);
            const r3 = randRange(30, 80);

            const pos1 = new Vector3(
                Math.cos(angle1) * r1,
                randRange(-20, 20),
                Math.sin(angle1) * r1
            );
            const pos2 = new Vector3(
                Math.cos(angle2) * r2,
                randRange(-20, 20),
                Math.sin(angle2) * r2
            );
            const pos3 = new Vector3(
                Math.cos(angle3) * r3,
                randRange(-20, 20),
                Math.sin(angle3) * r3
            );

            // Generate random velocities with approximate momentum balance
            const vAngle1 = randAngle();
            const vAngle2 = randAngle();
            const v1Mag = randRange(baseSpeed * 0.3, baseSpeed * 0.8);
            const v2Mag = randRange(baseSpeed * 0.3, baseSpeed * 0.8);

            const vel1 = new Vector3(
                Math.cos(vAngle1) * v1Mag,
                randRange(-baseSpeed * 0.2, baseSpeed * 0.2),
                Math.sin(vAngle1) * v1Mag
            );
            const vel2 = new Vector3(
                Math.cos(vAngle2) * v2Mag,
                randRange(-baseSpeed * 0.2, baseSpeed * 0.2),
                Math.sin(vAngle2) * v2Mag
            );

            // Star C velocity to approximately conserve momentum (reduces drift)
            const vel3 = new Vector3(
                -(vel1.x * STAR_A_MASS + vel2.x * STAR_B_MASS) / STAR_C_MASS * 0.1,
                randRange(-baseSpeed * 0.3, baseSpeed * 0.3),
                -(vel1.z * STAR_A_MASS + vel2.z * STAR_B_MASS) / STAR_C_MASS * 0.1
            );

            // Trisolaris: Random outer orbit
            const trisolarisAngle = randAngle();
            const trisolarisRadius = randRange(180, 250);
            const trisolarisSpeed = Math.sqrt(TOTAL_STAR_MASS / trisolarisRadius) * randRange(0.7, 0.85);
            const trisolarisY = randRange(-30, 30);

            return [
                {
                    name: 'α Centauri A',
                    mass: STAR_A_MASS,
                    radius: 3.3,
                    position: pos1,
                    velocity: vel1,
                    color: '#ffffaa',
                    texturePath: getTexture('alpha_centauri_a.png'),
                    isStar: true,
                    isFixed: false,
                },
                {
                    name: 'α Centauri B',
                    mass: STAR_B_MASS,
                    radius: 2.7,
                    position: pos2,
                    velocity: vel2,
                    color: '#ffcc66',
                    texturePath: getTexture('alpha_centauri_b.png'),
                    isStar: true,
                    isFixed: false,
                },
                {
                    name: 'Proxima Centauri',
                    mass: STAR_C_MASS,
                    radius: 1.2,
                    position: pos3,
                    velocity: vel3,
                    color: '#ff6644',
                    texturePath: getTexture('proxima_centauri.png'),
                    isStar: true,
                    isFixed: false,
                },
                // Trisolaris: Random outer orbit around the chaotic star system
                {
                    name: 'Trisolaris',
                    mass: 1.0,
                    radius: 0.3,
                    position: new Vector3(
                        Math.cos(trisolarisAngle) * trisolarisRadius,
                        trisolarisY,
                        Math.sin(trisolarisAngle) * trisolarisRadius
                    ),
                    velocity: new Vector3(
                        -Math.sin(trisolarisAngle) * trisolarisSpeed,
                        0,
                        Math.cos(trisolarisAngle) * trisolarisSpeed
                    ),
                    color: '#4488ff',
                    texturePath: getTexture('trisolaris.png'),
                    isStar: false,
                }
            ];
        }
    }
};

// ============================================
// FIGURE-8 ORBIT (8の字軌道)
// ============================================

export const FIGURE_EIGHT: StarSystemPreset = {
    id: 'figure-eight',
    name: 'Figure-8 Orbit',
    nameJa: '8の字軌道',
    description: 'Three equal-mass bodies following a stable figure-8 choreography. A mathematically proven periodic solution.',
    descriptionJa: '3つの等質量天体が8の字パターンで安定周回する、数学的に証明された周期解。',
    category: 'choreography',
    initialCamera: {
        position: [0, 80, 100],
        target: [0, 0, 0]
    },
    createBodies: () => {
        // Chenciner-Montgomery Figure-8 solution
        // Reference: "A remarkable periodic solution of the three-body problem" (2000)
        // High-precision initial conditions for G=1, m=1 normalized system

        // Scaling parameters
        const MASS = 10000;  // Mass per body (higher = faster, more visible motion)
        const L = 25;        // Position scale factor

        // Velocity scale: preserves dynamics when scaling position by L and mass by M
        // v_new = v_original * sqrt(M / L)
        const V = Math.sqrt(MASS / L);  // = 20

        // High-precision initial conditions from Šuvakov & Dmitrašinović (2013)
        // High-precision initial conditions from Šuvakov & Dmitrašinović (2013) / Chenciner & Montgomery
        const x1 = 0.9700043566973456;
        const y1 = -0.2430875323849975;
        const v1_x = 0.46620368503119045;
        const v1_y = 0.4323657300236305;

        // Scaling parameters (adjusted)
        // Scale L needs to be applied to both x and y

        return [
            {
                name: 'Body α',
                mass: MASS,
                radius: 0.5,
                position: new Vector3(x1 * L, y1 * L, 0),
                velocity: new Vector3(v1_x * V, v1_y * V, 0),
                color: '#ff6b6b',
                isStar: true,
                isFixed: false,
            },
            {
                name: 'Body β',
                mass: MASS,
                radius: 0.5,
                position: new Vector3(-x1 * L, -y1 * L, 0),
                velocity: new Vector3(v1_x * V, v1_y * V, 0),
                color: '#4ecdc4',
                isStar: true,
                isFixed: false,
            },
            {
                name: 'Body γ',
                mass: MASS,
                radius: 0.5,
                position: new Vector3(0, 0, 0),
                velocity: new Vector3(-2 * v1_x * V, -2 * v1_y * V, 0),
                color: '#ffe66d',
                isStar: true,
                isFixed: false,
            }
        ];
    }
};

// ============================================
// PRESET REGISTRY
// ============================================

export const STAR_SYSTEM_PRESETS: StarSystemPreset[] = [
    SOLAR_SYSTEM,
    THREE_BODY_SYSTEM,
    FIGURE_EIGHT,
];

export const getPresetById = (id: string): StarSystemPreset | undefined => {
    return STAR_SYSTEM_PRESETS.find(p => p.id === id);
};

// Helper to create bodies with UUIDs
export const createBodiesFromPreset = (
    preset: StarSystemPreset,
    mode?: StarSystemMode
): CelestialBody[] => {
    return preset.createBodies(mode).map(body => ({
        ...body,
        id: uuidv4()
    }));
};
