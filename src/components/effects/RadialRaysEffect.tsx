/**
 * RadialRaysEffect.tsx
 * Instanced radial burst with variable ray lengths and pulsing intensity
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RadialRaysEffectProps {
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
    rayCount: number;
    maxLength: number;
    color: string;
    spread: number;
    pulseSpeed: number;
    onComplete?: () => void;
}

const radialRayShader = {
    vertexShader: `
        precision mediump float;
        varying vec2 vUv;
        varying float vSeed;
        attribute float instanceSeed;
        attribute float instanceProgress;

        void main() {
            vUv = uv;
            vSeed = instanceSeed + instanceProgress;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        precision mediump float;
        uniform float opacity;
        uniform float pulseTime;
        uniform vec3 color;
        varying vec2 vUv;
        varying float vSeed;

        void main() {
            vec2 centered = vUv - vec2(0.5, 0.0);
            float axis = abs(centered.x);
            float along = clamp(vUv.y, 0.0, 1.0);
            float pulse = 0.85 + 0.15 * sin(pulseTime + vSeed * 6.2831);
            float core = 1.0 - smoothstep(0.0, 0.16, axis);
            float glow = 1.0 - smoothstep(0.0, 0.46, axis);
            float taper = smoothstep(0.0, 0.12, along) * (1.0 - smoothstep(0.55, 1.0, along));
            float alpha = (core * 0.85 + glow * 0.35) * taper * pulse * opacity;
            vec3 finalColor = mix(color, vec3(1.0), core * 0.6);
            gl_FragColor = vec4(finalColor, alpha);
        }
    `
};

export const RadialRaysEffect: React.FC<RadialRaysEffectProps> = ({
    position,
    startTime,
    duration,
    rayCount,
    maxLength,
    color,
    spread,
    pulseSpeed,
    onComplete
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
    const completedRef = useRef(false);
    const dummyRef = useRef(new THREE.Object3D());
    const tempScaleRef = useRef(new THREE.Vector3());

    const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);

    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                opacity: { value: 1 },
                pulseTime: { value: 0 },
                color: { value: new THREE.Color(color) }
            },
            vertexShader: radialRayShader.vertexShader,
            fragmentShader: radialRayShader.fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
    }, [color]);

    React.useEffect(() => {
        if (!instancedMeshRef.current) {
            return;
        }

        const seedAttr = new Float32Array(rayCount);
        const progressAttr = new Float32Array(rayCount);

        for (let i = 0; i < rayCount; i++) {
            seedAttr[i] = Math.random();
            progressAttr[i] = 0;
        }

        instancedMeshRef.current.geometry.setAttribute(
            'instanceSeed',
            new THREE.InstancedBufferAttribute(seedAttr, 1)
        );
        instancedMeshRef.current.geometry.setAttribute(
            'instanceProgress',
            new THREE.InstancedBufferAttribute(progressAttr, 1)
        );
    }, [rayCount]);

    useFrame(() => {
        if (!instancedMeshRef.current || completedRef.current) {
            return;
        }

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            completedRef.current = true;
            onComplete?.();
            return;
        }

        const mesh = instancedMeshRef.current;
        const progressAttr = mesh.geometry.getAttribute('instanceProgress') as THREE.InstancedBufferAttribute;
        const seedAttr = mesh.geometry.getAttribute('instanceSeed') as THREE.InstancedBufferAttribute;
        const dummy = dummyRef.current;
        const materialRef = mesh.material as THREE.ShaderMaterial;

        for (let i = 0; i < rayCount; i++) {
            const seed = seedAttr.getX(i);
            const stagger = seed * 0.18;
            const rayProgress = Math.max(0, Math.min(1, (progress - stagger) / (1 - stagger)));
            const eased = 1 - Math.pow(1 - rayProgress, 2.5);
            const angle = (i / rayCount) * Math.PI * 2 + seed * spread;
            const length = maxLength * (0.5 + seed * 0.75) * eased;
            const width = maxLength * (0.025 + seed * 0.04 * spread);
            const sway = (progress * 0.35 + seed) * 0.18;

            dummy.position.set(0, 0, 0);
            dummy.rotation.set(0, 0, angle + sway);
            tempScaleRef.current.set(width, length, 1);
            dummy.scale.copy(tempScaleRef.current);
            dummy.position.x = Math.cos(angle) * length * 0.1;
            dummy.position.y = Math.sin(angle) * length * 0.1;
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
            progressAttr.setX(i, eased);
        }

        progressAttr.needsUpdate = true;
        mesh.instanceMatrix.needsUpdate = true;
        materialRef.uniforms.opacity.value = progress > 0.72 ? 1 - (progress - 0.72) / 0.28 : 1;
        materialRef.uniforms.pulseTime.value = progress * pulseSpeed * Math.PI * 2;

        if (groupRef.current) {
            groupRef.current.rotation.z += 0.0018;
        }
    });

    return (
        <group ref={groupRef} position={[position.x, position.y, position.z]}>
            <instancedMesh
                ref={instancedMeshRef}
                args={[geometry, material, rayCount]}
                frustumCulled={false}
            />
        </group>
    );
};
