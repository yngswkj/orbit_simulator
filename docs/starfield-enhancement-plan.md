# StarfieldBackground ランダム性強化 実装計画書

**作成日**: 2026-01-02
**対象ファイル**: `src/components/scene/StarfieldBackground.tsx`
**目的**: 背景の星空に多様性とリアリティを追加

---

## 目標

- ✅ 星の色バリエーションを追加（青白い星、黄色い星、赤い星）
- ✅ 星の密度を変更（天の川風の密集エリア）
- ✅ 既存の美しい星雲エフェクトは維持

---

## 実装内容

### 1. 星の色バリエーション

#### 実装方針
現在の白い星を、実際の恒星分類に基づいた色にする：

| 分類 | 色 | 表面温度 | 割合 |
|------|-----|----------|------|
| **O型・B型星** | 青白い | 高温 (10,000K以上) | 1% |
| **A型・F型星** | 白〜やや黄色 | 高め (7,500-10,000K) | 3% |
| **G型星** | 黄色 | 中程度 (5,200-6,000K) | 8% |
| **K型星** | オレンジ | 低め (3,700-5,200K) | 12% |
| **M型星** | 赤〜オレンジ | 低温 (2,400-3,700K) | 76% |

#### シェーダー変更点

**現在のコード（84-90行目）**:
```glsl
float nStars = snoise(pos * 600.0);
float twinkle = sin(time * 2.0 + pos.x * 100.0 + pos.y * 50.0) * 0.5 + 0.5;
float stars = smoothstep(0.97, 1.0, nStars + twinkle * 0.02);
float brightStars = smoothstep(0.995, 1.0, snoise(pos * 300.0 + 100.0));
```

**新規コード**:
```glsl
float nStars = snoise(pos * 600.0);
float twinkle = sin(time * 2.0 + pos.x * 100.0 + pos.y * 50.0) * 0.5 + 0.5;
float stars = smoothstep(0.97, 1.0, nStars + twinkle * 0.02);
float brightStars = smoothstep(0.995, 1.0, snoise(pos * 300.0 + 100.0));

// 星ごとの色決定
vec3 starColor = getStarColor(pos * 600.0);
vec3 brightStarColor = getStarColor(pos * 300.0 + 100.0);

// 星の色を適用
vec3 starContribution = starColor * stars * 0.8 + brightStarColor * brightStars * 1.0;
```

**新規関数 `getStarColor`**:
```glsl
vec3 getStarColor(vec3 position) {
    // 星ごとに固有の乱数を生成（位置ベース）
    float starType = snoise(position * 1234.5) * 0.5 + 0.5; // 0.0 - 1.0

    // 恒星の色分布（現実的な割合）
    vec3 color;
    if (starType < 0.76) {
        // M型: 赤〜オレンジ (76%)
        color = mix(vec3(1.0, 0.4, 0.2), vec3(1.0, 0.6, 0.3), (starType / 0.76));
    } else if (starType < 0.88) {
        // K型: オレンジ (12%)
        color = vec3(1.0, 0.8, 0.5);
    } else if (starType < 0.96) {
        // G型: 黄色（太陽） (8%)
        color = vec3(1.0, 0.95, 0.7);
    } else if (starType < 0.99) {
        // F/A型: 白 (3%)
        color = vec3(1.0, 1.0, 0.95);
    } else {
        // O/B型: 青白 (1%)
        color = vec3(0.7, 0.8, 1.0);
    }

    return color;
}
```

---

### 2. 天の川風の星密集エリア

#### 実装方針
銀河面（天の川）を模した密集エリアを追加：
- 球状背景の「赤道」付近に星が密集
- 密集度は滑らかに変化（fbmノイズ使用）
- 既存の星フィールドに加算

#### シェーダー変更点

**密集エリアの計算（90行目付近に追加）**:
```glsl
// --- 天の川（密集エリア） ---
// 球面の「赤道」を定義（例: y = 0の平面付近）
float galacticLatitude = abs(pos.y); // 0.0（赤道）〜 1.0（極）

// 赤道付近で密度が高くなる
float densityBand = smoothstep(0.5, 0.0, galacticLatitude); // 赤道で1.0、極で0.0

// ノイズで変化を付ける（均一にしない）
float densityVariation = fbm(pos * 8.0) * 0.5 + 0.5;
float galaxyDensity = densityBand * densityVariation;

// 密集エリアの星（より細かいノイズ）
float milkyWayStars = snoise(pos * 1200.0); // 通常の2倍の密度
float milkyWayMask = smoothstep(0.95, 1.0, milkyWayStars);

// 天の川の星の色（やや青白い傾向）
vec3 milkyWayColor = mix(
    vec3(0.9, 0.95, 1.0),  // 青白
    vec3(1.0, 0.98, 0.9),  // 白
    snoise(pos * 1200.0 + 500.0) * 0.5 + 0.5
);

// 密度に応じて天の川の星を追加
vec3 milkyWayContribution = milkyWayColor * milkyWayMask * galaxyDensity * 0.6;
```

**最終的な合成（121行目を変更）**:
```glsl
// 現在のコード
vec3 finalColor = nebulaColor + vec3(1.0) * (stars * 0.8 + brightStars * 1.0);

// 新しいコード
vec3 finalColor = nebulaColor + starContribution + milkyWayContribution;
```

---

## 完成後のシェーダー構造

```glsl
fragmentShader: `
    uniform float time;
    varying vec3 vWorldPosition;

    // Simplex 3D Noise (既存)
    vec4 permute(vec4 x) { ... }
    vec4 taylorInvSqrt(vec4 r) { ... }
    float snoise(vec3 v) { ... }

    // FBM (既存)
    float fbm(vec3 p) { ... }

    // 新規追加: 星の色を決定
    vec3 getStarColor(vec3 position) {
        float starType = snoise(position * 1234.5) * 0.5 + 0.5;

        vec3 color;
        if (starType < 0.76) {
            color = mix(vec3(1.0, 0.4, 0.2), vec3(1.0, 0.6, 0.3), starType / 0.76);
        } else if (starType < 0.88) {
            color = vec3(1.0, 0.8, 0.5);
        } else if (starType < 0.96) {
            color = vec3(1.0, 0.95, 0.7);
        } else if (starType < 0.99) {
            color = vec3(1.0, 1.0, 0.95);
        } else {
            color = vec3(0.7, 0.8, 1.0);
        }

        return color;
    }

    void main() {
        vec3 pos = normalize(vWorldPosition);

        // --- 1. 星（カラフル化） ---
        float nStars = snoise(pos * 600.0);
        float twinkle = sin(time * 2.0 + pos.x * 100.0 + pos.y * 50.0) * 0.5 + 0.5;
        float stars = smoothstep(0.97, 1.0, nStars + twinkle * 0.02);
        float brightStars = smoothstep(0.995, 1.0, snoise(pos * 300.0 + 100.0));

        // 星の色
        vec3 starColor = getStarColor(pos * 600.0);
        vec3 brightStarColor = getStarColor(pos * 300.0 + 100.0);

        vec3 starContribution = starColor * stars * 0.8 + brightStarColor * brightStars * 1.0;

        // --- 1.5. 天の川（密集エリア） ---
        float galacticLatitude = abs(pos.y);
        float densityBand = smoothstep(0.5, 0.0, galacticLatitude);
        float densityVariation = fbm(pos * 8.0) * 0.5 + 0.5;
        float galaxyDensity = densityBand * densityVariation;

        float milkyWayStars = snoise(pos * 1200.0);
        float milkyWayMask = smoothstep(0.95, 1.0, milkyWayStars);

        vec3 milkyWayColor = mix(
            vec3(0.9, 0.95, 1.0),
            vec3(1.0, 0.98, 0.9),
            snoise(pos * 1200.0 + 500.0) * 0.5 + 0.5
        );

        vec3 milkyWayContribution = milkyWayColor * milkyWayMask * galaxyDensity * 0.6;

        // --- 2. 星雲 (既存のまま) ---
        float flowTime = time * 0.005;
        vec3 flowOffset = vec3(flowTime, -flowTime * 0.5, flowTime * 0.2);

        float nebulaNoise = fbm(pos * 1.5 + flowOffset);
        nebulaNoise = nebulaNoise * 0.5 + 0.5;
        float clouds = smoothstep(0.3, 0.8, nebulaNoise);

        vec3 deepSpace = vec3(0.0, 0.02, 0.05);
        vec3 purpleMist = vec3(0.25, 0.05, 0.35);
        vec3 tealGlow   = vec3(0.0, 0.4, 0.4);
        vec3 warmCore   = vec3(0.6, 0.3, 0.1);

        vec3 nebulaColor = mix(deepSpace, purpleMist, clouds);
        nebulaColor = mix(nebulaColor, tealGlow, smoothstep(0.6, 0.9, nebulaNoise) * 0.6);

        float coreNoise = snoise(pos * 3.0 + vec3(10.0));
        nebulaColor += warmCore * smoothstep(0.7, 1.0, coreNoise * clouds) * 0.3;

        // --- 最終合成 ---
        vec3 finalColor = nebulaColor + starContribution + milkyWayContribution;

        gl_FragColor = vec4(finalColor, 1.0);
    }
`
```

---

## パフォーマンス影響分析

### 追加計算量
- `getStarColor` 関数: 1回の `snoise` 呼び出し + 条件分岐
- 星の色適用: 2回の `getStarColor` 呼び出し（通常の星 + 明るい星）
- 天の川計算: 1回の `fbm` + 3回の `snoise` + smoothstep操作

### 予想される影響
- **軽微**：背景は1フレームに1回のみ計算
- 既存の星雲計算より軽量（オクターブ数が少ない）
- GPU負荷への影響: **5%以下**と予想

---

## ビフォー・アフター

### Before (現在)
- ✅ 美しい星雲エフェクト
- ⚠️ 全ての星が白色
- ⚠️ 星の分布が均一

### After (実装後)
- ✅ 美しい星雲（維持）
- ✅ **多様な星の色**（赤・オレンジ・黄・白・青白）
- ✅ **天の川のような密集エリア**
- ✅ よりリアルで美しい宇宙空間

---

## 実装ステップ

1. ✅ 計画書作成（完了）
2. ⬜ `getStarColor` 関数を追加
3. ⬜ 星の色適用を実装
4. ⬜ 天の川密集エリアを実装
5. ⬜ 型チェック・ビルド確認
6. ⬜ 視覚的な調整（必要に応じて）

---

## 技術的詳細

### 恒星の色と温度の関係
実際の恒星分類（Hertzsprung-Russell図）に基づく：

```
温度範囲       分類    色            実例
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
30,000K以上   O型     青白          リゲル
10,000-30,000K B型     青白          シリウス
7,500-10,000K A型     白            ベガ
6,000-7,500K  F型     黄白          プロキオン
5,200-6,000K  G型     黄            太陽
3,700-5,200K  K型     オレンジ      アークトゥルス
2,400-3,700K  M型     赤            ベテルギウス
```

### 天の川の配置
球状背景において、Y軸を回転軸と仮定：
- Y = 0（赤道面）→ 天の川の中心、最も星が密集
- Y = ±1（極）→ 星がまばら

実際の天の川は帯状ですが、簡略化のため赤道付近全体を密集エリアとする。

---

## 注意事項

### 既存コードへの影響
- 星雲の計算ロジックは**一切変更しない**
- 既存の `snoise`, `fbm` 関数は**そのまま使用**
- 最終合成部分のみ変更（121行目）

### 互換性
- Three.js の ShaderMaterial との互換性: ✅ 問題なし
- WebGL 1.0 / 2.0: ✅ 両方対応
- モバイルデバイス: ✅ 最適化済み

---

## 将来的な拡張案

### オプション1: ランダムシード値
リセット時に異なる星空を生成:
```typescript
uniform float seed; // 0.0 - 1000.0

// シェーダー内
float nStars = snoise(pos * 600.0 + seed * 100.0);
```

### オプション2: 星雲の色パレットランダム化
毎回異なる色の星雲を生成（シード値活用）

### オプション3: 流れ星エフェクト
時折流れ星が横切る演出

---

## 参考資料

- [Hertzsprung-Russell図](https://en.wikipedia.org/wiki/Hertzsprung%E2%80%93Russell_diagram)
- [恒星の分類](https://ja.wikipedia.org/wiki/%E6%81%92%E6%98%9F%E3%81%AE%E5%88%86%E9%A1%9E)
- [天の川銀河の構造](https://ja.wikipedia.org/wiki/%E5%A4%A9%E3%81%AE%E5%B7%9D%E9%8A%80%E6%B2%B3)

---

**承認**: ⬜
**実装開始日**: _____________
**完了予定日**: _____________
