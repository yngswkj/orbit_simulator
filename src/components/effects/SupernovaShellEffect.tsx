import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SupernovaShellEffectProps {
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
    delayMs: number;
    maxRadius: number;
    color: string;
    biasDirection: { x: number; y: number; z: number };
    thickness: number;
    opacity: number;
}

const shellShader = {
    vertexShader: `
        precision mediump float;
        uniform float progress;
        uniform float asymmetry;
        uniform vec3 biasDirection;
        varying vec3 vNormal;
        varying vec3 vWorldDirection;

        void main() {
            vNormal = normalize(normalMatrix * normal);
            float bias = dot(normalize(normal), normalize(biasDirection));
            float stretch = 1.0 + bias * asymmetry * progress;
            vec3 displaced = position * stretch;
            vec4 world = modelMatrix * vec4(displaced, 1.0);
            vWorldDirection = normalize(world.xyz - cameraPosition);
            gl_Position = projectionMatrix * viewMatrix * world;
        }
    `,
    fragmentShader: `
        precision mediump float;
        uniform vec3 color;
        uniform float opacity;
        uniform float thickness;
        varying vec3 vNormal;
        varying vec3 vWorldDirection;

        void main() {
            float fresnel = 1.0 - max(dot(normalize(vNormal), -normalize(vWorldDirection)), 0.0);
            fresnel = pow(fresnel, 2.6);
            float shell = smoothstep(thickness, 1.0, fresnel);
            gl_FragColor = vec4(color * (1.0 + fresnel * 1.1), shell * opacity);
        }
    `
};

export const SupernovaShellEffect: React.FC<SupernovaShellEffectProps> = ({
    position,
    startTime,
    duration,
    delayMs,
    maxRadius,
    color,
    biasDirection,
    thickness,
    opacity
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(() => ({
        progress: { value: 0 },
        color: { value: new THREE.Color(color) },
        opacity: { value: 0 },
        thickness: { value: thickness },
        asymmetry: { value: 0.18 },
        biasDirection: { value: new THREE.Vector3(biasDirection.x, biasDirection.y, biasDirection.z) }
    }), [biasDirection.x, biasDirection.y, biasDirection.z, color, thickness]);

    useFrame(() => {
        if (!meshRef.current || !materialRef.current) {
            return;
        }

        const elapsed = performance.now() - startTime - delayMs;
        if (elapsed <= 0) {
            meshRef.current.visible = false;
            return;
        }

        const localDuration = Math.max(1200, duration - delayMs);
        const progress = Math.min(elapsed / localDuration, 1);
        const eased = 1 - Math.pow(1 - progress, 2.2);
        const currentOpacity = opacity * Math.pow(1 - progress, 1.2);

        meshRef.current.visible = currentOpacity > 0.01;
        meshRef.current.scale.setScalar(Math.max(1, maxRadius * eased));
        materialRef.current.uniforms.progress.value = eased;
        materialRef.current.uniforms.opacity.value = currentOpacity;
    });

    return (
        <mesh
            ref={meshRef}
            position={[position.x, position.y, position.z]}
            visible={false}
        >
            <sphereGeometry args={[1, 32, 32]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={shellShader.vertexShader}
                fragmentShader={shellShader.fragmentShader}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.BackSide}
            />
        </mesh>
    );
};
