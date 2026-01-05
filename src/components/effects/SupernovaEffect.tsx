/**
 * SupernovaEffect.tsx
 * Supernova explosion effect with brightening, explosion, and fading phases
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SupernovaEffectProps {
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
    maxRadius: number;
    color: string;
    intensity: number;
    onComplete?: () => void;
}

// Custom shader for supernova core glow
const supernovaShader = {
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float progress;
        uniform float opacity;
        uniform vec3 color;
        uniform float intensity;
        uniform float phase; // 0-1: brightening, 1-2: explosion, 2-3: fading
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
            // Distance from center (spherical)
            vec2 centered = vUv - 0.5;
            float dist = length(centered) * 2.0;

            float alpha = 0.0;
            float brightness = 1.0;

            // Phase 0-0.33: Brightening (core intensifies)
            if (phase < 0.33) {
                float phaseProgress = phase / 0.33;
                // Core glow that intensifies
                alpha = smoothstep(1.0, 0.3, dist) * (0.5 + phaseProgress * 0.5);
                brightness = 1.0 + phaseProgress * intensity * 2.0;
            }
            // Phase 0.33-0.5: Explosion (rapid expansion)
            else if (phase < 0.5) {
                float phaseProgress = (phase - 0.33) / 0.17;
                // Bright flash
                alpha = smoothstep(1.2, 0.0, dist) * (1.0 - phaseProgress * 0.3);
                brightness = intensity * 3.0 * (1.0 - phaseProgress * 0.5);
            }
            // Phase 0.5-1.0: Fading (remnant glow)
            else {
                float phaseProgress = (phase - 0.5) / 0.5;
                // Fading core
                alpha = smoothstep(0.8, 0.0, dist) * (1.0 - phaseProgress);
                brightness = intensity * (1.0 - phaseProgress);
            }

            // Add pulsating effect during brightening
            if (phase < 0.33) {
                float pulse = sin(phase * 30.0) * 0.1 + 0.9;
                brightness *= pulse;
            }

            // Radial gradient for depth
            float radialGradient = 1.0 - dist * 0.5;
            alpha *= radialGradient;

            vec3 finalColor = color * brightness;
            gl_FragColor = vec4(finalColor, alpha * opacity);
        }
    `
};

export const SupernovaEffect: React.FC<SupernovaEffectProps> = ({
    position,
    startTime,
    duration,
    maxRadius,
    color,
    intensity,
    onComplete
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const completedRef = useRef(false);

    const uniforms = useMemo(() => ({
        progress: { value: 0 },
        opacity: { value: 1 },
        color: { value: new THREE.Color(color) },
        intensity: { value: intensity },
        phase: { value: 0 }
    }), [color, intensity]);

    useFrame(() => {
        if (!materialRef.current || completedRef.current) return;

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1 && !completedRef.current) {
            completedRef.current = true;
            onComplete?.();
            return;
        }

        // Update phase (0-1 for full animation)
        materialRef.current.uniforms.progress.value = progress;
        materialRef.current.uniforms.phase.value = progress;

        // Scale changes based on phase
        if (meshRef.current) {
            let scale;

            if (progress < 0.13) {
                // Phase 1: Slight contraction (0-2s)
                const phaseProgress = progress / 0.13;
                scale = maxRadius * 0.3 * (1.0 - phaseProgress * 0.2);
            } else if (progress < 0.33) {
                // Phase 2: Rapid brightening (2-5s)
                const phaseProgress = (progress - 0.13) / 0.2;
                scale = maxRadius * 0.3 * (0.8 + phaseProgress * 0.4);
            } else if (progress < 0.5) {
                // Phase 3: Explosive expansion (5-7.5s)
                const phaseProgress = (progress - 0.33) / 0.17;
                const easedProgress = 1 - Math.pow(1 - phaseProgress, 3);
                scale = maxRadius * 0.3 * (1.2 + easedProgress * 4.0);
            } else {
                // Phase 4: Continued expansion and fade (7.5-15s)
                const phaseProgress = (progress - 0.5) / 0.5;
                const easedProgress = Math.sqrt(phaseProgress);
                scale = maxRadius * 0.3 * (5.2 + easedProgress * 2.0);
            }

            meshRef.current.scale.set(scale, scale, scale);
        }

        // Opacity fade in final phase
        if (progress > 0.7) {
            const fadeProgress = (progress - 0.7) / 0.3;
            materialRef.current.uniforms.opacity.value = 1 - fadeProgress;
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={[position.x, position.y, position.z]}
        >
            {/* Spherical billboard effect */}
            <sphereGeometry args={[1, 32, 32]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={supernovaShader.vertexShader}
                fragmentShader={supernovaShader.fragmentShader}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.FrontSide}
            />
        </mesh>
    );
};
