/**
 * SupernovaEffect.tsx
 * Supernova explosion effect with brightening, explosion, and fading phases
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SupernovaEffectProps {
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
    maxRadius: number;
    color: string;
    intensity: number;
    onComplete?: () => void;
}

// Custom shader for supernova core glow with color temperature evolution
const supernovaShader = {
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
        uniform vec3 color;
        uniform float intensity;
        uniform float phase;
        varying vec2 vUv;

        // Convert color temperature to RGB (simplified approximation)
        vec3 colorTemperature(float temp) {
            // Blue phase (contraction): temp = 0.0 -> blue-white
            // Peak (explosion): temp = 1.0 -> extremely hot white
            // Red phase (expansion): temp = 2.0+ -> red-shifted

            if (temp < 0.5) {
                // Early phase: blue to bright white
                return mix(vec3(0.6, 0.7, 1.0), vec3(1.0, 1.0, 1.0), temp * 2.0);
            } else if (temp < 1.0) {
                // Peak: stay at white
                return vec3(1.0, 1.0, 1.0);
            } else {
                // Cooling: white to red-orange (redshift from expansion)
                float coolFactor = (temp - 1.0);
                return mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.5, 0.3), coolFactor);
            }
        }

        void main() {
            // Distance from center
            vec2 centered = vUv - 0.5;
            float dist = length(centered) * 2.0;

            // Smooth phase transitions using step functions
            float brightenMask = step(phase, 0.33);
            float explosionMask = step(0.33, phase) * step(phase, 0.5);
            float fadeMask = step(0.5, phase);

            // Calculate phase-specific values
            float phaseProgress1 = phase / 0.33;
            float phaseProgress2 = (phase - 0.33) / 0.17;
            float phaseProgress3 = (phase - 0.5) / 0.5;

            // Brightening phase
            float alpha1 = smoothstep(1.0, 0.3, dist) * (0.5 + phaseProgress1 * 0.5);
            float bright1 = 1.0 + phaseProgress1 * intensity * 2.0;
            float pulse = sin(phase * 30.0) * 0.1 + 0.9;
            bright1 *= pulse;

            // Explosion phase
            float alpha2 = smoothstep(1.2, 0.0, dist) * (1.0 - phaseProgress2 * 0.3);
            float bright2 = intensity * 3.0 * (1.0 - phaseProgress2 * 0.5);

            // Fading phase
            float alpha3 = smoothstep(0.8, 0.0, dist) * (1.0 - phaseProgress3);
            float bright3 = intensity * (1.0 - phaseProgress3);

            // Combine phases
            float alpha = alpha1 * brightenMask + alpha2 * explosionMask + alpha3 * fadeMask;
            float brightness = bright1 * brightenMask + bright2 * explosionMask + bright3 * fadeMask;

            // Radial gradient for depth
            float radialGradient = 1.0 - dist * 0.5;
            alpha *= radialGradient;

            // Calculate color temperature based on phase
            // 0.0-0.33: heating (0.0 -> 0.5)
            // 0.33-0.5: peak white (0.5 -> 1.0)
            // 0.5-1.0: cooling/redshift (1.0 -> 2.0)
            float tempValue = 0.0;
            if (phase < 0.33) {
                tempValue = phase / 0.33 * 0.5; // 0.0 to 0.5
            } else if (phase < 0.5) {
                tempValue = 0.5 + (phase - 0.33) / 0.17 * 0.5; // 0.5 to 1.0
            } else {
                tempValue = 1.0 + (phase - 0.5) / 0.5; // 1.0 to 2.0
            }

            vec3 tempColor = colorTemperature(tempValue);
            vec3 finalColor = mix(color, tempColor, 0.7) * brightness;

            gl_FragColor = vec4(finalColor, alpha * opacity);
        }
    `
};

export const SupernovaEffect: React.FC<SupernovaEffectProps> = ({
    position,
    startTime,
    duration,
    maxRadius,
    color,
    intensity,
    onComplete
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const completedRef = useRef(false);
    const [hasError, setHasError] = React.useState(false);

    const uniforms = useMemo(() => ({
        progress: { value: 0 },
        opacity: { value: 1 },
        color: { value: new THREE.Color(color) },
        intensity: { value: intensity },
        phase: { value: 0 }
    }), [color, intensity]);

    const [lightIntensity, setLightIntensity] = React.useState(0);

    // Calculate dynamic light intensity based on phase
    const getLightIntensity = React.useCallback(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 0.13) {
            // Contraction: dim
            return intensity * 50 * (1 - progress / 0.13);
        } else if (progress < 0.33) {
            // Brightening: increasing
            const phaseProgress = (progress - 0.13) / 0.2;
            return intensity * 50 + phaseProgress * intensity * 150;
        } else if (progress < 0.5) {
            // Explosion peak: maximum brightness
            return intensity * 200;
        } else {
            // Fading: exponential decay
            const fadeProgress = (progress - 0.5) / 0.5;
            return intensity * 200 * Math.pow(1 - fadeProgress, 2);
        }
    }, [startTime, duration, intensity]);

    // Error handling for shader compilation
    React.useEffect(() => {
        // WebGL error handling is done at the Canvas level
        // This effect is kept for future WebGL context checks if needed
        const handleError = (event: ErrorEvent) => {
            if (event.message && event.message.includes('WebGL')) {
                console.warn('SupernovaEffect: WebGL error detected, using fallback');
                setHasError(true);
            }
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    useFrame(() => {
        if (!materialRef.current || completedRef.current) return;

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1 && !completedRef.current) {
            completedRef.current = true;
            onComplete?.();
            return;
        }

        // Update phase (0-1 for full animation)
        materialRef.current.uniforms.progress.value = progress;
        materialRef.current.uniforms.phase.value = progress;

        // Scale changes based on phase
        if (meshRef.current) {
            let scale;

            if (progress < 0.13) {
                // Phase 1: Slight contraction (0-2s)
                const phaseProgress = progress / 0.13;
                scale = maxRadius * 0.3 * (1.0 - phaseProgress * 0.2);
            } else if (progress < 0.33) {
                // Phase 2: Rapid brightening (2-5s)
                const phaseProgress = (progress - 0.13) / 0.2;
                scale = maxRadius * 0.3 * (0.8 + phaseProgress * 0.4);
            } else if (progress < 0.5) {
                // Phase 3: Explosive expansion (5-7.5s)
                const phaseProgress = (progress - 0.33) / 0.17;
                const easedProgress = 1 - Math.pow(1 - phaseProgress, 3);
                scale = maxRadius * 0.3 * (1.2 + easedProgress * 4.0);
            } else {
                // Phase 4: Continued expansion and fade (7.5-15s)
                const phaseProgress = (progress - 0.5) / 0.5;
                const easedProgress = Math.sqrt(phaseProgress);
                scale = maxRadius * 0.3 * (5.2 + easedProgress * 2.0);
            }

            meshRef.current.scale.set(scale, scale, scale);
        }

        // Opacity fade in final phase
        if (progress > 0.7) {
            const fadeProgress = (progress - 0.7) / 0.3;
            materialRef.current.uniforms.opacity.value = 1 - fadeProgress;
        }

        // Update light intensity
        setLightIntensity(getLightIntensity());
    });

    // Fallback to simple mesh material if shader fails
    if (hasError) {
        return (
            <mesh
                ref={meshRef}
                position={[position.x, position.y, position.z]}
            >
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        );
    }

    return (
        <group position={[position.x, position.y, position.z]}>
            {/* Dynamic point light that illuminates nearby objects */}
            <pointLight
                color={color}
                intensity={lightIntensity}
                distance={maxRadius * 3}
                decay={2}
            />

            <mesh ref={meshRef}>
                {/* Lower poly count for mobile compatibility */}
                <sphereGeometry args={[1, 16, 16]} />
                <shaderMaterial
                    ref={materialRef}
                    uniforms={uniforms}
                    vertexShader={supernovaShader.vertexShader}
                    fragmentShader={supernovaShader.fragmentShader}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.FrontSide}
                />
            </mesh>
        </group>
    );
};
