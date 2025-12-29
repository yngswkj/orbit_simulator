# 三体星系プリセット実装計画

## 概要

小説「三体」（劉慈欣著）に登場する三体星系をシミュレートする機能。ケンタウルス座α星系（Alpha Centauri）をモデルとした3つの恒星が複雑な重力相互作用を行う。

## 恒星構成

| 恒星名 | モデル | 質量（太陽比） | 色 | スペクトル型 |
|--------|--------|--------------|-----|-------------|
| α Centauri A | ケンタウルス座α星A | 1.1 | #ffffaa（黄白） | G2V |
| α Centauri B | ケンタウルス座α星B | 0.9 | #ffcc66（橙） | K1V |
| Proxima Centauri | プロキシマ・ケンタウリ | 0.12 | #ff6644（赤） | M5.5Ve |

### 惑星

| 惑星名 | 説明 |
|--------|------|
| Trisolaris | 三体人の故郷。不安定な軌道を持つ惑星 |

## モード

### 安定期 (Stable Era)

- **配置**: 正三角形に近い配置
- **挙動**: 3つの恒星がゆっくりと回転
- **特徴**: 比較的予測可能な軌道パターン
- **初期条件**:
  - 軌道半径: 50単位
  - 速度: `sqrt((M_A + M_B + M_C) / (r * 3)) * 0.6`

### 乱紀 (Chaotic Era)

- **配置**: 不規則な3次元配置
- **挙動**: カオス的な恒星運動
- **特徴**: 予測不能な軌道、極端な重力変動
- **初期条件**:
  - 軌道半径: 45単位
  - Y軸方向にもオフセット（3D配置）

## 技術的実装

### ファイル構成

```
src/
├── types/
│   ├── physics.ts          # isStar プロパティ追加
│   └── starSystem.ts       # StarSystemPreset 型定義
├── utils/
│   ├── starSystems.ts      # THREE_BODY_SYSTEM プリセット
│   └── solarSystem.ts      # isStar: true 追加
├── store/
│   └── physicsStore.ts     # loadStarSystem アクション
└── components/
    ├── scene/
    │   ├── Scene.tsx       # findPrimaryStar ヘルパー
    │   └── CelestialBody.tsx # isStar 判定
    └── ui/
        ├── StarSystemGallery.tsx  # ギャラリーUI
        └── SimulationControls.tsx # ギャラリー統合
```

### 主要な変更点

#### 1. `isStar` プロパティ

```typescript
// src/types/physics.ts
interface CelestialBody {
  // ...
  isStar?: boolean; // 恒星判定（発光・カメラ参照用）
}
```

#### 2. 恒星検出ヘルパー

```typescript
// src/components/scene/Scene.tsx
const findPrimaryStar = (bodies: BodyType[]): BodyType | undefined => {
    const stars = bodies.filter(b => b.isStar);
    if (stars.length === 0) return undefined;
    return stars.reduce((max, star) =>
        star.mass > max.mass ? star : max, stars[0]);
};
```

#### 3. プリセット読み込み

```typescript
// src/store/physicsStore.ts
loadStarSystem: (systemId: string, mode?: StarSystemMode) => {
    const preset = getPresetById(systemId);
    if (!preset) return;

    const bodies = preset.createBodies(mode).map(body => ({
        ...body,
        id: uuidv4()
    }));

    // カメラリセットイベント発火
    window.dispatchEvent(new CustomEvent('starSystemChanged', {
        detail: { systemId, mode, camera: preset.initialCamera }
    }));

    set({ bodies, currentSystemId: systemId, ... });
}
```

## 物理的考慮事項

### 三体問題の特性

- **カオス性**: 初期条件の微小な差が大きく異なる結果を生む
- **長期予測不能**: 数値積分の誤差が蓄積
- **周期解の稀少性**: 安定した周期軌道は例外的

### シミュレーション上の課題

1. **数値安定性**: 恒星の接近時に積分誤差が増大
2. **時間スケール**: 現実の三体系は数百万年単位で変化
3. **視覚化**: カメラ追従時の参照恒星選択

### 対策

- **可変タイムステップ**: 接近時に dt を小さくする（将来実装）
- **エネルギー監視**: 総エネルギーの保存誤差を表示
- **最大質量恒星追従**: `findPrimaryStar` で最大質量の恒星を参照

## UI/UX

### 恒星系ギャラリー

- モーダルダイアログ形式
- プリセットカードにサムネイル表示
- 三体問題では安定期/乱紀モード選択可能
- 日本語/英語対応

### 翻訳キー

| キー | 英語 | 日本語 |
|------|------|--------|
| star_system_gallery | Star System Gallery | 恒星系ギャラリー |
| stable_era | Stable Era | 安定期 |
| chaotic_era | Chaotic Era | 乱紀 |

## 今後の拡張案

1. **プロキシマb**: Proxima Centauri周回のハビタブル惑星を追加
2. **タイムラプス**: 長期軌道変化の高速再生
3. **軌道分類**: 安定/準安定/カオスの自動判定
4. **三体人視点**: Trisolaris地表からの空の様子

## 参考資料

- 「三体」劉慈欣著 - 三体問題の文学的描写
- Alpha Centauri system - Wikipedia
- "The Three-Body Problem" - Henri Poincaré (1890)
