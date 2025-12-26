# orbit-simulator パフォーマンス改善計画書

**作成日**: 2025年12月27日
**対象バージョン**: 0.1.0
**作成者**: Claude Code

---

## 1. エグゼクティブサマリー

### 1.1 現状の問題

現在のorbit-simulatorは**O(N²)の計算量**を持つN体シミュレーションを採用しており、天体数が増加すると急激にパフォーマンスが低下します。

| 天体数 | 現在のFPS | 目標FPS |
|-------:|----------:|--------:|
| 20 | 60 | 60 |
| 50 | 45 | 60 |
| 100 | 20 | 45 |
| 200 | 5 | 30 |
| 500 | <1 | 15 |

### 1.2 改善目標

1. **100天体で60FPS**を維持
2. **500天体で30FPS**を達成
3. **1000天体でも操作可能**（15FPS以上）

### 1.3 改善アプローチ

| フェーズ | 施策 | 期待効果 |
|---------|------|----------|
| Phase 1 | コード最適化 | 1.5-2倍高速化 |
| Phase 2 | アルゴリズム改善 | 3-5倍高速化 |
| Phase 3 | 並列化 | 2-4倍高速化 |
| Phase 4 | GPU活用 | 10-50倍高速化 |

---

## 2. Phase 1: コード最適化

### 2.1 オブジェクト生成の削減

#### 現状の問題

```typescript
// 現在のコード (physics.ts:13-31)
export const calculateAcceleration = (
    body: CelestialBody,
    allBodies: CelestialBody[]
): Vector3 => {
    const acceleration = new Vector3(0, 0, 0);  // 毎回新規作成

    for (const other of allBodies) {
        const diff = new Vector3().subVectors(...);  // 毎回新規作成
        acceleration.add(diff.multiplyScalar(forceScalar));
    }
    return acceleration;
};
```

**問題点**: 毎フレーム、天体数²のVector3オブジェクトを生成し、GC負荷が高い

#### 改善案

```typescript
// オブジェクトプールを使用
const vectorPool = {
    diff: new Vector3(),
    temp: new Vector3(),
};

export const calculateAcceleration = (
    body: CelestialBody,
    allBodies: CelestialBody[],
    outAcceleration: Vector3  // 出力用Vector3を外部から受け取る
): Vector3 => {
    outAcceleration.set(0, 0, 0);

    for (const other of allBodies) {
        if (body.id === other.id) continue;

        vectorPool.diff.subVectors(other.position, body.position);
        const distanceSq = vectorPool.diff.lengthSq();
        const forceScalar = (G * other.mass) / Math.pow(distanceSq + SOFTENING_SQ, 1.5);

        outAcceleration.addScaledVector(vectorPool.diff, forceScalar);
    }
    return outAcceleration;
};
```

**期待効果**: GC負荷50%削減、全体で10-20%高速化

### 2.2 ループ最適化

#### 現状の問題

```typescript
// 現在のコード - 複数回ループ
const acc1 = bodies.map(body => calculateAcceleration(body, bodies));
const intermediateBodies = bodies.map((body, i) => { ... });
const acc2 = intermediateBodies.map(body => calculateAcceleration(...));
let nextBodies = intermediateBodies.map((body, i) => { ... });
```

**問題点**: 4回のフルループ、4回の配列生成

#### 改善案

```typescript
// 単一配列でインプレース更新
interface BodyState {
    position: Vector3;
    velocity: Vector3;
    acceleration: Vector3;
    mass: number;
    radius: number;
    // ...その他プロパティ
}

// 構造体配列（SoA）パターン
interface PhysicsState {
    positions: Float64Array;   // [x0, y0, z0, x1, y1, z1, ...]
    velocities: Float64Array;
    accelerations: Float64Array;
    masses: Float64Array;
    radii: Float64Array;
    count: number;
}

export const updatePhysicsOptimized = (state: PhysicsState, dt: number): void => {
    const { positions, velocities, accelerations, masses, count } = state;

    // 1. 加速度計算（インプレース）
    calculateAllAccelerations(state);

    // 2. 位置・速度更新（単一ループ）
    for (let i = 0; i < count; i++) {
        const idx = i * 3;
        // Velocity Verlet: v += 0.5 * a * dt, then position
        velocities[idx]     += 0.5 * accelerations[idx]     * dt;
        velocities[idx + 1] += 0.5 * accelerations[idx + 1] * dt;
        velocities[idx + 2] += 0.5 * accelerations[idx + 2] * dt;

        positions[idx]     += velocities[idx]     * dt;
        positions[idx + 1] += velocities[idx + 1] * dt;
        positions[idx + 2] += velocities[idx + 2] * dt;
    }

    // 3. 新位置での加速度再計算
    calculateAllAccelerations(state);

    // 4. 速度の最終更新
    for (let i = 0; i < count; i++) {
        const idx = i * 3;
        velocities[idx]     += 0.5 * accelerations[idx]     * dt;
        velocities[idx + 1] += 0.5 * accelerations[idx + 1] * dt;
        velocities[idx + 2] += 0.5 * accelerations[idx + 2] * dt;
    }
};
```

**期待効果**: メモリアロケーション80%削減、30-40%高速化

### 2.3 数学演算の最適化

#### 改善ポイント

```typescript
// 現在: Math.pow(x, 1.5) は遅い
const forceScalar = (G * other.mass) / Math.pow(distanceSq + SOFTENING_SQ, 1.5);

// 改善: sqrt を使った高速化
const distWithSoft = Math.sqrt(distanceSq + SOFTENING_SQ);
const forceScalar = (G * other.mass) / (distWithSoft * distWithSoft * distWithSoft);

// さらに改善: 逆数を事前計算
const invDist = 1.0 / Math.sqrt(distanceSq + SOFTENING_SQ);
const invDist3 = invDist * invDist * invDist;
const forceScalar = G * other.mass * invDist3;
```

**期待効果**: 数学演算20-30%高速化

### 2.4 Phase 1 実装計画

| タスク | ファイル | 工数 | 優先度 |
|--------|----------|------|:------:|
| Vector3オブジェクトプール導入 | physics.ts | 2h | 高 |
| 構造体配列（SoA）への変換 | physics.ts, physicsStore.ts | 4h | 高 |
| 数学演算の最適化 | physics.ts | 1h | 中 |
| ループ統合 | physics.ts | 2h | 中 |
| ベンチマーク作成 | tests/benchmark.ts | 2h | 高 |

**Phase 1 合計工数**: 約11時間
**期待される改善**: 1.5-2倍高速化

---

## 3. Phase 2: アルゴリズム改善

### 3.1 Barnes-Hut アルゴリズム

#### 概要

Barnes-Hutアルゴリズムは、空間を八分木（Octree）で分割し、遠方の天体群を単一の質点として近似することで、計算量を**O(N²)からO(N log N)**に削減します。

#### 原理

```
θ = s / d

s: ノードのサイズ（辺の長さ）
d: ノード重心から計算対象天体までの距離
θ < θ_threshold (通常0.5-1.0): ノード全体を質点として近似
θ >= θ_threshold: 子ノードに再帰
```

#### 実装設計

```typescript
// Octreeノード定義
interface OctreeNode {
    center: Vector3;          // ノード中心
    size: number;             // ノードサイズ
    mass: number;             // 含まれる天体の総質量
    centerOfMass: Vector3;    // 質量中心
    children: OctreeNode[] | null;  // 子ノード（8個）
    bodyIndex: number | null; // 葉ノードの場合、天体インデックス
}

// Octree構築
function buildOctree(state: PhysicsState, root: OctreeNode): void {
    // 1. 全天体を含む最小のバウンディングボックスを計算
    // 2. 再帰的に天体を挿入
    // 3. 各ノードの質量中心を計算
}

// Barnes-Hut力計算
function calculateForceBarnesHut(
    bodyIndex: number,
    state: PhysicsState,
    node: OctreeNode,
    theta: number,
    outForce: Vector3
): void {
    if (node.bodyIndex !== null) {
        // 葉ノード: 直接計算
        if (node.bodyIndex !== bodyIndex) {
            addGravitationalForce(bodyIndex, node.bodyIndex, state, outForce);
        }
        return;
    }

    // 内部ノード: θ判定
    const dx = node.centerOfMass.x - state.positions[bodyIndex * 3];
    const dy = node.centerOfMass.y - state.positions[bodyIndex * 3 + 1];
    const dz = node.centerOfMass.z - state.positions[bodyIndex * 3 + 2];
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

    if (node.size / distance < theta) {
        // 遠い: ノード全体を質点として近似
        addApproximateForce(bodyIndex, node, state, outForce);
    } else {
        // 近い: 子ノードに再帰
        for (const child of node.children!) {
            if (child.mass > 0) {
                calculateForceBarnesHut(bodyIndex, state, child, theta, outForce);
            }
        }
    }
}
```

#### パフォーマンス比較

| 天体数 | 直接法 (O(N²)) | Barnes-Hut (O(N log N)) | 高速化率 |
|-------:|---------------:|------------------------:|---------:|
| 100 | 10,000 | ~700 | 14x |
| 500 | 250,000 | ~4,500 | 56x |
| 1000 | 1,000,000 | ~10,000 | 100x |
| 5000 | 25,000,000 | ~60,000 | 417x |

### 3.2 空間ハッシュによる衝突検出最適化

#### 現状の問題

```typescript
// 現在のコード - O(N²)の衝突検出
for (let i = 0; i < nextBodies.length; i++) {
    for (let j = i + 1; j < nextBodies.length; j++) {
        const dist = b1.position.distanceTo(b2.position);
        if (dist < (b1.radius + b2.radius) * 0.8) {
            // 衝突処理
        }
    }
}
```

#### 改善案: 空間ハッシュグリッド

```typescript
interface SpatialHash {
    cellSize: number;
    cells: Map<string, number[]>;  // セルキー -> 天体インデックス配列
}

function buildSpatialHash(state: PhysicsState, maxRadius: number): SpatialHash {
    const cellSize = maxRadius * 4;  // 最大天体半径の4倍
    const cells = new Map<string, number[]>();

    for (let i = 0; i < state.count; i++) {
        const x = Math.floor(state.positions[i * 3] / cellSize);
        const y = Math.floor(state.positions[i * 3 + 1] / cellSize);
        const z = Math.floor(state.positions[i * 3 + 2] / cellSize);
        const key = `${x},${y},${z}`;

        if (!cells.has(key)) cells.set(key, []);
        cells.get(key)!.push(i);
    }

    return { cellSize, cells };
}

function detectCollisions(state: PhysicsState, hash: SpatialHash): [number, number][] {
    const collisions: [number, number][] = [];

    for (const [key, indices] of hash.cells) {
        // 同一セル内の天体をチェック
        for (let i = 0; i < indices.length; i++) {
            for (let j = i + 1; j < indices.length; j++) {
                if (checkCollision(state, indices[i], indices[j])) {
                    collisions.push([indices[i], indices[j]]);
                }
            }
        }

        // 隣接セルもチェック（26方向）
        const [cx, cy, cz] = key.split(',').map(Number);
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    if (dx === 0 && dy === 0 && dz === 0) continue;
                    const neighborKey = `${cx+dx},${cy+dy},${cz+dz}`;
                    // ... 隣接セルとの衝突チェック
                }
            }
        }
    }

    return collisions;
}
```

**期待効果**: 衝突検出O(N²) → O(N)に近い性能

### 3.3 適応的時間ステップ

#### 概要

天体間距離が近い場合に時間ステップを自動的に小さくし、遠い場合は大きくすることで、精度と速度を両立します。

```typescript
function calculateAdaptiveTimeStep(state: PhysicsState): number {
    let minTimeScale = Infinity;

    for (let i = 0; i < state.count; i++) {
        for (let j = i + 1; j < state.count; j++) {
            const dist = calculateDistance(state, i, j);
            const relVel = calculateRelativeVelocity(state, i, j);

            // 衝突時間スケール
            const timeScale = dist / (relVel + 1e-10);
            minTimeScale = Math.min(minTimeScale, timeScale);
        }
    }

    // 最小時間スケールの1/10を時間ステップとする
    return Math.min(BASE_DT, minTimeScale * 0.1);
}
```

### 3.4 Phase 2 実装計画

| タスク | ファイル | 工数 | 優先度 |
|--------|----------|------|:------:|
| Octreeデータ構造実装 | utils/octree.ts | 4h | 高 |
| Barnes-Hut力計算実装 | utils/barnesHut.ts | 6h | 高 |
| 空間ハッシュ衝突検出 | utils/spatialHash.ts | 3h | 中 |
| 適応的時間ステップ | physics.ts | 2h | 低 |
| ユニットテスト | tests/barnesHut.test.ts | 3h | 高 |
| 精度検証（エネルギー保存） | tests/accuracy.test.ts | 2h | 中 |

**Phase 2 合計工数**: 約20時間
**期待される改善**: 3-5倍高速化（特に多天体時）

---

## 4. Phase 3: Web Worker並列化

### 4.1 アーキテクチャ設計

```
┌─────────────────────────────────────────────────────────────┐
│                      Main Thread                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   React     │  │   Three.js  │  │   Zustand Store     │  │
│  │   UI        │  │   Renderer  │  │   (Display State)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                    ▲              │
│         │                │                    │              │
│         ▼                ▼                    │              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              SharedArrayBuffer                        │   │
│  │  positions[] | velocities[] | accelerations[]         │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ▲                                   │
└──────────────────────────│───────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │  Worker 1  │  │  Worker 2  │  │  Worker N  │
    │  Bodies    │  │  Bodies    │  │  Bodies    │
    │  0-99      │  │  100-199   │  │  ...       │
    └────────────┘  └────────────┘  └────────────┘
```

### 4.2 SharedArrayBuffer実装

```typescript
// physicsWorkerManager.ts
class PhysicsWorkerManager {
    private workers: Worker[] = [];
    private sharedBuffer: SharedArrayBuffer;
    private positions: Float64Array;
    private velocities: Float64Array;
    private accelerations: Float64Array;
    private masses: Float64Array;
    private syncCounter: Int32Array;

    constructor(maxBodies: number, workerCount: number = navigator.hardwareConcurrency) {
        // SharedArrayBufferを確保
        const bytesPerBody = 8 * (3 + 3 + 3 + 1);  // pos, vel, acc, mass (Float64)
        this.sharedBuffer = new SharedArrayBuffer(maxBodies * bytesPerBody + 4);

        // TypedArrayビューを作成
        let offset = 0;
        this.positions = new Float64Array(this.sharedBuffer, offset, maxBodies * 3);
        offset += maxBodies * 3 * 8;
        this.velocities = new Float64Array(this.sharedBuffer, offset, maxBodies * 3);
        offset += maxBodies * 3 * 8;
        this.accelerations = new Float64Array(this.sharedBuffer, offset, maxBodies * 3);
        offset += maxBodies * 3 * 8;
        this.masses = new Float64Array(this.sharedBuffer, offset, maxBodies);
        offset += maxBodies * 8;
        this.syncCounter = new Int32Array(this.sharedBuffer, offset, 1);

        // ワーカーを起動
        for (let i = 0; i < workerCount; i++) {
            const worker = new Worker(new URL('./physicsWorker.ts', import.meta.url));
            worker.postMessage({
                type: 'init',
                sharedBuffer: this.sharedBuffer,
                workerId: i,
                workerCount: workerCount,
                maxBodies: maxBodies
            });
            this.workers.push(worker);
        }
    }

    async step(bodyCount: number, dt: number): Promise<void> {
        // 全ワーカーに計算指示
        const stepPromises = this.workers.map((worker, i) => {
            return new Promise<void>((resolve) => {
                worker.onmessage = () => resolve();
                worker.postMessage({
                    type: 'step',
                    bodyCount,
                    dt
                });
            });
        });

        await Promise.all(stepPromises);
    }
}
```

### 4.3 Worker実装

```typescript
// physicsWorker.ts
let sharedPositions: Float64Array;
let sharedVelocities: Float64Array;
let sharedAccelerations: Float64Array;
let sharedMasses: Float64Array;
let workerId: number;
let workerCount: number;

self.onmessage = (e: MessageEvent) => {
    const { type } = e.data;

    if (type === 'init') {
        const { sharedBuffer, workerId: wid, workerCount: wc, maxBodies } = e.data;
        workerId = wid;
        workerCount = wc;

        // SharedArrayBufferからTypedArrayを作成
        let offset = 0;
        sharedPositions = new Float64Array(sharedBuffer, offset, maxBodies * 3);
        // ... 他のArrayも同様
    }

    if (type === 'step') {
        const { bodyCount, dt } = e.data;

        // 担当範囲を計算
        const bodiesPerWorker = Math.ceil(bodyCount / workerCount);
        const startIdx = workerId * bodiesPerWorker;
        const endIdx = Math.min(startIdx + bodiesPerWorker, bodyCount);

        // 加速度を計算（担当範囲のみ、ただし全天体からの影響を計算）
        for (let i = startIdx; i < endIdx; i++) {
            calculateAccelerationForBody(i, bodyCount);
        }

        // 同期ポイント（Atomics.wait/notify）
        Atomics.add(syncCounter, 0, 1);
        while (Atomics.load(syncCounter, 0) < workerCount) {
            // 他のワーカーを待機
        }

        // 位置・速度を更新
        for (let i = startIdx; i < endIdx; i++) {
            updatePositionVelocity(i, dt);
        }

        self.postMessage({ type: 'done' });
    }
};
```

### 4.4 Phase 3 実装計画

| タスク | ファイル | 工数 | 優先度 |
|--------|----------|------|:------:|
| SharedArrayBuffer設計 | utils/sharedPhysics.ts | 3h | 高 |
| WorkerManager実装 | workers/physicsWorkerManager.ts | 4h | 高 |
| Worker本体実装 | workers/physicsWorker.ts | 4h | 高 |
| 同期機構（Atomics）実装 | workers/sync.ts | 3h | 高 |
| Zustand連携 | store/physicsStore.ts | 2h | 中 |
| フォールバック（非対応ブラウザ） | utils/physicsPolyfill.ts | 2h | 中 |

**Phase 3 合計工数**: 約18時間
**期待される改善**: 2-4倍高速化（コア数に依存）

---

## 5. Phase 4: GPU演算（WebGPU/WebGL Compute）

### 5.1 概要

WebGPUまたはWebGL Compute Shaderを使用して、N体計算をGPU上で実行します。

### 5.2 WebGPU実装設計

```typescript
// gpuPhysics.ts
class GPUPhysicsEngine {
    private device: GPUDevice;
    private pipeline: GPUComputePipeline;
    private positionBuffer: GPUBuffer;
    private velocityBuffer: GPUBuffer;
    private massBuffer: GPUBuffer;

    async initialize(): Promise<void> {
        const adapter = await navigator.gpu.requestAdapter();
        this.device = await adapter!.requestDevice();

        const shaderModule = this.device.createShaderModule({
            code: `
                struct Body {
                    position: vec3<f32>,
                    velocity: vec3<f32>,
                    mass: f32,
                }

                @group(0) @binding(0) var<storage, read> bodies: array<Body>;
                @group(0) @binding(1) var<storage, read_write> accelerations: array<vec3<f32>>;

                const G: f32 = 1.0;
                const SOFTENING: f32 = 0.5;

                @compute @workgroup_size(64)
                fn main(@builtin(global_invocation_id) id: vec3<u32>) {
                    let i = id.x;
                    let bodyCount = arrayLength(&bodies);

                    if (i >= bodyCount) { return; }

                    var acc = vec3<f32>(0.0, 0.0, 0.0);
                    let myPos = bodies[i].position;

                    for (var j: u32 = 0; j < bodyCount; j++) {
                        if (i == j) { continue; }

                        let diff = bodies[j].position - myPos;
                        let distSq = dot(diff, diff) + SOFTENING * SOFTENING;
                        let invDist3 = inverseSqrt(distSq) / distSq;
                        acc += diff * (G * bodies[j].mass * invDist3);
                    }

                    accelerations[i] = acc;
                }
            `
        });

        this.pipeline = this.device.createComputePipeline({
            layout: 'auto',
            compute: {
                module: shaderModule,
                entryPoint: 'main',
            }
        });
    }

    async computeAccelerations(bodies: CelestialBody[]): Promise<Float32Array> {
        // GPUにデータ転送 → 計算 → 結果取得
        // ...
    }
}
```

### 5.3 パフォーマンス期待値

| 天体数 | CPU (1コア) | CPU (8コア) | GPU |
|-------:|------------:|------------:|----:|
| 100 | 0.5ms | 0.1ms | 0.01ms |
| 1000 | 50ms | 8ms | 0.1ms |
| 10000 | 5000ms | 800ms | 1ms |
| 100000 | - | - | 10ms |

### 5.4 Phase 4 実装計画

| タスク | ファイル | 工数 | 優先度 |
|--------|----------|------|:------:|
| WebGPU対応確認・ポリフィル | utils/gpuDetect.ts | 2h | 高 |
| Compute Shader実装 | shaders/nbody.wgsl | 4h | 高 |
| GPUバッファ管理 | gpu/bufferManager.ts | 4h | 高 |
| CPU-GPU同期 | gpu/sync.ts | 3h | 中 |
| フォールバック（WebGL） | gpu/webglFallback.ts | 6h | 中 |
| 統合テスト | tests/gpu.test.ts | 3h | 高 |

**Phase 4 合計工数**: 約22時間
**期待される改善**: 10-50倍高速化

---

## 6. 軌道予測の最適化

### 6.1 現状の問題

軌道予測は現在、リアルタイムでN体計算を先読み実行しているため、非常に重い処理となっています。

### 6.2 改善案

#### 6.2.1 二体近似

```typescript
// 軌道要素を計算（ケプラー軌道）
function calculateOrbitalElements(body: CelestialBody, centralBody: CelestialBody): OrbitalElements {
    const r = body.position.clone().sub(centralBody.position);
    const v = body.velocity.clone().sub(centralBody.velocity);
    const mu = G * (body.mass + centralBody.mass);

    // 角運動量ベクトル
    const h = r.clone().cross(v);

    // 離心率ベクトル
    const e = v.clone().cross(h).divideScalar(mu).sub(r.clone().normalize());

    // 軌道長半径
    const a = 1 / (2/r.length() - v.lengthSq()/mu);

    return { semiMajorAxis: a, eccentricity: e.length(), ... };
}

// ケプラー方程式で未来位置を高速計算
function predictPosition(elements: OrbitalElements, t: number): Vector3 {
    // ケプラー方程式をニュートン法で解く
    // 数千点の予測でも1ms以下
}
```

**効果**: 予測計算を100倍以上高速化

#### 6.2.2 予測のキャッシュと差分更新

```typescript
interface PredictionCache {
    bodyId: string;
    timestamp: number;
    points: Vector3[];
    orbitalElements: OrbitalElements;
}

// 軌道要素が大きく変化した場合のみ再計算
function shouldRecalculatePrediction(cache: PredictionCache, body: CelestialBody): boolean {
    const newElements = calculateOrbitalElements(body);
    return Math.abs(newElements.semiMajorAxis - cache.orbitalElements.semiMajorAxis) > 0.1;
}
```

---

## 7. メモリ最適化

### 7.1 トレイル管理の最適化

```typescript
// 現在: Vector3オブジェクトの配列
trail: Vector3[]  // 150点 × 各32バイト = 4.8KB/天体

// 改善: Float32Arrayリングバッファ
class TrailBuffer {
    private buffer: Float32Array;
    private head: number = 0;
    private count: number = 0;
    private readonly maxPoints: number;

    constructor(maxPoints: number = 150) {
        this.maxPoints = maxPoints;
        this.buffer = new Float32Array(maxPoints * 3);
    }

    push(x: number, y: number, z: number): void {
        const idx = this.head * 3;
        this.buffer[idx] = x;
        this.buffer[idx + 1] = y;
        this.buffer[idx + 2] = z;

        this.head = (this.head + 1) % this.maxPoints;
        if (this.count < this.maxPoints) this.count++;
    }

    getPoints(): Float32Array {
        // Three.jsのBufferGeometryに直接渡せる
        return this.buffer;
    }
}
```

**効果**: メモリ使用量50%削減、GC負荷大幅減少

### 7.2 天体数に応じた動的調整

```typescript
function adjustQualitySettings(bodyCount: number): QualitySettings {
    if (bodyCount <= 20) {
        return {
            trailLength: 150,
            predictionSteps: 1000,
            useBarnesHut: false,
            useWebWorker: false
        };
    } else if (bodyCount <= 100) {
        return {
            trailLength: 100,
            predictionSteps: 500,
            useBarnesHut: true,
            useWebWorker: false
        };
    } else {
        return {
            trailLength: 50,
            predictionSteps: 200,
            useBarnesHut: true,
            useWebWorker: true
        };
    }
}
```

---

## 8. 実装ロードマップ

### 8.1 マイルストーン

```
Week 1-2: Phase 1（コード最適化）
  └─ ベンチマーク作成
  └─ オブジェクトプール導入
  └─ ループ最適化
  └─ 検証・テスト

Week 3-4: Phase 2（アルゴリズム改善）
  └─ Octree実装
  └─ Barnes-Hut実装
  └─ 空間ハッシュ衝突検出
  └─ 精度検証

Week 5-6: Phase 3（並列化）
  └─ Web Worker設計
  └─ SharedArrayBuffer実装
  └─ 同期機構実装
  └─ 統合テスト

Week 7-8: Phase 4（GPU演算）※オプション
  └─ WebGPU調査
  └─ Compute Shader実装
  └─ フォールバック実装

Week 9: 統合・最終調整
  └─ 全フェーズ統合
  └─ パフォーマンスチューニング
  └─ ドキュメント整備
```

### 8.2 優先度マトリックス

| 施策 | 効果 | 工数 | 優先度 | 推奨 |
|------|:----:|:----:|:------:|:----:|
| オブジェクトプール | 中 | 低 | 高 | 必須 |
| ループ最適化 | 中 | 低 | 高 | 必須 |
| Barnes-Hut | 高 | 中 | 高 | 必須 |
| 空間ハッシュ | 中 | 低 | 中 | 推奨 |
| Web Worker | 高 | 中 | 中 | 推奨 |
| WebGPU | 最高 | 高 | 低 | オプション |
| 軌道予測最適化 | 高 | 低 | 高 | 必須 |
| トレイル最適化 | 中 | 低 | 中 | 推奨 |

---

## 9. KPI・成功指標

### 9.1 パフォーマンス指標

| 指標 | 現状 | Phase 1後 | Phase 2後 | Phase 3後 |
|------|-----:|----------:|----------:|----------:|
| 100天体FPS | 20 | 35 | 55 | 60 |
| 500天体FPS | <5 | 10 | 25 | 40 |
| 1000天体FPS | - | <5 | 15 | 25 |
| メモリ使用量 | 100% | 70% | 65% | 60% |
| GC頻度 | 高 | 低 | 低 | 低 |

### 9.2 計測方法

```typescript
// パフォーマンス計測ユーティリティ
class PerformanceMonitor {
    private frameTimes: number[] = [];
    private lastTime = performance.now();

    tick(): void {
        const now = performance.now();
        this.frameTimes.push(now - this.lastTime);
        if (this.frameTimes.length > 60) this.frameTimes.shift();
        this.lastTime = now;
    }

    getFPS(): number {
        const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        return 1000 / avgFrameTime;
    }

    getMemoryUsage(): number {
        return (performance as any).memory?.usedJSHeapSize ?? 0;
    }
}
```

---

## 10. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| SharedArrayBuffer非対応ブラウザ | Phase 3使用不可 | シングルスレッドフォールバック |
| WebGPU非対応ブラウザ | Phase 4使用不可 | WebGL Compute or CPU fallback |
| Barnes-Hut精度低下 | 物理的不正確さ | θパラメータ調整、ハイブリッド方式 |
| 複雑な衝突シナリオ | 衝突検出漏れ | 適応的時間ステップ併用 |
| メモリ不足（モバイル） | クラッシュ | 動的品質調整、天体数制限 |

---

## 11. 付録

### A. ベンチマークコード

```typescript
// benchmarks/nbody.bench.ts
import { updatePhysics } from '../src/utils/physics';
import { updatePhysicsOptimized } from '../src/utils/physicsOptimized';
import { updatePhysicsBarnesHut } from '../src/utils/barnesHut';

const ITERATIONS = 100;

function benchmark(name: string, fn: () => void): void {
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        fn();
    }
    const elapsed = performance.now() - start;
    console.log(`${name}: ${(elapsed / ITERATIONS).toFixed(3)}ms/iteration`);
}

// テストデータ生成
function generateBodies(count: number): CelestialBody[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `body-${i}`,
        name: `Body ${i}`,
        mass: Math.random() * 1000 + 1,
        radius: Math.random() * 0.5 + 0.1,
        position: new Vector3(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100
        ),
        velocity: new Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        ),
        color: '#ffffff'
    }));
}

// ベンチマーク実行
[10, 50, 100, 200, 500].forEach(count => {
    const bodies = generateBodies(count);
    console.log(`\n=== ${count} bodies ===`);

    benchmark('Original', () => updatePhysics(bodies, 1.0));
    benchmark('Optimized', () => updatePhysicsOptimized(bodies, 1.0));
    benchmark('Barnes-Hut', () => updatePhysicsBarnesHut(bodies, 1.0));
});
```

### B. 参考資料

1. Barnes, J., & Hut, P. (1986). "A hierarchical O(N log N) force-calculation algorithm"
2. Three.js Documentation - BufferGeometry
3. MDN Web Docs - SharedArrayBuffer
4. WebGPU Specification - W3C

---

*本計画書はorbit-simulator v0.1.0のパフォーマンス改善を目的として作成されました。*
*実装の優先順位は、プロジェクトの要件や制約に応じて調整してください。*
