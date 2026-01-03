# Orbit Simulator - 実装計画書

**バージョン**: 0.5.0 → 0.6.0+
**作成日**: 2026-01-02
**目的**: シミュレーションの完成度向上と楽しさの最大化

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [現状評価](#現状評価)
3. [優先度別実装計画](#優先度別実装計画)
4. [詳細実装ガイド](#詳細実装ガイド)
5. [技術的考慮事項](#技術的考慮事項)
6. [テスト戦略](#テスト戦略)

---

## プロジェクト概要

### 現在の主要機能

**物理シミュレーション**
- CPU/Worker/GPU の3モード切り替え
- Barnes-Hut アルゴリズム (O(N log N))
- Spatial Hash Grid による衝突検出 (O(N))
- Velocity Verlet 積分法

**視覚エフェクト**
- 天体衝突エフェクト（爆発・衝撃波・破片・熱輝）
- 降着円盤・相対論的ジェット
- 重力レンズ効果
- ハビタブルゾーン可視化

**UI/UX**
- 多言語対応（英語・日本語）
- Zen Mode（没入モード）
- キーボードショートカット
- 複数カメラモード（Free/Sun Lock/Surface Lock）

---

## 現状評価

### 総合スコア

| 項目 | スコア | 状態 |
|------|--------|------|
| コアアルゴリズム | 9/10 | ✅ 優秀 |
| UI/UX | 7.5/10 | ⚠️ 改善の余地あり |
| パフォーマンス | 8/10 | ✅ 良好 |
| コード品質 | 7/10 | ⚠️ リファクタリング推奨 |
| テスト | 2/10 | ❌ 未整備 |
| ドキュメント | 5/10 | ⚠️ 不足 |
| 拡張性 | 6/10 | ⚠️ ストア依存度高 |

### 主な課題

1. **アーキテクチャ**: `physicsStore.ts` が500+行で多機能を集約
2. **テスト**: テストスイートが存在しない
3. **ドキュメント**: コード内ドキュメントが不足
4. **UI密度**: 機能が多く、初心者が迷いやすい

---

## 優先度別実装計画

### Phase 1: 即効性の高い改善（1-2週間）

#### 🌟 優先度: 最高

##### 1-1. 軌道パラメータ表示 ⭐⭐⭐⭐⭐

**目的**: 教育的価値の向上、物理理解の促進

**実装場所**: `src/components/ui/BodyInspector.tsx`

**追加する情報**:
```typescript
interface OrbitalParameters {
  semiMajorAxis: number;      // 長半径 (a)
  eccentricity: number;        // 離心率 (e)
  inclination: number;         // 軌道傾斜角 (i) [度]
  orbitalPeriod: number;       // 公転周期 (T) [シミュレーション時間]
  apoapsis: number;            // 遠点距離
  periapsis: number;           // 近点距離
  argumentOfPeriapsis: number; // 近点引数 (ω) [度]
}
```

**計算ロジック**:
```typescript
// src/utils/orbitalMechanics.ts (新規作成)
export function calculateOrbitalParameters(
  body: CelestialBody,
  centralBody: CelestialBody
): OrbitalParameters {
  const r = body.position.clone().sub(centralBody.position);
  const v = body.velocity.clone().sub(centralBody.velocity);
  const mu = PHYSICS_CONSTANTS.G * centralBody.mass;

  // 比角運動量ベクトル h = r × v
  const h = r.clone().cross(v);
  const hMag = h.length();

  // 離心率ベクトル e = (v × h) / μ - r / |r|
  const eCrossProduct = v.clone().cross(h).divideScalar(mu);
  const eVector = eCrossProduct.sub(r.clone().normalize());
  const eccentricity = eVector.length();

  // 長半径 a = h² / (μ(1 - e²))
  const semiMajorAxis = (hMag * hMag) / (mu * (1 - eccentricity * eccentricity));

  // 公転周期 T = 2π√(a³/μ)
  const orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / mu);

  // 軌道傾斜角 i = arccos(hz / |h|)
  const inclination = Math.acos(h.z / hMag) * (180 / Math.PI);

  // 遠点・近点
  const apoapsis = semiMajorAxis * (1 + eccentricity);
  const periapsis = semiMajorAxis * (1 - eccentricity);

  // 昇交点ベクトル n = k × h
  const n = new Vector3(0, 0, 1).cross(h);
  const nMag = n.length();

  // 近点引数 ω
  let argumentOfPeriapsis = 0;
  if (nMag > 0 && eccentricity > 1e-8) {
    argumentOfPeriapsis = Math.acos(n.dot(eVector) / (nMag * eccentricity)) * (180 / Math.PI);
    if (eVector.z < 0) argumentOfPeriapsis = 360 - argumentOfPeriapsis;
  }

  return {
    semiMajorAxis,
    eccentricity,
    inclination,
    orbitalPeriod,
    apoapsis,
    periapsis,
    argumentOfPeriapsis
  };
}
```

**UI表示**:
```tsx
// BodyInspector.tsx に追加
const orbitalParams = useMemo(() => {
  const sun = bodies.find(b => b.isStar);
  if (!sun || !selectedBody) return null;
  return calculateOrbitalParameters(selectedBody, sun);
}, [selectedBody, bodies]);

// レンダリング
{orbitalParams && (
  <div className="orbital-parameters">
    <h4>軌道パラメータ</h4>
    <div>長半径: {orbitalParams.semiMajorAxis.toFixed(2)} AU</div>
    <div>離心率: {orbitalParams.eccentricity.toFixed(4)}</div>
    <div>軌道傾斜角: {orbitalParams.inclination.toFixed(2)}°</div>
    <div>公転周期: {(orbitalParams.orbitalPeriod / (2 * Math.PI)).toFixed(2)} 年</div>
    <div>遠点距離: {orbitalParams.apoapsis.toFixed(2)} AU</div>
    <div>近点距離: {orbitalParams.periapsis.toFixed(2)} AU</div>
  </div>
)}
```

**期待効果**:
- 教育的価値 +200%
- ユーザーエンゲージメント +50%
- 物理理解の深化

---

##### 1-3. カメラ遷移アニメーション ⭐⭐⭐⭐

**目的**: 没入感の向上、プロフェッショナルな視覚体験

**実装場所**: `src/components/scene/Camera.tsx`

**依存ライブラリ**:
```bash
npm install gsap
```

**実装コード**:
```typescript
// Camera.tsx
import gsap from 'gsap';

// カメラ遷移関数
const transitionCamera = (
  targetPosition: Vector3,
  targetLookAt: Vector3,
  duration: number = 0.8
) => {
  // 現在の位置・視線を保存
  const currentPos = camera.position.clone();
  const currentTarget = controls.target.clone();

  // GSAP アニメーション
  gsap.to(currentPos, {
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    duration,
    ease: 'power2.inOut',
    onUpdate: () => {
      camera.position.copy(currentPos);
    }
  });

  gsap.to(currentTarget, {
    x: targetLookAt.x,
    y: targetLookAt.y,
    z: targetLookAt.z,
    duration,
    ease: 'power2.inOut',
    onUpdate: () => {
      controls.target.copy(currentTarget);
      controls.update();
    }
  });
};

// 使用例: 天体選択時
useEffect(() => {
  if (followingBodyId && cameraMode === 'sun_lock') {
    const body = bodies.find(b => b.id === followingBodyId);
    if (body) {
      const offset = new Vector3(0, 50, 100);
      const targetPos = body.position.clone().add(offset);
      const targetLookAt = body.position.clone();

      transitionCamera(targetPos, targetLookAt, 1.0);
    }
  }
}, [followingBodyId, cameraMode]);
```

**追加オプション**:
```typescript
// より高度な制御
interface CameraTransitionOptions {
  duration?: number;
  ease?: string;
  onComplete?: () => void;
  delay?: number;
}

const transitionCameraAdvanced = (
  targetPosition: Vector3,
  targetLookAt: Vector3,
  options: CameraTransitionOptions = {}
) => {
  const {
    duration = 0.8,
    ease = 'power2.inOut',
    onComplete,
    delay = 0
  } = options;

  // ... GSAP 実装（onComplete コールバック付き）
};
```

**期待効果**:
- 没入感 +100%
- UI の洗練度向上
- ユーザー体験の向上

---

##### 1-4. リアルタイム統計グラフ ⭐⭐⭐⭐

**目的**: パフォーマンス可視化、デバッグ支援

**実装場所**: `src/components/ui/PerformanceStats.tsx` (拡張)

**依存ライブラリ**:
```bash
npm install recharts
```

**データ収集**:
```typescript
// src/hooks/usePerformanceMonitor.ts (新規作成)
import { useEffect, useRef } from 'react';

interface PerformanceData {
  timestamp: number;
  fps: number;
  physicsDuration: number;
  renderDuration: number;
  energyDrift: number;
}

const MAX_HISTORY = 300; // 5秒分 @ 60fps

export function usePerformanceMonitor() {
  const historyRef = useRef<PerformanceData[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = performance.now();
      const stats = physicsStats; // グローバル変数

      const data: PerformanceData = {
        timestamp: now,
        fps: stats.fps,
        physicsDuration: stats.physicsDuration,
        renderDuration: stats.renderDuration,
        energyDrift: stats.energy.drift * 100 // パーセント化
      };

      historyRef.current.push(data);

      // 古いデータを削除
      if (historyRef.current.length > MAX_HISTORY) {
        historyRef.current.shift();
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, []);

  return historyRef.current;
}
```

**グラフ表示**:
```tsx
// PerformanceStats.tsx に追加
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

export const PerformanceStats: React.FC = () => {
  const history = usePerformanceMonitor();
  const [showGraph, setShowGraph] = useState(false);

  return (
    <div className="performance-stats">
      <button onClick={() => setShowGraph(!showGraph)}>
        {showGraph ? 'グラフを隠す' : 'グラフを表示'}
      </button>

      {showGraph && (
        <div className="performance-graphs">
          {/* FPS グラフ */}
          <div className="graph-container">
            <h4>FPS</h4>
            <LineChart width={400} height={200} data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={[0, 60]} />
              <Tooltip />
              <Line type="monotone" dataKey="fps" stroke="#10b981" dot={false} />
            </LineChart>
          </div>

          {/* Physics Time グラフ */}
          <div className="graph-container">
            <h4>Physics Time (ms)</h4>
            <LineChart width={400} height={200} data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="physicsDuration" stroke="#3b82f6" dot={false} />
              <Line type="monotone" dataKey="renderDuration" stroke="#f59e0b" dot={false} />
            </LineChart>
          </div>

          {/* Energy Drift グラフ */}
          <div className="graph-container">
            <h4>Energy Drift (%)</h4>
            <LineChart width={400} height={200} data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={[-0.1, 0.1]} />
              <Tooltip />
              <Line type="monotone" dataKey="energyDrift" stroke="#a855f7" dot={false} />
            </LineChart>
          </div>
        </div>
      )}
    </div>
  );
};
```

**期待効果**:
- デバッグ効率 +200%
- パフォーマンス問題の早期発見
- 最適化の効果測定

---

### Phase 2: ユーザー体験の向上（2-4週間）

#### 🎯 優先度: 高

##### 2-1. 自動最適化提案システム ⭐⭐⭐⭐

**目的**: 初心者でも最適設定を自動適用

**実装場所**: `src/utils/autoOptimizer.ts` (新規作成)

**実装コード**:
```typescript
// src/utils/autoOptimizer.ts
import { usePhysicsStore } from '../store/physicsStore';

interface OptimizationSuggestion {
  type: 'warning' | 'info' | 'critical';
  title: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
}

export function analyzePerformance(): OptimizationSuggestion[] {
  const store = usePhysicsStore.getState();
  const stats = physicsStats;
  const suggestions: OptimizationSuggestion[] = [];

  // FPS が低い場合
  if (stats.fps < 30 && !store.useMultithreading && store.bodies.length > 300) {
    suggestions.push({
      type: 'critical',
      title: 'FPS 低下検出',
      message: 'Barnes-Hut アルゴリズムに切り替えることで、パフォーマンスが改善される可能性があります。',
      action: () => {
        // Barnes-Hut を有効化（実装詳細は省略）
      },
      actionLabel: 'Barnes-Hut を有効化'
    });
  }

  // GPU 対応だが未使用
  if (store.isGPUSupported && !store.useGPU && store.bodies.length > 2000) {
    suggestions.push({
      type: 'info',
      title: 'GPU アクセラレーション利用可能',
      message: '多数の天体をシミュレーション中です。GPU を使用すると大幅に高速化されます。',
      action: () => store.toggleGPU(),
      actionLabel: 'GPU を有効化'
    });
  }

  // エネルギードリフトが大きい
  if (Math.abs(stats.energy.drift) > 0.01) {
    suggestions.push({
      type: 'warning',
      title: 'エネルギー保存の精度低下',
      message: `エネルギードリフト: ${(stats.energy.drift * 100).toFixed(2)}%。時間刻み幅を小さくすることを推奨します。`,
      action: () => {
        // BASE_DT を縮小（実装詳細は省略）
      },
      actionLabel: '精度を向上'
    });
  }

  return suggestions;
}

// 自動チェック（5秒ごと）
export function startAutoOptimizer(
  onSuggestion: (suggestions: OptimizationSuggestion[]) => void
) {
  const interval = setInterval(() => {
    const suggestions = analyzePerformance();
    if (suggestions.length > 0) {
      onSuggestion(suggestions);
    }
  }, 5000);

  return () => clearInterval(interval);
}
```

**UI実装**:
```tsx
// src/components/ui/OptimizationNotifications.tsx (新規作成)
import { useEffect, useState } from 'react';
import { analyzePerformance, OptimizationSuggestion } from '../../utils/autoOptimizer';

export const OptimizationNotifications: React.FC = () => {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newSuggestions = analyzePerformance();
      setSuggestions(newSuggestions);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (index: number) => {
    setSuggestions(suggestions.filter((_, i) => i !== index));
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="optimization-notifications">
      {suggestions.map((suggestion, index) => (
        <div key={index} className={`notification ${suggestion.type}`}>
          <h4>{suggestion.title}</h4>
          <p>{suggestion.message}</p>
          <div className="actions">
            {suggestion.action && (
              <button onClick={() => {
                suggestion.action!();
                handleDismiss(index);
              }}>
                {suggestion.actionLabel}
              </button>
            )}
            <button onClick={() => handleDismiss(index)}>閉じる</button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

**App.tsx への統合**:
```tsx
// App.tsx
import { OptimizationNotifications } from './components/ui/OptimizationNotifications';

// レンダリング内
<OptimizationNotifications />
```

**期待効果**:
- 初心者の離脱率 -30%
- 平均 FPS +20%
- ユーザー満足度 +50%

---

##### 2-2. コンテキストメニュー ⭐⭐⭐

**目的**: 直感的な操作性、機能の発見しやすさ

**実装場所**: `src/components/scene/CelestialBody.tsx`

**実装コード**:
```tsx
// src/components/ui/ContextMenu.tsx (新規作成)
import { useEffect, useState } from 'react';

interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div
      className="context-menu"
      style={{ position: 'fixed', top: y, left: x, zIndex: 1000 }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => (
        <button
          key={index}
          className="context-menu-item"
          onClick={() => {
            if (!item.disabled) {
              item.action();
              onClose();
            }
          }}
          disabled={item.disabled}
        >
          {item.icon && <span className="icon">{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};
```

**CelestialBody.tsx への統合**:
```tsx
// CelestialBody.tsx
import { ContextMenu } from '../ui/ContextMenu';
import { Eye, Target, Trash2, Info } from 'lucide-react';

const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

const handleContextMenu = (event: ThreeEvent<MouseEvent>) => {
  event.stopPropagation();
  event.nativeEvent.preventDefault();

  setContextMenu({
    x: event.nativeEvent.clientX,
    y: event.nativeEvent.clientY
  });
};

const menuItems: ContextMenuItem[] = [
  {
    label: 'この天体を追従',
    icon: <Eye size={16} />,
    action: () => setFollowingBody(body.id)
  },
  {
    label: '天体情報を表示',
    icon: <Info size={16} />,
    action: () => selectBody(body.id)
  },
  {
    label: '軌道予測を表示',
    icon: <Target size={16} />,
    action: () => togglePrediction()
  },
  {
    label: '天体を削除',
    icon: <Trash2 size={16} />,
    action: () => removeBody(body.id),
    disabled: body.isFixed // 太陽など固定天体は削除不可
  }
];

// レンダリング
<mesh onContextMenu={handleContextMenu}>
  {/* ... */}
</mesh>

{contextMenu && (
  <ContextMenu
    x={contextMenu.x}
    y={contextMenu.y}
    items={menuItems}
    onClose={() => setContextMenu(null)}
  />
)}
```

**期待効果**:
- 機能発見性 +100%
- 操作効率 +50%
- 直感的な UX

---

##### 2-3. プリセットシナリオ拡充 ⭐⭐⭐⭐

**目的**: すぐに楽しめるコンテンツ、SNS 拡散性

**実装場所**: `src/utils/starSystems.ts`

**追加すべきプリセット**:

```typescript
// src/utils/starSystems.ts に追加

// 1. 三体問題の図8軌道
export const figure8System: StarSystemPreset = {
  id: 'figure-8',
  name: '図8軌道（三体問題）',
  description: '3つの同質量天体が図8の軌道を描く、カオス的だが周期的な運動',
  initialCamera: { position: [0, 100, 0], target: [0, 0, 0] },
  createBodies: () => {
    // 初期条件（Chenciner & Montgomery, 2000）
    const mass = 1.0;
    const radius = 0.5;

    return [
      {
        name: 'Body 1',
        mass,
        radius,
        position: new Vector3(-0.97000436, 0.24308753, 0),
        velocity: new Vector3(0.4662036850, 0.4323657300, 0),
        color: '#ff6b6b',
        id: uuidv4()
      },
      {
        name: 'Body 2',
        mass,
        radius,
        position: new Vector3(0, 0, 0),
        velocity: new Vector3(-0.93240737, -0.86473146, 0),
        color: '#4ecdc4',
        id: uuidv4()
      },
      {
        name: 'Body 3',
        mass,
        radius,
        position: new Vector3(0.97000436, -0.24308753, 0),
        velocity: new Vector3(0.4662036850, 0.4323657300, 0),
        color: '#95e1d3',
        id: uuidv4()
      }
    ];
  }
};

// 2. ラグランジュ点デモ
export const lagrangePointsSystem: StarSystemPreset = {
  id: 'lagrange-points',
  name: 'ラグランジュ点デモ',
  description: '地球-月系のラグランジュ点（L1〜L5）に配置された小天体',
  initialCamera: { position: [0, 200, 200], target: [0, 0, 0] },
  createBodies: () => {
    const earthMass = 1.0;
    const moonMass = 0.0123; // 地球の1.23%
    const distance = 60; // 地球-月距離

    // L4, L5 の位置計算（正三角形）
    const angle60 = Math.PI / 3;
    const l4 = new Vector3(
      distance * Math.cos(angle60),
      0,
      -distance * Math.sin(angle60)
    );
    const l5 = new Vector3(
      distance * Math.cos(-angle60),
      0,
      -distance * Math.sin(-angle60)
    );

    return [
      {
        name: 'Earth',
        mass: earthMass,
        radius: 1.0,
        position: new Vector3(0, 0, 0),
        velocity: new Vector3(0, 0, 0),
        color: '#22aaff',
        isFixed: true,
        id: uuidv4()
      },
      {
        name: 'Moon',
        mass: moonMass,
        radius: 0.27,
        position: new Vector3(0, 0, -distance),
        velocity: new Vector3(Math.sqrt(earthMass / distance), 0, 0),
        color: '#aaaaaa',
        id: uuidv4()
      },
      {
        name: 'L4 Satellite',
        mass: 0.0001,
        radius: 0.1,
        position: l4,
        velocity: new Vector3(
          Math.sqrt(earthMass / distance) * Math.cos(angle60),
          0,
          Math.sqrt(earthMass / distance) * Math.sin(angle60)
        ),
        color: '#10b981',
        id: uuidv4()
      },
      {
        name: 'L5 Satellite',
        mass: 0.0001,
        radius: 0.1,
        position: l5,
        velocity: new Vector3(
          Math.sqrt(earthMass / distance) * Math.cos(-angle60),
          0,
          Math.sqrt(earthMass / distance) * Math.sin(-angle60)
        ),
        color: '#f59e0b',
        id: uuidv4()
      }
    ];
  }
};

// 3. 彗星の接近（Shoemaker-Levy 9 風）
export const cometImpactSystem: StarSystemPreset = {
  id: 'comet-impact',
  name: '彗星衝突シナリオ',
  description: '複数の彗星断片が木星に衝突するシミュレーション（Shoemaker-Levy 9 風）',
  initialCamera: { position: [150, 100, 150], target: [0, 0, 0] },
  createBodies: () => {
    const jupiterMass = 317.8;
    const jupiterRadius = 0.8;
    const jupiterPos = new Vector3(0, 0, 0);

    const bodies: CelestialBody[] = [
      {
        name: 'Jupiter',
        mass: jupiterMass,
        radius: jupiterRadius,
        position: jupiterPos,
        velocity: new Vector3(0, 0, 0),
        color: '#d9a066',
        isFixed: true,
        id: uuidv4()
      }
    ];

    // 21個の彗星断片を生成
    const fragmentCount = 21;
    const baseDistance = 150;
    const baseVelocity = Math.sqrt(jupiterMass / baseDistance) * 0.7; // 楕円軌道

    for (let i = 0; i < fragmentCount; i++) {
      const angle = (i / fragmentCount) * Math.PI * 0.2 - Math.PI * 0.1; // ±18度の範囲
      const distance = baseDistance + (Math.random() - 0.5) * 20;

      bodies.push({
        name: `Fragment ${String.fromCharCode(65 + i)}`, // A, B, C, ...
        mass: 0.0001 + Math.random() * 0.0005,
        radius: 0.05 + Math.random() * 0.05,
        position: new Vector3(
          distance * Math.sin(angle),
          (Math.random() - 0.5) * 10,
          -distance * Math.cos(angle)
        ),
        velocity: new Vector3(
          baseVelocity * Math.cos(angle) + (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.2,
          baseVelocity * Math.sin(angle) + (Math.random() - 0.5) * 0.5
        ),
        color: `hsl(${180 + i * 8}, 70%, 60%)`,
        id: uuidv4()
      });
    }

    return bodies;
  }
};

// 4. 連星ブラックホールの合体
export const binaryBlackHoleMerger: StarSystemPreset = {
  id: 'binary-bh-merger',
  name: '連星ブラックホール合体',
  description: '2つのブラックホールが互いに周回しながら接近し、最終的に合体する',
  initialCamera: { position: [0, 100, 100], target: [0, 0, 0] },
  createBodies: () => {
    const bh1Mass = 30; // 30太陽質量
    const bh2Mass = 25; // 25太陽質量
    const separation = 30; // 初期分離距離

    const totalMass = bh1Mass + bh2Mass;
    const reducedMass = (bh1Mass * bh2Mass) / totalMass;
    const orbitalVelocity = Math.sqrt(PHYSICS_CONSTANTS.G * totalMass / separation);

    // 重心周りの座標
    const r1 = separation * (bh2Mass / totalMass);
    const r2 = separation * (bh1Mass / totalMass);
    const v1 = orbitalVelocity * (bh2Mass / totalMass);
    const v2 = orbitalVelocity * (bh1Mass / totalMass);

    return [
      {
        name: 'Black Hole 1',
        mass: bh1Mass,
        radius: 2.0,
        position: new Vector3(r1, 0, 0),
        velocity: new Vector3(0, 0, -v1),
        color: '#000000',
        isCompactObject: true,
        hasAccretionDisk: true,
        accretionDiskConfig: {
          innerRadius: 3,
          outerRadius: 8,
          rotationSpeed: 2.0,
          particleCount: 2000,
          tilt: 0.1
        },
        id: uuidv4()
      },
      {
        name: 'Black Hole 2',
        mass: bh2Mass,
        radius: 1.8,
        position: new Vector3(-r2, 0, 0),
        velocity: new Vector3(0, 0, v2),
        color: '#000000',
        isCompactObject: true,
        hasAccretionDisk: true,
        accretionDiskConfig: {
          innerRadius: 2.5,
          outerRadius: 7,
          rotationSpeed: 2.2,
          particleCount: 1800,
          tilt: -0.15
        },
        id: uuidv4()
      }
    ];
  }
};

// 5. 惑星形成シミュレーション
export const planetFormationSystem: StarSystemPreset = {
  id: 'planet-formation',
  name: '惑星形成シミュレーション',
  description: '原始惑星系円盤内の微惑星が衝突・合体して惑星を形成する過程',
  initialCamera: { position: [0, 200, 200], target: [0, 0, 0] },
  createBodies: () => {
    const sunMass = 1.0;
    const bodies: CelestialBody[] = [
      {
        name: 'Protostar',
        mass: sunMass,
        radius: 3.0,
        position: new Vector3(0, 0, 0),
        velocity: new Vector3(0, 0, 0),
        color: '#ffdd00',
        isFixed: true,
        isStar: true,
        id: uuidv4()
      }
    ];

    // 円盤内に100個の微惑星を配置
    const planetesimalCount = 100;
    const minRadius = 30;
    const maxRadius = 150;

    for (let i = 0; i < planetesimalCount; i++) {
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const angle = Math.random() * Math.PI * 2;
      const inclination = (Math.random() - 0.5) * 0.1; // ±2.9度

      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = radius * Math.tan(inclination);

      const orbitalVelocity = Math.sqrt(sunMass / radius);
      const vx = -orbitalVelocity * Math.sin(angle);
      const vz = orbitalVelocity * Math.cos(angle);

      bodies.push({
        name: `Planetesimal ${i + 1}`,
        mass: 0.001 + Math.random() * 0.005, // 0.001〜0.006地球質量
        radius: 0.05 + Math.random() * 0.1,
        position: new Vector3(x, y, z),
        velocity: new Vector3(
          vx + (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.1,
          vz + (Math.random() - 0.5) * 0.2
        ),
        color: `hsl(${Math.random() * 60 + 20}, 60%, 50%)`, // 茶色系
        id: uuidv4()
      });
    }

    return bodies;
  }
};

// プリセットリストに追加
export const ALL_PRESETS = [
  solarSystemPreset,
  binaryBlackHolePreset,
  figure8System,
  lagrangePointsSystem,
  cometImpactSystem,
  binaryBlackHoleMerger,
  planetFormationSystem
];
```

**StarSystemGallery.tsx への統合**:
```tsx
// StarSystemGallery.tsx
import { ALL_PRESETS } from '../../utils/starSystems';

// レンダリング
{ALL_PRESETS.map(preset => (
  <div key={preset.id} className="preset-card" onClick={() => loadPreset(preset)}>
    <h3>{preset.name}</h3>
    <p>{preset.description}</p>
  </div>
))}
```

**期待効果**:
- 即座に楽しめるコンテンツ
- SNS シェア率 +300%
- 教育的価値の向上
- リプレイ性の向上

---

### Phase 3: 技術的完成度向上（1ヶ月）

#### 🔧 優先度: 中

##### 3-1. Adaptive Timestep（適応的時間刻み） ⭐⭐⭐

**目的**: 長期シミュレーションの精度向上、エネルギー保存

**実装場所**: `src/utils/physics.ts`

**理論**:
```
誤差推定:
- 現在のステップでの加速度 a_n
- 次のステップでの加速度 a_n+1
- ローカル誤差 ε ≈ |a_n+1 - a_n| * dt²

適応的 dt:
dt_new = dt_old * sqrt(tolerance / ε)
```

**実装コード**:
```typescript
// src/utils/adaptiveTimestep.ts (新規作成)
import { PhysicsState } from '../types/physics';

interface AdaptiveTimestepConfig {
  minDt: number;
  maxDt: number;
  tolerance: number;
  safetyFactor: number;
}

const DEFAULT_CONFIG: AdaptiveTimestepConfig = {
  minDt: 0.0001,
  maxDt: 0.01,
  tolerance: 1e-6,
  safetyFactor: 0.9
};

export function calculateAdaptiveDt(
  state: PhysicsState,
  currentDt: number,
  config: AdaptiveTimestepConfig = DEFAULT_CONFIG
): number {
  const { count, accelerations, masses } = state;

  let maxAccelChange = 0;

  // 各天体の加速度変化を計算（前回との差分）
  // 注: 前回の加速度を保存する必要がある
  for (let i = 0; i < count; i++) {
    if (masses[i] <= 0) continue;

    const i3 = i * 3;
    const ax = accelerations[i3];
    const ay = accelerations[i3 + 1];
    const az = accelerations[i3 + 2];

    const accelMag = Math.sqrt(ax * ax + ay * ay + az * az);
    if (accelMag > maxAccelChange) {
      maxAccelChange = accelMag;
    }
  }

  // ローカル誤差推定
  const localError = maxAccelChange * currentDt * currentDt;

  // 新しい dt を計算
  let newDt = currentDt;
  if (localError > config.tolerance) {
    newDt = currentDt * config.safetyFactor * Math.sqrt(config.tolerance / localError);
  } else if (localError < config.tolerance * 0.1) {
    // 誤差が十分小さければ dt を増やす
    newDt = currentDt * 1.5;
  }

  // 範囲制限
  newDt = Math.max(config.minDt, Math.min(config.maxDt, newDt));

  return newDt;
}
```

**physicsStore.ts への統合**:
```typescript
// physicsStore.ts の updateBodies() 内
let adaptiveDt = BASE_DT * timeScale * distModeMultiplier;

if (useAdaptiveTimestep) {
  adaptiveDt = calculateAdaptiveDt(currentState, adaptiveDt);
}

for (let i = 0; i < steps; i++) {
  updatePhysicsSoA(currentState, adaptiveDt, false, false);
}
```

**UI コントロール**:
```tsx
// SimulationControls.tsx に追加
<label>
  <input
    type="checkbox"
    checked={useAdaptiveTimestep}
    onChange={() => toggleAdaptiveTimestep()}
  />
  適応的時間刻み（高精度）
</label>
```

**期待効果**:
- エネルギードリフト -80%
- 長期シミュレーションの安定性向上
- 精度とパフォーマンスのバランス

---

##### 3-2. テストスイート導入 ⭐⭐⭐

**目的**: バグ防止、リファクタリングの安全性

**セットアップ**:
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

**設定ファイル**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts'
  }
});
```

**テストケース例**:

```typescript
// tests/unit/physics.test.ts
import { describe, it, expect } from 'vitest';
import { calculateAccelerationsSoA, createPhysicsState } from '../../src/utils/physics';
import { Vector3 } from 'three';

describe('Physics Calculations', () => {
  it('should calculate gravitational acceleration correctly', () => {
    // 2天体問題（地球-太陽）
    const bodies = [
      {
        id: 'sun',
        name: 'Sun',
        mass: 333000,
        radius: 3.0,
        position: new Vector3(0, 0, 0),
        velocity: new Vector3(0, 0, 0),
        color: '#ffdd00'
      },
      {
        id: 'earth',
        name: 'Earth',
        mass: 1.0,
        radius: 0.13,
        position: new Vector3(0, 0, -50), // 1 AU ≈ 50 units
        velocity: new Vector3(Math.sqrt(333000 / 50), 0, 0),
        color: '#22aaff'
      }
    ];

    const state = createPhysicsState(bodies);
    calculateAccelerationsSoA(state);

    // 地球への加速度（太陽方向）
    const earthAccel = new Vector3(
      state.accelerations[3],
      state.accelerations[4],
      state.accelerations[5]
    );

    // 期待値: a = GM/r² ≈ 333000 / (50²) = 133.2
    const expectedMag = 333000 / (50 * 50);
    const actualMag = earthAccel.length();

    expect(actualMag).toBeCloseTo(expectedMag, 1);
  });

  it('should conserve energy in Kepler orbit', () => {
    // ... ケプラー軌道のエネルギー保存テスト
  });
});

// tests/unit/barnesHut.test.ts
import { describe, it, expect } from 'vitest';
import { OctreeNode, insertBody, calculateForce } from '../../src/utils/barnesHut';

describe('Barnes-Hut Algorithm', () => {
  it('should build octree correctly', () => {
    // ... オクツリー構築テスト
  });

  it('should approximate force within tolerance', () => {
    // ... 力の近似精度テスト
  });
});

// tests/unit/spatialHash.test.ts
import { describe, it, expect } from 'vitest';
import { SpatialHashGrid } from '../../src/utils/spatialHash';

describe('Spatial Hash Grid', () => {
  it('should detect all collisions', () => {
    // ... 衝突検出の網羅性テスト
  });

  it('should have no false negatives', () => {
    // ... 検出漏れゼロの確認
  });
});

// tests/integration/simulation.test.ts
import { describe, it, expect } from 'vitest';
import { usePhysicsStore } from '../../src/store/physicsStore';

describe('Simulation Integration', () => {
  it('should run solar system simulation without crashes', async () => {
    const store = usePhysicsStore.getState();
    store.loadSolarSystem();

    // 1000ステップ実行
    for (let i = 0; i < 1000; i++) {
      await store.updateBodies();
    }

    expect(store.bodies.length).toBeGreaterThan(0);
  });
});
```

**package.json に追加**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**期待効果**:
- バグ検出率 +500%
- リファクタリングの安全性
- ドキュメントとしての役割

---

### Phase 4: アーキテクチャ改善（長期）

#### 🏗️ 優先度: 中〜低

##### 4-1. ストア分割 ⭐⭐⭐

**目的**: 関心の分離、保守性向上

**現状の問題**:
- `physicsStore.ts` が500+行
- 物理・UI・カメラの状態が混在

**提案構造**:
```
src/store/
├── physics/
│   ├── usePhysicsSimulation.ts  # 物理状態のみ
│   ├── useCollisionManager.ts   # 衝突管理
│   └── useEnergyMonitor.ts      # エネルギー監視
├── ui/
│   ├── useUIState.ts             # UI フラグ
│   ├── usePerformanceStats.ts    # パフォーマンス
│   └── useNotifications.ts       # 通知
├── camera/
│   └── useCameraControl.ts       # カメラ状態
└── index.ts                      # 統合エクスポート
```

**実装例**:
```typescript
// src/store/physics/usePhysicsSimulation.ts
import { create } from 'zustand';

interface PhysicsSimulationState {
  bodies: CelestialBody[];
  physicsState: PhysicsState | null;
  simulationTime: number;
  timeScale: number;

  updateBodies: () => void;
  addBody: (body: CelestialBody) => void;
  removeBody: (id: string) => void;
  reset: () => void;
}

export const usePhysicsSimulation = create<PhysicsSimulationState>((set, get) => ({
  bodies: [],
  physicsState: null,
  simulationTime: 0,
  timeScale: 1.0,

  updateBodies: () => { /* ... */ },
  addBody: (body) => { /* ... */ },
  removeBody: (id) => { /* ... */ },
  reset: () => { /* ... */ }
}));

// src/store/ui/useUIState.ts
interface UIState {
  showGrid: boolean;
  showPrediction: boolean;
  showHabitableZone: boolean;
  zenMode: boolean;

  toggleGrid: () => void;
  togglePrediction: () => void;
  toggleHabitableZone: () => void;
  toggleZenMode: () => void;
}

export const useUIState = create<UIState>((set) => ({
  showGrid: true,
  showPrediction: false,
  showHabitableZone: false,
  zenMode: false,

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  togglePrediction: () => set((state) => ({ showPrediction: !state.showPrediction })),
  toggleHabitableZone: () => set((state) => ({ showHabitableZone: !state.showHabitableZone })),
  toggleZenMode: () => set((state) => ({ zenMode: !state.zenMode }))
}));

// コンポーネントでの使用
import { usePhysicsSimulation } from '../store/physics/usePhysicsSimulation';
import { useUIState } from '../store/ui/useUIState';

function MyComponent() {
  const bodies = usePhysicsSimulation(state => state.bodies);
  const showGrid = useUIState(state => state.showGrid);

  // ...
}
```

**期待効果**:
- コード可読性 +100%
- 保守性の向上
- 部分的リレンダリングの最適化

---

##### 4-2. Engine 抽象化層 ⭐⭐

**目的**: CPU/Worker/GPU の統一インターフェース

**提案構造**:
```typescript
// src/engine/PhysicsEngine.ts (abstract)
export abstract class PhysicsEngine {
  abstract init(maxBodies: number): Promise<void>;
  abstract step(dt: number): Promise<void>;
  abstract getBodies(): CelestialBody[];
  abstract setBodies(bodies: CelestialBody[]): void;
  abstract dispose(): void;
}

// src/engine/CPUEngine.ts
export class CPUEngine extends PhysicsEngine {
  private state: PhysicsState | null = null;

  async init(maxBodies: number): Promise<void> {
    // 初期化
  }

  async step(dt: number): Promise<void> {
    if (!this.state) return;
    updatePhysicsSoA(this.state, dt, false, true);
  }

  getBodies(): CelestialBody[] {
    return syncStateToBodies(this.state!, []);
  }

  setBodies(bodies: CelestialBody[]): void {
    this.state = createPhysicsState(bodies);
  }

  dispose(): void {
    this.state = null;
  }
}

// src/engine/WorkerEngine.ts
export class WorkerEngine extends PhysicsEngine {
  private manager: PhysicsWorkerManager;

  // ... Worker 実装
}

// src/engine/GPUEngine.ts
export class GPUEngine extends PhysicsEngine {
  private gpu: GPUPhysicsEngine;

  // ... GPU 実装
}

// 使用例
const engine = useGPU ? new GPUEngine() : new CPUEngine();
await engine.init(20000);
await engine.step(0.001);
```

**期待効果**:
- エンジン切り替えの簡素化
- テスト容易性の向上
- 将来の拡張性

---

## 技術的考慮事項

### パフォーマンス

#### メモリ最適化
```typescript
// Float64 → Float32 への変更（精度十分な場合）
// 現状: 8 bytes/値
// 改善: 4 bytes/値（-50% メモリ）

interface OptimizedPhysicsState {
  positions: Float32Array;    // 位置は Float32 で十分
  velocities: Float32Array;
  accelerations: Float32Array;
  masses: Float64Array;       // 質量は高精度が必要
  radii: Float32Array;
}
```

#### SIMD 活用
```typescript
// WebAssembly による SIMD 最適化
// Rust で実装し、wasm-bindgen でバインド

// 例: forces calculation
#[wasm_bindgen]
pub fn calculate_forces_simd(
    positions: &[f32],
    masses: &[f64],
    forces: &mut [f32]
) {
    // SIMD intrinsics を使用
}
```

### セキュリティ

#### WebGPU コンテキスト喪失対策
```typescript
// GPUPhysicsEngine.ts
private async handleContextLoss() {
  console.warn('GPU context lost, falling back to CPU');

  const store = usePhysicsStore.getState();
  store.useGPU = false;
  store.isCalculating = false;

  // CPU モードに自動切り替え
}

// イベントリスナー登録
device.lost.then((info) => {
  console.error('GPU device lost:', info);
  handleContextLoss();
});
```

#### メモリ制限
```typescript
// 安全な上限設定
const MAX_SAFE_BUFFER_SIZE = 100 * 1024 * 1024; // 100 MB

function validateBufferSize(maxBodies: number): boolean {
  const sizePerBody = 12 * 8; // 3 vectors * 4 components * 8 bytes
  const totalSize = maxBodies * sizePerBody;

  if (totalSize > MAX_SAFE_BUFFER_SIZE) {
    console.error(`Buffer size ${totalSize} exceeds safe limit`);
    return false;
  }

  return true;
}
```

---

## テスト戦略

### Unit Tests（単体テスト）

```typescript
// tests/unit/physics.test.ts
- calculateAccelerationsSoA()
- updatePhysicsSoA()
- syncStateToBodies()
- calculateTotalEnergy()

// tests/unit/barnesHut.test.ts
- OctreeNode construction
- insertBody()
- calculateForce() accuracy

// tests/unit/spatialHash.test.ts
- SpatialHashGrid.build()
- getPotentialCollisionPairs()
- findCollisions() completeness
```

### Integration Tests（統合テスト）

```typescript
// tests/integration/simulation.test.ts
- 太陽系シミュレーション（1000ステップ）
- エネルギー保存の検証
- 衝突検出と合体

// tests/integration/effects.test.ts
- 衝突エフェクトのトリガー
- パーティクル生成
- エフェクトのクリーンアップ
```

### E2E Tests（エンドツーエンドテスト）

```typescript
// tests/e2e/userFlow.test.ts
- ユーザーが天体を追加
- シミュレーションを実行
- カメラモードを切り替え
- シミュレーションを保存・読込
```

### Performance Tests（パフォーマンステスト）

```typescript
// tests/performance/benchmark.test.ts
- N=100, 500, 1000, 5000 での FPS 測定
- CPU vs Barnes-Hut vs Worker vs GPU の比較
- メモリ使用量の追跡
```

---

## ドキュメント整備

### コード内ドキュメント（JSDoc）

```typescript
/**
 * 天体間の重力加速度を計算します（Barnes-Hut アルゴリズム）
 *
 * @param state - 物理状態（SoA フォーマット）
 * @param theta - 近似精度パラメータ（0.0〜1.0、推奨: 0.5）
 * @returns void（state.accelerations を直接更新）
 *
 * @example
 * ```typescript
 * const state = createPhysicsState(bodies);
 * calculateAccelerationsBarnesHut(state, 0.5);
 * ```
 *
 * @remarks
 * - 計算量: O(N log N)
 * - THETA が小さいほど精度が高いが、計算コストも増加
 * - THETA = 0 の場合は完全な O(N²) 計算と等価
 */
export function calculateAccelerationsBarnesHut(
  state: PhysicsState,
  theta: number = 0.5
): void {
  // ...
}
```

### アーキテクチャドキュメント

```markdown
# docs/ARCHITECTURE.md

## システム構成

### コンポーネント図
[Mermaid diagram]

### データフロー
[Sequence diagram]

### 状態管理
[State transition diagram]
```

### API リファレンス

```markdown
# docs/API.md

## PhysicsStore

### Methods

#### `updateBodies()`
物理シミュレーションを1ステップ進めます。

**Parameters**: なし
**Returns**: `void`
**Throws**: なし

#### `addBody(body: CelestialBody)`
新しい天体をシミュレーションに追加します。

**Parameters**:
- `body` - 追加する天体（`id` は自動生成）

**Returns**: `void`
```

---

## まとめ

### 実装優先度

**Phase 1（即効性高）**:
1. 軌道パラメータ表示 ⭐⭐⭐⭐⭐
2. Save/Load シミュレーション ⭐⭐⭐⭐⭐
3. カメラ遷移アニメーション ⭐⭐⭐⭐
4. リアルタイム統計グラフ ⭐⭐⭐⭐

**Phase 2（UX向上）**:
5. 自動最適化提案 ⭐⭐⭐⭐
6. コンテキストメニュー ⭐⭐⭐
7. プリセットシナリオ拡充 ⭐⭐⭐⭐

**Phase 3（技術的完成度）**:
8. Adaptive Timestep ⭐⭐⭐
9. テストスイート ⭐⭐⭐

**Phase 4（長期）**:
10. ストア分割 ⭐⭐⭐
11. Engine 抽象化 ⭐⭐

### 期待効果

| 項目 | 現状 | 改善後 |
|------|------|--------|
| 教育的価値 | 7/10 | 9/10 |
| ユーザーエンゲージメント | 6/10 | 9/10 |
| コード品質 | 7/10 | 9/10 |
| テスト | 2/10 | 8/10 |
| 拡張性 | 6/10 | 9/10 |
| SNS 拡散性 | 5/10 | 9/10 |

---

**最終更新**: 2026-01-02
**バージョン**: 1.0
**作成者**: Claude Code Assistant
