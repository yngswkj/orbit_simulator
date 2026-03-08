/**
 * SupernovaEffect.tsx
 * Layered supernova effect with photosphere, corona, and expanding ejecta shells
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SupernovaShellEffect } from './SupernovaShellEffect';

interface SupernovaEffectProps {
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
    maxRadius: number;
    color: string;
    intensity: number;
    coreRadius: number;
    haloRadius: number;
    shellCount: number;
    biasDirection: { x: number; y: number; z: number };
    onComplete?: () => void;
}

const coreShader = {
    vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;

        void main() {
            vNormal = normalize(normalMatrix * normal);
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        precision mediump float;
        uniform float progress;
        uniform float intensity;
        uniform vec3 baseColor;
        uniform float opacity;
        varying vec3 vNormal;
        varying vec2 vUv;

        vec3 temperatureColor(float t) {
            if (t < 0.35) {
                return mix(vec3(0.55, 0.72, 1.0), vec3(0.9, 0.96, 1.0), t / 0.35);
            }

            if (t < 0.58) {
                return mix(vec3(0.9, 0.96, 1.0), vec3(1.0, 1.0, 1.0), (t - 0.35) / 0.23);
            }

            return mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.48, 0.24), (t - 0.58) / 0.42);
        }

        void main() {
            vec2 centered = vUv - 0.5;
            float dist = length(centered) * 2.0;
            float radial = smoothstep(1.08, 0.05, dist);
            float pulse = 0.9 + 0.1 * sin(progress * 45.0);
            float rim = pow(1.0 - abs(vNormal.z), 2.2);
            vec3 temp = temperatureColor(progress);
            vec3 finalColor = mix(baseColor, temp, 0.78) * (1.0 + rim * 0.55) * intensity * pulse;

            gl_FragColor = vec4(finalColor, radial * opacity);
        }
    `
};

const haloShader = {
    vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorldPosition = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
        }
    `,
    fragmentShader: `
        precision mediump float;
        uniform float progress;
        uniform float opacity;
        uniform vec3 color;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        float hash(vec3 p) {
            return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
        }

        void main() {
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 1.9);
            float coronaNoise = hash(vWorldPosition * 0.03 + progress * 4.0);
            float corona = fresnel * (0.75 + coronaNoise * 0.55);
            vec3 coronaColor = mix(color, vec3(1.0, 0.68, 0.32), progress * 0.55);
            gl_FragColor = vec4(coronaColor * (1.2 + fresnel), corona * opacity);
        }
    `
};

const shellColors = ['#dbe8ff', '#ffffff', '#ffbe8b', '#ff874f'];

export const SupernovaEffect: React.FC<SupernovaEffectProps> = ({
    position,
    startTime,
    duration,
    maxRadius,
    color,
    intensity,
    coreRadius,
    haloRadius,
    shellCount,
    biasDirection,
    onComplete
}) => {
    const coreRef = useRef<THREE.Mesh>(null);
    const haloRef = useRef<THREE.Mesh>(null);
    const coreMaterialRef = useRef<THREE.ShaderMaterial>(null);
    const haloMaterialRef = useRef<THREE.ShaderMaterial>(null);
    const lightRef = useRef<THREE.PointLight>(null);
    const completedRef = useRef(false);

    const coreUniforms = useMemo(() => ({
        progress: { value: 0 },
        intensity: { value: intensity },
        baseColor: { value: new THREE.Color(color) },
        opacity: { value: 1 }
    }), [color, intensity]);

    const haloUniforms = useMemo(() => ({
        progress: { value: 0 },
        opacity: { value: 0.7 },
        color: { value: new THREE.Color(color) }
    }), [color]);

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

        const contraction = progress < 0.16 ? 1.0 - progress * 0.7 : 0.88;
        const burst = progress < 0.35 ? 1.0 : 1.0 + (progress - 0.35) * 1.9;
        const fadeOpacity = progress > 0.72 ? 1 - (progress - 0.72) / 0.28 : 1;

        if (coreRef.current && coreMaterialRef.current) {
            const coreScale = coreRadius * contraction * burst;
            coreRef.current.scale.setScalar(Math.max(0.001, coreScale));
            coreMaterialRef.current.uniforms.progress.value = progress;
            coreMaterialRef.current.uniforms.opacity.value = fadeOpacity;
        }

        if (haloRef.current && haloMaterialRef.current) {
            const haloExpansion = 1.15 + Math.pow(progress, 0.7) * 4.2;
            haloRef.current.scale.setScalar(haloRadius * haloExpansion);
            haloMaterialRef.current.uniforms.progress.value = progress;
            haloMaterialRef.current.uniforms.opacity.value = (0.72 + Math.sin(progress * 18.0) * 0.08) * fadeOpacity;
        }

        if (lightRef.current) {
            const peak = progress < 0.35
                ? intensity * (80 + progress * 280)
                : intensity * 200 * Math.pow(1 - Math.max(0, progress - 0.35) / 0.65, 1.4);
            lightRef.current.intensity = peak;
        }
    });

    return (
        <group position={[position.x, position.y, position.z]}>
            <pointLight
                ref={lightRef}
                color={color}
                intensity={0}
                distance={maxRadius * 2.4}
                decay={1.8}
            />

            <mesh ref={haloRef}>
                <sphereGeometry args={[1, 32, 32]} />
                <shaderMaterial
                    ref={haloMaterialRef}
                    uniforms={haloUniforms}
                    vertexShader={haloShader.vertexShader}
                    fragmentShader={haloShader.fragmentShader}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                />
            </mesh>

            <mesh ref={coreRef}>
                <sphereGeometry args={[1, 24, 24]} />
                <shaderMaterial
                    ref={coreMaterialRef}
                    uniforms={coreUniforms}
                    vertexShader={coreShader.vertexShader}
                    fragmentShader={coreShader.fragmentShader}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.FrontSide}
                />
            </mesh>

            {Array.from({ length: shellCount }).map((_, index) => (
                <SupernovaShellEffect
                    key={index}
                    position={position}
                    startTime={startTime}
                    duration={duration}
                    delayMs={2400 + index * 950}
                    maxRadius={maxRadius * (0.45 + index * 0.28)}
                    color={shellColors[index % shellColors.length]}
                    biasDirection={biasDirection}
                    thickness={0.28 - index * 0.04}
                    opacity={0.45 - index * 0.07}
                />
            ))}
        </group>
    );
};
