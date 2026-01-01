import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TidalDisruptionEffectProps {
    position: THREE.Vector3;
    primaryPosition: THREE.Vector3;
    bodyRadius: number;
    bodyColor: string;
    startTime: number;
    duration?: number;
    onComplete?: () => void;
}

const PARTICLE_COUNT = 2000;

export const TidalDisruptionEffect: React.FC<TidalDisruptionEffectProps> = ({
    position,
    primaryPosition,
    bodyRadius,
    bodyColor,
    startTime,
    duration = 5000,
    onComplete
}) => {
    const pointsRef = useRef<THREE.Points>(null);
    const startTimeRef = useRef(startTime);

    // パーティクル初期化
    const { geometry, velocities } = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const sizes = new Float32Array(PARTICLE_COUNT);
        const vels: THREE.Vector3[] = [];
        // const initPos: THREE.Vector3[] = []; // Unused for now

        const baseColor = new THREE.Color(bodyColor);
        const toPrimary = new THREE.Vector3()
            .subVectors(primaryPosition, position)
            .normalize();

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // 球面上にランダム配置
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = bodyRadius * (0.8 + Math.random() * 0.4);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = position.x + x;
            positions[i * 3 + 1] = position.y + y;
            positions[i * 3 + 2] = position.z + z;

            // initPos.push(new THREE.Vector3(x, y, z));

            // 潮汐力方向（主天体に向かう/離れる方向）に沿った速度
            const tidalDir = new THREE.Vector3(x, y, z).normalize();
            const dot = tidalDir.dot(toPrimary);

            // 主天体側は引き寄せられ、反対側は押し出される
            const speed = (0.5 + Math.random() * 0.5) * bodyRadius * 0.1;
            const vel = tidalDir.clone().multiplyScalar(dot * speed);

            // 接線方向の回転成分を追加
            const tangent = new THREE.Vector3()
                .crossVectors(toPrimary, tidalDir)
                .normalize()
                .multiplyScalar(speed * 0.3);
            vel.add(tangent);

            vels.push(vel);

            // 色（中心に近いほど明るく）
            const colorVariation = 0.7 + Math.random() * 0.3;
            colors[i * 3] = baseColor.r * colorVariation;
            colors[i * 3 + 1] = baseColor.g * colorVariation;
            colors[i * 3 + 2] = baseColor.b * colorVariation;

            sizes[i] = bodyRadius * 0.02 * (0.5 + Math.random());
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        return { geometry: geo, velocities: vels };
    }, [position, primaryPosition, bodyRadius, bodyColor]);

    useFrame(() => {
        if (!pointsRef.current) return;

        const elapsed = (performance.now() - startTimeRef.current);
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            onComplete?.();
            return;
        }

        const positions = geometry.attributes.position.array as Float32Array;
        const sizes = geometry.attributes.size.array as Float32Array;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // 位置更新
            positions[i * 3] += velocities[i].x * 0.016;
            positions[i * 3 + 1] += velocities[i].y * 0.016;
            positions[i * 3 + 2] += velocities[i].z * 0.016;

            // 徐々に減速
            velocities[i].multiplyScalar(0.995);

            // サイズ縮小（フェードアウト）
            sizes[i] *= (1 - progress * 0.01);
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;

        // マテリアルの透明度も調整
        const material = pointsRef.current.material as THREE.PointsMaterial;
        material.opacity = 1 - progress * 0.8;
    });

    return (
        <points ref={pointsRef} geometry={geometry}>
            <pointsMaterial
                vertexColors
                transparent
                opacity={1}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};
