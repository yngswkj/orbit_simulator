# 重力可視化機能 実装計画

## 概要
以下3つの重力可視化機能を実装する：
1. **ヒルの領域表示** - 各天体の重力支配圏を半透明の球で表示
2. **等ポテンシャル面（2Dヒートマップ）** - 軌道平面上の重力強度を色で可視化
3. **ラグランジュ点マーカー** - 二体系の安定点（L1〜L5）を表示

---

## 1. ヒルの領域表示

### 概念
ヒル球（Hill Sphere）は、天体が衛星を重力的に保持できる領域。半径は以下の式で計算：

```
r_Hill = a × (m / 3M)^(1/3)
```
- `a`: 主星からの軌道半径
- `m`: 天体の質量
- `M`: 主星の質量

### 実装ファイル

#### 新規: `src/components/scene/HillSphere.tsx`

```typescript
import React, { useMemo } from 'react';
import { Sphere } from '@react-three/drei';
import { usePhysicsStore } from '../../store/physicsStore';
import type { CelestialBody } from '../../types/physics';
import { Vector3 } from 'three';

interface HillSphereProps {
    body: CelestialBody;
    primaryStar: CelestialBody;
}

const HillSphere: React.FC<HillSphereProps> = ({ body, primaryStar }) => {
    const hillRadius = useMemo(() => {
        // 恒星自身にはヒル球を表示しない
        if (body.isStar) return 0;

        const starPos = new Vector3(primaryStar.position.x, primaryStar.position.y, primaryStar.position.z);
        const bodyPos = new Vector3(body.position.x, body.position.y, body.position.z);
        const distance = starPos.distanceTo(bodyPos);

        // r_Hill = a × (m / 3M)^(1/3)
        const ratio = body.mass / (3 * primaryStar.mass);
        return distance * Math.pow(ratio, 1 / 3);
    }, [body, primaryStar]);

    if (hillRadius <= 0 || hillRadius < body.radius * 1.5) return null;

    return (
        <Sphere
            args={[hillRadius, 32, 16]}
            position={[body.position.x, body.position.y, body.position.z]}
        >
            <meshBasicMaterial
                color={body.color}
                transparent
                opacity={0.08}
                depthWrite={false}
                side={2} // DoubleSide
            />
        </Sphere>
    );
};

export const HillSphereLayer: React.FC = () => {
    const bodies = usePhysicsStore(state => state.bodies);
    const showHillSphere = usePhysicsStore(state => state.showHillSphere);

    // 最大質量の恒星を主星とする
    const primaryStar = useMemo(() => {
        const stars = bodies.filter(b => b.isStar);
        if (stars.length === 0) return null;
        return stars.reduce((max, s) => s.mass > max.mass ? s : max, stars[0]);
    }, [bodies]);

    if (!showHillSphere || !primaryStar) return null;

    // 複数恒星系ではヒル球を表示しない（計算が複雑）
    const starCount = bodies.filter(b => b.isStar).length;
    if (starCount > 1) return null;

    return (
        <group>
            {bodies.filter(b => !b.isStar).map(body => (
                <HillSphere key={body.id} body={body} primaryStar={primaryStar} />
            ))}
        </group>
    );
};
```

### Store更新: `src/store/physicsStore.ts`

```typescript
// 状態に追加
showHillSphere: boolean;

// 初期値
showHillSphere: false,

// アクション追加
toggleHillSphere: () => set(state => ({ showHillSphere: !state.showHillSphere })),
```

### UI更新: `src/components/ui/SimulationControls.tsx`

表示モードセクションに「ヒル球」トグルを追加：

```typescript
// アイコン: Circle または Orbit
<button onClick={toggleHillSphere}>
    {showHillSphere ? 'ヒル球 ON' : 'ヒル球 OFF'}
</button>
```

### Scene統合: `src/components/scene/Scene.tsx`

`SimulationContent`コンポーネント内に追加：

```typescript
import { HillSphereLayer } from './HillSphere';

// SimulationContent内
<HillSphereLayer />
```

---

## 2. 等ポテンシャル面（2Dヒートマップ）

### 概念
軌道平面（Y=0）上の各点における重力ポテンシャルを計算し、色で表現。

```
Φ(r) = -Σ (G × M_i / |r - r_i|)
```

### 実装ファイル

#### 新規: `src/components/scene/GravityHeatmap.tsx`

```typescript
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '../../store/physicsStore';
import * as THREE from 'three';

const GRID_SIZE = 100;        // グリッド解像度
const GRID_EXTENT = 300;      // 表示範囲（-300 ~ +300）
const UPDATE_INTERVAL = 5;    // フレーム間隔

// 色のグラデーション（ポテンシャル強度）
const getColor = (value: number): THREE.Color => {
    // value: 0（弱）〜 1（強）
    // 青 → 緑 → 黄 → 赤
    if (value < 0.25) {
        return new THREE.Color().lerpColors(
            new THREE.Color(0x000033), // 暗い青
            new THREE.Color(0x0066ff), // 青
            value * 4
        );
    } else if (value < 0.5) {
        return new THREE.Color().lerpColors(
            new THREE.Color(0x0066ff),
            new THREE.Color(0x00ff66), // 緑
            (value - 0.25) * 4
        );
    } else if (value < 0.75) {
        return new THREE.Color().lerpColors(
            new THREE.Color(0x00ff66),
            new THREE.Color(0xffff00), // 黄
            (value - 0.5) * 4
        );
    } else {
        return new THREE.Color().lerpColors(
            new THREE.Color(0xffff00),
            new THREE.Color(0xff3300), // 赤
            (value - 0.75) * 4
        );
    }
};

export const GravityHeatmap: React.FC = () => {
    const bodies = usePhysicsStore(state => state.bodies);
    const showGravityField = usePhysicsStore(state => state.showGravityField);
    const useRealisticDistances = usePhysicsStore(state => state.useRealisticDistances);

    const meshRef = useRef<THREE.Mesh>(null);
    const frameCount = useRef(0);

    // グリッド範囲を距離スケールに応じて調整
    const extent = useRealisticDistances ? GRID_EXTENT * 4 : GRID_EXTENT;

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(extent * 2, extent * 2, GRID_SIZE, GRID_SIZE);
        geo.rotateX(-Math.PI / 2); // XZ平面に配置

        // 頂点カラー用の属性を追加
        const colors = new Float32Array((GRID_SIZE + 1) * (GRID_SIZE + 1) * 3);
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        return geo;
    }, [extent]);

    useFrame(() => {
        if (!showGravityField || !meshRef.current) return;

        frameCount.current++;
        if (frameCount.current % UPDATE_INTERVAL !== 0) return;

        const geo = meshRef.current.geometry as THREE.PlaneGeometry;
        const positions = geo.attributes.position.array as Float32Array;
        const colors = geo.attributes.color.array as Float32Array;

        let minPotential = Infinity;
        let maxPotential = -Infinity;
        const potentials: number[] = [];

        // 1. 全頂点のポテンシャルを計算
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];

            let potential = 0;
            for (const body of bodies) {
                const dx = x - body.position.x;
                const dz = z - body.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz) + 0.1; // ゼロ除算防止
                potential += body.mass / dist;
            }

            potentials.push(potential);
            if (potential < minPotential) minPotential = potential;
            if (potential > maxPotential) maxPotential = potential;
        }

        // 2. 正規化して色を設定（対数スケール）
        const logMin = Math.log(minPotential + 1);
        const logMax = Math.log(maxPotential + 1);
        const logRange = logMax - logMin || 1;

        for (let i = 0; i < potentials.length; i++) {
            const logVal = Math.log(potentials[i] + 1);
            const normalized = (logVal - logMin) / logRange;
            const color = getColor(normalized);

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geo.attributes.color.needsUpdate = true;
    });

    if (!showGravityField) return null;

    return (
        <mesh ref={meshRef} geometry={geometry} position={[0, -0.5, 0]}>
            <meshBasicMaterial
                vertexColors
                transparent
                opacity={0.4}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
};
```

### Store更新

```typescript
showGravityField: boolean;
showGravityField: false,
toggleGravityField: () => set(state => ({ showGravityField: !state.showGravityField })),
```

### パフォーマンス考慮事項
- `UPDATE_INTERVAL = 5` でフレームスキップ
- `GRID_SIZE = 100` で解像度を制限（100×100 = 10,000頂点）
- 対数スケールで広いダイナミックレンジに対応

---

## 3. ラグランジュ点マーカー

### 概念
二体系（恒星-惑星）において、重力と遠心力が釣り合う5つの点：
- **L1**: 惑星と恒星の間
- **L2**: 惑星の外側（恒星と反対方向）
- **L3**: 恒星の反対側
- **L4**: 惑星軌道上、60°前方
- **L5**: 惑星軌道上、60°後方

### 計算式（簡易版）

```
L1距離: r × (m / 3M)^(1/3)        // ヒル半径と同じ
L2距離: r × (m / 3M)^(1/3)        // L1と同様
L3距離: r × (1 + 5m / 12M)        // 近似
L4/L5: 軌道半径上、±60°
```

### 実装ファイル

#### 新規: `src/components/scene/LagrangePoints.tsx`

```typescript
import React, { useMemo } from 'react';
import { Sphere, Text, Billboard } from '@react-three/drei';
import { usePhysicsStore } from '../../store/physicsStore';
import { Vector3 } from 'three';
import type { CelestialBody } from '../../types/physics';

interface LagrangePointProps {
    position: Vector3;
    label: string;
    color: string;
}

const LagrangePoint: React.FC<LagrangePointProps> = ({ position, label, color }) => {
    return (
        <group position={position}>
            <Sphere args={[1.5, 16, 16]}>
                <meshBasicMaterial color={color} transparent opacity={0.7} />
            </Sphere>
            <Billboard>
                <Text
                    position={[0, 3, 0]}
                    fontSize={2}
                    color="white"
                    anchorX="center"
                    outlineWidth={0.1}
                    outlineColor="#000"
                >
                    {label}
                </Text>
            </Billboard>
        </group>
    );
};

interface BodyLagrangePointsProps {
    body: CelestialBody;
    primaryStar: CelestialBody;
}

const BodyLagrangePoints: React.FC<BodyLagrangePointsProps> = ({ body, primaryStar }) => {
    const points = useMemo(() => {
        if (body.isStar) return [];

        const starPos = new Vector3(primaryStar.position.x, primaryStar.position.y, primaryStar.position.z);
        const bodyPos = new Vector3(body.position.x, body.position.y, body.position.z);

        const toStar = starPos.clone().sub(bodyPos);
        const distance = toStar.length();
        const direction = toStar.normalize();

        // ヒル半径（L1, L2距離）
        const massRatio = body.mass / (3 * primaryStar.mass);
        const hillRadius = distance * Math.pow(massRatio, 1 / 3);

        // L1: 惑星と恒星の間
        const L1 = bodyPos.clone().add(direction.clone().multiplyScalar(hillRadius));

        // L2: 惑星の外側
        const L2 = bodyPos.clone().sub(direction.clone().multiplyScalar(hillRadius));

        // L3: 恒星の反対側（近似）
        const L3offset = distance * (1 + (5 * body.mass) / (12 * primaryStar.mass));
        const L3 = starPos.clone().sub(direction.clone().multiplyScalar(L3offset));

        // L4, L5: 軌道上 ±60°（Y軸回転）
        const angle = Math.atan2(bodyPos.z - starPos.z, bodyPos.x - starPos.x);
        const L4angle = angle + Math.PI / 3;  // +60°
        const L5angle = angle - Math.PI / 3;  // -60°

        const L4 = new Vector3(
            starPos.x + distance * Math.cos(L4angle),
            bodyPos.y,
            starPos.z + distance * Math.sin(L4angle)
        );

        const L5 = new Vector3(
            starPos.x + distance * Math.cos(L5angle),
            bodyPos.y,
            starPos.z + distance * Math.sin(L5angle)
        );

        return [
            { position: L1, label: 'L1', color: '#ff6666' },
            { position: L2, label: 'L2', color: '#66ff66' },
            { position: L3, label: 'L3', color: '#6666ff' },
            { position: L4, label: 'L4', color: '#ffff66' },
            { position: L5, label: 'L5', color: '#ff66ff' },
        ];
    }, [body, primaryStar]);

    return (
        <group>
            {points.map(p => (
                <LagrangePoint key={p.label} position={p.position} label={p.label} color={p.color} />
            ))}
        </group>
    );
};

export const LagrangePointsLayer: React.FC = () => {
    const bodies = usePhysicsStore(state => state.bodies);
    const showLagrangePoints = usePhysicsStore(state => state.showLagrangePoints);
    const selectedBodyId = usePhysicsStore(state => state.selectedBodyId);

    const primaryStar = useMemo(() => {
        const stars = bodies.filter(b => b.isStar);
        if (stars.length !== 1) return null; // 単一恒星系のみ
        return stars[0];
    }, [bodies]);

    const selectedBody = useMemo(() => {
        if (!selectedBodyId) return null;
        return bodies.find(b => b.id === selectedBodyId && !b.isStar);
    }, [bodies, selectedBodyId]);

    if (!showLagrangePoints || !primaryStar || !selectedBody) return null;

    return <BodyLagrangePoints body={selectedBody} primaryStar={primaryStar} />;
};
```

### Store更新

```typescript
showLagrangePoints: boolean;
showLagrangePoints: false,
toggleLagrangePoints: () => set(state => ({ showLagrangePoints: !state.showLagrangePoints })),
```

### UI注意事項
- ラグランジュ点は**選択中の惑星**に対してのみ表示
- 複数恒星系では非表示（計算が不正確）
- UIで「惑星を選択してください」のガイダンスを表示

---

## 翻訳追加: `src/utils/i18n.ts`

```typescript
// 追加エントリ
hill_sphere: 'ヒル球',
hill_sphere_en: 'Hill Sphere',
gravity_field: '重力場',
gravity_field_en: 'Gravity Field',
lagrange_points: 'ラグランジュ点',
lagrange_points_en: 'Lagrange Points',
select_planet_for_lagrange: '惑星を選択するとラグランジュ点が表示されます',
select_planet_for_lagrange_en: 'Select a planet to show Lagrange points',
single_star_only: '単一恒星系でのみ利用可能',
single_star_only_en: 'Available for single-star systems only',
```

---

## UIレイアウト案

`SimulationControls.tsx`の表示モードセクション：

```
表示オプション
├── [✓] グリッド
├── [✓] 軌道予測
├── [✓] ハビタブルゾーン
├── [ ] ヒル球            ← 新規
├── [ ] 重力場            ← 新規
└── [ ] ラグランジュ点    ← 新規
```

---

## 実装順序

### Phase 1: Store拡張（10分）
1. `physicsStore.ts`に3つの状態とトグル関数を追加

### Phase 2: ヒル球（30分）
2. `HillSphere.tsx`を作成
3. `Scene.tsx`に統合
4. UIトグル追加

### Phase 3: 重力場ヒートマップ（45分）
5. `GravityHeatmap.tsx`を作成
6. `Scene.tsx`に統合
7. UIトグル追加

### Phase 4: ラグランジュ点（45分）
8. `LagrangePoints.tsx`を作成
9. `Scene.tsx`に統合
10. UIトグル追加（選択惑星依存の説明付き）

### Phase 5: 翻訳・仕上げ（15分）
11. `i18n.ts`に翻訳追加
12. ビルド確認

---

## 注意事項

### パフォーマンス
- 重力場ヒートマップは計算コストが高いため、フレームスキップ必須
- 天体数が多い場合は自動で解像度を下げる検討

### 複数恒星系対応
- ヒル球：複数恒星系では非表示（計算が複雑）
- 重力場：複数恒星でも計算可能（全天体の重力を合算）
- ラグランジュ点：単一恒星系のみ対応

### 視覚的調整
- 透明度は天体の視認性を妨げないよう控えめに
- ヒートマップは軌道平面より少し下に配置（Y=-0.5）
- ラグランジュ点のマーカーサイズは固定（距離によらず視認可能）
