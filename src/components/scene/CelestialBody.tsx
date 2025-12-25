import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail, Text, Billboard, useTexture, Line } from '@react-three/drei';
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
    const showRealistic = usePhysicsStore(state => state.showRealisticVisuals);
    const showGrid = usePhysicsStore(state => state.showGrid);
    const timeScale = usePhysicsStore(state => state.timeScale);
    const simulationTime = usePhysicsStore(state => state.simulationTime); // Pick up simulationTime

    const textRef = React.useRef<any>(null);
    const groupRef = React.useRef<any>(null); // Ref for position group
    const meshRef = React.useRef<any>(null); // Ref for spinning mesh

    const positionVector = useMemo(() => new Vector3(body.position.x, body.position.y, body.position.z), [body.position]);

    // Axial Tilt: Convert degrees to radians. 
    // We rotate around Z axis to tilt the Y axis.
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

    useFrame((state, delta) => {
        // 1. Text Scaling
        if (textRef.current) {
            const distance = state.camera.position.distanceTo(positionVector);
            const scaleFactor = Math.min(1.0, distance / 20.0);
            textRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
            textRef.current.material.opacity = Math.min(1.0, distance / 5.0);
        }

        // 2. Planet Rotation
        if (meshRef.current && body.rotationSpeed) {
            // Apply rotation based on accumulated simulation time (synced with pause)
            // rotationSpeed is now calibrated to Rad/Time
            meshRef.current.rotation.y = (body.rotationSpeed * simulationTime);
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
            {/* Axial Tilt Wrapper */}
            <group rotation={[0, 0, tiltRadians]}>
                {/* Spinning Mesh */}
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

                {/* Axis Line - Only visible when Grid is ON */}
                {showGrid && (
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

            {/* Trail */}
            {trailReady && (
                <Trail
                    target={groupRef}
                    width={2}
                    length={40}
                    color={new Color(body.color)}
                    attenuation={(t) => t}
                    interval={1}
                />
            )}

            {/* Label - Keep outside of tilt group so it stays upright relative to camera/scene? 
                Actually Billboard handles orientation, but position should be relative to center. 
                If we put it in tilt group, it orbits the tilted axis? No, Billboard overrides rotation. 
                But position offset [0, r+1.5, 0] would be tilted. 
                So KEEP IT OUTSIDE tilt group to ensure it floats "above" world Y if desired, 
                OR keep inside to float above "North Pole".
                Usually UI labels float above World Y. Let's keep it here (outside tilt).
            */}
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
    );
};
