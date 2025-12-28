# orbit-simulator 実装後レビュー改善計画書

**作成日**: 2025年12月28日
**対象**: Phase 1, 3, 4 実装完了後
**レビュアー**: Claude Code

---

## 1. エグゼクティブサマリー

### 1.1 実装状況

| Phase | 内容 | 状況 |
|-------|------|:----:|
| Phase 1 | SoA最適化・ループ統合 | 完了 |
| Phase 2 | Barnes-Hut | 除外（Direct法で十分） |
| Phase 3 | Web Worker並列化 | 完了 |
| Phase 4 | WebGPU Compute | 完了 |

### 1.2 全体評価

**総合スコア**: ⭐⭐⭐⭐ (4/5)

**強み**:
- 3つの計算モード（CPU/Worker/GPU）の切り替えが可能
- SoA最適化によりCPU単体で1000天体@500FPS達成
- Ping-Pongバッファによる効率的なGPU状態管理

**改善が必要な点**:
- モード間の物理的一貫性（積分法・衝突検出）
- Worker同期のCPU効率
- GPU毎フレームデータ転送のオーバーヘッド

---

## 2. 発見された問題点

### 2.1 重大 (Critical)

| ID | 問題 | 影響 | ファイル |
|----|------|------|----------|
| C-01 | GPU Shaderがオイラー法を使用 | モード間で軌道が一致しない | GPUPhysicsEngine.ts |
| C-02 | Worker同期がビジーウェイト | CPU使用率100%、発熱 | physics.worker.ts |

### 2.2 高 (High)

| ID | 問題 | 影響 | ファイル |
|----|------|------|----------|
| H-01 | GPU毎フレームデータ転送 | GPUの利点が減殺 | physicsStore.ts |
| H-02 | Worker/GPUで衝突検出なし | モード間で挙動不一致 | physics.worker.ts, GPUPhysicsEngine.ts |
| H-03 | 型安全でないアクセス | 保守性低下 | physicsStore.ts |

### 2.3 中 (Medium)

| ID | 問題 | 影響 | ファイル |
|----|------|------|----------|
| M-01 | グローバルシングルトン即時初期化 | 不要なリソース消費 | physicsStore.ts |
| M-02 | GPU Float32 vs CPU Float64 | 長時間で精度差 | GPUPhysicsEngine.ts |
| M-03 | Worker終了処理なし | リソースリーク | physicsStore.ts |
| M-04 | マジックナンバー散在 | 可読性・保守性低下 | 複数ファイル |

---

## 3. 改善計画

### 3.1 C-01: GPU積分法の統一

**現状**:
```wgsl
// GPUPhysicsEngine.ts - オイラー法
let newVel = oldVel + acc * params.dt;
let newPos = myPos + newVel * params.dt;
```

**問題**: CPUはVelocity Verlet、GPUはEuler法で**エネルギー保存性が異なる**

**改善案**: Leapfrog法（Velocity Verletと数学的に等価）

```wgsl
struct Body {
    data0 : vec4<f32>, // pos(xyz), mass(w)
    data1 : vec4<f32>, // vel(xyz), radius(w)
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    let index = GlobalInvocationID.x;
    if (index >= params.bodyCount) { return; }

    let myPos = bodiesIn[index].data0.xyz;
    let myMass = bodiesIn[index].data0.w;
    let oldVel = bodiesIn[index].data1.xyz;

    // 1. Calculate acceleration at current position
    var acc = vec3<f32>(0.0);
    for (var i : u32 = 0u; i < params.bodyCount; i++) {
        if (i == index) { continue; }
        let otherPos = bodiesIn[i].data0.xyz;
        let otherMass = bodiesIn[i].data0.w;
        let diff = otherPos - myPos;
        let distSq = dot(diff, diff) + params.softening;
        let invDist = inverseSqrt(distSq);
        let invDist3 = invDist * invDist * invDist;
        acc += diff * (params.G * otherMass * invDist3);
    }

    // 2. Leapfrog Integration (equivalent to Velocity Verlet)
    // v(t + dt/2) = v(t) + a(t) * dt/2  (kick)
    // x(t + dt)   = x(t) + v(t + dt/2) * dt  (drift)
    // v(t + dt)   = v(t + dt/2) + a(t + dt) * dt/2  (kick)

    // For single-pass: use symplectic Euler (position-first)
    let halfDt = params.dt * 0.5;
    let halfVel = oldVel + acc * halfDt;
    let newPos = myPos + halfVel * params.dt;

    // Recalculate acceleration at new position
    var newAcc = vec3<f32>(0.0);
    for (var i : u32 = 0u; i < params.bodyCount; i++) {
        if (i == index) { continue; }
        let otherPos = bodiesIn[i].data0.xyz;
        let otherMass = bodiesIn[i].data0.w;
        let diff = otherPos - newPos;
        let distSq = dot(diff, diff) + params.softening;
        let invDist = inverseSqrt(distSq);
        let invDist3 = invDist * invDist * invDist;
        newAcc += diff * (params.G * otherMass * invDist3);
    }

    let newVel = halfVel + newAcc * halfDt;

    bodiesOut[index].data0 = vec4<f32>(newPos, myMass);
    bodiesOut[index].data1 = vec4<f32>(newVel, bodiesIn[index].data1.w);
}
```

**工数**: 3時間
**優先度**: Critical

---

### 3.2 C-02: Worker同期の改善

**現状**:
```typescript
// physics.worker.ts - ビジーウェイト
function waitBarrier(targetCount: number) {
    Atomics.add(syncCounter, 0, 1);
    while (Atomics.load(syncCounter, 0) < targetCount) {
        // Spin ← CPU 100%
    }
}
```

**改善案**: Atomics.wait/notify を使用

```typescript
// 改善版 - ブロッキング待機
function waitBarrier(targetCount: number, phase: number) {
    const myCount = Atomics.add(syncCounter, 0, 1) + 1;

    if (myCount < targetCount) {
        // まだ全員到達していない → 待機
        // syncCounter[1] をフェーズカウンタとして使用
        const expectedPhase = phase;
        while (Atomics.load(syncCounter, 1) === expectedPhase) {
            // Atomics.wait は CPU を解放してブロック
            const result = Atomics.wait(syncCounter, 1, expectedPhase, 1000);
            if (result === 'timed-out') {
                // タイムアウト時は再チェック
                continue;
            }
        }
    } else {
        // 最後の到達者 → フェーズをインクリメントして全員を起こす
        Atomics.add(syncCounter, 1, 1);
        Atomics.notify(syncCounter, 1);
        // カウンタリセット
        Atomics.store(syncCounter, 0, 0);
    }
}
```

**注意**: `Atomics.wait` は Worker スレッドでのみ使用可能（メインスレッド不可）

**工数**: 2時間
**優先度**: Critical

---

### 3.3 H-01: GPUデータ転送の最適化

**現状**:
```typescript
// physicsStore.ts - 毎フレーム転送
await gpuEngine.setBodies(bodies);      // CPU → GPU
await gpuEngine.step(dt, bodies.length);
const gpuData = await gpuEngine.getBodies(bodies.length);  // GPU → CPU
```

**改善案A**: 描画時のみ読み戻し（推奨）

```typescript
// physicsStore.ts
updateBodies: async () => {
    if (useGPU) {
        // 初回のみアップロード
        if (!gpuStateInitialized) {
            await gpuEngine.setBodies(bodies);
            gpuStateInitialized = true;
        }

        // GPUで複数ステップ実行（描画は1回）
        const stepsPerFrame = 1;
        for (let i = 0; i < stepsPerFrame; i++) {
            await gpuEngine.step(dt, bodies.length);
        }

        // 描画用に読み戻し（ここがボトルネックだが必須）
        const gpuData = await gpuEngine.getBodies(bodies.length);
        // ...
    }
}
```

**改善案B**: 読み戻しを非同期化

```typescript
// 前フレームのデータで描画し、バックグラウンドで次を取得
let pendingRead: Promise<Float32Array | null> | null = null;

updateBodies: async () => {
    if (useGPU) {
        // 前フレームの読み戻しが完了していれば使用
        if (pendingRead) {
            const data = await pendingRead;
            if (data) syncBodiesToUI(data);
        }

        // ステップ実行
        await gpuEngine.step(dt, bodies.length);

        // 非同期で読み戻し開始（次フレームで使用）
        pendingRead = gpuEngine.getBodies(bodies.length);
    }
}
```

**工数**: 4時間
**優先度**: High

---

### 3.4 H-02: Worker/GPU衝突検出の実装

**現状**: CPUモードのみ衝突・合体が機能

**改善案**:

#### Worker版

```typescript
// physics.worker.ts に追加
function resolveCollisions(count: number) {
    // 簡易版: メインスレッドに衝突ペアを通知
    const collisions: [number, number][] = [];

    for (let i = startIdx; i < endIdx; i++) {
        for (let j = 0; j < count; j++) {
            if (i >= j) continue;

            const i3 = i * 3, j3 = j * 3;
            const dx = sharedPositions[i3] - sharedPositions[j3];
            const dy = sharedPositions[i3+1] - sharedPositions[j3+1];
            const dz = sharedPositions[i3+2] - sharedPositions[j3+2];
            const distSq = dx*dx + dy*dy + dz*dz;
            const radSum = sharedRadii[i] + sharedRadii[j];

            if (distSq < (radSum * 0.8) ** 2) {
                collisions.push([i, j]);
            }
        }
    }

    // 衝突ペアをメインスレッドに通知
    self.postMessage({ type: 'collisions', pairs: collisions });
}
```

#### GPU版

```wgsl
// 衝突検出は別パスで実行
@compute @workgroup_size(64)
fn detectCollisions(@builtin(global_invocation_id) id : vec3<u32>) {
    // 衝突フラグバッファに書き込み
    // メインスレッドで読み戻して処理
}
```

**工数**: 6時間（Worker + GPU）
**優先度**: High

---

### 3.5 H-03: 型安全性の改善

**現状**:
```typescript
if (!(gpuEngine as any).isReady) {  // 型を無視
```

**改善案**:

```typescript
// GPUPhysicsEngine.ts
export class GPUPhysicsEngine {
    private _isReady: boolean = false;

    public get isReady(): boolean {
        return this._isReady;
    }

    async init(maxBodies: number): Promise<void> {
        // ...
        this._isReady = true;
    }
}

// physicsStore.ts
if (!gpuEngine.isReady) {  // 型安全
    await gpuEngine.init(20000);
}
```

**工数**: 30分
**優先度**: High

---

### 3.6 M-01: 遅延初期化パターン

**現状**:
```typescript
// モジュール読み込み時に即座に初期化
export const workerManager = new PhysicsWorkerManager(20000);
workerManager.initWorkers();
```

**改善案**:

```typescript
// physicsStore.ts
let _workerManager: PhysicsWorkerManager | null = null;
let _gpuEngine: GPUPhysicsEngine | null = null;

function getWorkerManager(): PhysicsWorkerManager {
    if (!_workerManager) {
        _workerManager = new PhysicsWorkerManager(20000);
        _workerManager.initWorkers();
    }
    return _workerManager;
}

function getGPUEngine(): GPUPhysicsEngine {
    if (!_gpuEngine) {
        _gpuEngine = new GPUPhysicsEngine();
    }
    return _gpuEngine;
}

// 使用箇所
toggleMultithreading: () => {
    const manager = getWorkerManager();
    // ...
}
```

**工数**: 1時間
**優先度**: Medium

---

### 3.7 M-02: 定数の整理

**現状**: マジックナンバーが散在

**改善案**:

```typescript
// src/constants/physics.ts
export const PHYSICS_CONSTANTS = {
    G: 1.0,
    SOFTENING: 0.5,
    BASE_DT: 0.001,
    COLLISION_THRESHOLD: 0.8,
} as const;

export const BUFFER_LIMITS = {
    MAX_BODIES: 20000,
    TRAIL_LENGTH: 150,
    PREDICTION_STEPS: 500,
} as const;

export const GPU_CONFIG = {
    WORKGROUP_SIZE: 64,
    BYTES_PER_BODY: 32,
} as const;
```

**工数**: 1時間
**優先度**: Medium

---

## 4. 追加機能提案

### 4.1 エネルギー監視システム

**目的**: 積分法の精度を可視化

```typescript
// src/utils/energyMonitor.ts
export function calculateTotalEnergy(state: PhysicsState): {
    kinetic: number;
    potential: number;
    total: number;
} {
    let kinetic = 0;
    let potential = 0;

    for (let i = 0; i < state.count; i++) {
        const i3 = i * 3;
        const vx = state.velocities[i3];
        const vy = state.velocities[i3 + 1];
        const vz = state.velocities[i3 + 2];
        const m = state.masses[i];

        kinetic += 0.5 * m * (vx*vx + vy*vy + vz*vz);

        for (let j = i + 1; j < state.count; j++) {
            const j3 = j * 3;
            const dx = state.positions[i3] - state.positions[j3];
            const dy = state.positions[i3+1] - state.positions[j3+1];
            const dz = state.positions[i3+2] - state.positions[j3+2];
            const r = Math.sqrt(dx*dx + dy*dy + dz*dz);

            potential -= G * m * state.masses[j] / r;
        }
    }

    return { kinetic, potential, total: kinetic + potential };
}
```

**UI表示**:
```
Energy Conservation: 99.98% (Drift: -0.02%)
```

**工数**: 2時間
**優先度**: Medium

---

### 4.2 パフォーマンス統計UI

```typescript
// src/components/ui/PerformanceStats.tsx
interface Stats {
    mode: 'CPU' | 'Worker' | 'GPU';
    bodyCount: number;
    fps: number;
    physicsMs: number;
    renderMs: number;
    transferMs?: number;  // GPUのみ
    energyDrift: number;
}

export function PerformanceStats() {
    const stats = usePerformanceStats();

    return (
        <div className="stats-panel">
            <div>Mode: {stats.mode}</div>
            <div>Bodies: {stats.bodyCount}</div>
            <div>FPS: {stats.fps.toFixed(1)}</div>
            <div>Physics: {stats.physicsMs.toFixed(2)}ms</div>
            <div>Render: {stats.renderMs.toFixed(2)}ms</div>
            {stats.transferMs && <div>Transfer: {stats.transferMs.toFixed(2)}ms</div>}
            <div>Energy: {(100 + stats.energyDrift).toFixed(2)}%</div>
        </div>
    );
}
```

**工数**: 3時間
**優先度**: Medium

---

### 4.3 軌道要素表示

```typescript
// src/utils/orbitalElements.ts
export interface OrbitalElements {
    semiMajorAxis: number;      // a: 軌道長半径
    eccentricity: number;       // e: 離心率
    inclination: number;        // i: 軌道傾斜角
    longitudeAscending: number; // Ω: 昇交点経度
    argumentPeriapsis: number;  // ω: 近点引数
    trueAnomaly: number;        // ν: 真近点角
    period: number;             // T: 公転周期
}

export function calculateOrbitalElements(
    body: CelestialBody,
    centralBody: CelestialBody
): OrbitalElements {
    const r = body.position.clone().sub(centralBody.position);
    const v = body.velocity.clone().sub(centralBody.velocity);
    const mu = G * (body.mass + centralBody.mass);

    // 角運動量
    const h = r.clone().cross(v);

    // 離心率ベクトル
    const eVec = v.clone().cross(h).divideScalar(mu)
        .sub(r.clone().normalize());

    const e = eVec.length();
    const a = 1 / (2/r.length() - v.lengthSq()/mu);
    const T = 2 * Math.PI * Math.sqrt(a**3 / mu);

    // ... 他の要素も計算

    return { semiMajorAxis: a, eccentricity: e, period: T, ... };
}
```

**工数**: 4時間
**優先度**: Low

---

## 5. 実装ロードマップ

### Week 1: Critical修正

| 日 | タスク | 工数 |
|:--:|--------|:----:|
| 1 | C-01: GPU Shader Velocity Verlet化 | 3h |
| 2 | C-02: Worker Atomics.wait導入 | 2h |
| 3 | H-03: 型安全性改善 | 0.5h |
| 3 | テスト・検証 | 2h |

### Week 2: High修正

| 日 | タスク | 工数 |
|:--:|--------|:----:|
| 1-2 | H-01: GPUデータ転送最適化 | 4h |
| 3-4 | H-02: Worker衝突検出 | 3h |
| 5 | H-02: GPU衝突検出 | 3h |

### Week 3: Medium修正 + 機能追加

| 日 | タスク | 工数 |
|:--:|--------|:----:|
| 1 | M-01: 遅延初期化 | 1h |
| 1 | M-02: 定数整理 | 1h |
| 2 | エネルギー監視 | 2h |
| 3-4 | パフォーマンス統計UI | 3h |
| 5 | ドキュメント更新 | 2h |

---

## 6. 検証チェックリスト

### 6.1 物理的一貫性

- [ ] CPU/Worker/GPUで同じ初期条件から同じ軌道が得られる
- [ ] 長時間（1000周回）後もエネルギードリフトが1%以内
- [ ] 衝突・合体が全モードで正しく動作

### 6.2 パフォーマンス

- [ ] Worker使用時のCPU使用率が適切（100%でない）
- [ ] GPU使用時のデータ転送が最適化されている
- [ ] 1000天体で全モード60FPS達成

### 6.3 安定性

- [ ] モード切り替え時にクラッシュしない
- [ ] GPU非対応ブラウザで適切にフォールバック
- [ ] SharedArrayBuffer非対応環境で動作

---

## 7. まとめ

### 完了した最適化

| 項目 | 効果 |
|------|------|
| SoA変換 | メモリアクセス最適化 |
| ニュートン第三法則 | 計算量50%削減 |
| Web Worker | UI応答性向上 |
| WebGPU | 大規模シミュレーション対応 |

### 残課題（優先度順）

1. **GPU積分法統一** - モード間一貫性
2. **Worker同期改善** - CPU効率
3. **GPUデータ転送最適化** - パフォーマンス
4. **衝突検出統一** - 機能一貫性
5. **エネルギー監視** - 教育的価値

これらを修正することで、**教育・研究用途に耐えうる高品質なN体シミュレーター**が完成します。

---

*本計画書はPhase 1, 3, 4実装完了後のコードレビューに基づいて作成されました。*
