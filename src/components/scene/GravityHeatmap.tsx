import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '../../store/physicsStore';
import * as THREE from 'three';

const GRID_SIZE = 100;        // Grid resolution
const GRID_EXTENT = 300;      // Base extent (-300 to +300)
const BASE_UPDATE_INTERVAL = 5;    // Frame skip for performance
const COLOR_STOPS = [
    [0x000033, 0x0066ff],
    [0x0066ff, 0x00ff66],
    [0x00ff66, 0xffff00],
    [0xffff00, 0xff3300]
] as const;

export const GravityHeatmap: React.FC = () => {
    const bodies = usePhysicsStore(state => state.bodies);
    const showGravityField = usePhysicsStore(state => state.showGravityField);
    const useRealisticDistances = usePhysicsStore(state => state.useRealisticDistances);

    const meshRef = useRef<THREE.Mesh>(null);
    const frameCount = useRef(0);
    const vertexCount = (GRID_SIZE + 1) * (GRID_SIZE + 1);
    const potentialsRef = useRef(new Float32Array(vertexCount));
    const gradientColors = useMemo(
        () => COLOR_STOPS.map(([start, end]) => [new THREE.Color(start), new THREE.Color(end)] as const),
        []
    );
    const workingColor = useMemo(() => new THREE.Color(), []);

    // Adjust extent based on distance scale
    const extent = useRealisticDistances ? GRID_EXTENT * 4 : GRID_EXTENT;
    const updateInterval = bodies.length > 24 ? BASE_UPDATE_INTERVAL * 2 : BASE_UPDATE_INTERVAL;

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(extent * 2, extent * 2, GRID_SIZE, GRID_SIZE);
        geo.rotateX(-Math.PI / 2); // Lay flat on XZ plane

        // Add attribute for vertex colors
        const colors = new Float32Array((GRID_SIZE + 1) * (GRID_SIZE + 1) * 3);
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        return geo;
    }, [extent]);

    useFrame(() => {
        if (!showGravityField || !meshRef.current) return;

        frameCount.current++;
        if (frameCount.current % updateInterval !== 0) return;

        const geo = meshRef.current.geometry as THREE.PlaneGeometry;
        const positions = geo.attributes.position.array as Float32Array;
        const colors = geo.attributes.color.array as Float32Array;
        const potentials = potentialsRef.current;

        let minPotential = Infinity;
        let maxPotential = -Infinity;

        // 1. Calculate Potential at each vertex
        // P = Sum(m_i / r_i)  (Ignoring G for relative visualization)
        for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
            const positionIndex = vertexIndex * 3;
            const x = positions[positionIndex];
            const z = positions[positionIndex + 2];

            let potential = 0;
            for (const body of bodies) {
                const dx = x - body.position.x;
                const dz = z - body.position.z;
                // Add small epsilon to avoid division by zero near body center
                const dist = Math.sqrt(dx * dx + dz * dz) + 0.5;
                potential += body.mass / dist;
            }

            potentials[vertexIndex] = potential;
            if (potential < minPotential) minPotential = potential;
            if (potential > maxPotential) maxPotential = potential;
        }

        // 2. Normalize and Color mapped logarithmically
        // Logarithmic scale helps visualize the vast range of gravity
        const logMin = Math.log(minPotential + 1);
        const logMax = Math.log(maxPotential + 1);
        const logRange = logMax - logMin || 1;

        for (let i = 0; i < vertexCount; i++) {
            const logVal = Math.log(potentials[i] + 1);
            const normalized = (logVal - logMin) / logRange;
            const clamped = Math.min(Math.max(normalized, 0), 1);
            const segment = Math.min(Math.floor(clamped * gradientColors.length), gradientColors.length - 1);
            const segmentStart = segment / gradientColors.length;
            const localT = (clamped - segmentStart) * gradientColors.length;
            workingColor.lerpColors(
                gradientColors[segment][0],
                gradientColors[segment][1],
                localT
            );

            colors[i * 3] = workingColor.r;
            colors[i * 3 + 1] = workingColor.g;
            colors[i * 3 + 2] = workingColor.b;
        }

        geo.attributes.color.needsUpdate = true;
    }, -1);

    if (!showGravityField) return null;

    return (
        <mesh ref={meshRef} geometry={geometry} position={[0, -2, 0]}>
            <meshBasicMaterial
                vertexColors
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
};
