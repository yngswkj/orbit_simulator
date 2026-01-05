/**
 * GammaRayBurst.tsx
 * Gamma-ray burst jets emanating from supernova collapse into black hole
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GammaRayBurstProps {
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
    length: number;
    onComplete?: () => void;
}

// Custom shader for relativistic jets
const jetShader = {
    vertexShader: `
        precision mediump float;
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        precision mediump float;
        uniform float progress;
        uniform float opacity;
        varying vec2 vUv;

        void main() {
            // Distance from center axis
            vec2 centered = vUv - 0.5;
            float distFromAxis = abs(centered.x) * 2.0;
            float lengthPos = centered.y + 0.5; // 0 to 1 from bottom to top

            // Core beam (very bright)
            float coreBeam = 1.0 - smoothstep(0.0, 0.15, distFromAxis);

            // Outer glow
            float outerGlow = 1.0 - smoothstep(0.0, 0.5, distFromAxis);

            // Length mask (jet extends as progress increases)
            float lengthMask = step(lengthPos, progress);

            // Intensity varies along the jet
            float intensity = mix(1.0, 0.3, lengthPos);

            // Combine
            float alpha = (coreBeam * 0.9 + outerGlow * 0.4) * lengthMask * intensity * opacity;

            // Blue-white color for gamma rays
            vec3 color = mix(vec3(0.7, 0.9, 1.0), vec3(1.0, 1.0, 1.0), coreBeam);

            gl_FragColor = vec4(color, alpha);
        }
    `
};

export const GammaRayBurst: React.FC<GammaRayBurstProps> = ({
    position,
    startTime,
    duration,
    length,
    onComplete
}) => {
    const topJetRef = useRef<THREE.Mesh>(null);
    const bottomJetRef = useRef<THREE.Mesh>(null);
    const completedRef = useRef(false);

    const uniforms = {
        progress: { value: 0 },
        opacity: { value: 1 }
    };

    useFrame(() => {
        if (completedRef.current) return;

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1 && !completedRef.current) {
            completedRef.current = true;
            onComplete?.();
            return;
        }

        // Rapid extension in first half, then fade
        let visualProgress;
        if (progress < 0.5) {
            // Rapid extension (0-50%)
            visualProgress = progress * 2;
        } else {
            // Hold at full length (50-100%)
            visualProgress = 1.0;
        }

        // Update both jets
        [topJetRef, bottomJetRef].forEach(ref => {
            if (ref.current) {
                const material = ref.current.material as THREE.ShaderMaterial;
                material.uniforms.progress.value = visualProgress;

                // Fade out in the last 30%
                if (progress > 0.7) {
                    const fadeProgress = (progress - 0.7) / 0.3;
                    material.uniforms.opacity.value = 1 - fadeProgress;
                }
            }
        });
    });

    return (
        <group position={[position.x, position.y, position.z]}>
            {/* Top jet (+Y direction) */}
            <mesh
                ref={topJetRef}
                position={[0, length / 2, 0]}
            >
                <planeGeometry args={[length * 0.1, length]} />
                <shaderMaterial
                    uniforms={uniforms}
                    vertexShader={jetShader.vertexShader}
                    fragmentShader={jetShader.fragmentShader}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Bottom jet (-Y direction) */}
            <mesh
                ref={bottomJetRef}
                position={[0, -length / 2, 0]}
                rotation={[0, 0, Math.PI]}
            >
                <planeGeometry args={[length * 0.1, length]} />
                <shaderMaterial
                    uniforms={uniforms}
                    vertexShader={jetShader.vertexShader}
                    fragmentShader={jetShader.fragmentShader}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};
