import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '../../store/physicsStore';
import * as THREE from 'three';

const GRID_SIZE = 100;        // Grid resolution
const GRID_EXTENT = 300;      // Base extent (-300 to +300)
const UPDATE_INTERVAL = 5;    // Frame skip for performance

// Gradient colors from Blue (Low) -> Green -> Yellow -> Red (High)
const getColor = (value: number): THREE.Color => {
    // value is normalized 0..1
    if (value < 0.25) {
        return new THREE.Color().lerpColors(
            new THREE.Color(0x000033), // Dark Blue
            new THREE.Color(0x0066ff), // Blue
            value * 4
        );
    } else if (value < 0.5) {
        return new THREE.Color().lerpColors(
            new THREE.Color(0x0066ff),
            new THREE.Color(0x00ff66), // Green
            (value - 0.25) * 4
        );
    } else if (value < 0.75) {
        return new THREE.Color().lerpColors(
            new THREE.Color(0x00ff66),
            new THREE.Color(0xffff00), // Yellow
            (value - 0.5) * 4
        );
    } else {
        return new THREE.Color().lerpColors(
            new THREE.Color(0xffff00),
            new THREE.Color(0xff3300), // Red
            (value - 0.75) * 4
        );
    }
};

export const GravityHeatmap: React.FC = () => {
    const bodies = usePhysicsStore(state => state.bodies);
    const showGravityField = usePhysicsStore(state => state.showGravityField);
    const useRealisticDistances = usePhysicsStore(state => state.useRealisticDistances);

    const meshRef = useRef<THREE.Mesh>(null);
    const frameCount = useRef(0);

    // Adjust extent based on distance scale
    const extent = useRealisticDistances ? GRID_EXTENT * 4 : GRID_EXTENT;

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
        if (frameCount.current % UPDATE_INTERVAL !== 0) return;

        const geo = meshRef.current.geometry as THREE.PlaneGeometry;
        const positions = geo.attributes.position.array as Float32Array;
        const colors = geo.attributes.color.array as Float32Array;

        let minPotential = Infinity;
        let maxPotential = -Infinity;
        const potentials: number[] = [];

        // 1. Calculate Potential at each vertex
        // P = Sum(m_i / r_i)  (Ignoring G for relative visualization)
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];

            let potential = 0;
            for (const body of bodies) {
                const dx = x - body.position.x;
                const dz = z - body.position.z;
                // Add small epsilon to avoid division by zero near body center
                const dist = Math.sqrt(dx * dx + dz * dz) + 0.5;
                potential += body.mass / dist;
            }

            potentials.push(potential);
            if (potential < minPotential) minPotential = potential;
            if (potential > maxPotential) maxPotential = potential;
        }

        // 2. Normalize and Color mapped logarithmically
        // Logarithmic scale helps visualize the vast range of gravity
        const logMin = Math.log(minPotential + 1);
        const logMax = Math.log(maxPotential + 1);
        const logRange = logMax - logMin || 1;

        for (let i = 0; i < potentials.length; i++) {
            const logVal = Math.log(potentials[i] + 1);
            const normalized = (logVal - logMin) / logRange;
            const color = getColor(Math.min(Math.max(normalized, 0), 1));

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geo.attributes.color.needsUpdate = true;
    });

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
