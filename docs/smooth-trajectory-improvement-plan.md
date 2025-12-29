# 軌跡・軌道予測線 滑らか化 改善計画

## 現状分析

### 1. 軌跡 (Trail) の問題点

**現在の設定** ([CelestialBody.tsx:34-40](src/components/scene/CelestialBody.tsx#L34-L40)):
```typescript
const TRAIL_CONFIG = {
    RECENT_MAX: 60,       // 高解像度の最近のポイント
    RECENT_INTERVAL: 2,   // 2フレームごとにサンプリング
    COMPRESSED_MAX: 120,  // 圧縮された古いポイント
    COMPRESS_RATIO: 4,    // 4ポイントにつき1つを保持
    COMPRESS_TRIGGER: 80
};
```

**問題点**:
| 問題 | 原因 | 影響 |
|------|------|------|
| 高速天体でカクカク | RECENT_INTERVAL=2 でサンプリング間隔が広い | 8の字軌道など高速な動きで角張る |
| 圧縮部分がさらにカクカク | COMPRESS_RATIO=4 で4点につき1点 | 古い軌跡が直線的に見える |
| 総ポイント数が少ない | 60+120=180ポイント | 長い軌跡で滑らかさが失われる |
| 補間なし | 点を直線で結んでいる | 曲線が多角形に見える |

### 2. 軌道予測線 (Orbit Prediction) の問題点

**現在の設定** ([OrbitPrediction.tsx:7-9](src/components/scene/OrbitPrediction.tsx#L7-L9)):
```typescript
const PREDICTION_STEPS = 1200;
const SAVE_FREQUENCY = 10;  // 1200/10 = 120ポイント
```

**問題点**:
| 問題 | 原因 | 影響 |
|------|------|------|
| 急カーブがカクカク | 120ポイントで全周期を表現 | 近日点など曲率が高い部分で角張る |
| 固定サンプリング | 均等間隔で保存 | 直線部分に無駄、曲線部分に不足 |
| 補間なし | 点を直線で結んでいる | 曲線が多角形に見える |

---

## 改善戦略

### 戦略A: サンプリング密度の向上（シンプル）

**メリット**: 実装が簡単、確実に改善
**デメリット**: メモリ・パフォーマンスへの影響

#### Trail 改善
```typescript
const TRAIL_CONFIG = {
    RECENT_MAX: 120,      // 60 → 120 (2倍)
    RECENT_INTERVAL: 1,   // 2 → 1 (毎フレーム)
    COMPRESSED_MAX: 200,  // 120 → 200
    COMPRESS_RATIO: 3,    // 4 → 3 (より密に)
    COMPRESS_TRIGGER: 150
};
```

#### Orbit Prediction 改善
```typescript
const PREDICTION_STEPS = 1800;  // 1200 → 1800
const SAVE_FREQUENCY = 6;       // 10 → 6 (300ポイント)
```

### 戦略B: スプライン補間（高品質）

**メリット**: 少ないポイントで滑らかな曲線
**デメリット**: 計算コスト増、実装複雑

#### 実装方法
```typescript
import { CatmullRomCurve3 } from 'three';

// 元のポイントからスプライン生成
const curve = new CatmullRomCurve3(controlPoints);
const smoothPoints = curve.getPoints(200); // 補間で200ポイントに

// Line2で描画（drei Lineではなく）
<Line
    points={smoothPoints}
    ...
/>
```

### 戦略C: 適応的サンプリング（最適化）

**メリット**: 必要な部分のみ高密度
**デメリット**: 実装が複雑

#### 曲率ベースのサンプリング
```typescript
// 曲率が高い部分でより多くのポイントを保存
function shouldSavePoint(prevDir: Vector3, currDir: Vector3): boolean {
    const angle = prevDir.angleTo(currDir);
    // 角度変化が大きいほど保存
    return angle > MIN_ANGLE_THRESHOLD;
}
```

---

## 推奨実装計画

### Phase 1: 即座の改善（戦略A）

**Trail設定の改善**:
```typescript
const TRAIL_CONFIG = {
    RECENT_MAX: 100,
    RECENT_INTERVAL: 1,
    COMPRESSED_MAX: 180,
    COMPRESS_RATIO: 3,
    COMPRESS_TRIGGER: 120
};
```

**Prediction設定の改善**:
```typescript
const PREDICTION_STEPS = 1500;
const SAVE_FREQUENCY = 5;  // 300ポイント
```

### Phase 2: スプライン補間（オプション）

Catmull-Romスプラインを使用して、少ないポイントから滑らかな曲線を生成。

**Trail向けスプライン**:
```typescript
const SmoothTrail = ({ points, color }: { points: Vector3[], color: string }) => {
    const smoothedPoints = useMemo(() => {
        if (points.length < 4) return points;
        const curve = new CatmullRomCurve3(points);
        return curve.getPoints(points.length * 2); // 2倍に補間
    }, [points]);

    return <Line points={smoothedPoints} color={color} ... />;
};
```

**Prediction向けスプライン**:
Worker内で計算後、メインスレッドで補間:
```typescript
// OrbitPrediction.tsx
const smoothedPath = useMemo(() => {
    if (p.points.length < 4) return p.points;
    const curve = new CatmullRomCurve3(p.points);
    return curve.getPoints(p.points.length * 3);
}, [p.points]);
```

### Phase 3: パフォーマンス最適化

1. **Line2の使用**: drei Lineの代わりにthree.jsのLine2でGPU効率向上
2. **ジオメトリ再利用**: BufferGeometryを再利用してGC削減
3. **LODシステム**: カメラ距離に応じてポイント数を調整

---

## パラメータ比較表

### Trail

| パラメータ | 現在 | Phase 1 | 効果 |
|-----------|------|---------|------|
| RECENT_MAX | 60 | 100 | 高解像度部分が長くなる |
| RECENT_INTERVAL | 2 | 1 | サンプリング密度2倍 |
| COMPRESSED_MAX | 120 | 180 | 長い履歴を保持 |
| COMPRESS_RATIO | 4 | 3 | 圧縮時の損失削減 |
| 総ポイント数 | ~180 | ~280 | 約1.5倍 |

### Orbit Prediction

| パラメータ | 現在 | Phase 1 | 効果 |
|-----------|------|---------|------|
| PREDICTION_STEPS | 1200 | 1500 | より長い予測 |
| SAVE_FREQUENCY | 10 | 5 | サンプリング密度2倍 |
| 総ポイント数 | 120 | 300 | 2.5倍 |

---

## 期待される結果

### Phase 1 完了後
- 軌跡のカクカクが大幅に軽減
- 軌道予測線が滑らかに
- 8の字軌道など高速天体で効果顕著

### Phase 2 完了後（オプション）
- 少ないポイントでも滑らかな曲線
- カメラを近づけても角張らない
- パフォーマンスとのトレードオフ改善

---

## 実装優先順位

1. **高**: Trail の RECENT_INTERVAL を 1 に変更
2. **高**: Prediction の SAVE_FREQUENCY を 5 に変更
3. **中**: Trail のバッファサイズ拡大
4. **低**: スプライン補間の導入
5. **低**: 適応的サンプリングの実装
