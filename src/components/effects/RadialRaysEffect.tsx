/**
 * RadialRaysEffect.tsx
 * Radial light rays emanating from supernova explosion
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RadialRaysEffectProps {
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
    rayCount: number;
    maxLength: number;
    color: string;
    onComplete?: () => void;
}

// Custom shader for radial rays with glow
const radialRayShader = {
    vertexShader: `
        precision mediump float;
        varying vec2 vUv;
        varying float vIntensity;

        void main() {
            vUv = uv;
            // Calculate intensity based on distance from center
            vec2 center = vec2(0.5, 0.5);
            float distFromCenter = length(uv - center);
            vIntensity = 1.0 - smoothstep(0.0, 0.5, distFromCenter);

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        precision mediump float;
        uniform float progress;
        uniform float opacity;
        uniform vec3 color;
        varying vec2 vUv;
        varying float vIntensity;

        void main() {
            // Create ray pattern
            vec2 centered = vUv - 0.5;
            float angle = atan(centered.y, centered.x);
            float dist = length(centered) * 2.0;

            // Ray intensity with sharp edges
            float rayPattern = abs(sin(angle * 6.0)); // 12 rays (6 * 2)
            rayPattern = pow(rayPattern, 3.0); // Sharpen

            // Length mask (rays extend as progress increases)
            float lengthMask = step(dist, progress);

            // Brightness falloff from center
            float brightness = (1.0 - dist) * 2.0;
            brightness *= vIntensity;

            float alpha = rayPattern * lengthMask * brightness * opacity;

            gl_FragColor = vec4(color, alpha);
        }
    `
};

export const RadialRaysEffect: React.FC<RadialRaysEffectProps> = ({
    position,
    startTime,
    duration,
    maxLength,
    color,
    onComplete
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const raysRef = useRef<THREE.Mesh[]>([]);
    const completedRef = useRef(false);

    const rayCount = 12; // Number of rays

    // Create individual ray meshes
    const rays = useMemo(() => {
        const raysArray: JSX.Element[] = [];

        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2;
            const rotation = new THREE.Euler(0, 0, angle);

            const uniforms = {
                progress: { value: 0 },
                opacity: { value: 1 },
                color: { value: new THREE.Color(color) }
            };

            raysArray.push(
                <mesh
                    key={i}
                    rotation={rotation}
                    ref={(ref) => {
                        if (ref) raysRef.current[i] = ref;
                    }}
                >
                    <planeGeometry args={[maxLength * 2, maxLength * 0.3]} />
                    <shaderMaterial
                        uniforms={uniforms}
                        vertexShader={radialRayShader.vertexShader}
                        fragmentShader={radialRayShader.fragmentShader}
                        transparent
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            );
        }

        return raysArray;
    }, [rayCount, maxLength, color]);

    useFrame(() => {
        if (completedRef.current) return;

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1 && !completedRef.current) {
            completedRef.current = true;
            onComplete?.();
            return;
        }

        // Update all rays
        raysRef.current.forEach((ray, index) => {
            if (!ray) return;

            const material = ray.material as THREE.ShaderMaterial;

            // Staggered progress for each ray
            const stagger = (index / rayCount) * 0.2;
            const rayProgress = Math.max(0, Math.min(1, (progress - stagger) * 1.2));

            // Eased expansion
            const easedProgress = 1 - Math.pow(1 - rayProgress, 2);
            material.uniforms.progress.value = easedProgress;

            // Fade out in the last 30%
            if (progress > 0.7) {
                const fadeProgress = (progress - 0.7) / 0.3;
                material.uniforms.opacity.value = 1 - fadeProgress;
            }

            // Slight rotation animation
            ray.rotation.z += 0.001;
        });

        // Rotate entire group
        if (groupRef.current) {
            groupRef.current.rotation.z += 0.002;
        }
    });

    return (
        <group
            ref={groupRef}
            position={[position.x, position.y, position.z]}
        >
            {rays}
        </group>
    );
};
