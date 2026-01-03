import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Color } from 'three';

interface ProceduralPlanetProps {
    radius: number;
    color: string;
    type?: 'terrestrial' | 'gas_giant' | 'rocky' | 'ice' | 'molten' | 'star' | 'compact';
    rotationSpeed?: number;
}

// --- Shader Helper Functions (GLSL) ---
const commonNoise = `
    // High-quality 3D noise functions
    vec3 hash3(vec3 p) {
        p = fract(p * vec3(443.897, 441.423, 437.195));
        p += dot(p, p.yzx + 19.19);
        return fract((p.xxy + p.yxx) * p.zyx);
    }

    float hash(vec2 p) {
        return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
    }

    // 3D Perlin-like noise
    float noise3D(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);

        return mix(
            mix(mix(hash(i.xy + i.z * 1.0), hash(i.xy + vec2(1.0, 0.0) + i.z * 1.0), f.x),
                mix(hash(i.xy + vec2(0.0, 1.0) + i.z * 1.0), hash(i.xy + 1.0 + i.z * 1.0), f.x), f.y),
            mix(mix(hash(i.xy + (i.z + 1.0) * 1.0), hash(i.xy + vec2(1.0, 0.0) + (i.z + 1.0) * 1.0), f.x),
                mix(hash(i.xy + vec2(0.0, 1.0) + (i.z + 1.0) * 1.0), hash(i.xy + 1.0 + (i.z + 1.0) * 1.0), f.x), f.y),
            f.z
        );
    }

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

    // Optimized FBM (reduced octaves for performance)
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

    // 3D FBM for spherical surfaces (reduced octaves)
    float fbm3D(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; ++i) {
            v += a * noise3D(p);
            p = p * 2.0 + vec3(100.0);
            a *= 0.5;
        }
        return v;
    }

    // Ridged multifractal noise (output: 0.0 - 1.0)
    float ridgedNoise(vec2 p) {
        float n = fbm(p);
        n = abs(n * 2.0 - 1.0);  // Ensure 0-1 range
        return clamp(1.0 - n, 0.0, 1.0);
    }
`;

// --- 1. Terrestrial Shader (Earth-like) ---
const terrestrialShader = {
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
            vUv = uv;
            vNormal = normalize(mat3(modelMatrix) * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,
    fragmentShader: `
        uniform vec3 baseColor;
        uniform vec3 secondaryColor;  // Ocean color
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        ${commonNoise}

        void main() {
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            vec3 lightDir = normalize(-vWorldPosition); // Sun is at 0,0,0
            float NdotL = max(dot(vNormal, lightDir), 0.0);

            // Use 3D noise on sphere surface for better pattern
            vec3 spherePos = normalize(vWorldPosition) * 5.0;

            // Multi-layered continent formation
            float continentBase = fbm3D(spherePos * 0.8);
            float continentDetail = fbm3D(spherePos * 2.5);
            float mountains = ridgedNoise(vUv * 15.0) * 0.3;

            // Combine for realistic landmass
            float landHeight = continentBase * 0.7 + continentDetail * 0.3 + mountains * continentBase;

            // Sharp but natural coastline
            float coastline = smoothstep(0.46, 0.54, landHeight);

            // Terrain color variation
            vec3 landColor = mix(
                baseColor * 0.5,  // Lowlands (dark green/brown)
                baseColor * 1.2,  // Highlands (bright)
                smoothstep(0.5, 0.7, landHeight)
            );

            // Desert regions (low latitude, low moisture)
            float desertNoise = fbm3D(spherePos * 1.5);
            float latitude = abs(vUv.y - 0.5) * 2.0;
            float desert = smoothstep(0.3, 0.5, desertNoise) * smoothstep(0.6, 0.3, latitude);
            landColor = mix(landColor, vec3(0.8, 0.7, 0.5), desert * coastline);

            // Ocean depth variation
            vec3 deepOcean = secondaryColor * 0.6;
            vec3 shallowOcean = secondaryColor * 1.3;
            float oceanDepth = smoothstep(0.3, 0.5, landHeight);
            vec3 oceanVariation = mix(deepOcean, shallowOcean, oceanDepth);

            vec3 surfaceColor = mix(oceanVariation, landColor, coastline);

            // Enhanced ocean specular
            vec3 reflectDir = reflect(-lightDir, vNormal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 128.0);
            float roughWater = noise(vUv * 100.0 + time * 0.1) * 0.5 + 0.5;
            surfaceColor += vec3(0.9, 1.0, 1.0) * spec * (1.0 - coastline) * NdotL * roughWater;

            // Multi-layer cloud system
            float cloudTime = time * 0.015;

            // Large cloud masses
            float cloudLayer1 = fbm(vUv * 8.0 + vec2(cloudTime, 0.0));
            // Small cumulus
            float cloudLayer2 = fbm(vUv * 25.0 + vec2(cloudTime * 1.5, cloudTime * 0.3));
            // Cirrus (high altitude)
            float cloudLayer3 = fbm(vUv * 18.0 - vec2(cloudTime * 0.8, 0.0));

            // Combine cloud layers
            float clouds = cloudLayer1 * 0.5 + cloudLayer2 * 0.3 + cloudLayer3 * 0.2;

            // Cloud formation follows temperature/moisture patterns (static distribution)
            float cloudProbability = smoothstep(0.3, 0.7, fbm3D(spherePos * 1.2));
            clouds *= cloudProbability;

            float cloudAlpha = smoothstep(0.35, 0.7, clouds);

            // Soft cloud shadows with distance falloff
            float shadowTimeOffset = 0.008;
            float cloudShadowRaw = fbm(vUv * 8.0 + vec2(cloudTime - shadowTimeOffset, 0.0));
            float cloudShadow = smoothstep(0.35, 0.7, cloudShadowRaw) * 0.5;

            // Apply shadow to surface
            surfaceColor = mix(surfaceColor, surfaceColor * 0.55, cloudShadow * (1.0 - cloudAlpha) * NdotL);

            // Cloud color varies with lighting
            vec3 cloudColor = mix(vec3(0.85, 0.9, 0.95), vec3(1.0, 1.0, 1.0), NdotL);
            surfaceColor = mix(surfaceColor, cloudColor, cloudAlpha * 0.95);

            // Day/Night terminator
            float night = 1.0 - smoothstep(-0.15, 0.15, dot(vNormal, lightDir));

            // Realistic city lights (clustered, grid-like in some areas)
            float cityGrid = noise(vUv * 80.0) * noise(vUv * 40.0);
            float population = fbm(vUv * 25.0);
            float cities = smoothstep(0.65, 0.85, population) * smoothstep(0.5, 0.7, cityGrid);
            vec3 cityLights = vec3(1.0, 0.85, 0.6) * cities * coastline * 3.0;

            vec3 ambient = vec3(0.015, 0.02, 0.025); // Slight blue ambient
            vec3 finalColor = surfaceColor * (NdotL + ambient) + cityLights * night * (1.0 - cloudAlpha * 0.8);

            // Enhanced atmospheric scattering
            float viewIncidence = max(dot(viewDir, vNormal), 0.0);
            float fresnel = pow(1.0 - viewIncidence, 3.5);

            // Rayleigh scattering (blue sky)
            vec3 atmosDay = vec3(0.3, 0.5, 0.9);
            // Sunset/sunrise (Mie scattering)
            vec3 atmosSunset = vec3(1.0, 0.6, 0.3);

            // Terminator zone detection
            float terminatorZone = 1.0 - abs(dot(vNormal, lightDir));
            terminatorZone = pow(terminatorZone, 3.0);

            vec3 atmosColor = mix(atmosDay, atmosSunset, terminatorZone * 0.8);

            // Atmosphere visibility: brighter on day side, thinner on night
            float atmosIntensity = fresnel * (0.5 + 0.5 * smoothstep(-0.2, 0.5, NdotL));

            finalColor += atmosColor * atmosIntensity * 0.6;

            // Subtle atmospheric glow at limb
            float limbGlow = pow(1.0 - viewIncidence, 8.0) * (NdotL + 0.3);
            finalColor += atmosDay * limbGlow * 0.3;

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `,
};

// --- 2. Gas Giant Shader (Jupiter-like) ---
const gasGiantShader = {
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
            vUv = uv;
            vNormal = normalize(mat3(modelMatrix) * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,
    fragmentShader: `
        uniform vec3 baseColor;
        uniform vec3 secondaryColor;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        ${commonNoise}

        void main() {
            vec3 lightDir = normalize(-vWorldPosition);
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            float NdotL = max(dot(vNormal, lightDir), 0.0);

            // Latitude-based band structure
            float latitude = (vUv.y - 0.5) * 2.0; // -1 to 1
            float latitudeBands = sin(latitude * 12.0) * 0.5 + 0.5;

            // Multi-scale turbulence with different velocities per latitude
            // Fast equatorial jets, slower mid-latitudes
            float jetSpeed = (1.0 - abs(latitude)) * 2.0 + 0.5;
            vec2 windOffset = vec2(time * 0.03 * jetSpeed, 0.0);

            // Domain warping for realistic fluid dynamics
            vec2 warp1 = vec2(
                fbm(vUv * 2.5 + windOffset * 0.8),
                fbm(vUv * 2.5 + windOffset * 0.8 + 100.0)
            ) * 2.0;

            vec2 warp2 = vec2(
                fbm(vUv * 4.0 + warp1 + windOffset),
                fbm(vUv * 4.0 + warp1 + windOffset + 200.0)
            ) * 1.5;

            // Final turbulent flow pattern
            float turbulence = fbm(vUv * vec2(12.0, 35.0) + warp2 + windOffset * 1.5);

            // Combine latitude bands with turbulence
            float bandPattern = sin(latitude * 15.0 + turbulence * 3.0 + warp1.x * 2.0);
            float bandFactor = smoothstep(-0.6, 0.6, bandPattern);

            // Three-color gradient for richer appearance
            vec3 darkBand = baseColor * 0.6;
            vec3 midBand = mix(baseColor, secondaryColor, 0.5);
            vec3 lightBand = secondaryColor * 1.2;

            vec3 color = mix(darkBand, midBand, bandFactor);
            color = mix(color, lightBand, smoothstep(0.6, 0.8, bandFactor));

            // Great Red Spot / Storm features
            // Vortex shape using distance from center
            vec2 stormCenter = vec2(0.3, 0.4); // Position on texture
            vec2 stormUV = vUv - stormCenter;

            // Rotating vortex pattern
            float stormAngle = atan(stormUV.y, stormUV.x) + time * 0.1;
            float stormDist = length(stormUV * vec2(2.5, 1.0)); // Oval shape

            float vortexPattern = sin(stormAngle * 3.0 - stormDist * 15.0) * 0.5 + 0.5;
            float stormMask = smoothstep(0.15, 0.08, stormDist) * smoothstep(0.02, 0.08, stormDist);

            // Storm color (reddish for Jupiter-like)
            vec3 stormColor = vec3(0.9, 0.5, 0.4) * (0.8 + vortexPattern * 0.4);
            color = mix(color, stormColor, stormMask * 0.85);

            // Smaller storm cells scattered across bands
            float smallStorms = fbm(vUv * 15.0 + windOffset * 2.0);
            float stormCells = smoothstep(0.7, 0.85, smallStorms);
            color = mix(color, secondaryColor * 0.7, stormCells * 0.3);

            // Polar darkening and color shift
            float polarDarkening = smoothstep(0.5, 0.95, abs(latitude));
            color *= (1.0 - polarDarkening * 0.4);
            color = mix(color, color * vec3(0.8, 0.85, 0.9), polarDarkening * 0.3); // Bluish poles

            // Atmospheric depth - thicker atmosphere scatters more light
            float atmosphereDepth = smoothstep(-0.4, 0.8, NdotL);
            color *= atmosphereDepth * 0.85 + 0.15;

            // Limb darkening (gas giants have thick atmospheres)
            float viewIncidence = max(dot(viewDir, vNormal), 0.0);
            float limbDarkening = pow(viewIncidence, 0.6);
            color *= mix(0.4, 1.0, limbDarkening);

            // Fresnel atmospheric glow
            float fresnel = pow(1.0 - viewIncidence, 2.5);
            vec3 atmosGlow = mix(baseColor, secondaryColor, 0.7) * 0.8;
            color += atmosGlow * fresnel * (NdotL * 0.5 + 0.3);

            // Slight color variation for visual interest
            float colorNoise = fbm3D(normalize(vWorldPosition) * 8.0) * 0.1;
            color *= 1.0 + colorNoise;

            gl_FragColor = vec4(color, 1.0);
        }
    `,
};

// --- 3. Rocky Shader (Mars/Moon-like) ---
const rockyShader = {
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
            vUv = uv;
            vNormal = normalize(mat3(modelMatrix) * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,
    fragmentShader: `
        uniform vec3 baseColor;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        ${commonNoise}

        // Enhanced Voronoi noise for realistic craters
        vec2 voronoiPoint(vec2 cell) {
            vec2 p = fract(sin(vec2(dot(cell, vec2(127.1, 311.7)), dot(cell, vec2(269.5, 183.3)))) * 43758.5453);
            return p;
        }

        float voronoiDistance(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);

            float minDist = 1.0;

            for(int y = -1; y <= 1; y++) {
                for(int x = -1; x <= 1; x++) {
                    vec2 neighbor = vec2(float(x), float(y));
                    vec2 point = voronoiPoint(i + neighbor);
                    vec2 diff = neighbor + point - f;
                    float dist = length(diff);

                    minDist = min(minDist, dist);
                }
            }

            return minDist;
        }

        void main() {
            vec3 lightDir = normalize(-vWorldPosition);
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);

            // Use 3D position for seamless textures
            vec3 spherePos = normalize(vWorldPosition) * 8.0;

            // Multi-scale terrain features
            float largeTerrain = fbm3D(spherePos * 0.5); // Large-scale elevation
            float mediumTerrain = fbm3D(spherePos * 1.5); // Medium hills
            float fineTerrain = fbm3D(spherePos * 4.0); // Fine detail

            float terrain = largeTerrain * 0.5 + mediumTerrain * 0.3 + fineTerrain * 0.2;

            // Multi-scale crater system
            float largeCraters = voronoiDistance(vUv * 8.0);
            float mediumCraters = voronoiDistance(vUv * 20.0);
            float smallCraters = voronoiDistance(vUv * 45.0);

            // Combine craters with different probabilities
            float craterProb1 = smoothstep(0.15, 0.25, largeCraters);
            float craterProb2 = smoothstep(0.12, 0.18, mediumCraters);
            float craterProb3 = smoothstep(0.08, 0.12, smallCraters);

            // Deep crater bowl
            float craterDepth1 = 1.0 - smoothstep(0.0, 0.15, largeCraters);
            float craterDepth2 = 1.0 - smoothstep(0.0, 0.12, mediumCraters) * 0.7;
            float craterDepth3 = 1.0 - smoothstep(0.0, 0.08, smallCraters) * 0.4;

            float totalCraterDepth = max(craterDepth1, max(craterDepth2, craterDepth3));

            // Sharp crater rims
            float rim1 = smoothstep(0.13, 0.15, largeCraters) - smoothstep(0.15, 0.18, largeCraters);
            float rim2 = smoothstep(0.10, 0.12, mediumCraters) - smoothstep(0.12, 0.14, mediumCraters);
            float rim3 = smoothstep(0.06, 0.08, smallCraters) - smoothstep(0.08, 0.10, smallCraters);

            float craterRims = rim1 + rim2 * 0.7 + rim3 * 0.4;

            // Height map combining all features
            float height = terrain * 0.4 - totalCraterDepth * 0.8;

            // Normal map calculation using height
            float d = 0.002;
            float hx = terrain * 0.4 - max(
                1.0 - smoothstep(0.0, 0.15, voronoiDistance((vUv + vec2(d, 0.0)) * 8.0)),
                max(
                    (1.0 - smoothstep(0.0, 0.12, voronoiDistance((vUv + vec2(d, 0.0)) * 20.0))) * 0.7,
                    (1.0 - smoothstep(0.0, 0.08, voronoiDistance((vUv + vec2(d, 0.0)) * 45.0))) * 0.4
                )
            ) * 0.8;

            float hy = terrain * 0.4 - max(
                1.0 - smoothstep(0.0, 0.15, voronoiDistance((vUv + vec2(0.0, d)) * 8.0)),
                max(
                    (1.0 - smoothstep(0.0, 0.12, voronoiDistance((vUv + vec2(0.0, d)) * 20.0))) * 0.7,
                    (1.0 - smoothstep(0.0, 0.08, voronoiDistance((vUv + vec2(0.0, d)) * 45.0))) * 0.4
                )
            ) * 0.8;

            vec3 normalOffset = vec3((height - hx) / d, (height - hy) / d, 1.0);
            vec3 perturbedNormal = normalize(vNormal + normalOffset * 0.3);

            float NdotL = max(dot(perturbedNormal, lightDir), 0.0);

            // Color variations
            vec3 highlandsColor = baseColor * (0.9 + terrain * 0.3);
            vec3 lowlandsColor = baseColor * 0.5;
            vec3 dustColor = baseColor * vec3(0.8, 0.7, 0.6);

            // Terrain-based color
            vec3 surfaceColor = mix(lowlandsColor, highlandsColor, smoothstep(0.3, 0.7, terrain));

            // Crater floors are darker and different material (reduced effect)
            vec3 craterFloorColor = baseColor * 0.6;
            surfaceColor = mix(surfaceColor, craterFloorColor, totalCraterDepth * 0.5);

            // Add dust accumulation in low areas (reduced)
            float dustAccumulation = fbm3D(spherePos * 3.0) * (1.0 - terrain);
            surfaceColor = mix(surfaceColor, dustColor, dustAccumulation * 0.2);

            // Bright rim highlights (reduced)
            surfaceColor += vec3(0.4, 0.35, 0.3) * craterRims * NdotL;

            // Rocky texture detail (reduced)
            float rockDetail = noise(vUv * 150.0) * 0.08;
            surfaceColor *= 1.0 + rockDetail;

            // Enhanced lighting with subsurface scattering approximation
            float subsurface = pow(max(0.0, dot(perturbedNormal, lightDir) + 0.4) / 1.4, 2.0) * 0.3;
            vec3 ambient = vec3(0.08, 0.08, 0.09);  // Increased ambient for visibility

            vec3 color = surfaceColor * (NdotL * 0.9 + subsurface + ambient);

            // Atmospheric haze (thin atmosphere like Mars)
            float viewIncidence = max(dot(viewDir, vNormal), 0.0);
            float fresnel = pow(1.0 - viewIncidence, 5.0);

            vec3 dustAtmosphere = vec3(0.9, 0.6, 0.4); // Reddish/orange dust
            float atmosVisibility = fresnel * (NdotL * 0.7 + 0.2);

            color += dustAtmosphere * atmosVisibility * 0.15;

            gl_FragColor = vec4(color, 1.0);
        }
    `,
};

// --- 4. Ice Shader (Europa-like) ---
const iceShader = {
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
            vUv = uv;
            vNormal = normalize(mat3(modelMatrix) * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,
    fragmentShader: `
        uniform vec3 baseColor; // Usually white
        uniform vec3 secondaryColor; // Blue/Teal
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        ${commonNoise}

        void main() {
            vec3 lightDir = normalize(-vWorldPosition);
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);

            // 3D ice surface features
            vec3 spherePos = normalize(vWorldPosition) * 6.0;

            // Multi-layered ice texture
            float iceBase = fbm3D(spherePos * 0.8);
            float iceDetail = fbm3D(spherePos * 3.0);
            float iceFine = noise3D(spherePos * 8.0);

            float icePattern = iceBase * 0.5 + iceDetail * 0.3 + iceFine * 0.2;

            // Complex crack network (Ridged multifractal)
            float crack1 = ridgedNoise(vUv * 15.0);
            float crack2 = ridgedNoise(vUv * 30.0);
            float crack3 = ridgedNoise(vUv * 60.0);

            // Combine cracks at different scales
            float crackPattern = crack1 * 0.5 + crack2 * 0.3 + crack3 * 0.2;
            crackPattern = pow(crackPattern, 6.0); // Sharpen cracks

            // Deep crevasses
            float deepCracks = pow(crack1, 12.0);

            // Calculate perturbed normal from cracks
            float d = 0.003;
            float hx = ridgedNoise((vUv + vec2(d, 0.0)) * 15.0);
            float hy = ridgedNoise((vUv + vec2(0.0, d)) * 15.0);

            vec3 crackNormal = normalize(vec3(
                (crack1 - hx) / d * 2.0,
                (crack1 - hy) / d * 2.0,
                1.0
            ));

            vec3 normal = normalize(mix(vNormal, crackNormal, crackPattern * 0.6));

            float NdotL = max(dot(normal, lightDir), 0.0);

            // Advanced subsurface scattering
            // Ice transmits blue light
            float wrap = 0.6;
            float scatter = max(0.0, (dot(normal, lightDir) + wrap) / (1.0 + wrap));
            float backscatter = pow(max(0.0, dot(-lightDir, viewDir)), 4.0);

            // Ice color variations
            vec3 pureIce = vec3(0.95, 0.98, 1.0);
            vec3 deepIce = vec3(0.7, 0.85, 0.95);
            vec3 ancientIce = baseColor * vec3(0.9, 0.95, 1.0);

            // Mix ice types based on pattern
            vec3 iceColor = mix(pureIce, deepIce, icePattern);
            iceColor = mix(iceColor, ancientIce, smoothstep(0.3, 0.7, iceBase));

            // Cracks expose deeper, bluer ice
            vec3 crackColor = secondaryColor * 0.8;
            vec3 deepCrackColor = secondaryColor * 0.5;

            vec3 color = mix(iceColor, crackColor, crackPattern * 0.7);
            color = mix(color, deepCrackColor, deepCracks);

            // Direct lighting
            vec3 directLight = vec3(1.0) * NdotL;

            // Subsurface scattering (blue tint)
            vec3 scatterColor = vec3(0.6, 0.8, 1.0);
            vec3 scatterLight = scatterColor * pow(scatter, 1.5) * 0.6;

            // Backscattering glow
            vec3 backscatterLight = scatterColor * backscatter * 0.4 * (1.0 - NdotL);

            vec3 ambient = vec3(0.08, 0.1, 0.12); // Slight blue ambient
            color *= (directLight * 0.9 + ambient);
            color += scatterLight + backscatterLight;

            // Enhanced specular highlights (ice is very reflective)
            vec3 reflectDir = reflect(-lightDir, normal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);

            // Rough ice vs smooth ice
            float roughness = icePattern * 0.5 + 0.5;
            float smoothSpec = pow(max(dot(viewDir, reflectDir), 0.0), 128.0);

            color += vec3(0.9, 0.95, 1.0) * (spec * roughness + smoothSpec * (1.0 - roughness)) * NdotL;

            // Fresnel reflection
            float viewIncidence = max(dot(viewDir, normal), 0.0);
            float fresnel = pow(1.0 - viewIncidence, 4.0);

            // Ice rim glow
            vec3 fresnelColor = vec3(0.7, 0.9, 1.0);
            color += fresnelColor * fresnel * 0.3;

            // Atmospheric ice crystals halo
            float atmosphereGlow = pow(1.0 - viewIncidence, 6.0) * (NdotL + 0.2);
            color += fresnelColor * atmosphereGlow * 0.2;

            gl_FragColor = vec4(color, 1.0);
        }
    `,
};

// --- 5. Molten Shader (Lava) ---
const moltenShader = {
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
            vUv = uv;
            vNormal = normalize(mat3(modelMatrix) * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,
    fragmentShader: `
        uniform vec3 baseColor; // Dark crust
        uniform vec3 secondaryColor; // Orange/Red Lava
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        ${commonNoise}

        void main() {
            vec3 lightDir = normalize(-vWorldPosition);
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            float NdotL = max(dot(vNormal, lightDir), 0.0);

            // Multi-stage domain warping for realistic lava flow
            vec2 flowDir = vec2(1.0, 0.3); // Main flow direction

            // First warp layer
            vec2 q = vec2(
                fbm(vUv * 1.5 + vec2(time * 0.015, time * 0.008)),
                fbm(vUv * 1.5 + vec2(-time * 0.012, time * 0.01))
            );

            // Second warp layer
            vec2 r = vec2(
                fbm(vUv * 2.5 + 3.0 * q + flowDir * time * 0.025),
                fbm(vUv * 2.5 + 3.0 * q - flowDir * time * 0.02)
            );

            // Third warp for fine detail
            vec2 s = vec2(
                fbm(vUv * 4.0 + 2.0 * r + flowDir * time * 0.04),
                fbm(vUv * 4.0 + 2.0 * r)
            );

            // Final flow pattern
            float flowPattern = fbm(vUv * 5.0 + 3.0 * s + flowDir * time * 0.03);

            // Crust formation (cooled lava)
            float crustBase = fbm(vUv * 8.0 + q * 0.5);
            float crustDetail = noise(vUv * 40.0);

            // Dynamic crust (changes slowly over time)
            float crustMask = smoothstep(0.3, 0.7, flowPattern + crustBase * 0.3);

            // Lava river network
            float rivers = ridgedNoise(vUv * 12.0 + r * 2.0);
            rivers = pow(rivers, 4.0);

            // Active lava veins
            float veins = smoothstep(0.6, 0.9, flowPattern) * (1.0 - crustMask);

            // Heat intensity with pulsing (use stable temperature base)
            float tempBase = flowPattern * 0.5 + rivers * 0.3 + veins * 0.2;
            float heatPulse1 = sin(time * 2.0 + tempBase * 10.0) * 0.5 + 0.5;
            float heatPulse2 = sin(time * 3.5 + vUv.x * 15.0) * 0.5 + 0.5;
            float combinedPulse = mix(heatPulse1, heatPulse2, 0.5);

            // Lava color gradient (hot to cool)
            vec3 whitehot = vec3(1.5, 1.4, 1.2);  // Extreme heat
            vec3 yellowhot = vec3(1.3, 1.0, 0.4); // Very hot
            vec3 orangehot = secondaryColor * 1.5; // Hot
            vec3 redhot = secondaryColor * 0.8;    // Cooling

            // Temperature variation with pulse
            float temperature = tempBase * 0.7 + combinedPulse * 0.3;

            // Mix lava colors based on temperature
            vec3 lavaColor = mix(redhot, orangehot, smoothstep(0.3, 0.5, temperature));
            lavaColor = mix(lavaColor, yellowhot, smoothstep(0.5, 0.7, temperature));
            lavaColor = mix(lavaColor, whitehot, smoothstep(0.7, 0.9, temperature));

            // Extra bright hotspots
            float hotspots = pow(rivers, 8.0) * (1.0 - crustMask);
            lavaColor += whitehot * hotspots * 3.0 * combinedPulse;

            // Crust color and texture
            vec3 freshCrust = baseColor * 0.7; // Dark, recently cooled
            vec3 oldCrust = baseColor * 0.3;   // Very dark, old crust
            vec3 crackGlow = orangehot * 0.5;  // Glow from cracks

            float crustAge = fbm(vUv * 6.0);
            vec3 crustColor = mix(freshCrust, oldCrust, crustAge);

            // Add texture detail to crust
            crustColor *= 0.8 + crustDetail * 0.4;

            // Cracks in crust showing underlying lava
            float cracks = pow(ridgedNoise(vUv * 25.0 + q), 10.0);
            crustColor = mix(crustColor, crackGlow, cracks * 0.6);

            // Mix lava and crust
            vec3 color = mix(lavaColor, crustColor, crustMask);

            // Crust respects lighting, lava emits light
            float crustLighting = NdotL * 0.8 + 0.2;
            color = mix(color, color * crustLighting, crustMask);

            // Heat haze effect at edges
            float viewIncidence = max(dot(viewDir, vNormal), 0.0);
            float heatGlow = pow(1.0 - viewIncidence, 3.0) * (1.0 - crustMask);
            color += orangehot * heatGlow * 0.5;

            // Add emissive boost for bloom
            color *= (1.0 - crustMask) * 0.5 + 1.0;

            gl_FragColor = vec4(color, 1.0);
        }
    `,
};


export const ProceduralPlanet: React.FC<ProceduralPlanetProps> = ({ radius, color, type = 'terrestrial' }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Color Logic
    const primaryColor = useMemo(() => new Color(color), [color]);

    // Derived secondary colors based on type
    const secondaryColor = useMemo(() => {
        if (type === 'gas_giant') return primaryColor.clone().multiplyScalar(0.7).offsetHSL(0.1, 0, 0);
        if (type === 'terrestrial') return new Color('#003366'); // Ocean
        if (type === 'rocky') return primaryColor.clone().multiplyScalar(0.5); // Darker patches
        if (type === 'ice') return new Color('#0077be'); // Blue cracks
        if (type === 'molten') return new Color('#ff4500'); // Orange Red Lava
        return new Color('white');
    }, [type, primaryColor]);

    // Shader Selection
    const shader = useMemo(() => {
        switch (type) {
            case 'gas_giant': return gasGiantShader;
            case 'rocky': return rockyShader;
            case 'ice': return iceShader;
            case 'molten': return moltenShader;
            case 'terrestrial':
            default: return terrestrialShader;
        }
    }, [type]);

    const uniforms = useMemo(() => ({
        time: { value: 0 },
        baseColor: { value: primaryColor },
        secondaryColor: { value: secondaryColor }
    }), [primaryColor, secondaryColor]);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = clock.getElapsedTime();

            // Keep uniforms updated if colors change (e.g. during editing)
            materialRef.current.uniforms.baseColor.value = primaryColor;
            materialRef.current.uniforms.secondaryColor.value = secondaryColor;
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
