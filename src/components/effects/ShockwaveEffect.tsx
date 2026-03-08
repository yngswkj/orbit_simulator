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
    asymmetry?: number; // 0.0 - 1.0
    directionBias?: { x: number; y: number; z: number };
    onComplete?: () => void;
}

// Custom shader for glowing shockwave ring with asymmetric expansion
const shockwaveShader = {
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        void main() {
            vUv = uv;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,
    fragmentShader: `
        uniform float progress;
        uniform float opacity;
        uniform vec3 color;
        uniform float ringWidth;
        uniform float asymmetry;
        uniform vec3 directionBias;
        uniform vec3 centerPosition;
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        void main() {
            // Direction from center to current fragment
            vec3 dirFromCenter = normalize(vWorldPosition - centerPosition);

            // Calculate asymmetric bias
            // Dot product: -1 (opposite direction) to 1 (same direction)
            float directionDot = dot(dirFromCenter, directionBias);

            // Asymmetric radius modifier
            // In biased direction: expand more (1.0 + asymmetry)
            // Opposite direction: expand less (1.0 - asymmetry)
            float radiusMod = 1.0 + directionDot * asymmetry;

            // Distance from center in UV space
            vec2 centered = vUv - 0.5;
            float dist = length(centered) * 2.0;

            // Adjusted ring position based on asymmetry
            float ringPos = progress * radiusMod;
            float ringDist = abs(dist - ringPos);

            // Ring intensity with soft falloff
            float ring = smoothstep(ringWidth * radiusMod, 0.0, ringDist);

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
    asymmetry = 0,
    directionBias = { x: 0, y: 1, z: 0 }, // Default: Y-axis
    onComplete
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const completedRef = useRef(false);

    const uniforms = useMemo(() => ({
        progress: { value: 0 },
        opacity: { value: 1 },
        color: { value: new THREE.Color(color) },
        ringWidth: { value: 0.15 },
        asymmetry: { value: asymmetry },
        directionBias: { value: new THREE.Vector3(directionBias.x, directionBias.y, directionBias.z) },
        centerPosition: { value: new THREE.Vector3(position.x, position.y, position.z) }
    }), [color, asymmetry, directionBias, position]);

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
