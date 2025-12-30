import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HeatGlowEffectProps {
    bodyId: string;
    position: THREE.Vector3;
    radius: number;
    startTime: number;
    duration?: number;
    onComplete?: () => void;
}

export const HeatGlowEffect: React.FC<HeatGlowEffectProps> = ({
    position,
    radius,
    startTime,
    duration = 3000,
    onComplete
}) => {
    const glowRef = useRef<THREE.Mesh>(null);
    const startTimeRef = useRef(startTime);

    // 赤熱グラデーション用シェーダー
    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                progress: { value: 0 },
                baseColor: { value: new THREE.Color('#ff4400') },
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float progress;
                uniform vec3 baseColor;

                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    // フレネル効果（エッジで明るく）
                    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);

                    // パルス効果
                    float pulse = 0.8 + 0.2 * sin(time * 10.0);

                    // 進行に応じてフェードアウト
                    float fade = 1.0 - progress;

                    // 色温度変化（赤→オレンジ→暗い赤）
                    vec3 hotColor = vec3(1.0, 0.6, 0.2);
                    vec3 coolColor = vec3(0.5, 0.1, 0.0);
                    vec3 color = mix(hotColor, coolColor, progress);

                    float alpha = fresnel * pulse * fade * 0.8;

                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.FrontSide,
            depthWrite: false,
        });
    }, []);

    useFrame(({ clock }) => {
        if (!glowRef.current) return;

        const elapsed = performance.now() - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            onComplete?.();
            return;
        }

        shaderMaterial.uniforms.time.value = clock.elapsedTime;
        shaderMaterial.uniforms.progress.value = progress;

        // 位置追従（天体が動いている場合）
        glowRef.current.position.copy(position);
    });

    return (
        <mesh ref={glowRef} position={position}>
            <sphereGeometry args={[radius * 1.2, 32, 32]} />
            <primitive object={shaderMaterial} attach="material" />
        </mesh>
    );
};
