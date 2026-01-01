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
import { Line } from '@react-three/drei';

const UPDATE_INTERVAL = 4;     // Update every N frames
const SAMPLE_ANGLES = 72;      // Angular samples for boundary detection

// Find boundary points where classification changes from habitable to non-habitable
const findBoundaryPoints = (
    stars: { position: { x: number; z: number }; mass: number }[],
    referenceFlux: number,
    maxRadius: number
): { inner: THREE.Vector3[]; outer: THREE.Vector3[] } => {
    const innerPoints: THREE.Vector3[] = [];
    const outerPoints: THREE.Vector3[] = [];

    for (let a = 0; a < SAMPLE_ANGLES; a++) {
        const angle = (a / SAMPLE_ANGLES) * Math.PI * 2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        let innerR: number | null = null;
        let outerR: number | null = null;
        let prevClass = -1;

        // Sample along the ray from center outward
        for (let r = 1; r <= maxRadius; r += 2) {
            const x = cosA * r;
            const z = sinA * r;
            const flux = calculateFluxAt(x, z, stars);
            const classification = classifyHabitability(flux, referenceFlux);

            // Detect transitions
            if (prevClass !== -1) {
                if (prevClass !== 1 && classification === 1) {
                    // Entering habitable zone (inner boundary)
                    innerR = r;
                } else if (prevClass === 1 && classification !== 1) {
                    // Leaving habitable zone (outer boundary)
                    outerR = r;
                }
            }
            prevClass = classification;
        }

        // Add points if boundaries found
        if (innerR !== null) {
            innerPoints.push(new THREE.Vector3(cosA * innerR, 0, sinA * innerR));
        }
        if (outerR !== null) {
            outerPoints.push(new THREE.Vector3(cosA * outerR, 0, sinA * outerR));
        }
    }

    return { inner: innerPoints, outer: outerPoints };
};

export const HabitableZoneMap: React.FC = () => {
    // TODO: Multi-star habitable zone visualization is temporarily disabled
    // The ring-based approach needs refinement for smoother boundaries
    return null;
};

// Translucent fill between inner and outer boundaries
const HabitableFill: React.FC<{ inner: THREE.Vector3[]; outer: THREE.Vector3[] }> = ({ inner, outer }) => {
    const geometry = useMemo(() => {
        if (inner.length < 3 || outer.length < 3) return null;

        const geo = new THREE.BufferGeometry();
        const vertices: number[] = [];

        // Create triangle strip between inner and outer rings
        const minLen = Math.min(inner.length - 1, outer.length - 1);

        for (let i = 0; i < minLen; i++) {
            const i0 = inner[i];
            const o0 = outer[i];
            const i1 = inner[(i + 1) % (inner.length - 1)];
            const o1 = outer[(i + 1) % (outer.length - 1)];

            // First triangle
            vertices.push(i0.x, i0.y, i0.z);
            vertices.push(o0.x, o0.y, o0.z);
            vertices.push(i1.x, i1.y, i1.z);

            // Second triangle
            vertices.push(i1.x, i1.y, i1.z);
            vertices.push(o0.x, o0.y, o0.z);
            vertices.push(o1.x, o1.y, o1.z);
        }

        geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geo.computeVertexNormals();

        return geo;
    }, [inner, outer]);

    if (!geometry) return null;

    return (
        <mesh geometry={geometry}>
            <meshBasicMaterial
                color="#22ff66"
                transparent
                opacity={0.12}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
};
