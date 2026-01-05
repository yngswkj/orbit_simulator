/**
 * RadialRaysEffect.tsx
 * Radial light rays emanating from supernova explosion
 * Optimized with InstancedMesh for better performance (1 draw call instead of 12)
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
        varying float vInstanceProgress;

        attribute float instanceProgress;

        void main() {
            vUv = uv;
            vInstanceProgress = instanceProgress;

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
        varying float vInstanceProgress;

        void main() {
            // Create ray pattern
            vec2 centered = vUv - 0.5;
            float angle = atan(centered.y, centered.x);
            float dist = length(centered) * 2.0;

            // Ray intensity with sharp edges
            float rayPattern = abs(sin(angle * 6.0)); // 12 rays (6 * 2)
            rayPattern = pow(rayPattern, 3.0); // Sharpen

            // Length mask (rays extend as progress increases)
            // Use per-instance progress for staggered animation
            float lengthMask = step(dist, vInstanceProgress);

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
    const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
    const completedRef = useRef(false);

    const rayCount = 12; // Number of rays

    // Dummy object for matrix calculations
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Geometry and material
    const geometry = useMemo(() => new THREE.PlaneGeometry(maxLength * 2, maxLength * 0.3), [maxLength]);

    const material = useMemo(() => {
        const mat = new THREE.ShaderMaterial({
            uniforms: {
                progress: { value: 0 },
                opacity: { value: 1 },
                color: { value: new THREE.Color(color) }
            },
            vertexShader: radialRayShader.vertexShader,
            fragmentShader: radialRayShader.fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        return mat;
    }, [color]);

    // Initialize instance matrices and custom attribute for per-instance progress
    React.useEffect(() => {
        if (!instancedMeshRef.current) return;

        const instanceProgressArray = new Float32Array(rayCount);

        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2;

            // Set position and rotation
            dummy.position.set(0, 0, 0);
            dummy.rotation.set(0, 0, angle);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();

            instancedMeshRef.current.setMatrixAt(i, dummy.matrix);

            // Initialize instance progress (will be updated per frame)
            instanceProgressArray[i] = 0;
        }

        // Add custom attribute for per-instance progress
        const instanceProgress = new THREE.InstancedBufferAttribute(instanceProgressArray, 1);
        instancedMeshRef.current.geometry.setAttribute('instanceProgress', instanceProgress);

        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [rayCount]);

    useFrame(() => {
        if (completedRef.current || !instancedMeshRef.current) return;

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1 && !completedRef.current) {
            completedRef.current = true;
            onComplete?.();
            return;
        }

        const mat = instancedMeshRef.current.material as THREE.ShaderMaterial;

        // Update per-instance progress for staggered animation
        const instanceProgressAttr = instancedMeshRef.current.geometry.getAttribute('instanceProgress') as THREE.InstancedBufferAttribute;

        for (let i = 0; i < rayCount; i++) {
            // Staggered progress for each ray
            const stagger = (i / rayCount) * 0.2;
            const rayProgress = Math.max(0, Math.min(1, (progress - stagger) * 1.2));

            // Eased expansion
            const easedProgress = 1 - Math.pow(1 - rayProgress, 2);
            instanceProgressAttr.setX(i, easedProgress);

            // Slight rotation animation for each ray
            const tempMatrix = new THREE.Matrix4();
            instancedMeshRef.current.getMatrixAt(i, tempMatrix);
            const tempPos = new THREE.Vector3();
            const tempQuat = new THREE.Quaternion();
            const tempScale = new THREE.Vector3();
            tempMatrix.decompose(tempPos, tempQuat, tempScale);

            // Create temporary object for rotation update
            const rotationDummy = new THREE.Object3D();
            rotationDummy.position.copy(tempPos);
            rotationDummy.quaternion.copy(tempQuat);
            rotationDummy.scale.copy(tempScale);
            rotationDummy.rotation.z += 0.001;
            rotationDummy.updateMatrix();
            instancedMeshRef.current.setMatrixAt(i, rotationDummy.matrix);
        }

        instanceProgressAttr.needsUpdate = true;
        instancedMeshRef.current.instanceMatrix.needsUpdate = true;

        // Fade out in the last 30%
        if (progress > 0.7) {
            const fadeProgress = (progress - 0.7) / 0.3;
            mat.uniforms.opacity.value = 1 - fadeProgress;
        }

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
            <instancedMesh
                ref={instancedMeshRef}
                args={[geometry, material, rayCount]}
                frustumCulled={false}
            />
        </group>
    );
};
