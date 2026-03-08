/**
 * GammaRayBurst.tsx
 * Oriented relativistic jet burst for black-hole-forming supernovae
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GammaRayBurstProps {
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
    length: number;
    axis: { x: number; y: number; z: number };
    width: number;
    coreIntensity: number;
    onComplete?: () => void;
}

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
        uniform float coreIntensity;
        varying vec2 vUv;

        void main() {
            vec2 centered = vUv - 0.5;
            float distFromAxis = abs(centered.x) * 2.0;
            float along = clamp(vUv.y, 0.0, 1.0);
            float core = 1.0 - smoothstep(0.0, 0.14, distFromAxis);
            float glow = 1.0 - smoothstep(0.0, 0.48, distFromAxis);
            float lengthMask = smoothstep(0.0, 0.08, along) * step(along, progress);
            float tail = 1.0 - smoothstep(0.6, 1.0, along);
            float alpha = (core * coreIntensity + glow * 0.38) * tail * lengthMask * opacity;
            vec3 color = mix(vec3(0.45, 0.72, 1.0), vec3(1.0), core);
            gl_FragColor = vec4(color, alpha);
        }
    `
};

export const GammaRayBurst: React.FC<GammaRayBurstProps> = ({
    position,
    startTime,
    duration,
    length,
    axis,
    width,
    coreIntensity,
    onComplete
}) => {
    const topJetRef = useRef<THREE.Mesh>(null);
    const bottomJetRef = useRef<THREE.Mesh>(null);
    const completedRef = useRef(false);

    const uniforms = useMemo(() => ({
        progress: { value: 0 },
        opacity: { value: 1 },
        coreIntensity: { value: coreIntensity }
    }), [coreIntensity]);

    const orientation = useMemo(() => {
        const dir = new THREE.Vector3(axis.x, axis.y, axis.z).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        return quaternion;
    }, [axis.x, axis.y, axis.z]);

    useFrame(() => {
        if (completedRef.current) {
            return;
        }

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            completedRef.current = true;
            onComplete?.();
            return;
        }

        const visualProgress = progress < 0.45 ? progress / 0.45 : 1;
        const opacity = progress > 0.72 ? 1 - (progress - 0.72) / 0.28 : 1;

        [topJetRef.current, bottomJetRef.current].forEach(mesh => {
            if (!mesh) {
                return;
            }

            const material = mesh.material as THREE.ShaderMaterial;
            material.uniforms.progress.value = visualProgress;
            material.uniforms.opacity.value = opacity;
        });
    });

    return (
        <group
            position={[position.x, position.y, position.z]}
            quaternion={orientation}
        >
            <mesh ref={topJetRef} position={[0, length / 2, 0]}>
                <planeGeometry args={[width, length]} />
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

            <mesh ref={bottomJetRef} position={[0, -length / 2, 0]} rotation={[0, 0, Math.PI]}>
                <planeGeometry args={[width, length]} />
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
