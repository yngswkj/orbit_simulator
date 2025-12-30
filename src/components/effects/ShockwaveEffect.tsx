import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShockwaveEffectProps {
    position: THREE.Vector3;
    startTime: number;
    duration?: number;
    maxRadius?: number;
    color?: string;
    onComplete?: () => void;
}

export const ShockwaveEffect: React.FC<ShockwaveEffectProps> = ({
    position,
    startTime,
    duration = 1500,
    maxRadius = 50,
    color = '#ffaa00',
    onComplete
}) => {
    const ringRef = useRef<THREE.Mesh>(null);
    const startTimeRef = useRef(startTime);

    useFrame(() => {
        if (!ringRef.current) return;

        const elapsed = performance.now() - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            onComplete?.();
            return;
        }

        // イージング（急速に広がり、徐々に減速）
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentRadius = maxRadius * eased;

        // スケール更新
        ringRef.current.scale.set(currentRadius, currentRadius, 1);

        // 透明度（中盤で最大、その後フェードアウト）
        const material = ringRef.current.material as THREE.MeshBasicMaterial;

        if (progress < 0.2) {
            material.opacity = (progress / 0.2) * 0.8;
        } else {
            material.opacity = 0.8 * (1 - (progress - 0.2) / 0.8);
        }
    });

    return (
        <mesh
            ref={ringRef}
            position={position}
            rotation={[-Math.PI / 2, 0, 0]}
        >
            <ringGeometry args={[0.8, 1, 64]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0}
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};
