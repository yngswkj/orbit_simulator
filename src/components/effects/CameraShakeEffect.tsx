/**
 * CameraShakeEffect.tsx
 * Additive camera shake that composes with follow and cinematic camera motion
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
    const completedRef = useRef(false);
    const lastOffsetRef = useRef(new THREE.Vector3());
    const noiseTimeRef = useRef(startTime * 0.013);

    useEffect(() => {
        const offsetRef = lastOffsetRef;
        return () => {
            camera.position.sub(offsetRef.current);
            offsetRef.current.set(0, 0, 0);
        };
    }, [camera]);

    useFrame((_, delta) => {
        if (completedRef.current) {
            return;
        }

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        camera.position.sub(lastOffsetRef.current);

        if (progress >= 1) {
            completedRef.current = true;
            lastOffsetRef.current.set(0, 0, 0);
            onComplete?.();
            return;
        }

        noiseTimeRef.current += delta * 8;

        const currentIntensity = falloff === 'exponential'
            ? intensity * Math.pow(1 - progress, 2.8)
            : intensity * (1 - progress);

        const offset = lastOffsetRef.current;
        offset.set(
            Math.sin(noiseTimeRef.current * 1.7) * currentIntensity * 0.5 +
                Math.cos(noiseTimeRef.current * 3.1) * currentIntensity * 0.2,
            Math.cos(noiseTimeRef.current * 2.3) * currentIntensity * 0.45 +
                Math.sin(noiseTimeRef.current * 4.7) * currentIntensity * 0.15,
            Math.sin(noiseTimeRef.current * 2.9) * currentIntensity * 0.35
        );

        camera.position.add(offset);
    });

    return null;
};
