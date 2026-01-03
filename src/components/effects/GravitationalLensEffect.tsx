/**
 * GravitationalLensEffect.tsx
 * Post-processing gravitational lensing effect that distorts the background
 * Uses screen-space distortion based on black hole positions
 */

import { forwardRef, useMemo, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Effect } from 'postprocessing';
import { Uniform, Vector2, Vector3, Camera } from 'three';

// Custom shader for gravitational lensing
const fragmentShader = `
uniform vec2 blackHoleScreen;
uniform float lensStrength;
uniform float schwarzschildRadius;
uniform float aspectRatio;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Adjust UV for aspect ratio
    vec2 adjustedUV = uv;
    adjustedUV.x *= aspectRatio;

    vec2 adjustedBH = blackHoleScreen;
    adjustedBH.x *= aspectRatio;

    // Vector from pixel to black hole center
    vec2 toBH = adjustedBH - adjustedUV;
    float dist = length(toBH);

    // Gravitational lensing formula (simplified)
    // Light bends toward the black hole, stronger near the event horizon
    float eventHorizon = schwarzschildRadius * 0.5;
    float photonSphere = schwarzschildRadius * 1.5;

    // Skip if too far (optimization)
    if (dist > schwarzschildRadius * 8.0) {
        outputColor = inputColor;
        return;
    }

    // Einstein ring effect - light wraps around
    float bendStrength = 0.0;

    if (dist > eventHorizon) {
        // Outside event horizon: bend light toward black hole
        // Strength falls off with distance squared (inverse square law)
        float normalizedDist = dist / schwarzschildRadius;
        bendStrength = lensStrength / (normalizedDist * normalizedDist);

        // Extra bending near photon sphere
        if (dist < photonSphere * 2.0) {
            float photonFactor = 1.0 - smoothstep(photonSphere, photonSphere * 2.0, dist);
            bendStrength *= (1.0 + photonFactor * 2.0);
        }
    }

    // Apply distortion - pull UV toward black hole center
    vec2 bendDir = normalize(toBH);
    vec2 distortedUV = uv + bendDir * bendStrength * 0.1;

    // Undo aspect ratio adjustment for sampling
    distortedUV.x = clamp(distortedUV.x, 0.0, 1.0);
    distortedUV.y = clamp(distortedUV.y, 0.0, 1.0);

    // Sample the distorted position
    vec4 distortedColor = texture2D(inputBuffer, distortedUV);

    // Darken near event horizon (light cannot escape)
    float darkenFactor = 1.0;
    if (dist < eventHorizon * 1.2) {
        darkenFactor = smoothstep(eventHorizon * 0.8, eventHorizon * 1.2, dist);
    }

    // Add subtle blue-shift effect near the black hole (gravitational blueshift)
    vec3 finalColor = distortedColor.rgb * darkenFactor;
    if (dist < photonSphere * 3.0) {
        float blueShift = (1.0 - dist / (photonSphere * 3.0)) * 0.15;
        finalColor.b += blueShift;
        finalColor.r -= blueShift * 0.5;
    }

    outputColor = vec4(finalColor, distortedColor.a);
}
`;

// Custom postprocessing Effect class
class GravitationalLensEffectImpl extends Effect {
    constructor({
        blackHoleScreen = new Vector2(0.5, 0.5),
        lensStrength = 1.0,
        schwarzschildRadius = 0.05,
        aspectRatio = 1.0,
    } = {}) {
        super('GravitationalLensEffect', fragmentShader, {
            uniforms: new Map<string, Uniform>([
                ['blackHoleScreen', new Uniform(blackHoleScreen)],
                ['lensStrength', new Uniform(lensStrength)],
                ['schwarzschildRadius', new Uniform(schwarzschildRadius)],
                ['aspectRatio', new Uniform(aspectRatio)],
            ]),
        });
    }

    update(
        _renderer: unknown,
        _inputBuffer: unknown,
        _deltaTime: number
    ) {
        // Updates are handled externally
    }
}

// Props for the React component
interface GravitationalLensEffectProps {
    blackHolePosition: Vector3;
    schwarzschildRadius: number;
    strength?: number;
    camera: Camera;
    enabled?: boolean;
}

// React component wrapper
export const GravitationalLensEffect = forwardRef<
    GravitationalLensEffectImpl,
    GravitationalLensEffectProps
>(({ blackHolePosition, schwarzschildRadius, strength = 1.0, camera, enabled = true }, ref) => {
    const effect = useMemo(() => {
        return new GravitationalLensEffectImpl({
            lensStrength: strength,
        });
    }, [strength]);

    // Update uniforms every frame based on camera position
    useFrame(() => {
        if (!camera) return;

        // Always set lensStrength based on enabled state
        effect.uniforms.get('lensStrength')!.value = enabled ? strength : 0;

        // Skip calculations if disabled
        if (!enabled) return;

        // Project 3D position to screen space (0-1)
        const screenPos = blackHolePosition.clone().project(camera);

        // Convert from NDC (-1 to 1) to UV (0 to 1)
        const screenUV = new Vector2(
            (screenPos.x + 1) / 2,
            (screenPos.y + 1) / 2
        );

        // Calculate screen-space radius based on distance
        const distance = camera.position.distanceTo(blackHolePosition);
        const screenRadius = Math.min(0.3, schwarzschildRadius / distance * 2);

        // Get aspect ratio
        const aspect = window.innerWidth / window.innerHeight;

        effect.uniforms.get('blackHoleScreen')!.value = screenUV;
        effect.uniforms.get('schwarzschildRadius')!.value = screenRadius;
        effect.uniforms.get('aspectRatio')!.value = aspect;
    });

    // Expose the effect instance via ref
    useImperativeHandle(ref, () => effect, [effect]);

    return <primitive object={effect} />;
});

GravitationalLensEffect.displayName = 'GravitationalLensEffect';
