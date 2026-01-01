# Advanced Visualization - Week 1 Implementation Plan

本計画は、高度な可視化機能のPhase 1およびPhase 2の実装を対象とします。

## Phase 1: ハビタブルゾーン動的計算

### 1.1 単一恒星HZ動的計算
恒星の質量から光度を計算し、ハビタブルゾーンの内縁・外縁を動的に決定します。

#### [MODIFY] [src/constants/physics.ts](file:///c:/Users/yngsw/dev/orbit-simulator/src/constants/physics.ts)
`SOLAR_CONSTANTS`を追加します。

#### [NEW] [src/utils/habitableZone.ts](file:///c:/Users/yngsw/dev/orbit-simulator/src/utils/habitableZone.ts)
`calculateLuminosity`, `calculateSingleStarHZ`, `calculateFluxAt`, `classifyHabitability` 関数を実装します。

#### [MODIFY] [src/components/scene/Scene.tsx](file:///c:/Users/yngsw/dev/orbit-simulator/src/components/scene/Scene.tsx)
単一恒星系の場合に `calculateSingleStarHZ` を使用してリングジオメトリを動的に生成します。

### 1.2 連星系HZ（2D）
複数恒星系の場合、グリッドベースのヒートマップを表示します。

#### [NEW] [src/components/scene/HabitableZoneMap.tsx](file:///c:/Users/yngsw/dev/orbit-simulator/src/components/scene/HabitableZoneMap.tsx)
100x100グリッドで放射フラックスを計算し、頂点カラーで温度分布（寒すぎ/適温/熱すぎ）を可視化します。

#### [MODIFY] [src/components/scene/Scene.tsx](file:///c:/Users/yngsw/dev/orbit-simulator/src/components/scene/Scene.tsx)
`HabitableZoneMap` コンポーネントを統合します。

#### [MODIFY] [src/utils/i18n.ts](file:///c:/Users/yngsw/dev/orbit-simulator/src/utils/i18n.ts)
関連する翻訳テキストを追加します。

---

## Phase 2: 衝突エフェクト・デブリシステム

### 2.1 衝突検出・破壊エフェクト（ロシュ限界）

#### [MODIFY] [src/types/physics.ts](file:///c:/Users/yngsw/dev/orbit-simulator/src/types/physics.ts)
`CelestialBody` に `isBeingDestroyed`, `destructionProgress` などのフィールドを追加します。

#### [NEW] [src/utils/rocheLimit.ts](file:///c:/Users/yngsw/dev/orbit-simulator/src/utils/rocheLimit.ts)
`calculateRocheLimit`, `checkRocheLimit` 関数を実装します。

#### [NEW] [src/components/effects/TidalDisruptionEffect.tsx](file:///c:/Users/yngsw/dev/orbit-simulator/src/components/effects/TidalDisruptionEffect.tsx)
潮汐破壊時のパーティクルエフェクトを実装します。

### 2.2 衝撃波・赤熱エフェクト

#### [NEW] [src/components/effects/ShockwaveEffect.tsx](file:///c:/Users/yngsw/dev/orbit-simulator/src/components/effects/ShockwaveEffect.tsx)
衝突時の衝撃波リングエフェクト。

#### [NEW] [src/components/effects/HeatGlowEffect.tsx](file:///c:/Users/yngsw/dev/orbit-simulator/src/components/effects/HeatGlowEffect.tsx)
加熱時の赤熱シェーダーエフェクト。

### 2.3 非物理デブリシステム

#### [NEW] [src/types/debris.ts](file:///c:/Users/yngsw/dev/orbit-simulator/src/types/debris.ts)
デブリパーティクルの型定義。

## Verification Plan

### Automated Tests
- 今回は主に視覚的な変更のため、自動テストの追加予定はありません。

### Manual Verification
1.  **単一恒星HZ**: 太陽（質量333,000）を配置し、0.95-1.4AUの位置に緑色のリングが表示されるか確認。質量を変更してリングサイズが変わるか確認。
2.  **連星系HZ**: 2つの太陽を配置し、その中間に複雑なヒートマップが表示されるか確認。
3.  **衝突エフェクト**: 惑星を恒星に突っ込ませ、ロシュ限界付近でパーティクルが発生し、破壊されるか確認。
4.  **衝撃波**: 衝突時にリング状の衝撃波が広がるか確認。
