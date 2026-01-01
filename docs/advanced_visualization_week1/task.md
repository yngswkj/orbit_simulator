# Week 1 Task List: Advanced Visualization

高度な可視化機能（Week 1）の実装タスクリスト。
主にハビタブルゾーンの動的計算（Phase 1）と、衝突・破壊エフェクト（Phase 2）の実装を行う。

- [/] Phase 1: ハビタブルゾーン動的計算
    - [/] 定数と物理計算ユーティリティの実装
        - `src/constants/physics.ts` (SOLAR_CONSTANTS追加)
        - `src/utils/habitableZone.ts` (新規作成)
    - [/] 単一恒星系のHZ表示
        - `src/components/scene/Scene.tsx` (動的HZ計算とリング表示)
    - [x] シングル・連星系・複数恒星系のHZ表示（ヒートマップ統合完了）
        - `src/components/scene/HabitableZoneMap.tsx` (新規作成)
        - `src/components/scene/Scene.tsx` (Map統合)
    - [x] UI/多言語対応
        - `src/utils/i18n.ts` (テキスト追加)

- [/] Phase 2: 衝突エフェクト・デブリシステム
    - [x] 衝突検出とロシュ限界ロジック
        - `src/types/physics.ts` (破壊状態フィールド追加)
        - `src/utils/rocheLimit.ts` (新規作成)
    - [x] 潮汐破壊エフェクト
        - `src/components/effects/TidalDisruptionEffect.tsx` (新規作成)
    - [x] 衝突時の衝撃波・赤熱エフェクト
        - `src/components/effects/ShockwaveEffect.tsx` (実装・統合完了)
        - `src/components/effects/HeatGlowEffect.tsx` (Scene統合完了)
    - [x] 非物理デブリシステム
        - `src/types/debris.ts` (新規作成)
