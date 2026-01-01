/**
 * HabitableZoneMap.tsx
 * Ring-based visualization of habitable zones for multi-star systems
 * Shows habitable region boundaries as glowing green rings
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '../../store/physicsStore';
import { calculateFluxAt, classifyHabitability } from '../../utils/habitableZone';
import { DISTANCE_SCALES } from '../../utils/solarSystem';
import * as THREE from 'three';

const GRID_SIZE = 100;
const UPDATE_INTERVAL = 5;

// Definitions: Too Cold (Blue), Habitable (Green), Too Hot (Red)
const COLORS = {
    COLD: new THREE.Color(0x0044aa),
    HABITABLE: new THREE.Color(0x22aa44),
    HOT: new THREE.Color(0xaa2222),
    TRANSPARENT: new THREE.Color(0x000000),
};

export const HabitableZoneMap: React.FC = () => {
    const bodies = usePhysicsStore(state => state.bodies);
    const showHabitableZone = usePhysicsStore(state => state.showHabitableZone);
    const useRealisticDistances = usePhysicsStore(state => state.useRealisticDistances);

    const meshRef = useRef<THREE.Mesh>(null);
    const frameCount = useRef(0);

    const stars = useMemo(() => bodies.filter(b => b.isStar), [bodies]);
    const isMultiStarSystem = stars.length > 1;

    // Grid extent (based on farthest star)
    const extent = useMemo(() => {
        if (stars.length === 0) return 1000;

        const maxDist = Math.max(...stars.map(s =>
            Math.sqrt(s.position.x ** 2 + s.position.z ** 2)
        ));
        const baseExtent = Math.max(maxDist * 3, 100);
        return useRealisticDistances ? baseExtent * 4 : baseExtent;
    }, [stars, useRealisticDistances]);

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(extent * 2, extent * 2, GRID_SIZE, GRID_SIZE);
        geo.rotateX(-Math.PI / 2);

        const colors = new Float32Array((GRID_SIZE + 1) * (GRID_SIZE + 1) * 3);
        const alphas = new Float32Array((GRID_SIZE + 1) * (GRID_SIZE + 1));

        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

        return geo;
    }, [extent]);

    useFrame(() => {
        if (!showHabitableZone || !meshRef.current || stars.length < 2) return;

        frameCount.current++;
        if (frameCount.current % UPDATE_INTERVAL !== 0) return;

        const geo = meshRef.current.geometry as THREE.PlaneGeometry;
        const positions = geo.attributes.position.array as Float32Array;
        const colors = geo.attributes.color.array as Float32Array;

        const auScale = useRealisticDistances
            ? DISTANCE_SCALES.REALISTIC.AU_UNIT
            : DISTANCE_SCALES.COMPRESSED.AU_UNIT;

        // Normalization: Flux at 1 AU from Sun
        const referenceFlux = 1.0 / (auScale * auScale);

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            const vertexIndex = i / 3;

            const flux = calculateFluxAt(x, z, stars);

            // Note: classifyHabitability now handles normalization if we pass non-normalized flux?
            // Wait, looking at utils/habitableZone.ts:
            // classifyHabitability takes (flux, referenceFlux) and does flux/referenceFlux internally.
            // So we should pass the RAW flux and the referenceFlux separately.

            // Week 1 code was doing: normalizedFlux = flux / referenceFlux -> classifyHabitability(normalizedFlux)
            // But Week 1 classifyHabitability EXPECTED normalized flux.

            // HEAD code (which I saved to utils) expects: classifyHabitability(flux, referenceFlux)
            // So I should pass raw flux and referenceFlux.

            const classification = classifyHabitability(flux, referenceFlux);

            let color: THREE.Color;

            switch (classification) {
                case 0: // Cold
                    color = COLORS.COLD;
                    break;
                case 1: // Habitable
                    color = COLORS.HABITABLE;
                    break;
                case 2: // Hot
                    color = COLORS.HOT;
                    break;
                default:
                    color = COLORS.COLD;
            }

            colors[vertexIndex * 3] = color.r;
            colors[vertexIndex * 3 + 1] = color.g;
            colors[vertexIndex * 3 + 2] = color.b;
        }

        geo.attributes.color.needsUpdate = true;
    });

    if (!showHabitableZone || !isMultiStarSystem) return null;

    return (
        <mesh ref={meshRef} geometry={geometry} position={[0, -1.5, 0]}>
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
