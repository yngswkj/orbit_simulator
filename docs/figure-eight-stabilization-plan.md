# 8の字軌道 安定化計画

## 現状の問題点

現在の8の字軌道が即座に衝突する原因を分析しました。

### 現在の実装
```typescript
const MASS = 80000;
const SCALE = 18;
const x1 = 0.97000436;
const v1x = 0.93240737 / 2;
const v1y = 0.86473146 / 2;

// 問題: 速度スケーリングが不正確
velocity: new Vector3(v1x * SCALE * 0.35, 0, v1y * SCALE * 0.35)
```

### 問題点

1. **速度スケーリングの不整合**
   - 位置を `SCALE` 倍しているが、速度のスケーリング `0.35` が物理的に正しくない
   - 重力系では速度は `√(M/L)` でスケールする必要がある

2. **質量と空間スケールの不整合**
   - `MASS = 80000` は太陽系用のスケール
   - Figure-8は `G = 1, m = 1` で正規化された解

3. **数値精度の問題**
   - `BASE_DT = 0.001` は大きすぎる可能性

---

## Chenciner-Montgomery 解の正確な初期条件

論文 "A remarkable periodic solution of the three-body problem" (2000) より：

### 正規化条件 (G = 1, m = 1)
```
位置:
  Body 1: (-0.97000436, 0)
  Body 2: (+0.97000436, 0)
  Body 3: (0, 0)

速度:
  Body 1: (0.466203685, 0.43236573)
  Body 2: (0.466203685, 0.43236573)
  Body 3: (-0.932407370, -0.86473146)

周期: T ≈ 6.3259
```

---

## 修正計画

### Phase 1: 物理的に正しいスケーリング

**原理**: スケール変換時に運動方程式を保存する

位置を `L` 倍、質量を `M` 倍すると：
```
v_new = v_original * √(G * M / L)
```

シミュレータでは `G = 1` なので：
```
v_new = v_original * √(M / L)
```

### Phase 2: 推奨パラメータ

#### オプションA: 小スケール（精度重視）
```typescript
const MASS = 1.0;    // 正規化質量
const SCALE = 10;    // 視覚的に見やすいサイズ
// v_scale = √(1/10) ≈ 0.316
```

#### オプションB: 中スケール（バランス型）
```typescript
const MASS = 100;    // 中程度の質量
const SCALE = 20;    // 程よい大きさ
// v_scale = √(100/20) = √5 ≈ 2.236
```

#### オプションC: 大スケール（太陽系スケール）
```typescript
const MASS = 10000;  // 太陽系に近いスケール
const SCALE = 25;    // 大きめの軌道
// v_scale = √(10000/25) = √400 = 20
```

### Phase 3: 実装コード

```typescript
export const FIGURE_EIGHT: StarSystemPreset = {
    id: 'figure-eight',
    name: 'Figure-8 Orbit',
    nameJa: '8の字軌道',
    description: 'Three equal-mass bodies following a stable figure-8 choreography.',
    descriptionJa: '3つの等質量天体が8の字パターンで安定周回する周期解。',
    category: 'choreography',
    initialCamera: {
        position: [0, 80, 100],
        target: [0, 0, 0]
    },
    createBodies: () => {
        // Chenciner-Montgomery exact initial conditions (G=1, m=1 normalized)
        const x1 = 0.97000436;
        const v1_x = 0.466203685;  // = 0.93240737 / 2
        const v1_y = 0.43236573;   // = 0.86473146 / 2

        // Scaling parameters
        const MASS = 100;   // Mass per body
        const L = 20;       // Position scale

        // Velocity scale: v_new = v_old * sqrt(M / L)
        const V = Math.sqrt(MASS / L);  // ≈ 2.236

        return [
            {
                name: 'Body α',
                mass: MASS,
                radius: 1.5,
                position: new Vector3(-x1 * L, 0, 0),
                velocity: new Vector3(v1_x * V, 0, v1_y * V),
                color: '#ff6b6b',
                isStar: true,
                isFixed: false,
            },
            {
                name: 'Body β',
                mass: MASS,
                radius: 1.5,
                position: new Vector3(x1 * L, 0, 0),
                velocity: new Vector3(v1_x * V, 0, v1_y * V),
                color: '#4ecdc4',
                isStar: true,
                isFixed: false,
            },
            {
                name: 'Body γ',
                mass: MASS,
                radius: 1.5,
                position: new Vector3(0, 0, 0),
                velocity: new Vector3(-2 * v1_x * V, 0, -2 * v1_y * V),
                color: '#ffe66d',
                isStar: true,
                isFixed: false,
            }
        ];
    }
};
```

### Phase 4: 追加の安定化（必要に応じて）

1. **タイムステップ調整**
   - Figure-8専用に `BASE_DT` を小さくする（0.0005など）
   - または、シンプレクティック積分法の精度確認

2. **エネルギー監視**
   - 総エネルギーの保存を確認（ドリフトが大きければ dt を下げる）

3. **初期条件の微調整**
   - シミュレータ固有の数値誤差に対応した補正

---

## テスト計画

1. **短期安定性**: 10周期（T ≈ 63秒のシミュレーション時間）安定動作を確認
2. **長期安定性**: 100周期後もエネルギー保存率 < 1% を確認
3. **視覚的確認**: 8の字パターンが綺麗に描画されることを確認

---

## 推奨アクション

**即座に実装すべき修正**:
1. オプションBのパラメータで実装（MASS=100, L=20）
2. 速度スケーリングを `√(M/L)` に修正
3. カメラ位置を調整

**オプション追加機能**:
- タイムスケールを0.5倍にすると、よりゆっくり動いて観察しやすい
