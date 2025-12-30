import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '../../store/physicsStore';
import { calculateFluxAt, classifyHabitability } from '../../utils/habitableZone';
import { DISTANCE_SCALES } from '../../utils/solarSystem';
import * as THREE from 'three';

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
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
};
