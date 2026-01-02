import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Color } from 'three';

interface ProceduralPlanetProps {
    radius: number;
    color: string;
    type?: 'terrestrial' | 'gas_giant' | 'star' | 'compact';
    rotationSpeed?: number;
}

// Shader for Terrestrial Planets (Continents, Oceans, Atmosphere)
const terrestrialShader = {
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float time;

        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 baseColor;
        uniform vec3 oceanColor;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        // Simple pseudo-noise
        float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
        
        float noise(vec2 x) {
            vec2 i = floor(x);
            vec2 f = fract(x);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        float fbm(vec2 x) {
            float v = 0.0;
            float a = 0.5;
            vec2 shift = vec2(100);
            mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
            for (int i = 0; i < 5; ++i) {
                v += a * noise(x);
                x = rot * x * 2.0 + shift;
                a *= 0.5;
            }
            return v;
        }

        void main() {
            // Continents vs Ocean based on noise threshold
            // Rotate noise coordinates over time to simulate planet rotation if needed, 
            // but usually we rotate the mesh.
            
            vec2 sphereUV = vUv;
            sphereUV.x += time * 0.01; // Cloud drift or surface mapping drift

            float n = fbm(sphereUV * 8.0);
            
            vec3 landColor = baseColor;
            vec3 waterColor = oceanColor;

            // Mix land and water based on noise
            float coastline = smoothstep(0.45, 0.55, n);
            vec3 surfaceColor = mix(waterColor, landColor, coastline);

            // Cloud Layer (offset noise)
            float clouds = fbm(sphereUV * 12.0 + vec2(time * 0.05, 0.0));
            float cloudAlpha = smoothstep(0.5, 0.8, clouds);
            surfaceColor = mix(surfaceColor, vec3(1.0), cloudAlpha * 0.8);

            // Atmosphere / Fresnel
            vec3 viewDir = normalize(-vPosition); // View direction in camera space
            float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);
            vec3 atmosColor = vec3(0.4, 0.6, 1.0);
            
            // Rim light
            surfaceColor += atmosColor * fresnel * 0.5;

            // Simple lighting
            // Assuming light source at (0,0,0) in world, but typically directional light
            // In simulation, light is at (0,0,0). So normal pointing to (0,0,0) is lit.
            
            gl_FragColor = vec4(surfaceColor, 1.0);
        }
    `
};

// Shader for Gas Giants (Banded structures)
const gasGiantShader = {
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 baseColor;
        uniform vec3 secondaryColor;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
        float noise(vec2 x) {
            vec2 i = floor(x);
            vec2 f = fract(x);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
            // Banding based on Y coordinate (vUv.y)
            float y = vUv.y * 15.0; // Number of bands
            
            // Add turbulence
            float turbulence = noise(vUv * vec2(10.0, 50.0) + vec2(time * 0.1, 0.0));
            
            float band = sin(y + turbulence * 2.0);
            float bandFactor = smoothstep(-1.0, 1.0, band);
            
            vec3 color = mix(baseColor, secondaryColor, bandFactor);
            
            // Fresnel
            vec3 viewDir = normalize(-vPosition);
            float fresnel = pow(1.0 - dot(viewDir, vNormal), 4.0);
            color += color * fresnel * 0.4;

            gl_FragColor = vec4(color, 1.0);
        }
    `
};

export const ProceduralPlanet: React.FC<ProceduralPlanetProps> = ({ radius, color, type = 'terrestrial', rotationSpeed = 0 }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Determine planet style
    const isGasGiant = type === 'gas_giant' || radius > 5; // Simple heuristic: large planets are gas giants
    const primaryColor = new Color(color);
    const secondaryColor = isGasGiant ? primaryColor.clone().multiplyScalar(0.7).offsetHSL(0.1, 0, 0) : new Color('#003366'); // Ocean color for terrestrial

    const shader = isGasGiant ? gasGiantShader : terrestrialShader;

    const uniforms = useMemo(() => ({
        time: { value: 0 },
        baseColor: { value: primaryColor },
        oceanColor: { value: secondaryColor }, // For terrestrial
        secondaryColor: { value: secondaryColor } // For gas giant
    }), [color, isGasGiant]);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            // Animate shader internal time (for clouds/turbulence)
            materialRef.current.uniforms.time.value = clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[radius, 64, 64]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={shader.vertexShader}
                fragmentShader={shader.fragmentShader}
            />
        </mesh>
    );
};
