/* eslint-disable react-hooks/purity, react-hooks/immutability */
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EFFECT_CONSTANTS, PHYSICS_CONSTANTS } from '../../constants/physics';
import { usePhysicsStore } from '../../store/physicsStore';
import { getPerformanceConfig } from '../../constants/performance';

interface TidalDisruptionEffectProps {
    position: THREE.Vector3;
    primaryPosition: THREE.Vector3;
    bodyRadius: number;
    bodyColor: string;
    primaryMass: number;
    startTime: number;
    duration?: number;
    onComplete?: () => void;
}

const particleVertexShader = `
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
`;

const particleFragmentShader = `
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
        vec3 finalColor = mix(vColor, vec3(1.0), core * 0.45);
        gl_FragColor = vec4(finalColor, alpha);
    }
`;

export const TidalDisruptionEffect: React.FC<TidalDisruptionEffectProps> = ({
    position,
    primaryPosition,
    bodyRadius,
    bodyColor,
    primaryMass,
    startTime,
    duration = 5000,
    onComplete
}) => {
    const pointsRef = useRef<THREE.Points>(null);
    const coreGlowRef = useRef<THREE.Mesh>(null);
    const haloGlowRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const completedRef = useRef(false);
    const qualityLevel = usePhysicsStore(state => state.qualityLevel);
    const actualParticleCount = Math.min(
        EFFECT_CONSTANTS.MAX_TIDAL_PARTICLES,
        getPerformanceConfig(qualityLevel).maxTidalParticles
    );
    const particlePosition = useMemo(() => new THREE.Vector3(), []);
    const toPrimary = useMemo(() => new THREE.Vector3(), []);
    const fallbackAxis = useMemo(() => new THREE.Vector3(0, 1, 0), []);

    const { geometry, uniforms } = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(actualParticleCount * 3);
        const colors = new Float32Array(actualParticleCount * 3);
        const sizes = new Float32Array(actualParticleCount);
        const alphaSeedArray = new Float32Array(actualParticleCount);
        const velocities: THREE.Vector3[] = [];
        const twistVectors: THREE.Vector3[] = [];
        const baseColors: THREE.Color[] = [];
        const baseSizes: number[] = [];
        const captureFlags = new Uint8Array(actualParticleCount);

        const effectPosition = new THREE.Vector3(position.x, position.y, position.z);
        const primaryVector = new THREE.Vector3(primaryPosition.x, primaryPosition.y, primaryPosition.z);
        const baseColor = new THREE.Color(bodyColor);
        const captureColor = new THREE.Color('#edf6ff');
        const ejectaColor = new THREE.Color('#ffd9c0');
        const primaryDirection = new THREE.Vector3().subVectors(primaryVector, effectPosition);
        const distance = Math.max(primaryDirection.length(), bodyRadius * 2);
        primaryDirection.normalize();

        const tangentAxis = new THREE.Vector3()
            .crossVectors(primaryDirection, Math.abs(primaryDirection.y) > 0.85 ? new THREE.Vector3(1, 0, 0) : fallbackAxis)
            .normalize();
        const binormalAxis = new THREE.Vector3().crossVectors(primaryDirection, tangentAxis).normalize();

        const G = PHYSICS_CONSTANTS.G;
        const escapeVelocity = Math.sqrt(2 * G * primaryMass / distance);
        const orbitalSpeed = Math.sqrt(G * primaryMass / distance);
        const tidalForceStrength = Math.min(
            3.2,
            Math.max(0.35, (2 * G * primaryMass * bodyRadius) / Math.pow(distance, 3))
        );
        const captureSpeedBase = Math.min(
            bodyRadius * 18,
            Math.max(bodyRadius * 5.5, escapeVelocity * tidalForceStrength * 0.9)
        );
        const swirlSpeedBase = Math.min(
            bodyRadius * 10,
            Math.max(bodyRadius * 2.2, orbitalSpeed * 0.42)
        );

        for (let i = 0; i < actualParticleCount; i++) {
            const azimuth = Math.random() * Math.PI * 2;
            const lateralDir = tangentAxis.clone()
                .multiplyScalar(Math.cos(azimuth))
                .add(binormalAxis.clone().multiplyScalar(Math.sin(azimuth)))
                .normalize();
            const twistDir = new THREE.Vector3().crossVectors(primaryDirection, lateralDir).normalize();
            const longitudinalOffset = (Math.random() - 0.5) * bodyRadius * 3.3;
            const radialOffset = bodyRadius * (0.16 + Math.random() * 0.62);
            const thicknessOffset = (Math.random() - 0.5) * bodyRadius * 0.2;
            const startOffset = primaryDirection.clone()
                .multiplyScalar(longitudinalOffset)
                .add(lateralDir.clone().multiplyScalar(radialOffset))
                .add(binormalAxis.clone().multiplyScalar(thicknessOffset));
            const startPosition = effectPosition.clone().add(startOffset);
            const captureParticle = Math.random() < 0.7;
            const speedJitter = 0.72 + Math.random() * 0.56;

            positions[i * 3] = startPosition.x;
            positions[i * 3 + 1] = startPosition.y;
            positions[i * 3 + 2] = startPosition.z;

            if (captureParticle) {
                const inwardVelocity = primaryDirection.clone().multiplyScalar(captureSpeedBase * speedJitter);
                const swirlVelocity = lateralDir.clone().multiplyScalar(swirlSpeedBase * (0.7 + Math.random() * 0.55));
                velocities.push(inwardVelocity.add(swirlVelocity));
                twistVectors.push(twistDir.clone().multiplyScalar(bodyRadius * (0.75 + Math.random() * 0.45)));
                captureFlags[i] = 1;
                baseColors.push(baseColor.clone().lerp(captureColor, 0.45 + Math.random() * 0.3));
                baseSizes.push(bodyRadius * (0.032 + Math.random() * 0.028));
            } else {
                const ejectaVelocity = primaryDirection.clone().multiplyScalar(-captureSpeedBase * (0.35 + Math.random() * 0.28));
                ejectaVelocity.add(lateralDir.clone().multiplyScalar(swirlSpeedBase * (0.55 + Math.random() * 0.35)));
                ejectaVelocity.add(binormalAxis.clone().multiplyScalar(bodyRadius * (0.9 + Math.random() * 1.4)));
                velocities.push(ejectaVelocity);
                twistVectors.push(twistDir.clone().multiplyScalar(bodyRadius * (0.18 + Math.random() * 0.22)));
                captureFlags[i] = 0;
                baseColors.push(baseColor.clone().lerp(ejectaColor, 0.28 + Math.random() * 0.24));
                baseSizes.push(bodyRadius * (0.026 + Math.random() * 0.024));
            }

            const particleColor = baseColors[i];
            colors[i * 3] = particleColor.r;
            colors[i * 3 + 1] = particleColor.g;
            colors[i * 3 + 2] = particleColor.b;
            sizes[i] = baseSizes[i];
            alphaSeedArray[i] = 0.4 + Math.random() * 0.6;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('alphaSeed', new THREE.BufferAttribute(alphaSeedArray, 1));
        geo.userData.velocities = velocities;
        geo.userData.twistVectors = twistVectors;
        geo.userData.baseColors = baseColors;
        geo.userData.baseSizes = baseSizes;
        geo.userData.captureFlags = captureFlags;

        return {
            geometry: geo,
            uniforms: {
                opacity: { value: 1 }
            }
        };
    }, [
        actualParticleCount,
        bodyColor,
        bodyRadius,
        fallbackAxis,
        position.x,
        position.y,
        position.z,
        primaryMass,
        primaryPosition.x,
        primaryPosition.y,
        primaryPosition.z
    ]);

    useFrame((_, delta) => {
        if (!pointsRef.current || !materialRef.current || completedRef.current) return;

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            completedRef.current = true;
            onComplete?.();
            return;
        }

        const dt = Math.min(delta, 0.033);
        const positions = geometry.attributes.position.array as Float32Array;
        const colors = geometry.attributes.color.array as Float32Array;
        const sizes = geometry.attributes.size.array as Float32Array;
        const velocities = geometry.userData.velocities as THREE.Vector3[];
        const twistVectors = geometry.userData.twistVectors as THREE.Vector3[];
        const baseColors = geometry.userData.baseColors as THREE.Color[];
        const baseSizes = geometry.userData.baseSizes as number[];
        const captureFlags = geometry.userData.captureFlags as Uint8Array;
        const coreGlowStrength = progress <= 0.35
            ? 1
            : Math.max(0, 1 - ((progress - 0.35) / 0.65) * 1.8);

        for (let i = 0; i < actualParticleCount; i++) {
            particlePosition.set(
                positions[i * 3],
                positions[i * 3 + 1],
                positions[i * 3 + 2]
            );

            toPrimary.subVectors(primaryPosition, particlePosition);
            const distanceToPrimary = Math.max(toPrimary.length(), bodyRadius * 0.45);
            toPrimary.divideScalar(distanceToPrimary);

            if (captureFlags[i] === 1) {
                velocities[i].addScaledVector(toPrimary, bodyRadius * 8.5 * dt);
                velocities[i].addScaledVector(twistVectors[i], bodyRadius * 2.2 * dt * (1 - progress * 0.55));
                twistVectors[i].applyAxisAngle(toPrimary, 0.45 * dt);
                velocities[i].multiplyScalar(0.992);
            } else {
                velocities[i].addScaledVector(toPrimary, -bodyRadius * 1.6 * dt);
                velocities[i].addScaledVector(twistVectors[i], bodyRadius * 0.9 * dt);
                twistVectors[i].applyAxisAngle(toPrimary, -0.12 * dt);
                velocities[i].multiplyScalar(0.996);
            }

            positions[i * 3] += velocities[i].x * dt;
            positions[i * 3 + 1] += velocities[i].y * dt;
            positions[i * 3 + 2] += velocities[i].z * dt;

            const sizeFade = captureFlags[i] === 1
                ? Math.max(0.28, 0.92 - progress * 0.55)
                : Math.max(0.36, 0.95 - progress * 0.3);
            sizes[i] = Math.max(baseSizes[i] * sizeFade, bodyRadius * 0.012);

            const baseColor = baseColors[i];
            const brightness = captureFlags[i] === 1
                ? 0.82 + coreGlowStrength * 0.5
                : 0.72 + (1 - progress) * 0.25;
            colors[i * 3] = Math.min(1, baseColor.r * brightness);
            colors[i * 3 + 1] = Math.min(1, baseColor.g * brightness);
            colors[i * 3 + 2] = Math.min(1, baseColor.b * (brightness + 0.08));
        }

        materialRef.current.uniforms.opacity.value = 0.92 - progress * 0.38;
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;

        if (coreGlowRef.current) {
            const coreScale = bodyRadius * (1.1 + (1 - progress) * 0.55);
            coreGlowRef.current.scale.setScalar(coreScale);
            const coreMaterial = coreGlowRef.current.material as THREE.MeshBasicMaterial;
            coreMaterial.opacity = 0.55 * coreGlowStrength;
        }

        if (haloGlowRef.current) {
            const haloScale = bodyRadius * (2.3 + progress * 1.1);
            haloGlowRef.current.scale.setScalar(haloScale);
            const haloMaterial = haloGlowRef.current.material as THREE.MeshBasicMaterial;
            haloMaterial.opacity = 0.18 * Math.max(0, coreGlowStrength * 0.75);
        }
    });

    return (
        <group position={[position.x, position.y, position.z]}>
            <mesh ref={haloGlowRef}>
                <sphereGeometry args={[1, 24, 24]} />
                <meshBasicMaterial
                    color="#9fd4ff"
                    transparent
                    opacity={0.18}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            <mesh ref={coreGlowRef}>
                <sphereGeometry args={[1, 24, 24]} />
                <meshBasicMaterial
                    color="#eef8ff"
                    transparent
                    opacity={0.55}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            <points ref={pointsRef} geometry={geometry}>
                <shaderMaterial
                    ref={materialRef}
                    uniforms={uniforms}
                    vertexShader={particleVertexShader}
                    fragmentShader={particleFragmentShader}
                    transparent
                    vertexColors
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    );
};
