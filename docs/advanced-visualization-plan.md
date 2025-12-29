# 高度な可視化機能 - 実装計画書

## 概要

本計画書は、軌道シミュレーターに以下の高度な可視化機能を段階的に実装するための詳細な設計と手順を定義する。

| Phase | 機能 | 難易度 | 推定工数 |
|-------|------|--------|----------|
| Phase 1 | ハビタブルゾーン動的計算 | 🟢 低 | 3-4時間 |
| Phase 2 | 衝突エフェクト・デブリ | 🟡 中 | 6-8時間 |
| Phase 3 | 降着円盤・3D HZ | 🔴 高 | 12-16時間 |

---

# Phase 1: ハビタブルゾーン動的計算

## 1.1 単一恒星HZ動的計算

### 概要
恒星の質量から光度を計算し、ハビタブルゾーン（液体の水が存在可能な領域）の内縁・外縁を動的に決定する。

### 物理モデル

```
質量-光度関係: L = M^3.5 （太陽質量比）
ハビタブルゾーン内縁: r_inner = sqrt(L) × 0.95 AU
ハビタブルゾーン外縁: r_outer = sqrt(L) × 1.4 AU
```

### 変更対象ファイル

#### 1.1.1 src/constants/physics.ts（追加）

```typescript
// 太陽の物理定数
export const SOLAR_CONSTANTS = {
    SOLAR_MASS: 333000,        // 地球質量単位での太陽質量
    SOLAR_LUMINOSITY: 1.0,     // 基準光度（太陽=1）

    // ハビタブルゾーン境界（AU単位、太陽光度1の場合）
    HZ_INNER_AU: 0.95,
    HZ_OUTER_AU: 1.4,
};
```

#### 1.1.2 src/utils/habitableZone.ts（新規作成）

```typescript
import { SOLAR_CONSTANTS } from '../constants/physics';
import type { CelestialBody } from '../types/physics';

/**
 * 恒星の質量から光度を計算（質量-光度関係）
 * @param starMass 恒星質量（シミュレーション単位）
 * @returns 太陽光度比
 */
export const calculateLuminosity = (starMass: number): number => {
    const solarMassRatio = starMass / SOLAR_CONSTANTS.SOLAR_MASS;
    // 主系列星の質量-光度関係: L ∝ M^3.5
    return Math.pow(solarMassRatio, 3.5);
};

/**
 * 単一恒星のハビタブルゾーン境界を計算
 * @param star 恒星オブジェクト
 * @param auScale 1AUのシミュレーション単位長
 * @returns { inner: number, outer: number } 内縁・外縁距離
 */
export const calculateSingleStarHZ = (
    star: CelestialBody,
    auScale: number
): { inner: number; outer: number } => {
    const luminosity = calculateLuminosity(star.mass);
    const sqrtL = Math.sqrt(luminosity);

    return {
        inner: sqrtL * SOLAR_CONSTANTS.HZ_INNER_AU * auScale,
        outer: sqrtL * SOLAR_CONSTANTS.HZ_OUTER_AU * auScale,
    };
};

/**
 * 複数恒星系での特定座標における放射フラックスを計算
 * @param x X座標
 * @param z Z座標
 * @param stars 恒星配列
 * @returns 正規化されたフラックス値
 */
export const calculateFluxAt = (
    x: number,
    z: number,
    stars: CelestialBody[]
): number => {
    let totalFlux = 0;

    for (const star of stars) {
        const dx = x - star.position.x;
        const dz = z - star.position.z;
        const distSq = dx * dx + dz * dz + 0.01; // epsilon避け

        const luminosity = calculateLuminosity(star.mass);
        // 放射フラックス: F = L / (4πr²) → 正規化して L / r²
        totalFlux += luminosity / distSq;
    }

    return totalFlux;
};

/**
 * フラックス値がハビタブルゾーン範囲内かを判定
 * 太陽系地球位置（1AU）でのフラックスを1.0として正規化
 * @param flux 放射フラックス
 * @returns 0=寒すぎ, 1=ハビタブル, 2=熱すぎ
 */
export const classifyHabitability = (flux: number): 0 | 1 | 2 => {
    // 1AU での太陽フラックス = 1.0 / 1² = 1.0
    // HZ内縁(0.95AU): flux = 1.0 / 0.95² ≈ 1.11
    // HZ外縁(1.4AU): flux = 1.0 / 1.4² ≈ 0.51
    const HZ_INNER_FLUX = 1.0 / (SOLAR_CONSTANTS.HZ_INNER_AU ** 2); // ~1.11
    const HZ_OUTER_FLUX = 1.0 / (SOLAR_CONSTANTS.HZ_OUTER_AU ** 2); // ~0.51

    if (flux > HZ_INNER_FLUX) return 2; // 熱すぎ
    if (flux < HZ_OUTER_FLUX) return 0; // 寒すぎ
    return 1; // ハビタブル
};
```

#### 1.1.3 src/components/scene/Scene.tsx（修正）

```typescript
// 既存のインポートに追加
import { calculateSingleStarHZ } from '../../utils/habitableZone';

// SimulationContent 内の修正
const SimulationContent = () => {
    // ... 既存コード ...

    const stars = bodies.filter(b => b.isStar);
    const isSingleStarSystem = stars.length === 1;
    const primaryStar = isSingleStarSystem ? stars[0] : undefined;

    // 動的HZ計算（修正箇所）
    const scale = useRealisticDistances
        ? DISTANCE_SCALES.REALISTIC.AU_UNIT
        : DISTANCE_SCALES.COMPRESSED.AU_UNIT;

    const habitableZone = useMemo(() => {
        if (!primaryStar) return null;
        return calculateSingleStarHZ(primaryStar, scale);
    }, [primaryStar, scale]);

    // レンダリング部分
    {showHabitableZone && habitableZone && primaryStar && (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[primaryStar.position.x, -0.5, primaryStar.position.z]}
        >
            <ringGeometry args={[habitableZone.inner, habitableZone.outer, 64]} />
            <meshBasicMaterial color="#22aa44" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
    )}
};
```

---

## 1.2 連星系HZ（2D）

### 概要
複数の恒星がある系において、各グリッド点での合計放射フラックスを計算し、ハビタブル領域を2Dヒートマップとして表示する。

### 設計方針
- 既存の `GravityHeatmap.tsx` のアーキテクチャを流用
- 100×100 グリッドで5フレームごとに更新（パフォーマンス維持）
- 単一恒星系では従来のリング表示、複数恒星系では2Dマップ表示

### 変更対象ファイル

#### 1.2.1 src/components/scene/HabitableZoneMap.tsx（新規作成）

```typescript
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '../../store/physicsStore';
import { calculateFluxAt, classifyHabitability } from '../../utils/habitableZone';
import { DISTANCE_SCALES } from '../../utils/solarSystem';
import * as THREE from 'three';

const GRID_SIZE = 100;
const UPDATE_INTERVAL = 5;

// 色定義: 寒すぎ(青) / ハビタブル(緑) / 熱すぎ(赤)
const COLORS = {
    COLD: new THREE.Color(0x0044aa),
    HABITABLE: new THREE.Color(0x22aa44),
    HOT: new THREE.Color(0xaa2222),
    TRANSPARENT: new THREE.Color(0x000000),
};

export const HabitableZoneMap: React.FC = () => {
    const bodies = usePhysicsStore(state => state.bodies);
    const showHabitableZone = usePhysicsStore(state => state.showHabitableZone);
    const useRealisticDistances = usePhysicsStore(state => state.useRealisticDistances);

    const meshRef = useRef<THREE.Mesh>(null);
    const frameCount = useRef(0);

    const stars = useMemo(() => bodies.filter(b => b.isStar), [bodies]);
    const isMultiStarSystem = stars.length > 1;

    // 単一恒星系では表示しない（Scene.tsxのリング表示を使用）
    if (!isMultiStarSystem) return null;

    // グリッド範囲（最も遠い恒星の2倍）
    const extent = useMemo(() => {
        const maxDist = Math.max(...stars.map(s =>
            Math.sqrt(s.position.x ** 2 + s.position.z ** 2)
        ));
        const baseExtent = Math.max(maxDist * 3, 100);
        return useRealisticDistances ? baseExtent * 4 : baseExtent;
    }, [stars, useRealisticDistances]);

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(extent * 2, extent * 2, GRID_SIZE, GRID_SIZE);
        geo.rotateX(-Math.PI / 2);

        const colors = new Float32Array((GRID_SIZE + 1) * (GRID_SIZE + 1) * 3);
        const alphas = new Float32Array((GRID_SIZE + 1) * (GRID_SIZE + 1));

        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

        return geo;
    }, [extent]);

    useFrame(() => {
        if (!showHabitableZone || !meshRef.current || stars.length < 2) return;

        frameCount.current++;
        if (frameCount.current % UPDATE_INTERVAL !== 0) return;

        const geo = meshRef.current.geometry as THREE.PlaneGeometry;
        const positions = geo.attributes.position.array as Float32Array;
        const colors = geo.attributes.color.array as Float32Array;

        const auScale = useRealisticDistances
            ? DISTANCE_SCALES.REALISTIC.AU_UNIT
            : DISTANCE_SCALES.COMPRESSED.AU_UNIT;

        // 正規化用: 1AUでの太陽フラックス
        const referenceFlux = 1.0 / (auScale * auScale);

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            const vertexIndex = i / 3;

            const flux = calculateFluxAt(x, z, stars);
            const normalizedFlux = flux / referenceFlux;
            const classification = classifyHabitability(normalizedFlux);

            let color: THREE.Color;
            let alpha = 0.3;

            switch (classification) {
                case 0: // 寒すぎ
                    color = COLORS.COLD;
                    alpha = 0.1;
                    break;
                case 1: // ハビタブル
                    color = COLORS.HABITABLE;
                    alpha = 0.4;
                    break;
                case 2: // 熱すぎ
                    color = COLORS.HOT;
                    alpha = 0.2;
                    break;
            }

            colors[vertexIndex * 3] = color.r;
            colors[vertexIndex * 3 + 1] = color.g;
            colors[vertexIndex * 3 + 2] = color.b;
        }

        geo.attributes.color.needsUpdate = true;
    });

    if (!showHabitableZone || !isMultiStarSystem) return null;

    return (
        <mesh ref={meshRef} geometry={geometry} position={[0, -1.5, 0]}>
            <meshBasicMaterial
                vertexColors
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
};
```

#### 1.2.2 src/components/scene/Scene.tsx（修正）

```typescript
// インポート追加
import { HabitableZoneMap } from './HabitableZoneMap';

// SimulationContent のレンダリング部分に追加
return (
    <>
        {/* 既存のコンポーネント */}

        {/* 単一恒星系のリング表示（既存） */}
        {showHabitableZone && habitableZone && primaryStar && isSingleStarSystem && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[primaryStar.position.x, -0.5, primaryStar.position.z]}>
                <ringGeometry args={[habitableZone.inner, habitableZone.outer, 64]} />
                <meshBasicMaterial color="#22aa44" transparent opacity={0.15} side={THREE.DoubleSide} />
            </mesh>
        )}

        {/* 複数恒星系の2Dマップ表示（新規） */}
        <HabitableZoneMap />

        {/* 既存のコンポーネント */}
    </>
);
```

#### 1.2.3 src/utils/i18n.ts（翻訳追加）

```typescript
// 追加項目
habitable_zone_multi_star: 'Multi-Star Habitable Zone',
habitable_zone_multi_star_ja: '連星系ハビタブルゾーン',
hz_cold: 'Too Cold',
hz_cold_ja: '寒冷域',
hz_habitable: 'Habitable',
hz_habitable_ja: 'ハビタブル',
hz_hot: 'Too Hot',
hz_hot_ja: '高温域',
```

---

# Phase 2: 衝突エフェクト・デブリシステム

## 2.1 衝突検出・破壊エフェクト（ロシュ限界）

### 概要
天体がロシュ限界内に侵入した際、潮汐破壊による視覚的な破壊エフェクトを表示する。物理的なSPH計算は行わず、パーティクルによる視覚表現のみ。

### 物理モデル

```
ロシュ限界: r_Roche = 2.44 × R_primary × (ρ_primary / ρ_secondary)^(1/3)

簡略化（密度比を質量比で近似）:
r_Roche ≈ 2.44 × R_primary × (M_primary / M_secondary)^(1/3)
```

### 変更対象ファイル

#### 2.1.1 src/types/physics.ts（追加）

```typescript
// 既存のCelestialBodyに追加
export interface CelestialBody {
    // ... 既存フィールド ...

    // 破壊状態（Phase 2で追加）
    isBeingDestroyed?: boolean;
    destructionProgress?: number; // 0-1
    destructionStartTime?: number;
}

// 破壊イベント
export interface TidalDisruptionEvent {
    bodyId: string;
    primaryId: string;
    position: { x: number; y: number; z: number };
    startTime: number;
    duration: number;
}
```

#### 2.1.2 src/utils/rocheLimit.ts（新規作成）

```typescript
import type { CelestialBody } from '../types/physics';

/**
 * ロシュ限界距離を計算
 * @param primary 主天体（惑星/恒星）
 * @param secondary 衛星/小天体
 * @returns ロシュ限界距離
 */
export const calculateRocheLimit = (
    primary: CelestialBody,
    secondary: CelestialBody
): number => {
    // 密度比を質量・半径から計算
    // ρ = M / (4/3 π R³) → ρ1/ρ2 = (M1/R1³) / (M2/R2³)
    const densityRatio = (primary.mass / Math.pow(primary.radius, 3)) /
                         (secondary.mass / Math.pow(secondary.radius, 3));

    return 2.44 * primary.radius * Math.pow(densityRatio, 1/3);
};

/**
 * 天体ペアがロシュ限界内かをチェック
 * @returns ロシュ限界内の場合はイベント情報、そうでなければnull
 */
export const checkRocheLimit = (
    body1: CelestialBody,
    body2: CelestialBody
): { primary: CelestialBody; secondary: CelestialBody; rocheLimit: number } | null => {
    // 質量が大きい方を主天体とする
    const [primary, secondary] = body1.mass > body2.mass
        ? [body1, body2]
        : [body2, body1];

    // 恒星同士は対象外
    if (primary.isStar && secondary.isStar) return null;

    const rocheLimit = calculateRocheLimit(primary, secondary);

    const dx = primary.position.x - secondary.position.x;
    const dy = primary.position.y - secondary.position.y;
    const dz = primary.position.z - secondary.position.z;
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

    if (distance < rocheLimit) {
        return { primary, secondary, rocheLimit };
    }

    return null;
};
```

#### 2.1.3 src/components/effects/TidalDisruptionEffect.tsx（新規作成）

```typescript
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TidalDisruptionEffectProps {
    position: THREE.Vector3;
    primaryPosition: THREE.Vector3;
    bodyRadius: number;
    bodyColor: string;
    startTime: number;
    duration?: number;
    onComplete?: () => void;
}

const PARTICLE_COUNT = 2000;

export const TidalDisruptionEffect: React.FC<TidalDisruptionEffectProps> = ({
    position,
    primaryPosition,
    bodyRadius,
    bodyColor,
    startTime,
    duration = 5000,
    onComplete
}) => {
    const pointsRef = useRef<THREE.Points>(null);
    const startTimeRef = useRef(startTime);

    // パーティクル初期化
    const { geometry, velocities, initialPositions } = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const sizes = new Float32Array(PARTICLE_COUNT);
        const vels: THREE.Vector3[] = [];
        const initPos: THREE.Vector3[] = [];

        const baseColor = new THREE.Color(bodyColor);
        const toPrimary = new THREE.Vector3()
            .subVectors(primaryPosition, position)
            .normalize();

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // 球面上にランダム配置
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = bodyRadius * (0.8 + Math.random() * 0.4);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = position.x + x;
            positions[i * 3 + 1] = position.y + y;
            positions[i * 3 + 2] = position.z + z;

            initPos.push(new THREE.Vector3(x, y, z));

            // 潮汐力方向（主天体に向かう/離れる方向）に沿った速度
            const tidalDir = new THREE.Vector3(x, y, z).normalize();
            const dot = tidalDir.dot(toPrimary);

            // 主天体側は引き寄せられ、反対側は押し出される
            const speed = (0.5 + Math.random() * 0.5) * bodyRadius * 0.1;
            const vel = tidalDir.clone().multiplyScalar(dot * speed);

            // 接線方向の回転成分を追加
            const tangent = new THREE.Vector3()
                .crossVectors(toPrimary, tidalDir)
                .normalize()
                .multiplyScalar(speed * 0.3);
            vel.add(tangent);

            vels.push(vel);

            // 色（中心に近いほど明るく）
            const colorVariation = 0.7 + Math.random() * 0.3;
            colors[i * 3] = baseColor.r * colorVariation;
            colors[i * 3 + 1] = baseColor.g * colorVariation;
            colors[i * 3 + 2] = baseColor.b * colorVariation;

            sizes[i] = bodyRadius * 0.02 * (0.5 + Math.random());
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        return { geometry: geo, velocities: vels, initialPositions: initPos };
    }, [position, primaryPosition, bodyRadius, bodyColor]);

    useFrame(({ clock }) => {
        if (!pointsRef.current) return;

        const elapsed = (performance.now() - startTimeRef.current);
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            onComplete?.();
            return;
        }

        const positions = geometry.attributes.position.array as Float32Array;
        const sizes = geometry.attributes.size.array as Float32Array;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // 位置更新
            positions[i * 3] += velocities[i].x * 0.016;
            positions[i * 3 + 1] += velocities[i].y * 0.016;
            positions[i * 3 + 2] += velocities[i].z * 0.016;

            // 徐々に減速
            velocities[i].multiplyScalar(0.995);

            // サイズ縮小（フェードアウト）
            sizes[i] *= (1 - progress * 0.01);
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;

        // マテリアルの透明度も調整
        const material = pointsRef.current.material as THREE.PointsMaterial;
        material.opacity = 1 - progress * 0.8;
    });

    return (
        <points ref={pointsRef} geometry={geometry}>
            <pointsMaterial
                vertexColors
                transparent
                opacity={1}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};
```

---

## 2.2 衝撃波・赤熱エフェクト

### 概要
天体衝突時に衝撃波リングと赤熱発光エフェクトを表示する。

#### 2.2.1 src/components/effects/ShockwaveEffect.tsx（新規作成）

```typescript
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShockwaveEffectProps {
    position: THREE.Vector3;
    startTime: number;
    duration?: number;
    maxRadius?: number;
    color?: string;
    onComplete?: () => void;
}

export const ShockwaveEffect: React.FC<ShockwaveEffectProps> = ({
    position,
    startTime,
    duration = 1500,
    maxRadius = 50,
    color = '#ffaa00',
    onComplete
}) => {
    const ringRef = useRef<THREE.Mesh>(null);
    const startTimeRef = useRef(startTime);

    useFrame(() => {
        if (!ringRef.current) return;

        const elapsed = performance.now() - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            onComplete?.();
            return;
        }

        // イージング（急速に広がり、徐々に減速）
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentRadius = maxRadius * eased;

        // スケール更新
        ringRef.current.scale.set(currentRadius, currentRadius, 1);

        // 透明度（中盤で最大、その後フェードアウト）
        const material = ringRef.current.material as THREE.MeshBasicMaterial;
        const opacityPeak = 0.3;
        if (progress < 0.2) {
            material.opacity = (progress / 0.2) * 0.8;
        } else {
            material.opacity = 0.8 * (1 - (progress - 0.2) / 0.8);
        }
    });

    return (
        <mesh
            ref={ringRef}
            position={position}
            rotation={[-Math.PI / 2, 0, 0]}
        >
            <ringGeometry args={[0.8, 1, 64]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0}
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};
```

#### 2.2.2 src/components/effects/HeatGlowEffect.tsx（新規作成）

```typescript
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
```

---

## 2.3 非物理デブリシステム

### 概要
衝突後のデブリを軌道パラメータで管理し、N体計算には含めない。視覚的にのみ表示。

#### 2.3.1 src/types/debris.ts（新規作成）

```typescript
export interface DebrisParticle {
    id: string;
    position: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
    size: number;
    color: string;
    createdAt: number;
    lifetime: number; // ms
}

export interface DebrisCloud {
    id: string;
    sourceBodyId: string;
    particles: DebrisParticle[];
    createdAt: number;
}
```

#### 2.3.2 src/store/effectsStore.ts（新規作成）

```typescript
import { create } from 'zustand';
import type { DebrisCloud } from '../types/debris';
import type { TidalDisruptionEvent } from '../types/physics';

interface EffectsStore {
    // 衝撃波エフェクト
    shockwaves: Array<{
        id: string;
        position: { x: number; y: number; z: number };
        startTime: number;
        maxRadius: number;
    }>;

    // 赤熱エフェクト
    heatGlows: Array<{
        id: string;
        bodyId: string;
        position: { x: number; y: number; z: number };
        radius: number;
        startTime: number;
    }>;

    // デブリクラウド
    debrisClouds: DebrisCloud[];

    // 潮汐破壊イベント
    tidalDisruptions: TidalDisruptionEvent[];

    // アクション
    addShockwave: (position: { x: number; y: number; z: number }, maxRadius: number) => void;
    removeShockwave: (id: string) => void;

    addHeatGlow: (bodyId: string, position: { x: number; y: number; z: number }, radius: number) => void;
    removeHeatGlow: (id: string) => void;

    addDebrisCloud: (cloud: Omit<DebrisCloud, 'id'>) => void;
    updateDebris: (dt: number) => void;
    removeExpiredDebris: () => void;

    addTidalDisruption: (event: Omit<TidalDisruptionEvent, 'startTime'>) => void;
    removeTidalDisruption: (bodyId: string) => void;

    cleanup: () => void;
}

export const useEffectsStore = create<EffectsStore>((set, get) => ({
    shockwaves: [],
    heatGlows: [],
    debrisClouds: [],
    tidalDisruptions: [],

    addShockwave: (position, maxRadius) => {
        const id = `shockwave-${Date.now()}-${Math.random()}`;
        set(state => ({
            shockwaves: [...state.shockwaves, { id, position, startTime: performance.now(), maxRadius }]
        }));
    },

    removeShockwave: (id) => {
        set(state => ({
            shockwaves: state.shockwaves.filter(s => s.id !== id)
        }));
    },

    addHeatGlow: (bodyId, position, radius) => {
        const id = `heatglow-${Date.now()}-${Math.random()}`;
        set(state => ({
            heatGlows: [...state.heatGlows, { id, bodyId, position, radius, startTime: performance.now() }]
        }));
    },

    removeHeatGlow: (id) => {
        set(state => ({
            heatGlows: state.heatGlows.filter(h => h.id !== id)
        }));
    },

    addDebrisCloud: (cloud) => {
        const id = `debris-${Date.now()}-${Math.random()}`;
        set(state => ({
            debrisClouds: [...state.debrisClouds, { ...cloud, id }]
        }));
    },

    updateDebris: (dt) => {
        set(state => ({
            debrisClouds: state.debrisClouds.map(cloud => ({
                ...cloud,
                particles: cloud.particles.map(p => ({
                    ...p,
                    position: {
                        x: p.position.x + p.velocity.x * dt,
                        y: p.position.y + p.velocity.y * dt,
                        z: p.position.z + p.velocity.z * dt,
                    },
                    // 減速（空気抵抗的な効果）
                    velocity: {
                        x: p.velocity.x * 0.999,
                        y: p.velocity.y * 0.999,
                        z: p.velocity.z * 0.999,
                    }
                }))
            }))
        }));
    },

    removeExpiredDebris: () => {
        const now = performance.now();
        set(state => ({
            debrisClouds: state.debrisClouds
                .map(cloud => ({
                    ...cloud,
                    particles: cloud.particles.filter(p =>
                        now - p.createdAt < p.lifetime
                    )
                }))
                .filter(cloud => cloud.particles.length > 0)
        }));
    },

    addTidalDisruption: (event) => {
        set(state => ({
            tidalDisruptions: [...state.tidalDisruptions, { ...event, startTime: performance.now() }]
        }));
    },

    removeTidalDisruption: (bodyId) => {
        set(state => ({
            tidalDisruptions: state.tidalDisruptions.filter(t => t.bodyId !== bodyId)
        }));
    },

    cleanup: () => {
        set({
            shockwaves: [],
            heatGlows: [],
            debrisClouds: [],
            tidalDisruptions: [],
        });
    },
}));
```

#### 2.3.3 src/components/effects/DebrisRenderer.tsx（新規作成）

```typescript
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useEffectsStore } from '../../store/effectsStore';
import * as THREE from 'three';

export const DebrisRenderer: React.FC = () => {
    const debrisClouds = useEffectsStore(state => state.debrisClouds);
    const updateDebris = useEffectsStore(state => state.updateDebris);
    const removeExpiredDebris = useEffectsStore(state => state.removeExpiredDebris);

    const pointsRef = useRef<THREE.Points>(null);
    const lastUpdate = useRef(0);

    // 全デブリを統合したジオメトリ
    const geometry = useMemo(() => {
        const allParticles = debrisClouds.flatMap(c => c.particles);
        const count = allParticles.length;

        if (count === 0) return null;

        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        allParticles.forEach((p, i) => {
            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;

            const color = new THREE.Color(p.color);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            // 寿命に応じてサイズ縮小
            const age = (performance.now() - p.createdAt) / p.lifetime;
            sizes[i] = p.size * (1 - age * 0.5);
        });

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        return geo;
    }, [debrisClouds]);

    useFrame((_, delta) => {
        // 60fpsで更新
        updateDebris(delta);

        // 1秒ごとに期限切れチェック
        const now = performance.now();
        if (now - lastUpdate.current > 1000) {
            removeExpiredDebris();
            lastUpdate.current = now;
        }

        // ジオメトリ更新
        if (pointsRef.current && geometry) {
            const allParticles = debrisClouds.flatMap(c => c.particles);
            const positions = geometry.attributes.position.array as Float32Array;
            const sizes = geometry.attributes.size.array as Float32Array;

            allParticles.forEach((p, i) => {
                positions[i * 3] = p.position.x;
                positions[i * 3 + 1] = p.position.y;
                positions[i * 3 + 2] = p.position.z;

                const age = (performance.now() - p.createdAt) / p.lifetime;
                sizes[i] = p.size * (1 - age * 0.5);
            });

            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.size.needsUpdate = true;
        }
    });

    if (!geometry || debrisClouds.length === 0) return null;

    return (
        <points ref={pointsRef} geometry={geometry}>
            <pointsMaterial
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
};
```

#### 2.3.4 src/utils/collisionEffects.ts（新規作成）

```typescript
import { useEffectsStore } from '../store/effectsStore';
import type { CelestialBody } from '../types/physics';
import type { DebrisParticle } from '../types/debris';
import { v4 as uuidv4 } from 'uuid';

/**
 * 衝突発生時のエフェクトを生成
 */
export const triggerCollisionEffects = (
    body1: CelestialBody,
    body2: CelestialBody,
    collisionPoint: { x: number; y: number; z: number }
) => {
    const store = useEffectsStore.getState();

    // 衝撃波
    const maxRadius = Math.max(body1.radius, body2.radius) * 5;
    store.addShockwave(collisionPoint, maxRadius);

    // 赤熱効果（大きい方の天体に）
    const larger = body1.mass > body2.mass ? body1 : body2;
    store.addHeatGlow(larger.id, larger.position, larger.radius);

    // デブリ生成
    const debrisCount = Math.min(Math.floor((body1.mass + body2.mass) / 100), 500);
    const particles: DebrisParticle[] = [];

    const smaller = body1.mass > body2.mass ? body2 : body1;

    for (let i = 0; i < debrisCount; i++) {
        // ランダムな方向
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = smaller.radius * 0.5 * (0.5 + Math.random());

        particles.push({
            id: uuidv4(),
            position: { ...collisionPoint },
            velocity: {
                x: Math.sin(phi) * Math.cos(theta) * speed,
                y: Math.sin(phi) * Math.sin(theta) * speed,
                z: Math.cos(phi) * speed,
            },
            size: smaller.radius * 0.05 * (0.3 + Math.random() * 0.7),
            color: smaller.color,
            createdAt: performance.now(),
            lifetime: 5000 + Math.random() * 10000, // 5-15秒
        });
    }

    store.addDebrisCloud({
        sourceBodyId: smaller.id,
        particles,
        createdAt: performance.now(),
    });
};
```

---

# Phase 3: 降着円盤・3D HZ

## 3.1 降着円盤（視覚表現）

### 概要
ブラックホールや中性子星などの高密度天体の周囲に形成される降着円盤を視覚的に表現する。物理シミュレーションは行わず、シェーダーベースのアニメーションで実現。

### 変更対象ファイル

#### 3.1.1 src/types/physics.ts（追加）

```typescript
// CelestialBodyに追加
export interface CelestialBody {
    // ... 既存フィールド ...

    // コンパクト天体フラグ
    isCompactObject?: boolean; // ブラックホール、中性子星など
    hasAccretionDisk?: boolean;
    accretionDiskConfig?: {
        innerRadius: number;  // シュヴァルツシルト半径の倍数
        outerRadius: number;
        rotationSpeed: number;
        temperature: number;  // ケルビン（色温度計算用）
    };
}
```

#### 3.1.2 src/components/effects/AccretionDisk.tsx（新規作成）

```typescript
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AccretionDiskProps {
    position: THREE.Vector3;
    innerRadius: number;
    outerRadius: number;
    rotationSpeed?: number;
    particleCount?: number;
}

export const AccretionDisk: React.FC<AccretionDiskProps> = ({
    position,
    innerRadius,
    outerRadius,
    rotationSpeed = 1,
    particleCount = 50000
}) => {
    const pointsRef = useRef<THREE.Points>(null);

    // パーティクルジオメトリ
    const { geometry, angles, radii } = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const anglesArr: number[] = [];
        const radiiArr: number[] = [];

        for (let i = 0; i < particleCount; i++) {
            // 対数分布で内側に密集
            const t = Math.random();
            const r = innerRadius + (outerRadius - innerRadius) * Math.pow(t, 0.5);
            const angle = Math.random() * Math.PI * 2;

            // 円盤の厚み（内側ほど薄い）
            const thickness = (r - innerRadius) / (outerRadius - innerRadius) * 0.1 * outerRadius;
            const y = (Math.random() - 0.5) * thickness;

            positions[i * 3] = Math.cos(angle) * r;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = Math.sin(angle) * r;

            anglesArr.push(angle);
            radiiArr.push(r);

            // 色温度: 内側=青白 → 外側=赤
            const tempFactor = 1 - (r - innerRadius) / (outerRadius - innerRadius);
            if (tempFactor > 0.7) {
                // 最内縁: 青白
                colors[i * 3] = 0.8 + tempFactor * 0.2;
                colors[i * 3 + 1] = 0.9 + tempFactor * 0.1;
                colors[i * 3 + 2] = 1.0;
            } else if (tempFactor > 0.3) {
                // 中間: 黄〜オレンジ
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 0.5 + tempFactor;
                colors[i * 3 + 2] = 0.2;
            } else {
                // 外縁: 赤〜暗い赤
                colors[i * 3] = 0.8;
                colors[i * 3 + 1] = 0.2 * tempFactor;
                colors[i * 3 + 2] = 0.1;
            }

            // サイズ（内側ほど小さく明るく見せる）
            sizes[i] = 0.5 + (1 - tempFactor) * 1.5;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        return { geometry: geo, angles: anglesArr, radii: radiiArr };
    }, [innerRadius, outerRadius, particleCount]);

    useFrame((_, delta) => {
        if (!pointsRef.current) return;

        const positions = geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
            // ケプラー回転: 内側ほど速い (ω ∝ r^-1.5)
            const r = radii[i];
            const angularVelocity = rotationSpeed * Math.pow(innerRadius / r, 1.5);
            angles[i] += angularVelocity * delta;

            positions[i * 3] = Math.cos(angles[i]) * r;
            positions[i * 3 + 2] = Math.sin(angles[i]) * r;
        }

        geometry.attributes.position.needsUpdate = true;
    });

    return (
        <group position={position}>
            <points ref={pointsRef} geometry={geometry}>
                <pointsMaterial
                    vertexColors
                    transparent
                    opacity={0.9}
                    sizeAttenuation
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    );
};
```

#### 3.1.3 src/components/effects/RelativisticJet.tsx（新規作成）

```typescript
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RelativisticJetProps {
    position: THREE.Vector3;
    length: number;
    width: number;
    particleCount?: number;
}

export const RelativisticJet: React.FC<RelativisticJetProps> = ({
    position,
    length,
    width,
    particleCount = 10000
}) => {
    const pointsRef = useRef<THREE.Points>(null);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            // 双極ジェット（上下対称）
            const direction = i < particleCount / 2 ? 1 : -1;

            // 円錐状に広がる
            const t = Math.random();
            const y = t * length * direction;
            const spreadRadius = width * t * 0.5;
            const angle = Math.random() * Math.PI * 2;

            positions[i * 3] = Math.cos(angle) * spreadRadius * Math.random();
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = Math.sin(angle) * spreadRadius * Math.random();

            // 速度（再利用時の初期位置リセット用）
            velocities[i] = 0.5 + Math.random() * 0.5;

            // 色: 根元=青白、先端=薄い青
            const intensity = 1 - t * 0.7;
            colors[i * 3] = 0.3 * intensity;
            colors[i * 3 + 1] = 0.5 * intensity;
            colors[i * 3 + 2] = 1.0 * intensity;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

        return geo;
    }, [length, width, particleCount]);

    useFrame((_, delta) => {
        if (!pointsRef.current) return;

        const positions = geometry.attributes.position.array as Float32Array;
        const velocities = geometry.attributes.velocity.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
            const direction = i < particleCount / 2 ? 1 : -1;

            // Y方向に移動
            positions[i * 3 + 1] += velocities[i] * delta * length * 0.5 * direction;

            // 範囲外に出たらリセット
            if (Math.abs(positions[i * 3 + 1]) > length) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.random() * width * 0.1;
                positions[i * 3] = Math.cos(angle) * r;
                positions[i * 3 + 1] = 0;
                positions[i * 3 + 2] = Math.sin(angle) * r;
            }
        }

        geometry.attributes.position.needsUpdate = true;
    });

    return (
        <group position={position}>
            <points ref={pointsRef} geometry={geometry}>
                <pointsMaterial
                    vertexColors
                    transparent
                    opacity={0.7}
                    sizeAttenuation
                    size={0.5}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    );
};
```

---

## 3.2 連星系HZ（3D等値面）

### 概要
Marching Cubesアルゴリズムを使用して、連星系のハビタブルゾーンを3D等値面として可視化する。計算負荷が高いため、WebGPU Compute Shaderで実装。

### 技術的課題

1. **計算量**: 64³ = 262,144グリッド点
2. **Marching Cubes**: 256パターンのルックアップテーブル
3. **動的更新**: 恒星移動に伴う再計算

### 変更対象ファイル

#### 3.2.1 src/gpu/shaders/marchingCubes.wgsl（新規作成）

```wgsl
// Marching Cubes ルックアップテーブル（省略: 実際には256エントリ必要）
// https://paulbourke.net/geometry/polygonise/ を参照

struct Params {
    gridSize: u32,
    isoValue: f32,
    gridMin: vec3<f32>,
    gridMax: vec3<f32>,
}

struct Star {
    position: vec3<f32>,
    luminosity: f32,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> stars: array<Star>;
@group(0) @binding(2) var<storage, read_write> scalarField: array<f32>;
@group(0) @binding(3) var<storage, read_write> vertices: array<vec3<f32>>;
@group(0) @binding(4) var<storage, read_write> vertexCount: atomic<u32>;

// スカラー場計算カーネル
@compute @workgroup_size(8, 8, 8)
fn computeScalarField(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= params.gridSize || id.y >= params.gridSize || id.z >= params.gridSize) {
        return;
    }

    let gridStep = (params.gridMax - params.gridMin) / f32(params.gridSize);
    let worldPos = params.gridMin + vec3<f32>(id) * gridStep;

    var totalFlux: f32 = 0.0;
    let starCount = arrayLength(&stars);

    for (var i: u32 = 0u; i < starCount; i++) {
        let diff = worldPos - stars[i].position;
        let distSq = dot(diff, diff) + 0.01;
        totalFlux += stars[i].luminosity / distSq;
    }

    let index = id.x + id.y * params.gridSize + id.z * params.gridSize * params.gridSize;
    scalarField[index] = totalFlux;
}

// Marching Cubes カーネル（簡略版）
@compute @workgroup_size(8, 8, 8)
fn marchingCubes(@builtin(global_invocation_id) id: vec3<u32>) {
    // 各グリッドセルの8頂点のスカラー値を取得
    // ルックアップテーブルから三角形を生成
    // 頂点バッファに書き込み

    // 実装省略: 完全なMCアルゴリズムは複雑なため
    // ライブラリ使用または別途実装
}
```

#### 3.2.2 src/gpu/HabitableZone3DEngine.ts（新規作成）

```typescript
/**
 * WebGPU Compute Shader による3Dハビタブルゾーン計算エンジン
 *
 * 注意: 完全な実装には以下が必要:
 * 1. Marching Cubesルックアップテーブル
 * 2. 頂点バッファ管理
 * 3. メッシュ生成パイプライン
 */

import type { CelestialBody } from '../types/physics';
import { calculateLuminosity } from '../utils/habitableZone';

const GRID_SIZE = 64;

export class HabitableZone3DEngine {
    private device: GPUDevice | null = null;
    private scalarFieldBuffer: GPUBuffer | null = null;
    private vertexBuffer: GPUBuffer | null = null;
    private computePipeline: GPUComputePipeline | null = null;

    async init(): Promise<void> {
        if (!navigator.gpu) throw new Error('WebGPU not supported');
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) throw new Error('No GPUAdapter found');
        this.device = await adapter.requestDevice();

        // バッファ・パイプライン初期化
        // ... 実装省略
    }

    async computeIsoSurface(
        stars: CelestialBody[],
        isoValueInner: number,
        isoValueOuter: number
    ): Promise<Float32Array | null> {
        if (!this.device) return null;

        // スカラー場計算
        // Marching Cubes実行
        // 頂点データ読み戻し

        // ... 実装省略
        return null;
    }

    dispose(): void {
        this.scalarFieldBuffer?.destroy();
        this.vertexBuffer?.destroy();
        this.device?.destroy();
    }
}
```

#### 3.2.3 実装ノート

3D HZ可視化は以下の理由から**Phase 3の後半または将来バージョン**での実装を推奨:

1. **Marching Cubesの複雑さ**: 256パターンのルックアップテーブル管理
2. **動的メッシュ生成**: Three.jsとの統合が複雑
3. **代替案**: 2Dマップを複数高度で表示する「スライス表示」が実装容易

---

# 実装チェックリスト

## Phase 1
- [ ] `src/constants/physics.ts` - SOLAR_CONSTANTS追加
- [ ] `src/utils/habitableZone.ts` - 新規作成
- [ ] `src/components/scene/Scene.tsx` - 動的HZ計算
- [ ] `src/components/scene/HabitableZoneMap.tsx` - 新規作成
- [ ] `src/utils/i18n.ts` - 翻訳追加
- [ ] ビルド確認・動作テスト

## Phase 2
- [ ] `src/types/physics.ts` - 破壊関連型追加
- [ ] `src/types/debris.ts` - 新規作成
- [ ] `src/utils/rocheLimit.ts` - 新規作成
- [ ] `src/utils/collisionEffects.ts` - 新規作成
- [ ] `src/store/effectsStore.ts` - 新規作成
- [ ] `src/components/effects/TidalDisruptionEffect.tsx` - 新規作成
- [ ] `src/components/effects/ShockwaveEffect.tsx` - 新規作成
- [ ] `src/components/effects/HeatGlowEffect.tsx` - 新規作成
- [ ] `src/components/effects/DebrisRenderer.tsx` - 新規作成
- [ ] `src/store/physicsStore.ts` - 衝突時エフェクトトリガー統合
- [ ] ビルド確認・動作テスト

## Phase 3
- [ ] `src/components/effects/AccretionDisk.tsx` - 新規作成
- [ ] `src/components/effects/RelativisticJet.tsx` - 新規作成
- [ ] `src/types/physics.ts` - コンパクト天体フラグ追加
- [ ] `src/utils/starSystems.ts` - ブラックホールプリセット追加
- [ ] `src/gpu/shaders/marchingCubes.wgsl` - 新規作成
- [ ] `src/gpu/HabitableZone3DEngine.ts` - 新規作成
- [ ] ビルド確認・動作テスト

---

# パフォーマンス目標

| 機能 | 目標FPS | 許容負荷 |
|------|---------|----------|
| Phase 1 全機能 | 60fps | +5% CPU |
| Phase 2 エフェクト（同時5個） | 55fps | +15% GPU |
| Phase 3 降着円盤（5万粒子） | 50fps | +20% GPU |
| Phase 3 3D HZ（64³グリッド） | 30fps | GPU専用 |

---

# 依存関係

```
Phase 1 (独立)
    ├── habitableZone.ts
    └── HabitableZoneMap.tsx

Phase 2 (Phase 1完了後)
    ├── effectsStore.ts (独立)
    ├── rocheLimit.ts (独立)
    ├── TidalDisruptionEffect.tsx
    ├── ShockwaveEffect.tsx
    ├── HeatGlowEffect.tsx
    ├── DebrisRenderer.tsx
    └── collisionEffects.ts (上記すべてに依存)

Phase 3 (Phase 2完了後)
    ├── AccretionDisk.tsx (独立)
    ├── RelativisticJet.tsx (独立)
    └── HabitableZone3DEngine.ts (Phase 1のhabitableZone.tsに依存)
```
