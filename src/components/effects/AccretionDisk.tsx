/* eslint-disable react-hooks/purity, react-hooks/immutability */
/**
 * AccretionDisk.tsx
 * Visual representation of an accretion disk around massive objects (black holes, neutron stars)
 * Features:
 * - Particle system with Keplerian rotation
 * - Photon sphere ring (bright ring at ~1.5 Schwarzschild radii)
 * - Temperature gradient (inner=hot/blue, outer=cool/red)
 */

import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePhysicsStore } from '../../store/physicsStore';
import { getPerformanceConfig } from '../../constants/performance';

interface AccretionDiskProps {
    position: { x: number; y: number; z: number };
    innerRadius: number;
    outerRadius: number;
    rotationSpeed?: number;
    particleCount?: number;
    tilt?: number; // Disk tilt angle in radians
}

// Disk particle shader with velocity-based stretching
const diskVertexShader = `
    attribute float size;
    attribute float temperature;
    attribute float velocity;
    attribute vec2 velocityDir;

    uniform float time;
    uniform float innerRadius;
    uniform float rotationSpeed;

    varying float vTemperature;
    varying float vDistance;
    varying float vVelocity;
    varying vec2 vVelocityDir;

    void main() {
        vTemperature = temperature;
        vVelocity = velocity;
        vVelocityDir = velocityDir;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vDistance = length(mvPosition.xyz);

        // Larger particles for stretched effect
        float stretchFactor = 1.0 + velocity * 0.5;
        gl_PointSize = size * stretchFactor * (300.0 / vDistance);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const diskFragmentShader = `
    varying float vTemperature;
    varying float vDistance;
    varying float vVelocity;
    varying vec2 vVelocityDir;

    vec3 temperatureToColor(float t) {
        // Black body radiation approximation
        if (t > 0.85) {
            // Innermost: Blue-white (very hot)
            return vec3(0.6, 0.8, 1.0) * (1.0 + t * 0.5);
        } else if (t > 0.6) {
            // Hot: White-blue
            return vec3(0.9, 0.95, 1.0) * (0.8 + t * 0.4);
        } else if (t > 0.35) {
            // Medium: Yellow-white
            return vec3(1.0, 0.9, 0.7) * (0.7 + t * 0.3);
        } else if (t > 0.15) {
            // Cool: Orange
            return vec3(1.0, 0.6, 0.3) * (0.6 + t * 0.2);
        } else {
            // Outer: Red-orange (dim)
            return vec3(0.8, 0.3, 0.1) * (0.4 + t * 0.2);
        }
    }

    void main() {
        vec2 center = gl_PointCoord - vec2(0.5);

        // Stretch particle in velocity direction (gravitational dragging effect)
        float stretchAmount = 1.0 + vVelocity * 1.5;
        vec2 stretchDir = normalize(vVelocityDir + vec2(0.001));

        // Rotate and scale the coordinate to create elongated shape
        float cosA = stretchDir.x;
        float sinA = stretchDir.y;
        vec2 rotated = vec2(
            center.x * cosA + center.y * sinA,
            -center.x * sinA + center.y * cosA
        );

        // Compress along velocity direction, expand perpendicular
        rotated.x *= stretchAmount;
        rotated.y *= 1.0 / sqrt(stretchAmount);

        float dist = length(rotated);
        if (dist > 0.5) discard;

        // Tail effect - fade toward the back (opposite velocity direction)
        float tailFade = 1.0 - smoothstep(0.0, 0.4, rotated.x) * vVelocity * 0.5;

        // Soft edge
        float alpha = smoothstep(0.5, 0.15, dist) * tailFade;

        // Distance fade
        alpha *= clamp(1.0 - vDistance / 600.0, 0.2, 1.0);

        vec3 color = temperatureToColor(vTemperature);

        // Brighter core, dimmer tail
        float coreBrightness = smoothstep(0.3, 0.0, dist);
        float glow = 1.0 + coreBrightness * 0.4;

        gl_FragColor = vec4(color * glow, alpha * 0.85);
    }
`;

// Photon sphere ring shader
const photonRingVertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec2 vUv;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);

        gl_Position = projectionMatrix * mvPosition;
    }
`;

const photonRingFragmentShader = `
    uniform float time;

    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec2 vUv;

    void main() {
        // Fresnel effect for edge glow
        float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.0);

        // Static brightness
        float pulse = 1.0;
        float hotspot = 1.0;

        // Core brightness
        float core = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);

        float intensity = (fresnel * 0.5 + core * 0.8) * pulse * hotspot;

        // Color: bright yellow-white core with orange-red edges
        vec3 coreColor = vec3(1.0, 0.95, 0.8);
        vec3 edgeColor = vec3(1.0, 0.6, 0.3);
        vec3 color = mix(edgeColor, coreColor, core);

        gl_FragColor = vec4(color * intensity * 1.5, intensity * 0.9);
    }
`;

// Event horizon shader
const eventHorizonVertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const eventHorizonFragmentShader = `
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
        // Pure black center with very subtle edge highlight
        float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 4.0);

        // Extremely subtle purple-ish edge (frame dragging hint)
        vec3 edgeColor = vec3(0.1, 0.05, 0.15) * fresnel;

        // Mostly black
        gl_FragColor = vec4(edgeColor, 1.0);
    }
`;

export const AccretionDisk: React.FC<AccretionDiskProps> = ({
    position,
    innerRadius,
    outerRadius,
    rotationSpeed = 1,
    particleCount,
    tilt = 0.1
}) => {
    const pointsRef = useRef<THREE.Points>(null);
    const anglesRef = useRef<Float32Array | null>(null);
    const radiiRef = useRef<Float32Array | null>(null);
    const baseRadiiRef = useRef<Float32Array | null>(null); // Original radii for respawn
    const groupRef = useRef<THREE.Group>(null);
    const simulationState = usePhysicsStore(state => state.simulationState);
    const qualityLevel = usePhysicsStore(state => state.qualityLevel);

    useThree(); // Keep for potential future use

    // Get particle count from performance config if not explicitly provided
    const actualParticleCount = particleCount ?? getPerformanceConfig(qualityLevel).accretionDiskParticles;

    // Create particle geometry and material
    const { geometry, material } = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(actualParticleCount * 3);
        const sizes = new Float32Array(actualParticleCount);
        const temperatures = new Float32Array(actualParticleCount);
        const velocities = new Float32Array(actualParticleCount);
        const velocityDirs = new Float32Array(actualParticleCount * 2);
        const angles = new Float32Array(actualParticleCount);
        const radii = new Float32Array(actualParticleCount);
        const baseRadii = new Float32Array(actualParticleCount);

        for (let i = 0; i < actualParticleCount; i++) {
            // Logarithmic distribution - more particles near inner edge
            const t = Math.random();
            const r = innerRadius + (outerRadius - innerRadius) * Math.pow(t, 0.35);
            const angle = Math.random() * Math.PI * 2;

            // Disk thickness varies with radius (thinner near center)
            const normalizedR = (r - innerRadius) / (outerRadius - innerRadius);
            const thickness = normalizedR * outerRadius * 0.06;
            const height = (Math.random() - 0.5) * thickness;

            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;

            positions[i * 3] = x;
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = z;

            angles[i] = angle;
            radii[i] = r;
            baseRadii[i] = r;

            // Initial velocity (will be updated each frame)
            // Velocity increases toward center (Keplerian)
            const vel = (1 - normalizedR) * 0.8;
            velocities[i] = vel;

            // Velocity direction (tangent to orbit, slightly inward spiral)
            const tangentAngle = angle + Math.PI / 2;
            velocityDirs[i * 2] = Math.cos(tangentAngle);
            velocityDirs[i * 2 + 1] = Math.sin(tangentAngle);

            // Temperature: higher at inner edge
            const tempFactor = 1 - normalizedR;
            temperatures[i] = tempFactor;

            // Size: smaller particles near inner edge (appear brighter)
            sizes[i] = 0.8 + normalizedR * 1.8;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('temperature', new THREE.BufferAttribute(temperatures, 1));
        geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));
        geo.setAttribute('velocityDir', new THREE.BufferAttribute(velocityDirs, 2));

        anglesRef.current = angles;
        radiiRef.current = radii;
        baseRadiiRef.current = baseRadii;

        // Shader material
        const mat = new THREE.ShaderMaterial({
            vertexShader: diskVertexShader,
            fragmentShader: diskFragmentShader,
            uniforms: {
                time: { value: 0 },
                innerRadius: { value: innerRadius },
                rotationSpeed: { value: rotationSpeed },
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        return { geometry: geo, material: mat };
        // IMPORTANT: position removed from deps to prevent particle regeneration on every frame
    }, [innerRadius, outerRadius, actualParticleCount, rotationSpeed]);

    // Photon sphere ring material
    const photonRingMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader: photonRingVertexShader,
            fragmentShader: photonRingFragmentShader,
            uniforms: {
                time: { value: 0 },
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
        });
    }, []);

    // Event horizon material
    const eventHorizonMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader: eventHorizonVertexShader,
            fragmentShader: eventHorizonFragmentShader,
            uniforms: {},
        });
    }, []);

    useFrame((state, delta) => {
        if (!pointsRef.current || !anglesRef.current || !radiiRef.current || !baseRadiiRef.current) return;
        if (simulationState !== 'running') return;

        const positions = geometry.attributes.position.array as Float32Array;
        const velocityAttr = geometry.attributes.velocity.array as Float32Array;
        const velocityDirAttr = geometry.attributes.velocityDir.array as Float32Array;
        const temperatureAttr = geometry.attributes.temperature.array as Float32Array;
        const sizeAttr = geometry.attributes.size.array as Float32Array;
        const angles = anglesRef.current;
        const radii = radiiRef.current;
        const baseRadii = baseRadiiRef.current;

        // Update uniforms
        material.uniforms.time.value = state.clock.elapsedTime;
        photonRingMaterial.uniforms.time.value = state.clock.elapsedTime;

        // Animation speeds
        const baseSpeed = 0.15;
        const infallSpeed = 0.02; // Slow spiral infall

        for (let i = 0; i < actualParticleCount; i++) {
            let r = radii[i];

            // Normalize radius
            const normalizedR = Math.max(0, (r - innerRadius) / (outerRadius - innerRadius));

            // Keplerian rotation: inner particles orbit faster
            const speedMultiplier = 1.0 + (1.0 - normalizedR) * 2.0;
            const angularVelocity = rotationSpeed * baseSpeed * speedMultiplier * (innerRadius / r);
            angles[i] += angularVelocity * delta;

            // Spiral infall: particles slowly move toward center
            // Infall rate increases as particles get closer (gravitational acceleration)
            const infallRate = infallSpeed * (1.0 + (1.0 - normalizedR) * 2.0);
            r -= infallRate * delta;
            radii[i] = r;

            // Respawn at outer edge when reaching inner boundary
            if (r <= innerRadius * 0.9) {
                // Reset to outer region with new random angle
                radii[i] = baseRadii[i];
                r = baseRadii[i];
                angles[i] = Math.random() * Math.PI * 2;
            }

            // Update position
            const x = Math.cos(angles[i]) * r;
            const z = Math.sin(angles[i]) * r;
            positions[i * 3] = x;
            positions[i * 3 + 2] = z;

            // Update velocity magnitude (higher at inner edge)
            const newNormalizedR = (r - innerRadius) / (outerRadius - innerRadius);
            const velocity = Math.min(1.0, (1.0 - newNormalizedR) * 1.2);
            velocityAttr[i] = velocity;

            // Update velocity direction (tangent + slight inward spiral)
            // Tangent direction with inward component
            const tangentAngle = angles[i] + Math.PI / 2;
            const inwardAngle = angles[i] + Math.PI; // Points toward center
            const spiralMix = 0.15; // How much inward vs tangent

            const dirX = Math.cos(tangentAngle) * (1 - spiralMix) + Math.cos(inwardAngle) * spiralMix;
            const dirZ = Math.sin(tangentAngle) * (1 - spiralMix) + Math.sin(inwardAngle) * spiralMix;
            const dirLen = Math.sqrt(dirX * dirX + dirZ * dirZ);

            velocityDirAttr[i * 2] = dirX / dirLen;
            velocityDirAttr[i * 2 + 1] = dirZ / dirLen;

            // Update temperature (hotter at inner edge)
            temperatureAttr[i] = 1.0 - newNormalizedR;

            // Update size (smaller at inner edge)
            sizeAttr[i] = 0.8 + newNormalizedR * 1.8;
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.velocity.needsUpdate = true;
        geometry.attributes.velocityDir.needsUpdate = true;
        geometry.attributes.temperature.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;
    });

    // Photon sphere radius (1.5 Schwarzschild radii equivalent)
    const photonSphereRadius = innerRadius * 0.5;

    return (
        <group
            ref={groupRef}
            position={[position.x, position.y, position.z]}
            rotation={[tilt, 0, 0]}
        >
            {/* Main accretion disk particles */}
            <points ref={pointsRef} geometry={geometry} material={material} />

            {/* Photon Sphere Ring - The characteristic bright ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[photonSphereRadius, photonSphereRadius * 0.15, 16, 64]} />
                <primitive object={photonRingMaterial} attach="material" />
            </mesh>

            {/* Secondary photon ring (inner) */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[photonSphereRadius * 0.7, photonSphereRadius * 0.08, 12, 48]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.4}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Inner glow - ISCO region */}
            <mesh>
                <sphereGeometry args={[innerRadius * 0.6, 32, 16]} />
                <meshBasicMaterial
                    color="#ffddaa"
                    transparent
                    opacity={0.25}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Event horizon with subtle edge effect */}
            <mesh>
                <sphereGeometry args={[innerRadius * 0.25, 32, 32]} />
                <primitive object={eventHorizonMaterial} attach="material" />
            </mesh>

            {/* Shadow silhouette (slightly larger than event horizon) */}
            <mesh>
                <sphereGeometry args={[innerRadius * 0.35, 32, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.95} />
            </mesh>
        </group>
    );
};
