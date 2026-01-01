/**
 * ShockwaveEffect.tsx
 * Rich expanding shockwave ring effect with glow and fade
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShockwaveEffectProps {
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
    maxRadius: number;
    color: string;
    onComplete?: () => void;
}

// Custom shader for glowing shockwave ring
const shockwaveShader = {
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float progress;
        uniform float opacity;
        uniform vec3 color;
        uniform float ringWidth;
        varying vec2 vUv;

        void main() {
            // Distance from center
            vec2 centered = vUv - 0.5;
            float dist = length(centered) * 2.0;

            // Ring position based on progress
            float ringPos = progress;
            float ringDist = abs(dist - ringPos);

            // Ring intensity with soft falloff
            float ring = smoothstep(ringWidth, 0.0, ringDist);

            // Inner glow
            float innerGlow = smoothstep(ringPos, 0.0, dist) * 0.3;

            // Combine
            float alpha = (ring + innerGlow) * opacity;

            // Edge brightness boost
            float edgeBrightness = 1.0 + ring * 0.5;

            gl_FragColor = vec4(color * edgeBrightness, alpha);
        }
    `
};

export const ShockwaveEffect: React.FC<ShockwaveEffectProps> = ({
    position,
    startTime,
    duration,
    maxRadius,
    color,
    onComplete
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const completedRef = useRef(false);

    const uniforms = useMemo(() => ({
        progress: { value: 0 },
        opacity: { value: 1 },
        color: { value: new THREE.Color(color) },
        ringWidth: { value: 0.15 }
    }), [color]);

    useFrame(() => {
        if (!materialRef.current || completedRef.current) return;

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1 && !completedRef.current) {
            completedRef.current = true;
            onComplete?.();
            return;
        }

        // Easing for expansion (fast start, slow end)
        const easedProgress = 1 - Math.pow(1 - progress, 2);

        // Update uniforms
        materialRef.current.uniforms.progress.value = easedProgress;

        // Fade out in the last 40%
        const fadeStart = 0.6;
        if (progress > fadeStart) {
            const fadeProgress = (progress - fadeStart) / (1 - fadeStart);
            materialRef.current.uniforms.opacity.value = 1 - fadeProgress;
        }

        // Ring gets thinner as it expands
        materialRef.current.uniforms.ringWidth.value = 0.2 * (1 - progress * 0.5);

        // Scale the mesh
        if (meshRef.current) {
            const scale = maxRadius * easedProgress * 2;
            meshRef.current.scale.set(scale, scale, 1);
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={[position.x, position.y + 0.1, position.z]}
            rotation={[-Math.PI / 2, 0, 0]}
        >
            <planeGeometry args={[1, 1, 1, 1]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={shockwaveShader.vertexShader}
                fragmentShader={shockwaveShader.fragmentShader}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};
