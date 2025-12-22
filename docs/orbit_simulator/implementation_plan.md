# 3D Celestial Orbit Simulator Implementation Plan

## Goal Description
ブラウザ上で動作する3D天体軌道シミュレーターを作成する。ユーザーは天体を自由に配置し、物理法則（万有引力）に基づいた軌道運動を視覚的に楽しむことができる。視点操作、再生速度の変更、天体の追加編集を可能にする。

## User Review Required
> [!IMPORTANT]
> 物理演算の精度とパフォーマンスのバランスについて：JavaScript (Browser) での実行のため、数千個の天体ではなく、数十〜数百個程度のN体シミュレーションを想定する。非常に高精度な科学的シミュレーションではなく、"Physically Reasonably Accurate" (見た目と挙動が物理的に正しい) レベルを目指す。

## Proposed Changes

### Tech Stack
- **Framework**: React (Vite) + TypeScript
- **3D Engine**: Three.js + @react-three/fiber (R3F)
- **Utilities**: @react-three/drei, leva (for debug UI/controls if needed), zustand (state management), uuid

### Architecture

#### Core Physics Engine (`src/engine`)
- `usePhysicsStore`: Zustand store holding the state of all bodies (position, velocity, mass, radius, color).
- `PhysicsLoop`: A component or hook that runs on `useFrame` to update positions using a symplectic integrator (e.g., Velocity Verlet) for stable orbits.

#### 3D Components (`src/components/scene`)
- `Scene`: Main canvas entry point.
- `CelestialBody`: Reusable component rendering a sphere and its trail.
- `StarField`: Background stars.
- `Controls`: Wrapper for `OrbitControls`.

#### UI Overlay (`src/components/ui`)
- `ControlPanel`: HTML overlay for adding bodies, controlling time scale.
- `BodyList`: List of current bodies with delete/edit options.

### Directory Structure
```
src/
  components/
    scene/      # 3D R3F components
    ui/         # 2D React UI components
  hooks/        # Custom hooks (physics loop)
  store/        # Zustand state
  types/        # TS interfaces
  utils/        # Math helpers (gravity calc)
```

## Additional Features Plan
- **Text Billboarding**: Use `@react-three/drei`'s `<Billboard>` component to wrap celestial body labels so they always face the camera.
- **Solar System Preset**: Add a predefined list of planets (Sun to Neptune) with scaled masses/distances/velocities to the `physicsStore`. Add a "Load Solar System" button to the UI.

## Visual Enhancements Plan
- **Better Trails**: Increase trial width and adjust opacity attenuation. Ensure they are visible from distance.
- **Orbit Prediction**: Create a `OrbitPredictor` component/hook that simulates N-body physics for X future steps (e.g., 500-1000 steps) without affecting the main simulation. Render these paths using `Line` from `@react-three/drei`.
    - *Note*: This is computationally expensive. Will limit prediction steps or update frequency.
- **Grid & Axes**: Add `<Grid>` and `<AxesHelper>` (or `<GizmoHelper>`) to `Scene.tsx` for spatial reference.

## Verification Plan

### Automated Tests
- 基本的な物理計算関数の単体テスト (Optional)

### Manual Verification
- **太陽-地球-月** のような系を配置し、安定して公転することを確認する。
- ドラッグで視点がスムーズに動くか確認する。
- 天体を追加した際、初期速度に応じて楕円軌道や双曲線軌道を描くか確認する。
