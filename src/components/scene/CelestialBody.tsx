import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail, Text, Billboard, useTexture } from '@react-three/drei';
import { usePhysicsStore } from '../../store/physicsStore';
import type { CelestialBody as BodyType } from '../../types/physics';
import { Vector3, Color } from 'three';

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

export const CelestialBody: React.FC<CelestialBodyProps> = ({ body }) => {
    // Memoize geometry args to avoid regeneration
    // Radius is visual size. Maybe scale it slightly differently from physical collision radius if needed?
    // For now 1:1.
    const showRealistic = usePhysicsStore(state => state.showRealisticVisuals);

    const textRef = React.useRef<any>(null);
    const groupRef = React.useRef<any>(null); // Ref for the group to be targeted by Trail
    const positionVector = useMemo(() => new Vector3(body.position.x, body.position.y, body.position.z), [body.position]);

    // Delayed trail initialization to prevent the "line from origin" artifact on mount
    // We completely skip rendering the Trail component until stabilized to avoid capturing the (0,0,0) initialization point.
    const [trailReady, setTrailReady] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setTrailReady(true);
        }, 600); // Slightly longer delay to ensure everything is settled
        return () => clearTimeout(timer);
    }, []);

    useFrame((state) => {
        if (textRef.current) {
            const distance = state.camera.position.distanceTo(positionVector);
            const scaleFactor = Math.min(1.0, distance / 20.0);
            textRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
            textRef.current.material.opacity = Math.min(1.0, distance / 5.0);
        }
    });

    const selectBody = usePhysicsStore(state => state.selectBody);

    return (
        <group
            ref={groupRef}
            position={positionVector}
            onClick={(e) => {
                e.stopPropagation();
                selectBody(body.id);
            }}
        >
            <Sphere args={[body.radius, 32, 32]}>
                {showRealistic && body.texturePath ? (
                    <React.Suspense fallback={<meshStandardMaterial color={body.color} />}>
                        <TextureOrb body={body} />
                    </React.Suspense>
                ) : (
                    <meshStandardMaterial
                        color={body.color}
                        emissive={body.color}
                        emissiveIntensity={2.0} // Increased brightness for small bodies
                    />
                )}
            </Sphere>

            {/* Trail - Attached via target ref to ensure clean initialization */}
            {trailReady && (
                <Trail
                    target={groupRef}
                    width={2} // Reduced width to match smaller bodies
                    length={40} // Increased length
                    color={new Color(body.color)}
                    attenuation={(t) => t} // Linear attenuation for longer visibility
                    interval={1} // frame interval
                />
            )}

            {/* Label */}
            <Billboard
                follow={true}
                lockX={false}
                lockY={false}
                lockZ={false} // Lock the rotation on the z axis (default=false)
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
    );
};
