import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Billboard, useTexture, Line } from '@react-three/drei';
import { usePhysicsStore } from '../../store/physicsStore';
import type { CelestialBody as BodyType } from '../../types/physics';
import { Vector3 } from 'three';

interface CelestialBodyProps {
    body: BodyType;
}

// Separate component since useTexture suspends
const TextureOrb = ({ body }: { body: BodyType }) => {
    // Try-catch isn't possible with hooks directly, but we can assume valid paths.
    // If path is missing, fallback to color.
    const texturePath = body.texturePath;
    if (!texturePath) return null;

    const texture = useTexture(texturePath); // This will suspend

    return (
        <meshStandardMaterial
            map={texture}
            emissiveMap={body.name === 'Sun' ? texture : undefined}
            emissive={body.name === 'Sun' ? 'white' : 'black'}
            emissiveIntensity={body.name === 'Sun' ? 2.0 : 0.0}
            roughness={1}
            metalness={0}
        />
    );
};

// Internal component for constant width trail
const ConstantWidthTrail = ({ position, color }: { position: Vector3, color: string }) => {
    const [points, setPoints] = React.useState<Vector3[]>([]);
    const frameCount = React.useRef(0);

    useFrame(() => {
        frameCount.current++;
        // Update every 3 frames for smoothness vs performance
        if (frameCount.current % 3 === 0) {
            setPoints(prev => {
                const newPoints = [...prev, position.clone()];
                // Limit trail length
                if (newPoints.length > 150) newPoints.shift();
                return newPoints;
            });
        }
    });

    if (points.length < 2) return null;

    return (
        <Line
            points={points}
            color={color}
            lineWidth={2.5} // Constant screen-space width
            opacity={0.6}
            transparent
        />
    );
};

export const CelestialBody: React.FC<CelestialBodyProps> = ({ body }) => {
    const showRealistic = usePhysicsStore(state => state.showRealisticVisuals);
    const showGrid = usePhysicsStore(state => state.showGrid);
    const simulationTime = usePhysicsStore(state => state.simulationTime);

    const textRef = React.useRef<any>(null);
    const groupRef = React.useRef<any>(null);
    const meshRef = React.useRef<any>(null);

    const positionVector = useMemo(() => new Vector3(body.position.x, body.position.y, body.position.z), [body.position]);

    const tiltRadians = useMemo(() => {
        return (body.axialTilt || 0) * (Math.PI / 180);
    }, [body.axialTilt]);

    // Delayed trail initialization
    const [trailReady, setTrailReady] = React.useState(false);
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setTrailReady(true);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    useFrame((state) => {
        if (textRef.current) {
            const distance = state.camera.position.distanceTo(positionVector);
            const scaleFactor = Math.min(1.0, distance / 20.0);
            textRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
            textRef.current.material.opacity = Math.min(1.0, distance / 5.0);
        }

        if (meshRef.current && body.rotationSpeed) {
            // Visual Rotation: Scale relative speed (Earth=1.0) to Rads/Year (2300)
            const EARTH_YEAR_RAD = 2300;
            meshRef.current.rotation.y = (body.rotationSpeed * simulationTime * EARTH_YEAR_RAD);
        }
    });

    const selectBody = usePhysicsStore(state => state.selectBody);
    const cameraMode = usePhysicsStore(state => state.cameraMode);
    const followingBodyId = usePhysicsStore(state => state.followingBodyId);

    // Filter interactions for Surface View
    const isSurfaceView = cameraMode === 'surface_lock';
    const isSelf = isSurfaceView && followingBodyId === body.id;

    const handleClick = (e: any) => {
        if (isSurfaceView) return; // Disable selection in Surface View
        e.stopPropagation();
        selectBody(body.id);
    };

    return (
        <>
            <group
                ref={groupRef}
                position={positionVector}
                onClick={handleClick}
            >
                {/* Axial Tilt Wrapper */}
                <group rotation={[0, 0, tiltRadians]}>
                    <Sphere ref={meshRef} args={[body.radius, 32, 32]}>
                        {showRealistic && body.texturePath ? (
                            <React.Suspense fallback={<meshStandardMaterial color={body.color} />}>
                                <TextureOrb body={body} />
                            </React.Suspense>
                        ) : (
                            <meshStandardMaterial
                                color={body.color}
                                emissive={body.color}
                                emissiveIntensity={2.0}
                            />
                        )}
                    </Sphere>

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

                <Billboard
                    follow={true}
                    lockX={false}
                    lockY={false}
                    lockZ={false}
                >
                    <Text
                        ref={textRef}
                        position={[0, body.radius + 1.5, 0]}
                        fontSize={1.0}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.1}
                        outlineColor="#000000"
                    >
                        {body.name}
                    </Text>
                </Billboard>
            </group>

            {/* Trail - Rendered in World Space */}
            {trailReady && (
                <ConstantWidthTrail
                    position={positionVector}
                    color={body.color}
                />
            )}
        </>
    );
};
