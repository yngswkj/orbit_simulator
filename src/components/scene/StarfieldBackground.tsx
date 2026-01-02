import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const starfieldShader = {
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vWorldPosition = position; 
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec3 vWorldPosition;

        // Simplex 3D Noise (Ian McEwan, Ashima Arts)
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){ 
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 = v - i + dot(i, C.xxx) ;
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );
            vec3 x1 = x0 - i1 + 1.0 * C.xxx;
            vec3 x2 = x0 - i2 + 2.0 * C.xxx;
            vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
            i = mod(i, 289.0 ); 
            vec4 p = permute( permute( permute( 
                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
            float n_ = 1.0/7.0; 
            vec3  ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z); 
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );  
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }

        // Fractal Brownian Motion (Layered Noise)
        float fbm(vec3 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            for (int i = 0; i < 4; i++) {
                value += amplitude * snoise(p * frequency);
                p += vec3(10.0); // Shift next layer to avoid alignment artifacts
                frequency *= 2.0;
                amplitude *= 0.5;
            }
            return value;
        }

        void main() {
            vec3 pos = normalize(vWorldPosition); 

            // --- 1. Stars (Twinkle & Dense) ---
            // Base star noise
            float nStars = snoise(pos * 600.0); 
            // Twinkle factor using time and position
            float twinkle = sin(time * 2.0 + pos.x * 100.0 + pos.y * 50.0) * 0.5 + 0.5;
            // Create sharp points
            float stars = smoothstep(0.97, 1.0, nStars + twinkle * 0.02); 
            // Some extra bright lonely stars
            float brightStars = smoothstep(0.995, 1.0, snoise(pos * 300.0 + 100.0));

            // --- 2. Rich Nebula (Multi-layered FBM) ---
            // Slow moving deep structure
            float flowTime = time * 0.005;
            vec3 flowOffset = vec3(flowTime, -flowTime * 0.5, flowTime * 0.2);
            
            float nebulaNoise = fbm(pos * 1.5 + flowOffset);
            
            // Normalize noise to 0.0 - 1.0 range approx
            nebulaNoise = nebulaNoise * 0.5 + 0.5; 
            
            // Create "voids" and "clouds"
            // Sharpen the contrast
            float clouds = smoothstep(0.3, 0.8, nebulaNoise);

            // --- 3. Color Mixing (Cosmic Palette) ---
            vec3 deepSpace = vec3(0.0, 0.02, 0.05); // Deep Blue-Black
            vec3 purpleMist = vec3(0.25, 0.05, 0.35);
            vec3 tealGlow   = vec3(0.0, 0.4, 0.4);
            vec3 warmCore   = vec3(0.6, 0.3, 0.1);

            // Mix colors based on noise intensity
            vec3 nebulaColor = mix(deepSpace, purpleMist, clouds);
            nebulaColor = mix(nebulaColor, tealGlow, smoothstep(0.6, 0.9, nebulaNoise) * 0.6);
            
            // Add warm accents in dense areas
            float coreNoise = snoise(pos * 3.0 + vec3(10.0));
            nebulaColor += warmCore * smoothstep(0.7, 1.0, coreNoise * clouds) * 0.3;

            // Combine
            vec3 finalColor = nebulaColor + vec3(1.0) * (stars * 0.8 + brightStars * 1.0);

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};

export const StarfieldBackground = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock, camera }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = clock.getElapsedTime() * 0.5;
        }
        if (meshRef.current) {
            meshRef.current.position.copy(camera.position);
        }
    });

    const uniforms = useMemo(() => ({
        time: { value: 0 }
    }), []);

    return (
        <mesh ref={meshRef} frustumCulled={false}>
            <sphereGeometry args={[40000, 64, 64]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={starfieldShader.vertexShader}
                fragmentShader={starfieldShader.fragmentShader}
                side={THREE.BackSide}
                depthWrite={false}
            />
        </mesh>
    );
};
