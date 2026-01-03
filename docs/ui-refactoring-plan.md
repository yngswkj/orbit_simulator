# UI統合リファクタリング実装計画書

**プロジェクト**: Orbit Simulator
**対象**: 統合サイドパネル方式によるUI改善（提案A）
**作成日**: 2026-01-03
**目的**: ラボモードと既存コントロールパネルの統合により、UI/UX一貫性とコード保守性を向上

---

## 📋 現状分析

### 問題点の整理

#### 1. **UIの二重構造**
- 天体追加機能が2箇所に分散:
  - [`ControlPanel`](../src/components/ui/ControlPanel.tsx) 内の [`BodyCreator`](../src/components/ui/BodyCreator.tsx) (インラインフォーム)
  - [`BodyListPanel`](../src/components/ui/lab/BodyListPanel.tsx) 内の `AddBodyModal` (プリセット選択)
- ユーザーが「どちらを使うべきか」迷う

#### 2. **パネル配置の分散**
```
現在のレイアウト（ラボモード有効時）:
┌──────────────────────────────────────────────┐
│ [BodyListPanel]  Canvas  [BodyInspector]    │
│   (左, 280px)              (右上, 280px)     │
│                            [ControlPanel]    │
│                              (右, 320px)     │
└──────────────────────────────────────────────┘
```
- 左右両端を占有し、キャンバス領域を圧迫
- 視線の移動距離が大きい

#### 3. **機能の不統一**
- **検索機能**: `BodyListPanel` のみ
- **ベクトル編集**: `BodyInspector` でラボモード時のみ表示
- **回転速度編集**: `BodyInspector` で `!labMode` 時のみ表示（逆説的）

#### 4. **ボタン配置の競合**
右上エリアに複数UI要素が密集:
- `LabModeToggle` (right: 80px)
- `HelpButton` (right: 340px)
- `ZenExit` (right: 20px, ZenMode時)

---

## 🎯 改善目標

### 1. **UIの一貫性向上**
- すべてのコントロールを右側サイドパネルに統合
- モード切り替え時のレイアウト変化を最小化

### 2. **機能の統一**
- 天体追加方法を1つに統合（プリセット + カスタムフォーム）
- 検索機能を共通化

### 3. **画面スペースの効率化**
- キャンバス領域の確保
- レスポンシブ対応の基盤構築

### 4. **保守性の向上**
- コンポーネント責務の明確化
- 重複コードの削減

---

## 🏗️ 提案A: 統合サイドパネル方式

### アーキテクチャ概要

```
新しいレイアウト:
┌──────────────────────────────────────────────┐
│                                              │
│           Canvas (最大化)                    │
│                                              │
│                            [UnifiedSidePanel]│
│                              ┌──────────────┐│
│                              │ [Tabs]       ││
│                              │ - Controls   ││
│                              │ - Bodies     ││
│                              │ - Inspector  ││
│                              └──────────────┘│
└──────────────────────────────────────────────┘
```

### コンポーネント構造

```typescript
<UnifiedSidePanel>
  <TabNavigation>
    <Tab id="controls" icon={Settings}>Controls</Tab>
    <Tab id="bodies" icon={Globe}>Bodies</Tab>
    <Tab id="inspector" icon={Eye}>Inspector</Tab>
  </TabNavigation>

  <TabContent>
    {activeTab === 'controls' && (
      <>
        <SimulationControls />
        <UnifiedBodyCreator /> {/* プリセット + カスタム */}
      </>
    )}

    {activeTab === 'bodies' && (
      <BodyList /> {/* 検索 + リスト */}
    )}

    {activeTab === 'inspector' && (
      <BodyInspectorContent /> {/* 既存のBodyInspector内容 */}
    )}
  </TabContent>
</UnifiedSidePanel>
```

---

## 📝 実装計画

### Phase 1: 基盤構築 (優先度: 高)

#### タスク 1.1: UnifiedSidePanel コンポーネント作成
**ファイル**: `src/components/ui/UnifiedSidePanel.tsx`

```typescript
interface UnifiedSidePanelProps {
  defaultTab?: 'controls' | 'bodies' | 'inspector';
}

export const UnifiedSidePanel: React.FC<UnifiedSidePanelProps> = ({
  defaultTab = 'controls'
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isOpen, setIsOpen] = useState(true);
  const zenMode = usePhysicsStore(state => state.zenMode);
  const selectedBodyId = usePhysicsStore(state => state.selectedBodyId);

  // 天体選択時は自動的にInspectorタブへ
  useEffect(() => {
    if (selectedBodyId) setActiveTab('inspector');
  }, [selectedBodyId]);

  if (zenMode) return <ZenModeExitButton />;
  if (!isOpen) return <CompactControls onOpen={() => setIsOpen(true)} />;

  return (
    <div className="unified-side-panel">
      <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
      <TabContent activeTab={activeTab} />
    </div>
  );
};
```

**依存ファイル**:
- `src/components/ui/TabNavigation.tsx` (新規)
- `src/components/ui/TabContent.tsx` (新規)

**スタイル**: `src/components/ui/UnifiedSidePanel.css`

---

#### タスク 1.2: TabNavigation コンポーネント
**ファイル**: `src/components/ui/TabNavigation.tsx`

```typescript
interface Tab {
  id: 'controls' | 'bodies' | 'inspector';
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  badge?: number; // 天体数など
}

export const TabNavigation: React.FC<{
  activeTab: string;
  onChange: (tab: string) => void;
}> = ({ activeTab, onChange }) => {
  const bodies = usePhysicsStore(state => state.bodies);
  const selectedBodyId = usePhysicsStore(state => state.selectedBodyId);

  const tabs: Tab[] = [
    { id: 'controls', label: 'Controls', icon: Settings },
    { id: 'bodies', label: 'Bodies', icon: Globe, badge: bodies.length },
    {
      id: 'inspector',
      label: 'Inspector',
      icon: Eye,
      // 選択中の天体がある場合のみ有効
      disabled: !selectedBodyId
    }
  ];

  return (
    <div className="tab-navigation">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          disabled={tab.disabled}
        >
          <tab.icon size={18} />
          <span>{tab.label}</span>
          {tab.badge !== undefined && (
            <span className="badge">{tab.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
};
```

---

#### タスク 1.3: TabContent コンポーネント
**ファイル**: `src/components/ui/TabContent.tsx`

```typescript
export const TabContent: React.FC<{
  activeTab: 'controls' | 'bodies' | 'inspector';
}> = ({ activeTab }) => {
  return (
    <div className="tab-content custom-scrollbar">
      {activeTab === 'controls' && <ControlsTab />}
      {activeTab === 'bodies' && <BodiesTab />}
      {activeTab === 'inspector' && <InspectorTab />}
    </div>
  );
};
```

**サブコンポーネント**:
- `ControlsTab.tsx`: SimulationControls + UnifiedBodyCreator
- `BodiesTab.tsx`: 検索 + BodyList
- `InspectorTab.tsx`: BodyInspector の内容を移植

---

### Phase 2: 機能統合 (優先度: 高)

#### タスク 2.1: UnifiedBodyCreator コンポーネント
**ファイル**: `src/components/ui/UnifiedBodyCreator.tsx`

```typescript
export const UnifiedBodyCreator: React.FC = () => {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');

  return (
    <div className="unified-body-creator">
      <div className="mode-toggle">
        <button
          onClick={() => setMode('preset')}
          className={mode === 'preset' ? 'active' : ''}
        >
          Preset
        </button>
        <button
          onClick={() => setMode('custom')}
          className={mode === 'custom' ? 'active' : ''}
        >
          Custom
        </button>
      </div>

      {mode === 'preset' && <PresetSelector />}
      {mode === 'custom' && <CustomBodyForm />}
    </div>
  );
};
```

**統合内容**:
- `AddBodyModal` のプリセット機能を `PresetSelector` に移植
- `BodyCreator` のフォームを `CustomBodyForm` に移植

**削除予定ファイル**:
- `src/components/ui/lab/AddBodyModal.tsx`
- `src/components/ui/BodyCreator.tsx`

---

#### タスク 2.2: BodiesTab - 検索機能の統合
**ファイル**: `src/components/ui/tabs/BodiesTab.tsx`

```typescript
export const BodiesTab: React.FC = () => {
  const bodies = usePhysicsStore(state => state.bodies);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'star' | 'planet' | 'black_hole'>('all');

  const filteredBodies = useMemo(() => {
    return bodies.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || getBodyType(b) === filterType;
      return matchesSearch && matchesType;
    });
  }, [bodies, searchTerm, filterType]);

  return (
    <div className="bodies-tab">
      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      <TypeFilter value={filterType} onChange={setFilterType} />
      <BodyList bodies={filteredBodies} />
    </div>
  );
};
```

**移植元**: `BodyListPanel.tsx` の検索機能

---

#### タスク 2.3: InspectorTab - BodyInspector の統合
**ファイル**: `src/components/ui/tabs/InspectorTab.tsx`

```typescript
export const InspectorTab: React.FC = () => {
  const selectedBodyId = usePhysicsStore(state => state.selectedBodyId);
  const bodies = usePhysicsStore(state => state.bodies);
  const selectedBody = bodies.find(b => b.id === selectedBodyId);

  if (!selectedBody) {
    return (
      <div className="inspector-empty">
        <Globe size={48} color="#6b7280" />
        <p>Select a body to inspect</p>
      </div>
    );
  }

  return (
    <div className="inspector-tab">
      <BodyInspectorContent body={selectedBody} />
    </div>
  );
};
```

**移植作業**:
- `BodyInspector.tsx` の内容を `BodyInspectorContent` コンポーネント化
- 独立パネル→タブ内表示に調整（position: absolute を削除）

---

### Phase 3: 既存コンポーネント調整 (優先度: 中)

#### タスク 3.1: BodyInspector のリファクタリング
**対象**: `src/components/ui/BodyInspector.tsx`

**変更内容**:
```typescript
// Before: 独立したパネル
export const BodyInspector: React.FC = () => {
  // ... position: absolute スタイル
};

// After: コンテンツコンポーネント化
export const BodyInspectorContent: React.FC<{
  body: CelestialBody;
}> = ({ body }) => {
  // スタイリングを削除し、内容のみ提供
};
```

**修正箇所**:
1. `position: absolute` 等のスタイル削除
2. `selectedBodyId` の取得ロジック削除（親から受け取る）
3. `labMode` による条件分岐の見直し

---

#### タスク 3.2: rotationSpeed 編集条件の修正
**対象**: `src/components/ui/BodyInspector.tsx` L135-147

**問題**: 現在 `!labMode` 時のみ表示されている（逆説的）

**修正案**:
```typescript
// 修正前:
{!labMode && (
  <div>
    <label>Rotation Speed</label>
    <input ... />
  </div>
)}

// 修正後: ラボモード時も表示
<div style={{ marginBottom: '5px' }}>
  <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>
    {t('rotation_speed')}
  </label>
  {labMode && (
    <input
      type="range"
      min="0" max="10" step="0.1"
      value={selectedBody.rotationSpeed || 1.0}
      onChange={(e) => updateBody(selectedBody.id, { rotationSpeed: parseFloat(e.target.value) })}
      className="lab-range"
      style={{ marginBottom: '5px' }}
    />
  )}
  <input
    type="number"
    value={selectedBody.rotationSpeed || 1.0}
    onChange={(e) => updateBody(selectedBody.id, { rotationSpeed: parseFloat(e.target.value) })}
    step="0.1"
    className="lab-input"
    style={{ width: '100%', boxSizing: 'border-box' }}
  />
</div>
```

---

#### タスク 3.3: App.tsx の更新
**対象**: `src/App.tsx`

**変更内容**:
```typescript
// Before:
<ControlPanel />
<BodyInspector />
<LabModeToggle />
{labMode && <BodyListPanel />}

// After:
<UnifiedSidePanel />
{/* LabModeToggle は UnifiedSidePanel 内に統合 */}
```

**削除される条件分岐**: `labMode` による UI 切り替えロジック

---

### Phase 4: スタイリングとアニメーション (優先度: 中)

#### タスク 4.1: CSS 統合
**新規ファイル**: `src/components/ui/UnifiedSidePanel.css`

```css
.unified-side-panel {
  position: absolute;
  top: 0;
  right: 0;
  height: 100vh;
  width: 360px; /* 旧 ControlPanel より若干拡大 */
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(12px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.tab-navigation {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 12px 0;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.75rem;
  position: relative;
}

.tab-btn:hover:not(:disabled) {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  color: #60a5fa;
  border-bottom-color: #60a5fa;
}

.tab-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.tab-btn .badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #60a5fa;
  color: white;
  font-size: 0.625rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scrollbar-gutter: stable;
}

/* Tab 切り替えアニメーション */
.tab-content > div {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**既存CSS統合元**:
- `ControlPanel.css` (存在すれば)
- `lab/LabMode.css` から必要なスタイルを移植

---

#### タスク 4.2: レスポンシブ対応
**対象**: `UnifiedSidePanel.css`

```css
/* タブレット対応 */
@media (max-width: 1024px) {
  .unified-side-panel {
    width: 320px;
  }

  .tab-btn {
    font-size: 0.7rem;
    padding: 10px 6px;
  }
}

/* モバイル対応 */
@media (max-width: 768px) {
  .unified-side-panel {
    width: 100%;
    height: auto;
    max-height: 60vh;
    top: auto;
    bottom: 0;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tab-navigation {
    flex-direction: row;
    justify-content: space-around;
  }

  .tab-content {
    max-height: calc(60vh - 60px);
  }
}
```

---

### Phase 5: クリーンアップ (優先度: 低)

#### タスク 5.1: 不要ファイルの削除

**削除対象**:
```
src/components/ui/
├── BodyCreator.tsx (→ UnifiedBodyCreator に統合)
├── ControlPanel.tsx (→ UnifiedSidePanel に統合)
└── lab/
    ├── AddBodyModal.tsx (→ PresetSelector に統合)
    ├── BodyListPanel.tsx (→ BodiesTab に統合)
    └── LabModeToggle.tsx (→ UnifiedSidePanel に統合)
```

**注意**: 削除前に必ず Git コミットを作成

---

#### タスク 5.2: Import パスの更新

**対象ファイル**:
- `src/App.tsx`
- その他、削除されたコンポーネントを参照している箇所

**方法**: VSCode の "Find All References" を使用

---

#### タスク 5.3: 翻訳キーの整理
**対象**: `src/utils/i18n.ts` (または翻訳ファイル)

**追加キー**:
```typescript
{
  tab_controls: 'Controls',
  tab_bodies: 'Bodies',
  tab_inspector: 'Inspector',
  body_creator_preset: 'Preset',
  body_creator_custom: 'Custom',
  filter_all: 'All',
  filter_star: 'Star',
  filter_planet: 'Planet',
  filter_black_hole: 'Black Hole',
  inspector_empty: 'Select a body to inspect'
}
```

---

## 📊 実装スケジュール

### Week 1: 基盤構築
- [ ] タスク 1.1: UnifiedSidePanel コンポーネント作成
- [ ] タスク 1.2: TabNavigation コンポーネント
- [ ] タスク 1.3: TabContent コンポーネント
- [ ] タスク 4.1: CSS 統合（基本スタイル）

### Week 2: 機能統合
- [ ] タスク 2.1: UnifiedBodyCreator コンポーネント
- [ ] タスク 2.2: BodiesTab - 検索機能の統合
- [ ] タスク 2.3: InspectorTab - BodyInspector の統合
- [ ] タスク 3.2: rotationSpeed 編集条件の修正

### Week 3: 調整とクリーンアップ
- [ ] タスク 3.1: BodyInspector のリファクタリング
- [ ] タスク 3.3: App.tsx の更新
- [ ] タスク 4.2: レスポンシブ対応
- [ ] タスク 5.1~5.3: クリーンアップ

### Week 4: テストと最適化
- [ ] 統合テスト（各タブの動作確認）
- [ ] パフォーマンス検証
- [ ] UX 改善（アニメーション調整等）
- [ ] ドキュメント更新

---

## 🧪 テスト計画

### 手動テスト項目

#### 基本機能
- [ ] タブ切り替えが正常に動作
- [ ] 天体選択時に Inspector タブに自動切り替え
- [ ] Zen Mode への切り替え
- [ ] パネルの最小化/復元

#### Controls タブ
- [ ] シミュレーション制御（Play/Pause/Reset）
- [ ] Time Scale 変更
- [ ] Camera Mode 切り替え
- [ ] プリセット天体追加
- [ ] カスタム天体追加

#### Bodies タブ
- [ ] 検索機能
- [ ] タイプフィルタ
- [ ] 天体選択
- [ ] 天体削除
- [ ] 天体複製

#### Inspector タブ
- [ ] 天体情報表示
- [ ] 名前、質量、色の編集
- [ ] ベクトル編集（Position/Velocity）
- [ ] 回転速度編集
- [ ] Follow/Unfollow 切り替え

#### キーボードショートカット
- [ ] Space: Play/Pause
- [ ] 1-9: 天体選択
- [ ] Shift+1/2/3: Camera Mode

#### レスポンシブ
- [ ] デスクトップ表示（>1024px）
- [ ] タブレット表示（768-1024px）
- [ ] モバイル表示（<768px）

---

## 📈 期待される効果

### 1. **UX の向上**
- 一貫した操作感
- 視線移動の削減
- 初見ユーザーの学習コスト低減

### 2. **コードの保守性向上**
- コンポーネント責務の明確化
- 重複コードの削減（約30%減）
- テストの容易性向上

### 3. **パフォーマンス改善**
- 不要な再レンダリングの削減（タブ内容の遅延レンダリング）
- DOM ノード数の削減

### 4. **拡張性の向上**
- 新しいタブの追加が容易
- モバイル対応の基盤確立

---

## 🔧 技術的な注意点

### 1. **状態管理**
- `activeTab` は UnifiedSidePanel のローカル状態で管理
- `selectedBodyId` 変更時の Inspector タブ自動切り替えは useEffect で実装

### 2. **パフォーマンス最適化**
```typescript
// 非アクティブタブの内容は条件付きレンダリング
{activeTab === 'controls' && <ControlsTab />}
{activeTab === 'bodies' && <BodiesTab />}
{activeTab === 'inspector' && <InspectorTab />}
```

### 3. **アクセシビリティ**
- Tab 切り替えに `role="tablist"` を付与
- キーボードナビゲーション（Arrow keys）対応
- ARIA ラベルの適切な設定

### 4. **アニメーション**
- タブ切り替え時のフェードイン効果
- パネル最小化/復元のスライドアニメーション
- `prefers-reduced-motion` への対応

---

## 🚀 将来の拡張案

### Phase 6: 追加機能（オプション）

#### 1. **Settings タブ**
- Language 切り替え
- Theme 設定（Dark/Light）
- Performance 設定（GPU/CPU切り替え）

#### 2. **Presets タブ**
- 保存済みシステムのリスト
- インポート/エクスポート機能
- クラウド同期

#### 3. **Analytics タブ**
- 軌道エネルギーのグラフ
- 安定性指標
- 統計情報

#### 4. **モバイル最適化**
- スワイプジェスチャーでタブ切り替え
- 縦画面時のレイアウト調整
- タッチ操作の最適化

---

## 📚 参考資料

### デザインリファレンス
- Material Design Tabs: https://m3.material.io/components/tabs
- Radix UI Tabs: https://www.radix-ui.com/docs/primitives/components/tabs
- shadcn/ui Tabs: https://ui.shadcn.com/docs/components/tabs

### 既存ファイル構造
```
src/components/ui/
├── ControlPanel.tsx (320行)
├── BodyCreator.tsx (200行)
├── BodyInspector.tsx (255行)
├── CompactControls.tsx (保持)
├── SimulationControls.tsx (保持)
├── common/
│   └── VectorInput.tsx (保持)
└── lab/
    ├── LabMode.css (統合)
    ├── LabModeToggle.tsx (削除予定)
    ├── BodyListPanel.tsx (削除予定)
    └── AddBodyModal.tsx (削除予定)
```

### 新しいファイル構造
```
src/components/ui/
├── UnifiedSidePanel.tsx (新規)
├── UnifiedSidePanel.css (新規)
├── TabNavigation.tsx (新規)
├── TabContent.tsx (新規)
├── tabs/
│   ├── ControlsTab.tsx (新規)
│   ├── BodiesTab.tsx (新規)
│   └── InspectorTab.tsx (新規)
├── body-creator/
│   ├── UnifiedBodyCreator.tsx (新規)
│   ├── PresetSelector.tsx (新規)
│   └── CustomBodyForm.tsx (新規)
├── CompactControls.tsx (保持)
├── SimulationControls.tsx (保持)
└── common/
    ├── VectorInput.tsx (保持)
    ├── SearchBar.tsx (新規)
    └── TypeFilter.tsx (新規)
```

---

## ✅ チェックリスト

### 実装前
- [ ] この計画書をチームでレビュー
- [ ] デザインモックアップの作成（オプション）
- [ ] 現在の UI のスクリーンショット撮影（比較用）
- [ ] Git ブランチ作成: `feature/ui-unification`

### 実装中
- [ ] 各 Phase 完了時に Git コミット
- [ ] 定期的な動作確認
- [ ] パフォーマンス計測（Chrome DevTools）

### 実装後
- [ ] すべての手動テスト項目をクリア
- [ ] コードレビュー
- [ ] ドキュメント更新（README, CHANGELOG）
- [ ] Pull Request 作成

---

## 📞 問い合わせ

この実装計画書について質問や提案がある場合は、以下を確認してください：

- GitHub Issues: orbit-simulator リポジトリ
- 設計ドキュメント: `docs/architecture_v2.md`
- 既存の実装計画: `docs/IMPLEMENTATION_PLAN.md`

---

**End of Document**
