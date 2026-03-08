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
import { getPresetById } from '../../utils/starSystems';
import { getTidalStretchAmount } from '../../utils/scriptedScenarios';

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
    const currentSystemId = usePhysicsStore(state => state.currentSystemId);
    const scriptedScenario = usePhysicsStore(state => state.scriptedScenario);
    const tidalDisruptedEvents = usePhysicsStore(state => state.tidallyDisruptedEvents);

    const groupRef = React.useRef<Group>(null);
    const visualGroupRef = React.useRef<Group>(null);
    const meshRef = React.useRef<Mesh>(null);
    const perfConfig = getPerformanceConfig(qualityLevel);
    const stretchAxis = React.useMemo(() => new Vector3(1, 0, 0), []);
    const defaultScale = React.useMemo(() => new Vector3(1, 1, 1), []);
    const targetColor = React.useMemo(() => new Vector3(), []);
    const tidalHighlightColor = React.useMemo(() => new Vector3(0.95, 0.98, 1.05), []);
    const diskProgressBucketRef = React.useRef(-1);
    const [diskVisualProgress, setDiskVisualProgress] = React.useState(0);
    const tidalEvent = useMemo(
        () => tidalDisruptedEvents.find(event => event.bodyId === body.id) ?? null,
        [body.id, tidalDisruptedEvents]
    );
    const tidalScenarioConfig = useMemo(() => {
        if (!currentSystemId) {
            return null;
        }

        const config = getPresetById(currentSystemId)?.scenario;
        return config?.kind === 'tidal-disruption' ? config : null;
    }, [currentSystemId]);
    const displaySource = tidalEvent
        ? tidalEvent.position
        : { x: body.position.x, y: body.position.y, z: body.position.z };

    const positionVector = useMemo(
        () => new Vector3(displaySource.x, displaySource.y, displaySource.z),
        [displaySource.x, displaySource.y, displaySource.z]
    );

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

        const material = meshRef.current?.material;
        const phaseElapsedMs = scriptedScenario.phaseStartedAt === null
            ? 0
            : Math.max(0, performance.now() - scriptedScenario.phaseStartedAt);
        const isTidalTarget = (
            scriptedScenario.kind === 'tidal-disruption' &&
            scriptedScenario.targetBodyId === body.id &&
            !!tidalScenarioConfig
        );

        if (visualGroupRef.current) {
            if (isTidalTarget && tidalScenarioConfig) {
                const stretchAmount = getTidalStretchAmount(
                    scriptedScenario.phase,
                    scriptedScenario.metricValue,
                    phaseElapsedMs,
                    tidalScenarioConfig.disruptionDurationMs
                );
                const restoredRadiusScale = tidalEvent
                    ? tidalEvent.bodyRadius / Math.max(body.radius, 0.001)
                    : 1;
                const longitudinalScale = restoredRadiusScale * (1 + 1.35 * stretchAmount);
                const transverseScale = restoredRadiusScale * Math.max(0.72, 1 - 0.28 * stretchAmount);
                const bodies = usePhysicsStore.getState().bodies;
                const primary = scriptedScenario.primaryBodyId
                    ? bodies.find(candidate => candidate.id === scriptedScenario.primaryBodyId)
                    : null;

                visualGroupRef.current.scale.set(longitudinalScale, transverseScale, transverseScale);

                if (primary) {
                    const tidalAxis = primary.position.clone().sub(positionVector);
                    if (tidalAxis.lengthSq() > 0.0001) {
                        tidalAxis.normalize();
                        visualGroupRef.current.quaternion.setFromUnitVectors(stretchAxis, tidalAxis);
                    }
                }
            } else {
                visualGroupRef.current.scale.copy(defaultScale);
                visualGroupRef.current.quaternion.identity();
            }
        }

        if (material && 'color' in material && 'emissive' in material && 'emissiveIntensity' in material) {
            const standardMaterial = material as unknown as {
                color: { setRGB: (r: number, g: number, b: number) => void };
                emissive: { setRGB: (r: number, g: number, b: number) => void };
                emissiveIntensity: number;
            };
            const baseColor = new Vector3(
                parseInt(body.color.slice(1, 3), 16) / 255,
                parseInt(body.color.slice(3, 5), 16) / 255,
                parseInt(body.color.slice(5, 7), 16) / 255
            );

            if (isTidalTarget && tidalScenarioConfig) {
                const stretchAmount = getTidalStretchAmount(
                    scriptedScenario.phase,
                    scriptedScenario.metricValue,
                    phaseElapsedMs,
                    tidalScenarioConfig.disruptionDurationMs
                );
                targetColor.copy(baseColor).lerp(tidalHighlightColor, stretchAmount * 0.55);
                standardMaterial.color.setRGB(targetColor.x, targetColor.y, targetColor.z);
                standardMaterial.emissive.setRGB(targetColor.x, targetColor.y, targetColor.z);
                standardMaterial.emissiveIntensity = 2 + stretchAmount * 2.5;
            } else {
                standardMaterial.color.setRGB(baseColor.x, baseColor.y, baseColor.z);
                standardMaterial.emissive.setRGB(baseColor.x, baseColor.y, baseColor.z);
                standardMaterial.emissiveIntensity = body.isStar || body.isCompactObject ? 2.0 : 0;
            }
        }

        const isTidalPrimary = (
            scriptedScenario.kind === 'tidal-disruption' &&
            scriptedScenario.primaryBodyId === body.id &&
            !!tidalScenarioConfig
        );

        if (isTidalPrimary && tidalScenarioConfig) {
            let nextProgress = 0;

            if (scriptedScenario.phase === 'debris-capture') {
                nextProgress = Math.max(0, Math.min(1, phaseElapsedMs / tidalScenarioConfig.disruptionDurationMs));
            } else if (scriptedScenario.phase === 'aftermath' || scriptedScenario.phase === 'complete') {
                nextProgress = 1;
            }

            const nextBucket = Math.round(nextProgress * 6);
            if (nextBucket !== diskProgressBucketRef.current) {
                diskProgressBucketRef.current = nextBucket;
                setDiskVisualProgress(nextProgress);
            }
        } else if (diskProgressBucketRef.current !== 0 || diskVisualProgress !== 0) {
            diskProgressBucketRef.current = 0;
            setDiskVisualProgress(0);
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
    const shouldShowTrail = !isSelf && !tidalEvent && (
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

    const renderedDiskConfig = useMemo(() => {
        if (!body.hasAccretionDisk || !body.accretionDiskConfig) {
            return body.accretionDiskConfig;
        }

        if (
            scriptedScenario.kind !== 'tidal-disruption' ||
            scriptedScenario.primaryBodyId !== body.id ||
            diskVisualProgress <= 0
        ) {
            return body.accretionDiskConfig;
        }

        const baseParticleCount = body.accretionDiskConfig.particleCount ?? 2400;
        const boostedParticleCount = Math.max(baseParticleCount, 4200);

        return {
            ...body.accretionDiskConfig,
            outerRadius: body.accretionDiskConfig.outerRadius + (20 - body.accretionDiskConfig.outerRadius) * diskVisualProgress,
            rotationSpeed: body.accretionDiskConfig.rotationSpeed + (2.75 - body.accretionDiskConfig.rotationSpeed) * diskVisualProgress,
            particleCount: Math.round(
                (baseParticleCount + (boostedParticleCount - baseParticleCount) * diskVisualProgress) / 200
            ) * 200
        };
    }, [body.accretionDiskConfig, body.hasAccretionDisk, body.id, diskVisualProgress, scriptedScenario.kind, scriptedScenario.primaryBodyId]);

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
                    <group ref={visualGroupRef}>
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
                    </group>

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

            {body.hasAccretionDisk && renderedDiskConfig && (
                <AccretionDisk
                    position={displaySource}
                    innerRadius={body.radius * renderedDiskConfig.innerRadius}
                    outerRadius={body.radius * renderedDiskConfig.outerRadius}
                    rotationSpeed={renderedDiskConfig.rotationSpeed}
                    particleCount={renderedDiskConfig.particleCount}
                    tilt={renderedDiskConfig.tilt}
                />
            )}

            {body.hasJets && (
                <RelativisticJet
                    position={displaySource}
                    length={body.radius * 15}
                    baseWidth={body.radius * 2}
                    speed={1.5}
                />
            )}
        </>
    );
};
