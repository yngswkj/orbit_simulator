/* eslint-disable react-hooks/purity, react-hooks/immutability */
/**
 * RelativisticJet.tsx
 * Visual representation of bipolar relativistic jets from compact objects
 * Particles stream from poles in opposite directions
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePhysicsStore } from '../../store/physicsStore';

interface RelativisticJetProps {
    position: { x: number; y: number; z: number };
    length: number;
    baseWidth: number;
    particleCount?: number;
    speed?: number;
    color?: string;
}

const jetVertexShader = `
    attribute float size;
    attribute float alpha;

    varying float vAlpha;

    void main() {
        vAlpha = alpha;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float distance = length(mvPosition.xyz);

        gl_PointSize = size * (200.0 / distance);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const jetFragmentShader = `
    uniform vec3 jetColor;
    varying float vAlpha;

    void main() {
        // Circular particle
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        if (dist > 0.5) discard;

        // Soft glow
        float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;

        // Core is brighter
        float core = smoothstep(0.3, 0.0, dist);
        vec3 color = jetColor + vec3(core * 0.5);

        gl_FragColor = vec4(color, alpha);
    }
`;

export const RelativisticJet: React.FC<RelativisticJetProps> = ({
    position,
    length,
    baseWidth,
    particleCount = 8000,
    speed = 1,
    color = '#4488ff'
}) => {
    const pointsRef = useRef<THREE.Points>(null);
    const progressRef = useRef<Float32Array | null>(null);
    const spreadRef = useRef<Float32Array | null>(null);
    const angleRef = useRef<Float32Array | null>(null);
    const speedRef = useRef<Float32Array | null>(null);
    const simulationState = usePhysicsStore(state => state.simulationState);

    const { geometry, material } = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const alphas = new Float32Array(particleCount);
        const progress = new Float32Array(particleCount);
        const spread = new Float32Array(particleCount);
        const angles = new Float32Array(particleCount);
        const speeds = new Float32Array(particleCount); // Individual speeds

        const halfCount = particleCount / 2;

        for (let i = 0; i < particleCount; i++) {
            // Direction: first half goes up (+Y), second half goes down (-Y)
            const direction = i < halfCount ? 1 : -1;

            // Random progress along jet (0 = base, 1 = tip)
            const t = Math.random();
            progress[i] = t;

            // Individual speed variation (0.5x to 1.5x base speed)
            speeds[i] = 0.5 + Math.random();

            // Jet expands as it travels
            const spreadRadius = baseWidth * (0.1 + t * 0.5);
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * spreadRadius;

            spread[i] = r;
            angles[i] = angle;

            const x = Math.cos(angle) * r;
            const y = t * length * direction;
            const z = Math.sin(angle) * r;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Smaller and dimmer at tip
            sizes[i] = 2.0 * (1 - t * 0.7);
            alphas[i] = 0.8 * (1 - t * 0.6);
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

        progressRef.current = progress;
        spreadRef.current = spread;
        angleRef.current = angles;
        speedRef.current = speeds;

        const mat = new THREE.ShaderMaterial({
            vertexShader: jetVertexShader,
            fragmentShader: jetFragmentShader,
            uniforms: {
                jetColor: { value: new THREE.Color(color) }
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        return { geometry: geo, material: mat };
    }, [length, baseWidth, particleCount, color]);

    useFrame((_, delta) => {
        if (!pointsRef.current || !progressRef.current || !spreadRef.current || !angleRef.current || !speedRef.current) return;
        if (simulationState !== 'running') return;

        const positions = geometry.attributes.position.array as Float32Array;
        const alphas = geometry.attributes.alpha.array as Float32Array;
        const sizes = geometry.attributes.size.array as Float32Array;
        const progress = progressRef.current;
        const spread = spreadRef.current;
        const angles = angleRef.current;
        const speeds = speedRef.current;

        const halfCount = particleCount / 2;

        for (let i = 0; i < particleCount; i++) {
            const direction = i < halfCount ? 1 : -1;

            // Move particle along jet with individual speed
            progress[i] += delta * speed * 0.3 * speeds[i];

            // Reset when reaching tip
            if (progress[i] > 1) {
                progress[i] = 0;
                spread[i] = Math.random() * baseWidth * 0.1;
                angles[i] = Math.random() * Math.PI * 2;
                speeds[i] = 0.5 + Math.random(); // Re-randomize speed
            }

            const t = progress[i];

            // Expand spread as particle moves
            const currentSpread = spread[i] * (0.5 + t * 1.5);
            const x = Math.cos(angles[i]) * currentSpread;
            const y = t * length * direction;
            const z = Math.sin(angles[i]) * currentSpread;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Fade and shrink at tip
            alphas[i] = 0.8 * (1 - t * 0.7);
            sizes[i] = 2.0 * (1 - t * 0.5);
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.alpha.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;
    });

    return (
        <group position={[position.x, position.y, position.z]}>
            <points ref={pointsRef} geometry={geometry} material={material} />

            {/* Base glow at origin */}
            <mesh>
                <sphereGeometry args={[baseWidth * 0.3, 16, 8]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.5}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
};
