import React, { useMemo } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Sphere, useTexture, Line, Html } from '@react-three/drei';
import { usePhysicsStore } from '../../store/physicsStore';
import type { CelestialBody as BodyType } from '../../types/physics';
import { Group, Mesh, Vector3 } from 'three';
import { AccretionDisk } from '../effects/AccretionDisk';
import { RelativisticJet } from '../effects/RelativisticJet';
import { ProceduralPlanet } from './ProceduralPlanet';
import { getPerformanceConfig } from '../../constants/performance';
import type { Line2 } from 'three-stdlib';

interface CelestialBodyProps {
    body: BodyType;
}

const EMPTY_LINE_POSITIONS = [0, 0, 0, 0, 0, 0];

// Separate component since useTexture suspends
const TextureOrb = ({ body }: { body: BodyType }) => {
    // TextureOrb is only rendered if texturePath exists
    const texture = useTexture(body.texturePath!);

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

// Internal component for constant width trail with LOD compression
const ConstantWidthTrail = ({ position, color }: { position: Vector3, color: string }) => {
    const recentPoints = React.useRef<Vector3[]>([]);
    const compressedPoints = React.useRef<Vector3[]>([]);
    const frameCount = React.useRef(0);
    const lineRef = React.useRef<Line2>(null);
    const positionBufferRef = React.useRef<number[]>([]);
    const useRealisticDistances = usePhysicsStore(state => state.useRealisticDistances);
    const resetToken = usePhysicsStore(state => state.resetToken);
    const simulationState = usePhysicsStore(state => state.simulationState);
    const qualityLevel = usePhysicsStore(state => state.qualityLevel);

    // Get trail config from performance settings
    const perfConfig = getPerformanceConfig(qualityLevel);
    const TRAIL_CONFIG = {
        RECENT_MAX: perfConfig.trailRecentPoints,
        RECENT_INTERVAL: 2,
        COMPRESSED_MAX: perfConfig.trailCompressedPoints,
        COMPRESS_RATIO: perfConfig.trailCompressionRatio,
        COMPRESS_TRIGGER: Math.floor(perfConfig.trailRecentPoints * 1.33)
    };
    const maxTrailPoints = TRAIL_CONFIG.RECENT_MAX + TRAIL_CONFIG.COMPRESSED_MAX;

    const syncTrailGeometry = React.useCallback((positions: number[]) => {
        if (!lineRef.current) return;

        const nextPositions = positions.length >= 6 ? positions : EMPTY_LINE_POSITIONS;
        lineRef.current.geometry.setPositions(nextPositions);
        lineRef.current.computeLineDistances();
    }, []);

    React.useEffect(() => {
        recentPoints.current = [];
        compressedPoints.current = [];
        frameCount.current = 0;
        positionBufferRef.current.length = 0;
        syncTrailGeometry(positionBufferRef.current);
    }, [resetToken, syncTrailGeometry, useRealisticDistances]);

    useFrame(() => {
        if (simulationState !== 'running' || !lineRef.current) return;

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
        }

        const trailPoints = [...compressedPoints.current, ...recentPoints.current];
        const visiblePointCount = Math.min(trailPoints.length, maxTrailPoints);
        const positionBuffer = positionBufferRef.current;

        if (visiblePointCount < 2) {
            positionBuffer.length = 0;
            syncTrailGeometry(positionBuffer);
            return;
        }

        positionBuffer.length = visiblePointCount * 3;

        for (let i = 0; i < visiblePointCount; i++) {
            const point = trailPoints[i];
            const offset = i * 3;
            positionBuffer[offset] = point.x;
            positionBuffer[offset + 1] = point.y;
            positionBuffer[offset + 2] = point.z;
        }

        syncTrailGeometry(positionBuffer);
    });

    return (
        <Line
            ref={lineRef}
            points={[[0, 0, 0], [0, 0, 0]]}
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
    const qualityLevel = usePhysicsStore(state => state.qualityLevel);
    const bodyCount = usePhysicsStore(state => state.bodies.length);
    const selectedBodyId = usePhysicsStore(state => state.selectedBodyId);
    const followingBodyId = usePhysicsStore(state => state.followingBodyId);
    const selectBody = usePhysicsStore(state => state.selectBody);
    const cameraMode = usePhysicsStore(state => state.cameraMode);

    const groupRef = React.useRef<Group>(null);
    const meshRef = React.useRef<Mesh>(null);
    const perfConfig = getPerformanceConfig(qualityLevel);

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

    useFrame(() => {
        if (meshRef.current && body.rotationSpeed) {
            const EARTH_YEAR_RAD = 2300;
            meshRef.current.rotation.y = (body.rotationSpeed * simulationTime * EARTH_YEAR_RAD);
        }
    });

    const isSurfaceView = cameraMode === 'surface_lock';
    const isSelf = isSurfaceView && followingBodyId === body.id;
    const isFocusedBody = body.id === selectedBodyId || body.id === followingBodyId;
    const shouldShowLabel = !isSelf && (
        isFocusedBody ||
        bodyCount <= perfConfig.maxVisibleLabels ||
        (body.isStar && bodyCount <= perfConfig.maxVisibleStarLabels)
    );
    const shouldShowTrail = !isSelf && (
        isFocusedBody ||
        bodyCount <= perfConfig.maxTrailedBodies
    );
    const [trailReady, setTrailReady] = React.useState(false);

    React.useEffect(() => {
        if (!shouldShowTrail) {
            setTrailReady(false);
            return;
        }

        const timer = setTimeout(() => {
            setTrailReady(true);
        }, 600);

        return () => clearTimeout(timer);
    }, [shouldShowTrail]);

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
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

                {shouldShowLabel && (
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
                )}
            </group>

            {shouldShowTrail && trailReady && (
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
