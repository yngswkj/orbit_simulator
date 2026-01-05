/**
 * CameraShakeEffect.tsx
 * Camera shake effect for dramatic events like supernova explosions
 */

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraShakeEffectProps {
    startTime: number;
    duration: number;
    intensity: number;
    falloff?: 'linear' | 'exponential';
    onComplete?: () => void;
}

export const CameraShakeEffect: React.FC<CameraShakeEffectProps> = ({
    startTime,
    duration,
    intensity,
    falloff = 'exponential',
    onComplete
}) => {
    const { camera } = useThree();
    const originalPosition = useRef<THREE.Vector3>(new THREE.Vector3());
    const completedRef = useRef(false);
    const shakeOffset = useRef<THREE.Vector3>(new THREE.Vector3());

    // Store original camera position
    useEffect(() => {
        originalPosition.current.copy(camera.position);

        return () => {
            // Restore original position on cleanup
            if (!completedRef.current) {
                camera.position.copy(originalPosition.current);
            }
        };
    }, [camera]);

    useFrame(() => {
        if (completedRef.current) return;

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            completedRef.current = true;
            // Reset to original position
            camera.position.copy(originalPosition.current);
            onComplete?.();
            return;
        }

        // Calculate shake intensity based on progress and falloff
        let currentIntensity: number;

        if (falloff === 'exponential') {
            // Exponential falloff: strong at start, quickly decreases
            currentIntensity = intensity * Math.pow(1 - progress, 3);
        } else {
            // Linear falloff
            currentIntensity = intensity * (1 - progress);
        }

        // Generate random shake offset
        shakeOffset.current.set(
            (Math.random() - 0.5) * currentIntensity,
            (Math.random() - 0.5) * currentIntensity,
            (Math.random() - 0.5) * currentIntensity
        );

        // Apply shake to camera position
        camera.position.copy(originalPosition.current).add(shakeOffset.current);
    });

    return null; // This component doesn't render anything visible
};
