/**
 * ExplosionEffect.tsx
 * Shader-driven burst with central flash and hot particulate ejecta
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EFFECT_CONSTANTS } from '../../constants/physics';

const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
};

interface ExplosionEffectProps {
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
    size: number;
    color: string;
    particleCount: number;
    onComplete?: () => void;
}

const particleShader = {
    vertexShader: `
        attribute float size;
        attribute float alphaSeed;
        varying vec3 vColor;
        varying float vAlphaSeed;

        void main() {
            vColor = color;
            vAlphaSeed = alphaSeed;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = max(1.0, size * (280.0 / max(1.0, -mvPosition.z)));
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        precision mediump float;
        uniform float opacity;
        varying vec3 vColor;
        varying float vAlphaSeed;

        void main() {
            vec2 centered = gl_PointCoord - 0.5;
            float dist = length(centered);
            float mask = smoothstep(0.5, 0.08, dist);
            float core = smoothstep(0.18, 0.0, dist);
            float alpha = mask * opacity * (0.72 + vAlphaSeed * 0.28);
            vec3 finalColor = mix(vColor, vec3(1.0), core * 0.55);
            gl_FragColor = vec4(finalColor, alpha);
        }
    `
};

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
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const completedRef = useRef(false);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const alphaSeedArray = new Float32Array(particleCount);
        const vels: THREE.Vector3[] = [];
        const colorArray: THREE.Color[] = [];
        const sizeArray: number[] = [];

        const baseColor = new THREE.Color(color);
        const hotColor = new THREE.Color('#fff3d6');
        const seedOffset = size * 0.17 + particleCount * 0.013 + position.x * 0.11 + position.y * 0.07 + position.z * 0.05;

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;

            const theta = seededRandom(seedOffset + i * 1.17) * Math.PI * 2;
            const phi = Math.acos(2 * seededRandom(seedOffset + i * 2.31) - 1);
            const speed = size * (0.5 + seededRandom(seedOffset + i * 3.07) * 1.9);

            vels.push(new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.sin(phi) * Math.sin(theta) * speed,
                Math.cos(phi) * speed
            ));

            const particleColor = baseColor.clone().lerp(hotColor, seededRandom(seedOffset + i * 4.41) * 0.55);
            colorArray.push(particleColor);
            colors[i * 3] = particleColor.r;
            colors[i * 3 + 1] = particleColor.g;
            colors[i * 3 + 2] = particleColor.b;

            const particleSize = size * (0.18 + seededRandom(seedOffset + i * 5.63) * 0.3);
            sizes[i] = particleSize;
            sizeArray.push(particleSize);
            alphaSeedArray[i] = 0.4 + seededRandom(seedOffset + i * 6.91) * 0.6;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('alphaSeed', new THREE.BufferAttribute(alphaSeedArray, 1));
        geo.userData.velocities = vels;
        geo.userData.baseColors = colorArray;
        geo.userData.initialSizes = sizeArray;

        return geo;
    }, [color, particleCount, position.x, position.y, position.z, size]);

    const uniforms = useMemo(() => ({
        opacity: { value: 1 }
    }), []);

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

        if (flashRef.current) {
            const flashProgress = Math.min(progress / 0.32, 1);
            const flashScale = size * (1.6 + flashProgress * 2.2);
            flashRef.current.scale.setScalar(flashScale);

            const material = flashRef.current.material as THREE.MeshBasicMaterial;
            material.opacity = (1 - flashProgress) * 0.95;
        }

        if (pointsRef.current && materialRef.current) {
            const pointsGeometry = pointsRef.current.geometry as THREE.BufferGeometry;
            const positions = pointsGeometry.attributes.position.array as Float32Array;
            const sizes = pointsGeometry.attributes.size.array as Float32Array;
            const colors = pointsGeometry.attributes.color.array as Float32Array;
            const velocities = pointsGeometry.userData.velocities as THREE.Vector3[];
            const baseColors = pointsGeometry.userData.baseColors as THREE.Color[];
            const initialSizes = pointsGeometry.userData.initialSizes as number[];

            if (!positions || !sizes || !colors || !velocities || !baseColors || !initialSizes) {
                return;
            }

            const dt = EFFECT_CONSTANTS.FRAME_TIME;
            const drag = 0.985;
            const gravity = -0.02 * size;
            const fade = Math.pow(1 - progress, 1.15);

            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += velocities[i].x * dt;
                positions[i * 3 + 1] += velocities[i].y * dt + gravity * dt;
                positions[i * 3 + 2] += velocities[i].z * dt;

                velocities[i].multiplyScalar(drag);

                sizes[i] = Math.max(initialSizes[i] * (1.0 - progress * 0.7), size * 0.03);

                const baseColor = baseColors[i];
                colors[i * 3] = baseColor.r * (0.7 + fade * 0.5);
                colors[i * 3 + 1] = baseColor.g * (0.6 + fade * 0.55);
                colors[i * 3 + 2] = baseColor.b * (0.55 + fade * 0.45);
            }

            materialRef.current.uniforms.opacity.value = fade;
            pointsGeometry.attributes.position.needsUpdate = true;
            pointsGeometry.attributes.size.needsUpdate = true;
            pointsGeometry.attributes.color.needsUpdate = true;
        }
    });

    return (
        <group>
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

            <points ref={pointsRef} geometry={geometry}>
                <shaderMaterial
                    ref={materialRef}
                    uniforms={uniforms}
                    vertexShader={particleShader.vertexShader}
                    fragmentShader={particleShader.fragmentShader}
                    transparent
                    vertexColors
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    );
};
