/**
 * HeatGlowEffect.tsx
 * Shader-based heat glow effect with fresnel and pulsing
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HeatGlowEffectProps {
    position: { x: number; y: number; z: number };
    radius: number;
    startTime: number;
    duration: number;
    intensity?: number;
    onComplete?: () => void;
}

// Custom shader for heat glow with fresnel effect
const heatGlowShader = {
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform float progress;
        uniform float intensity;
        uniform vec3 hotColor;
        uniform vec3 coolColor;

        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
            // View direction
            vec3 viewDir = normalize(vViewPosition);

            // Fresnel effect (rim lighting)
            float fresnel = 1.0 - abs(dot(vNormal, viewDir));
            fresnel = pow(fresnel, 2.0);

            // Pulsing effect
            float pulse = 0.85 + 0.15 * sin(time * 8.0);
            float pulse2 = 0.9 + 0.1 * sin(time * 12.0 + 1.5);

            // Color transition based on progress (hot -> cool)
            vec3 color = mix(hotColor, coolColor, progress * 0.8);

            // Add some noise-like variation
            float noiseish = sin(vNormal.x * 10.0 + time * 3.0) *
                            sin(vNormal.y * 10.0 + time * 2.0) *
                            sin(vNormal.z * 10.0 + time * 4.0);
            noiseish = noiseish * 0.1 + 0.9;

            // Combine effects
            float alpha = fresnel * pulse * pulse2 * intensity * (1.0 - progress * 0.7) * noiseish;

            // Brightness variation
            float brightness = 1.0 + fresnel * 0.5;

            gl_FragColor = vec4(color * brightness, alpha);
        }
    `
};

export const HeatGlowEffect: React.FC<HeatGlowEffectProps> = ({
    position,
    radius,
    startTime,
    duration,
    intensity = 1.0,
    onComplete
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const completedRef = useRef(false);

    const uniforms = useMemo(() => ({
        time: { value: 0 },
        progress: { value: 0 },
        intensity: { value: intensity },
        hotColor: { value: new THREE.Color('#ff4400') },
        coolColor: { value: new THREE.Color('#440000') }
    }), [intensity]);

    useFrame(({ clock }) => {
        if (!materialRef.current || completedRef.current) return;

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1 && !completedRef.current) {
            completedRef.current = true;
            onComplete?.();
            return;
        }

        materialRef.current.uniforms.time.value = clock.elapsedTime;
        materialRef.current.uniforms.progress.value = progress;

        // Scale slightly expands then contracts
        if (meshRef.current) {
            const breathe = 1 + 0.1 * Math.sin(clock.elapsedTime * 3) * (1 - progress);
            const baseScale = radius * 1.15 * (1 + (1 - progress) * 0.1);
            meshRef.current.scale.setScalar(baseScale * breathe);
        }
    });

    return (
        <mesh ref={meshRef} position={[position.x, position.y, position.z]}>
            <sphereGeometry args={[1, 32, 32]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={heatGlowShader.vertexShader}
                fragmentShader={heatGlowShader.fragmentShader}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.FrontSide}
            />
        </mesh>
    );
};
