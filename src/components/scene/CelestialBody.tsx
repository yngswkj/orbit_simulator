import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, useTexture, Line, Html } from '@react-three/drei';
import { usePhysicsStore } from '../../store/physicsStore';
import type { CelestialBody as BodyType } from '../../types/physics';
import { Vector3, CatmullRomCurve3 } from 'three';
import { AccretionDisk } from '../effects/AccretionDisk';
import { RelativisticJet } from '../effects/RelativisticJet';
import { ProceduralPlanet } from './ProceduralPlanet';

interface CelestialBodyProps {
    body: BodyType;
}

// Separate component since useTexture suspends
const TextureOrb = ({ body }: { body: BodyType }) => {
    const texturePath = body.texturePath;
    if (!texturePath) return null;

    const texture = useTexture(texturePath);

    return (
        <meshStandardMaterial
            map={texture}
            emissiveMap={body.isStar ? texture : undefined}
            emissive={body.isStar ? 'white' : 'black'}
            emissiveIntensity={body.isStar ? 2.0 : 0.0}
            roughness={1}
            metalness={0}
        />
    );
};

// Trail configuration
const TRAIL_CONFIG = {
    RECENT_MAX: 60,
    RECENT_INTERVAL: 2,
    COMPRESSED_MAX: 120,
    COMPRESS_RATIO: 4,
    COMPRESS_TRIGGER: 80
};

// Spline interpolation for smooth curves (memoized)
const useSplinePoints = (controlPoints: Vector3[], segments: number): Vector3[] => {
    return useMemo(() => {
        if (controlPoints.length < 4) return controlPoints;
        try {
            const curve = new CatmullRomCurve3(controlPoints, false, 'catmullrom', 0.5);
            return curve.getPoints(segments);
        } catch {
            return controlPoints;
        }
    }, [controlPoints, segments]);
};

// Internal component for constant width trail with LOD compression
const ConstantWidthTrail = ({ position, color }: { position: Vector3, color: string }) => {
    const recentPoints = React.useRef<Vector3[]>([]);
    const compressedPoints = React.useRef<Vector3[]>([]);
    const [renderPoints, setRenderPoints] = React.useState<Vector3[]>([]);
    const frameCount = React.useRef(0);
    const useRealisticDistances = usePhysicsStore(state => state.useRealisticDistances);
    const resetToken = usePhysicsStore(state => state.resetToken);
    const simulationState = usePhysicsStore(state => state.simulationState);

    React.useEffect(() => {
        recentPoints.current = [];
        compressedPoints.current = [];
        setRenderPoints([]);
    }, [useRealisticDistances, resetToken]);

    useFrame(() => {
        if (simulationState !== 'running') return;
        frameCount.current++;
        if (frameCount.current % TRAIL_CONFIG.RECENT_INTERVAL === 0) {
            recentPoints.current.push(position.clone());
            if (recentPoints.current.length > TRAIL_CONFIG.COMPRESS_TRIGGER) {
                const toCompress = recentPoints.current.splice(0, TRAIL_CONFIG.COMPRESS_TRIGGER - TRAIL_CONFIG.RECENT_MAX);
                for (let i = 0; i < toCompress.length; i += TRAIL_CONFIG.COMPRESS_RATIO) {
                    compressedPoints.current.push(toCompress[i]);
                }
                while (compressedPoints.current.length > TRAIL_CONFIG.COMPRESSED_MAX) {
                    compressedPoints.current.shift();
                }
            }
            setRenderPoints([...compressedPoints.current, ...recentPoints.current]);
        }
    });

    const smoothPoints = useSplinePoints(renderPoints, Math.min(renderPoints.length * 2, 400));
    if (smoothPoints.length < 2) return null;

    return (
        <Line
            points={smoothPoints}
            color={color}
            lineWidth={2.5}
            opacity={0.6}
            transparent
        />
    );
};

export const CelestialBody: React.FC<CelestialBodyProps> = ({ body }) => {
    const showRealistic = usePhysicsStore(state => state.showRealisticVisuals);
    const showGrid = usePhysicsStore(state => state.showGrid);
    const simulationTime = usePhysicsStore(state => state.simulationTime);

    const groupRef = React.useRef<any>(null);
    const meshRef = React.useRef<any>(null);

    const positionVector = useMemo(() => new Vector3(body.position.x, body.position.y, body.position.z), [body.position]);

    const tiltRadians = useMemo(() => {
        return (body.axialTilt || 0) * (Math.PI / 180);
    }, [body.axialTilt]);

    // Helper to Determine Planet Type
    const planetType = useMemo(() => {
        if (body.mass > 200) return 'gas_giant';

        // Special exclusions/overrides based on name
        const nameLower = body.name.toLowerCase();

        // Explicit types for Solar System
        if (nameLower.includes('sun')) return 'star'; // Should be handled by body.isStar but just in case
        if (nameLower.includes('mercury')) return 'rocky';
        if (nameLower.includes('venus')) return 'terrestrial'; // Or 'rocky' with atmosphere override? Let's use terrestrial for now or add 'venusian' later
        if (nameLower.includes('earth')) return 'terrestrial';
        if (nameLower.includes('mars')) return 'rocky';
        if (nameLower.includes('jupiter') || nameLower.includes('saturn') || nameLower.includes('uranus') || nameLower.includes('neptune')) return 'gas_giant';

        // Moons
        if (nameLower.includes('moon') || nameLower.includes('luna')) return 'rocky';
        if (nameLower.includes('europa') || nameLower.includes('enceladus') || nameLower.includes('pluto')) return 'ice';
        if (nameLower.includes('io') || nameLower.includes('volcano')) return 'molten';

        // Distance / Density heuristics for unknown bodies
        const dist = Math.sqrt(body.position.x ** 2 + body.position.z ** 2);

        // Very close to sun -> Molten (only if extremely close, e.g. < 0.3 AU => < 15 units)
        if (dist < 15) return 'molten';

        // Far from sun -> Ice
        if (dist > 800 && body.mass < 100) return 'ice';

        // Default small body logic
        if (body.mass < 0.2) return 'rocky';

        return 'terrestrial';
    }, [body.mass, body.position.x, body.position.z, body.name]);

    const [trailReady, setTrailReady] = React.useState(false);
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setTrailReady(true);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    useFrame(() => {
        if (meshRef.current && body.rotationSpeed) {
            const EARTH_YEAR_RAD = 2300;
            meshRef.current.rotation.y = (body.rotationSpeed * simulationTime * EARTH_YEAR_RAD);
        }
    });

    const selectBody = usePhysicsStore(state => state.selectBody);
    const cameraMode = usePhysicsStore(state => state.cameraMode);
    const followingBodyId = usePhysicsStore(state => state.followingBodyId);

    const isSurfaceView = cameraMode === 'surface_lock';
    const isSelf = isSurfaceView && followingBodyId === body.id;

    const handleClick = (e: any) => {
        if (isSurfaceView) return;
        e.stopPropagation();
        selectBody(body.id);
    };

    // Display Logic:
    // 1. If showRealistic AND texturePath exists -> Use TextureOrb (Sphere)
    // 2. Else -> Use Shader (ProceduralPlanet) OR Emissive Sphere (for Stars/Compact without texture override)

    const shouldUseTexture = showRealistic && !!body.texturePath;

    return (
        <>
            <group
                ref={groupRef}
                position={positionVector}
                onClick={handleClick}
            >
                <group rotation={[0, 0, tiltRadians]}>
                    {shouldUseTexture ? (
                        <Sphere ref={meshRef} args={[body.radius, 32, 32]}>
                            <React.Suspense fallback={<meshStandardMaterial color={body.color} />}>
                                <TextureOrb body={body} />
                            </React.Suspense>
                        </Sphere>
                    ) : (
                        /* Fallback to Procedual / Simple Shader */
                        body.isStar || body.isCompactObject ? (
                            /* Star/Compact Shader (Simple Emissive for now, could be procedural later) */
                            <Sphere ref={meshRef} args={[body.radius, 32, 32]}>
                                <meshStandardMaterial
                                    color={body.color}
                                    emissive={body.color}
                                    emissiveIntensity={2.0}
                                />
                            </Sphere>
                        ) : (
                            /* Planet Shader */
                            /* Note: ProceduralPlanet does not use meshRef for rotation from parent logic yet. 
                               It handles rotation internally via uniforms but we might want to sync it.
                               For now, we just render it. */
                            <ProceduralPlanet
                                radius={body.radius}
                                color={body.color}
                                type={planetType}
                                rotationSpeed={body.rotationSpeed}
                            />
                        )
                    )}

                    {showGrid && !isSelf && (
                        <Line
                            points={[[0, -body.radius * 1.5, 0], [0, body.radius * 1.5, 0]]}
                            color="white"
                            lineWidth={1}
                            opacity={0.5}
                            transparent
                            dashed
                            dashScale={2}
                            gapSize={1}
                        />
                    )}
                </group>

                <Html
                    position={[0, body.radius + 1.5, 0]}
                    center
                    zIndexRange={[1000, 0]}
                    style={{
                        color: 'white',
                        fontSize: '14px',
                        fontFamily: 'system-ui, sans-serif',
                        textShadow: '0 0 4px black, 0 0 2px black',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                >
                    {body.name}
                </Html>
            </group>

            {trailReady && (
                <ConstantWidthTrail
                    position={positionVector}
                    color={body.color}
                />
            )}

            {body.hasAccretionDisk && body.accretionDiskConfig && (
                <AccretionDisk
                    position={body.position}
                    innerRadius={body.radius * body.accretionDiskConfig.innerRadius}
                    outerRadius={body.radius * body.accretionDiskConfig.outerRadius}
                    rotationSpeed={body.accretionDiskConfig.rotationSpeed}
                    particleCount={body.accretionDiskConfig.particleCount}
                    tilt={body.accretionDiskConfig.tilt}
                />
            )}

            {body.hasJets && (
                <RelativisticJet
                    position={body.position}
                    length={body.radius * 15}
                    baseWidth={body.radius * 2}
                    speed={1.5}
                />
            )}
        </>
    );
};
