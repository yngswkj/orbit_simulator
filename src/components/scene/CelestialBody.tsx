import React, { useMemo } from 'react';
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
    // Since generated images might fail, this is risky.
    // But we will generate them.
    const texture = useTexture(body.texturePath || ''); // This will suspend

    return (
        <meshStandardMaterial
            map={texture}
            emissive={body.name === 'Sun' ? texture : undefined}
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

    const positionVector = useMemo(() => new Vector3(body.position.x, body.position.y, body.position.z), [body.position]);

    return (
        <group position={positionVector}>
            <Trail
                width={2} // Reduced width to match smaller bodies
                length={40} // Increased length
                color={new Color(body.color)}
                attenuation={(t) => t} // Linear attenuation for longer visibility
                interval={1} // frame interval
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
            </Trail>

            {/* Label (Optional: only show if big or hovered?) */}
            {/* Label */}
            <Billboard
                follow={true}
                lockX={false}
                lockY={false}
                lockZ={false} // Lock the rotation on the z axis (default=false)
            >
                <Text
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
