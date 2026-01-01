<<<<<<< HEAD
/**
 * HabitableZoneMap.tsx
 * Ring-based visualization of habitable zones for multi-star systems
 * Shows habitable region boundaries as glowing green rings
 */

=======
>>>>>>> advanced-visualization-week1
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '../../store/physicsStore';
import { calculateFluxAt, classifyHabitability } from '../../utils/habitableZone';
import { DISTANCE_SCALES } from '../../utils/solarSystem';
import * as THREE from 'three';
<<<<<<< HEAD
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
=======

const GRID_SIZE = 100;
const UPDATE_INTERVAL = 5;

// 色定義: 寒すぎ(青) / ハビタブル(緑) / 熱すぎ(赤)
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

    // グリッド範囲（最も遠い恒星の2倍）
    const extent = useMemo(() => {
        // Fallback or empty array check unnecessary for Hooks order, but good for logic
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

        // 正規化用: 1AUでの太陽フラックス
        const referenceFlux = 1.0 / (auScale * auScale);

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            const vertexIndex = i / 3;

            const flux = calculateFluxAt(x, z, stars);
            const normalizedFlux = flux / referenceFlux;
            const classification = classifyHabitability(normalizedFlux);

            let color: THREE.Color;

            switch (classification) {
                case 0: // 寒すぎ
                    color = COLORS.COLD;
                    break;
                case 1: // ハビタブル
                    color = COLORS.HABITABLE;
                    break;
                case 2: // 熱すぎ
                    color = COLORS.HOT;
                    break;
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
>>>>>>> advanced-visualization-week1
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
};
