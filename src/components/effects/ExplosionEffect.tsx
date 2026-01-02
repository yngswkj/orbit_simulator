/**
 * ExplosionEffect.tsx
 * Particle-based explosion with flash, sparks, and smoke
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EFFECT_CONSTANTS } from '../../constants/physics';

interface ExplosionEffectProps {
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
    size: number;
    color: string;
    particleCount: number;
    onComplete?: () => void;
}

export const ExplosionEffect: React.FC<ExplosionEffectProps> = ({
    position,
    startTime,
    duration,
    size,
    color,
    particleCount,
    onComplete
}) => {
    const pointsRef = useRef<THREE.Points>(null);
    const flashRef = useRef<THREE.Mesh>(null);
    const completedRef = useRef(false);

    // Initialize particles
    const { geometry, velocities, initialSizes } = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const vels: THREE.Vector3[] = [];
        const initSizes: number[] = [];

        const baseColor = new THREE.Color(color);
        const brightColor = new THREE.Color('#ffffff');

        for (let i = 0; i < particleCount; i++) {
            // Start at center
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;

            // Random velocity (spherical distribution)
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const speed = size * (0.5 + Math.random() * 1.5);

            vels.push(new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.sin(phi) * Math.sin(theta) * speed,
                Math.cos(phi) * speed
            ));

            // Color gradient: center particles brighter
            const brightness = 0.5 + Math.random() * 0.5;
            const particleColor = new THREE.Color().lerpColors(baseColor, brightColor, Math.random() * 0.5);

            colors[i * 3] = particleColor.r * brightness;
            colors[i * 3 + 1] = particleColor.g * brightness;
            colors[i * 3 + 2] = particleColor.b * brightness;

            // Random sizes
            const particleSize = size * 0.05 * (0.3 + Math.random() * 0.7);
            sizes[i] = particleSize;
            initSizes.push(particleSize);
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        return { geometry: geo, velocities: vels, initialSizes: initSizes };
    }, [position, size, color, particleCount]);

    useFrame(() => {
        if (completedRef.current) return;

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1 && !completedRef.current) {
            completedRef.current = true;
            onComplete?.();
            return;
        }

        // Update flash (bright sphere that fades quickly)
        if (flashRef.current) {
            const flashProgress = Math.min(elapsed / (duration * 0.3), 1);
            const flashScale = size * 2 * (1 - flashProgress * 0.5);
            flashRef.current.scale.setScalar(flashScale);

            const material = flashRef.current.material as THREE.MeshBasicMaterial;
            material.opacity = (1 - flashProgress) * 0.9;
        }

        // Update particles
        if (pointsRef.current) {
            const positions = geometry.attributes.position.array as Float32Array;
            const sizes = geometry.attributes.size.array as Float32Array;
            const colors = geometry.attributes.color.array as Float32Array;

            const dt = EFFECT_CONSTANTS.FRAME_TIME;
            const drag = 0.98;
            const gravity = -0.02 * size;

            for (let i = 0; i < particleCount; i++) {
                // Update position
                positions[i * 3] += velocities[i].x * dt;
                positions[i * 3 + 1] += velocities[i].y * dt + gravity * dt;
                positions[i * 3 + 2] += velocities[i].z * dt;

                // Apply drag
                velocities[i].multiplyScalar(drag);

                // Shrink particles over time
                sizes[i] = initialSizes[i] * (1 - progress * 0.8);

                // Gamma-corrected fade for more natural color transition
                const gammaFade = Math.pow(1 - progress, EFFECT_CONSTANTS.GAMMA_CORRECTION);
                colors[i * 3] *= 0.995 * (0.7 + 0.3 * gammaFade);
                colors[i * 3 + 1] *= 0.99 * (0.7 + 0.3 * gammaFade);
                colors[i * 3 + 2] *= 0.98 * (0.7 + 0.3 * gammaFade);
            }

            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.size.needsUpdate = true;
            geometry.attributes.color.needsUpdate = true;
        }
    });

    return (
        <group>
            {/* Central flash */}
            <mesh ref={flashRef} position={[position.x, position.y, position.z]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={1}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Particles */}
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
        </group>
    );
};
