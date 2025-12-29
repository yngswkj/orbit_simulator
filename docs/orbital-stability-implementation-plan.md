# 軌道安定化 実装計画書

## 概要

2つの軌道安定性問題を修正する：
1. **8の字軌道**: 即座に衝突 → 安定した周期軌道へ
2. **Trisolaris (三体星系)**: 短命 → より長期間生存可能に

---

# Part 1: 8の字軌道の安定化

## 現状の問題

### 現在の実装
```typescript
const MASS = 80000;
const SCALE = 18;
const v1x = 0.93240737 / 2;
const v1y = 0.86473146 / 2;

// 問題: 速度スケーリングが物理的に不正確
velocity: new Vector3(v1x * SCALE * 0.35, 0, v1y * SCALE * 0.35)
```

### 問題の根本原因

1. **速度スケーリングの不整合**
   - 位置を `L` 倍すると、速度は `√(M/L)` 倍する必要がある
   - 現在の `0.35` は根拠のない値

2. **質量スケールの不適切さ**
   - `MASS = 80000` は太陽系用のスケール
   - Figure-8解は `G=1, m=1` で正規化

## Chenciner-Montgomery 解の正確な初期条件

```
正規化条件 (G=1, m=1):
  位置: (±0.97000436, 0), (0, 0)
  速度: Body 1,2: (0.466203685, 0.43236573)
        Body 3:   (-0.932407370, -0.86473146)
  周期: T ≈ 6.3259
```

## 修正実装

```typescript
createBodies: () => {
    // Chenciner-Montgomery exact initial conditions
    const x1 = 0.97000436;
    const v1_x = 0.466203685;
    const v1_y = 0.43236573;

    // Scaling: position by L, mass by M
    // Velocity scales as sqrt(M/L) to preserve dynamics
    const MASS = 100;
    const L = 20;
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
```

## カメラ設定

```typescript
initialCamera: {
    position: [0, 60, 80],  // 軌道全体が見える距離
    target: [0, 0, 0]
}
```

---

# Part 2: Trisolaris の長期生存化

## 現状の問題

### 安定期 (Stable Mode)
```typescript
// 現在: α Centauri A に近すぎる
position: new Vector3(35, 0, 0)
velocity: new Vector3(0, 0, Math.sqrt(STAR_A_MASS / 35) * 0.7)
```
- α Centauri A (位置: 80, 0, 0) に近すぎて重力摂動が大きい
- 他の恒星の影響で軌道が不安定化

### 乱紀 (Chaotic Mode)
```typescript
// 現在: ランダム化された位置
position: new Vector3(rand(60), rand(10), rand(-30))
```
- 恒星に近い位置からスタートする可能性
- 初期条件のランダム性が生存率を下げる

## 安定化の戦略

### 戦略A: 遠距離配置（推奨）

**原理**: 3つの恒星の重心から十分遠くに配置し、恒星系全体を1つの天体として公転

```
距離の目安:
- 恒星間距離: ~80単位
- Trisolaris軌道半径: 200-250単位（恒星間距離の2.5-3倍）
```

### 戦略B: ラグランジュ点近似

**原理**: 3恒星系の擬似ラグランジュ点（重力均衡点）付近に配置

```
注意: 三体問題にはL4/L5のような安定点がないため、
      あくまで「比較的安定な領域」への配置
```

### 戦略C: 近接軌道（α Centauri A 周回）

**原理**: 主星に十分近く、速い公転で他の恒星の影響を受けにくくする

```
条件:
- 軌道半径 << 恒星間距離
- 公転周期 << 恒星の相互運動周期
```

## 推奨実装（戦略A: 遠距離配置）

### 安定期
```typescript
// 重心から遠方に配置
{
    name: 'Trisolaris',
    mass: 1.0,
    radius: 0.3,  // 視認性のため少し大きく
    position: new Vector3(180, 0, 0),  // 恒星軌道の2倍以上
    velocity: new Vector3(0, 0, Math.sqrt(TOTAL_STAR_MASS / 180) * 0.8),
    color: '#4488ff',
    isStar: false,
}
```

### 乱紀
```typescript
// 最も外側からスタート（生存確率向上）
{
    name: 'Trisolaris',
    mass: 1.0,
    radius: 0.3,
    position: new Vector3(200, 20, 0),  // Y軸にオフセットで軌道傾斜
    velocity: new Vector3(
        0,
        0,
        Math.sqrt(TOTAL_STAR_MASS / 200) * 0.75  // やや遅めで安定
    ),
    color: '#4488ff',
    isStar: false,
}
```

## 物理的根拠

### 軌道速度の計算

3恒星の合計質量を `M_total` として：
```
M_total = STAR_A_MASS + STAR_B_MASS + STAR_C_MASS
        = SUN_MASS * (1.1 + 0.9 + 0.12)
        = SUN_MASS * 2.12
        ≈ 706,000

円軌道速度 v = √(G * M_total / r)
r = 180 の場合: v ≈ √(706000 / 180) ≈ 62.6
r = 200 の場合: v ≈ √(706000 / 200) ≈ 59.4
```

### 安定性の指標

Hill球半径（影響圏）の概算：
```
r_Hill ≈ a * (m_planet / 3*M_stars)^(1/3)

Trisolaris (m=1) の場合:
r_Hill ≈ 180 * (1 / (3 * 706000))^(1/3) ≈ 1.3単位

→ 恒星間距離(80)に比べ十分小さいので、
   恒星から180単位離れていれば影響は限定的
```

---

# 実装手順

## Phase 1: 8の字軌道修正

1. `FIGURE_EIGHT` プリセットのパラメータを修正
   - `MASS = 100`, `L = 20`, `V = √(M/L)`
2. カメラ位置を調整
3. 天体半径を調整（視認性）

## Phase 2: Trisolaris 配置修正

1. 安定期: 軌道半径を 35 → 180 に変更
2. 乱紀: 軌道半径を 60 → 200 に変更、Y軸オフセット追加
3. 速度計算を合計質量ベースに変更
4. 天体半径を 0.2 → 0.3 に変更（視認性向上）

## Phase 3: テストと微調整

1. 8の字軌道: 10周期の安定性確認
2. Trisolaris: 30秒以上の生存確認
3. 必要に応じてパラメータ微調整

---

# パラメータまとめ

## 8の字軌道

| パラメータ | 現在 | 修正後 |
|-----------|------|--------|
| MASS | 80000 | 100 |
| SCALE (L) | 18 | 20 |
| 速度係数 | 0.35 | √(100/20) ≈ 2.24 |
| 天体半径 | 2.0 | 1.5 |
| カメラZ | 70 | 80 |

## Trisolaris (安定期)

| パラメータ | 現在 | 修正後 |
|-----------|------|--------|
| 軌道半径 | 35 | 180 |
| 速度基準 | STAR_A_MASS | TOTAL_STAR_MASS |
| 速度係数 | 0.7 | 0.8 |
| 天体半径 | 0.2 | 0.3 |

## Trisolaris (乱紀)

| パラメータ | 現在 | 修正後 |
|-----------|------|--------|
| 軌道半径 | 60 | 200 |
| Y軸オフセット | rand(10) | 20 (固定) |
| ランダム化 | あり | なし（安定性優先）|
| 速度係数 | 0.3, 0.5 | 0.75 |

---

# 期待される結果

## 8の字軌道
- 3天体が安定した8の字パターンで周回
- 周期 T ≈ 6.3 シミュレーション時間単位
- 長時間（100周期以上）安定動作

## Trisolaris
- 安定期: 恒星系の外周を周回、長期間（分単位）生存
- 乱紀: 恒星のカオス運動の影響を受けにくく、より長く観察可能
- 最終的には三体問題の性質上、軌道が乱れる可能性あり（これは期待される動作）
