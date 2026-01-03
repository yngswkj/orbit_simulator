# UnifiedSidePanel UI ユーザビリティレビュー

**プロジェクト**: Orbit Simulator
**対象**: UnifiedSidePanel 実装
**レビュー日**: 2026-01-03
**評価基準**: Nielsen Norman Group - 10 Usability Heuristics
**評価者**: Claude Code

---

## 📊 総合評価サマリー

| 評価項目 | スコア | 状態 |
|---------|--------|------|
| **1. システム状態の可視性** | ⭐⭐⭐⭐☆ (4/5) | 良好 |
| **2. 現実世界との一致** | ⭐⭐⭐⭐⭐ (5/5) | 優秀 |
| **3. ユーザー制御と自由** | ⭐⭐⭐☆☆ (3/5) | 要改善 |
| **4. 一貫性と標準** | ⭐⭐⭐⭐☆ (4/5) | 良好 |
| **5. エラー防止** | ⭐⭐☆☆☆ (2/5) | **要改善** |
| **6. 認識優先（想起不要）** | ⭐⭐⭐⭐⭐ (5/5) | 優秀 |
| **7. 柔軟性と効率性** | ⭐⭐⭐☆☆ (3/5) | 要改善 |
| **8. 美的でミニマルなデザイン** | ⭐⭐⭐⭐☆ (4/5) | 良好 |
| **9. エラー認識と復旧** | ⭐⭐☆☆☆ (2/5) | **要改善** |
| **10. ヘルプとドキュメント** | ⭐⭐⭐☆☆ (3/5) | 要改善 |
| **総合スコア** | **35/50** | **70%** |

**評価**: 基本的なユーザビリティは確保されているが、エラー処理とユーザー制御の面で改善の余地あり。

---

## 📋 詳細評価

### 1. システム状態の可視性 ⭐⭐⭐⭐☆ (4/5)

#### ✅ 良い点

**1.1 アクティブタブの明確な表示**
```tsx
// TabNavigation.tsx:22-26
<button
  onClick={() => onChange('controls')}
  className={`tab-btn ${activeTab === 'controls' ? 'active' : ''}`}
>
```
- アクティブタブは青色ハイライト（`#60a5fa`）で視覚的に明確
- 下部ボーダーでさらに強調

**1.2 天体数のバッジ表示**
```tsx
// TabNavigation.tsx:33
<span className="badge">{bodies.length}</span>
```
- Bodies タブに現在の天体数を表示
- リアルタイムで更新される

**1.3 選択状態のフィードバック**
```tsx
// BodiesTab.tsx:94-95
background: selectedBodyId === body.id ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
border: `1px solid ${selectedBodyId === body.id ? 'rgba(96, 165, 250, 0.3)' : 'transparent'}`
```
- 選択された天体は背景色と枠線でハイライト

**1.4 ホバー状態のフィードバック**
```css
/* UnifiedSidePanel.css:52-55 */
.tab-btn:hover:not(:disabled) {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}
```
- ホバー時に色と背景が変化

#### ⚠️ 改善点

**1.5 ローディング状態の欠如**
```tsx
// UnifiedBodyCreator.tsx:46 - addBody() は即時実行
addBody(props);
```
- **問題**: 天体追加時のフィードバックがない
- **影響**: 大量の天体を追加した際、処理中かどうか不明
- **推奨**: ローディングインジケーターまたはトースト通知を追加

**1.6 フィルタ適用状態の不明瞭さ**
```tsx
// BodiesTab.tsx:66-78 - フィルタボタン
```
- **問題**: フィルタ適用時に「何件ヒットしているか」が不明
- **推奨**: "Planet (3)" のように件数を表示

---

### 2. 現実世界との一致 ⭐⭐⭐⭐⭐ (5/5)

#### ✅ 優秀な点

**2.1 タブメタファーの採用**
```tsx
// TabNavigation.tsx:19-45 - タブUI
```
- 一般的なタブUI パターンを踏襲
- ユーザーは学習不要で操作可能

**2.2 アイコンの直感性**
```tsx
// TabNavigation.tsx:24, 31, 41
<Settings size={18} /> // Controls
<Globe size={18} />    // Bodies
<Eye size={18} />      // Inspector
```
- Controls = 歯車（設定）
- Bodies = 地球（天体）
- Inspector = 目（観察）
- すべて業界標準のアイコン

**2.3 物理量の表現**
```tsx
// BodyInspectorContent.tsx:71
<span>10^{Math.log10(selectedBody.mass).toFixed(1)}</span>
```
- 質量を対数スケールで表示（科学的慣習に準拠）
- スライダーと数値入力の両方を提供

**2.4 色選択の直感性**
```tsx
// BodyInspectorContent.tsx:132-146
<input type="color" />  // カラーピッカー
<input type="text" />   // HEXコード入力
```
- 視覚的選択とテキスト入力の両立

**2.5 プリセット名称の明瞭性**
```tsx
// UnifiedBodyCreator.tsx:94-97
{ type: 'Star', icon: Sun, color: '#facc15' },
{ type: 'Planet', icon: Globe, color: '#60a5fa' },
{ type: 'Gas Giant', icon: Disc, color: '#fdba74' },
{ type: 'Black Hole', icon: Zap, color: '#c084fc' }
```
- 天文学的に正確な用語を使用

---

### 3. ユーザー制御と自由 ⭐⭐⭐☆☆ (3/5)

#### ✅ 良い点

**3.1 パネルの閉じる機能**
```tsx
// UnifiedSidePanel.tsx:53-59
<button onClick={() => setIsOpen(false)}>×</button>
```
- 右上の×ボタンでパネルを閉じられる

**3.2 タブ切り替えの自由**
```tsx
// UnifiedSidePanel.tsx:62
<TabNavigation activeTab={activeTab} onChange={setActiveTab} />
```
- いつでも任意のタブに切り替え可能

**3.3 天体選択の解除**
```tsx
// InspectorTab では選択解除ボタンがない
```
- **問題**: Inspector タブ内で選択を解除する方法がない
- 別のタブに移動して Bodies タブから再度クリックする必要がある

#### ⚠️ 重大な改善点

**3.4 削除操作の即時実行**
```tsx
// BodiesTab.tsx:119-122
onClick={(e) => {
  e.stopPropagation();
  if (confirm(`Delete ${body.name}?`)) removeBody(body.id);
}}
```
- **問題**: ネイティブの `confirm()` ダイアログを使用
- **影響**: デザインの一貫性を損なう、モダンなUIに不適合
- **推奨**: カスタムモーダルまたはトースト通知で削除確認

**3.5 Undo 機能の欠如**
```tsx
// どこにもUndo/Redoの実装なし
```
- **問題**: 誤削除した天体を復元できない
- **影響**: 重大なデータ損失のリスク
- **推奨**: Undo スタックの実装、または「ゴミ箱」機能

**3.6 複数選択・一括操作の未サポート**
```tsx
// BodiesTab.tsx - 単一選択のみ
```
- **問題**: 複数の天体を一度に削除・移動できない
- **推奨**: Shift/Ctrl クリックでの複数選択

---

### 4. 一貫性と標準 ⭐⭐⭐⭐☆ (4/5)

#### ✅ 良い点

**4.1 カラースキームの統一**
```css
/* UnifiedSidePanel.css:8, 58 */
background: rgba(20, 20, 30, 0.85);
color: #60a5fa; /* 統一されたアクセントカラー */
```
- ブルー系（`#60a5fa`）をアクセントカラーとして一貫使用

**4.2 スペーシングの規則性**
```tsx
// 各タブで統一された padding
padding: '0 20px 10px'  // BodiesTab.tsx:53
padding: '0 20px 20px'  // BodyInspectorContent.tsx:33
```
- 20px の水平パディングを統一

**4.3 フォームスタイルの統一**
```css
/* UnifiedSidePanel.css:128-140 */
.lab-input, .unified-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* ... */
}
```
- すべての入力フィールドで同じスタイル

**4.4 アニメーションの一貫性**
```css
/* UnifiedSidePanel.css:101-104 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```
- タブ切り替え時に統一されたフェードイン

#### ⚠️ 改善点

**4.5 ボタンスタイルの不統一**
```tsx
// UnifiedBodyCreator.tsx:148-157 - 青色の大きなボタン
background: '#3b82f6'

// BodyInspectorContent.tsx:182-189 - 半透明の小さなボタン
background: 'rgba(255, 255, 255, 0.1)'
```
- **問題**: プライマリアクションのスタイルが統一されていない
- **推奨**: ボタンコンポーネントを共通化（`PrimaryButton`, `SecondaryButton` 等）

**4.6 ラベルの大文字小文字の不統一**
```tsx
// BodyInspectorContent.tsx:57
<label>Name</label>  // 最初だけ大文字

// BodyInspectorContent.tsx:93
<label>Radius</label>  // 最初だけ大文字

// BodyInspectorContent.tsx:160
VECTORS & PHYSICS  // すべて大文字
```
- **問題**: ラベルのスタイルが統一されていない
- **推奨**: "Name" なのか "NAME" なのか統一

---

### 5. エラー防止 ⭐⭐☆☆☆ (2/5) **重点改善領域**

#### ⚠️ 重大な問題点

**5.1 削除前の確認が不十分**
```tsx
// BodiesTab.tsx:121
if (confirm(`Delete ${body.name}?`)) removeBody(body.id);
```
- **問題**: ネイティブ confirm のみ（誤クリック防止不十分）
- **推奨**:
  - 2段階確認（例: 削除ボタン → モーダル → 確認ボタン）
  - 重要な天体（Sunなど）は削除不可にする

**5.2 数値入力の検証欠如**
```tsx
// BodyInspectorContent.tsx:84
onChange={(e) => updateBody(selectedBody.id, { mass: parseFloat(e.target.value) })}
```
- **問題**: 無効な値（NaN, 負の数, ゼロ）のチェックなし
- **影響**: シミュレーションがクラッシュする可能性
- **推奨**:
  ```tsx
  const newMass = parseFloat(e.target.value);
  if (!isNaN(newMass) && newMass > 0) {
    updateBody(selectedBody.id, { mass: newMass });
  }
  ```

**5.3 Inspector タブが無効時の説明不足**
```tsx
// TabNavigation.tsx:38-39
disabled={!selectedBodyId}
title={!selectedBodyId ? t('select_body_msg') : t('tab_inspector')}
```
- **問題**: `title` 属性はホバー時のみ表示（モバイルで見えない）
- **推奨**: タブ上に「Select a body first」とテキスト表示

**5.4 モード切り替え時の状態保持**
```tsx
// UnifiedBodyCreator.tsx:10
const [mode, setMode] = useState<'preset' | 'custom'>('preset');
```
- **問題**: Preset → Custom → Preset と切り替えると、Custom の入力内容が失われる可能性
- **推奨**: 入力内容を保持する（または明示的に「入力内容がリセットされます」と警告）

**5.5 重複名の防止なし**
```tsx
// UnifiedBodyCreator.tsx:46 - addBody() に名前チェックなし
addBody(props);
```
- **問題**: 同名の天体を複数作成できてしまう
- **推奨**: 重複チェック、または自動的に番号付加（"Planet", "Planet 2", ...）

**5.6 範囲外の値の制約不足**
```tsx
// BodyInspectorContent.tsx:98
<input type="range" min="0.1" max="100" step="0.1" />
```
- **良い点**: スライダーで範囲制限
- **問題**: 直接数値入力では範囲外も入力可能
- **推奨**: 数値入力にも `min`, `max` 属性を追加

---

### 6. 認識優先（想起不要） ⭐⭐⭐⭐⭐ (5/5)

#### ✅ 優秀な点

**6.1 すべての操作が可視化**
```tsx
// TabNavigation.tsx - すべてのタブが常に表示
// BodiesTab.tsx - すべての天体がリスト表示
```
- ユーザーは「何ができるか」を記憶する必要がない

**6.2 アイコンとテキストの併用**
```tsx
// TabNavigation.tsx:24-25
<Settings size={18} />
<span>{t('tab_controls')}</span>
```
- アイコンだけでなくラベルも表示（認識しやすい）

**6.3 現在値の常時表示**
```tsx
// BodyInspectorContent.tsx:71, 94
<span>10^{Math.log10(selectedBody.mass).toFixed(1)}</span>
<span>{selectedBody.radius.toFixed(1)}</span>
```
- スライダー横に現在値を表示
- ユーザーは値を覚える必要がない

**6.4 検索機能の提供**
```tsx
// BodiesTab.tsx:54-62
<input type="text" placeholder={t('search_placeholder')} />
```
- 天体をスクロールして探す代わりに検索可能

**6.5 フィルタボタンの常時可視化**
```tsx
// BodiesTab.tsx:66-81
(['all', 'star', 'planet', 'black_hole'] as const).map(...)
```
- すべてのフィルタオプションが常に見える

**6.6 Inspector の空状態メッセージ**
```tsx
// InspectorTab.tsx:15-22
<Globe size={48} />
<p>{t('select_body_msg')}</p>
```
- 天体未選択時に何をすべきか明示

---

### 7. 柔軟性と効率性 ⭐⭐⭐☆☆ (3/5)

#### ✅ 良い点

**7.1 プリセットとカスタムの選択**
```tsx
// UnifiedBodyCreator.tsx:10, 66-88
const [mode, setMode] = useState<'preset' | 'custom'>('preset');
```
- 初心者はプリセット、上級者はカスタムフォーム

**7.2 スライダーと数値入力の併用**
```tsx
// BodyInspectorContent.tsx:73-87
<input type="range" />  // 大まかな調整
<input type="number" /> // 精密な入力
```
- 素早い調整（スライダー）と正確な入力（数値）の両立

**7.3 検索とフィルタの組み合わせ**
```tsx
// BodiesTab.tsx:29-40
const filteredBodies = useMemo(() => {
  return bodies.filter(b => matchesSearch && matchesType);
}, [bodies, searchTerm, filterType]);
```
- 複数の絞り込み条件を並行使用可能

#### ⚠️ 改善点

**7.4 キーボードショートカットの欠如**
```tsx
// UnifiedSidePanel.tsx - キーボードイベントハンドリングなし
```
- **問題**: タブ切り替えにマウス必須
- **推奨**:
  - `Ctrl+1/2/3` でタブ切り替え
  - `Ctrl+N` で新規天体追加
  - `Ctrl+F` で検索フォーカス

**7.5 一括操作の未サポート**
```tsx
// BodiesTab.tsx - 単一選択のみ
```
- **問題**: 複数の天体を一度に削除・編集できない
- **推奨**: 複数選択 + 一括削除・一括編集

**7.6 最近使用した値の記憶なし**
```tsx
// UnifiedBodyCreator.tsx:13-20
const [newBody, setNewBody] = useState({...});
```
- **問題**: 前回追加した天体の値を再利用できない
- **推奨**: 「前回と同じ値で作成」ボタン、またはlocalStorage保存

**7.7 お気に入り/ブックマーク機能なし**
```tsx
// 頻繁に使う天体をブックマークする機能なし
```
- **推奨**: ピン留め機能（リストの上部に固定）

**7.8 ドラッグ&ドロップ未サポート**
```tsx
// BodiesTab.tsx - リスト並び替え不可
```
- **推奨**: ドラッグで天体の表示順を変更可能に

---

### 8. 美的でミニマルなデザイン ⭐⭐⭐⭐☆ (4/5)

#### ✅ 優秀な点

**8.1 適切な余白**
```tsx
// BodiesTab.tsx:92-97
gap: '10px', padding: '8px', marginBottom: '4px'
```
- 要素間のスペーシングが適切

**8.2 グラスモーフィズム効果**
```css
/* UnifiedSidePanel.css:8-9 */
background: rgba(20, 20, 30, 0.85);
backdrop-filter: blur(12px);
```
- 背景のぼかしで深度を表現
- 現代的なデザインパターン

**8.3 控えめなアニメーション**
```css
/* UnifiedSidePanel.css:101-104 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
}
```
- アニメーションが短く（0.3s）、控えめ

**8.4 アイコンの適切なサイズ**
```tsx
// TabNavigation.tsx:24
<Settings size={18} />  // タブアイコン

// BodiesTab.tsx:55
<Search size={14} />    // 検索アイコン（小さめ）
```
- コンテキストに応じたサイズ調整

#### ⚠️ 改善点

**8.5 情報密度の不均衡**
```tsx
// BodyInspectorContent.tsx:33-211 - 178行の長大なコンポーネント
```
- **問題**: Inspector タブは情報が多すぎる（スクロール必須）
- **推奨**:
  - タブ内タブ（Basic/Advanced/Actions）
  - アコーディオンの積極活用

**8.6 不要な視覚要素**
```tsx
// UnifiedBodyCreator.tsx:62-64
<h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
  {t('add_body')}
</h3>
```
- **問題**: "ADD BODY" の見出しは不要（タブ名で明確）
- **推奨**: 見出し削除、またはより小さく

**8.7 ボーダーの重複**
```tsx
// UnifiedSidePanel.tsx:50-52
borderBottom: '1px solid rgba(255,255,255,0.05)'

// TabNavigation - さらに borderBottom
```
- **問題**: ボーダーが連続して視覚的にノイジー
- **推奨**: どちらか一方を削除

---

### 9. エラー認識と復旧 ⭐⭐☆☆☆ (2/5) **重点改善領域**

#### ⚠️ 重大な問題点

**9.1 エラーメッセージの欠如**
```tsx
// BodyInspectorContent.tsx:84
onChange={(e) => updateBody(selectedBody.id, { mass: parseFloat(e.target.value) })}
```
- **問題**: 無効な入力（"abc", 負の数）を入れてもエラー表示なし
- **影響**: ユーザーは何が間違っているか分からない
- **推奨**:
  ```tsx
  {error && <span style={{color: '#ff4050'}}>{error}</span>}
  ```

**9.2 削除失敗時のフィードバックなし**
```tsx
// BodiesTab.tsx:121
removeBody(body.id);
```
- **問題**: `removeBody()` の成功/失敗が不明
- **推奨**: トースト通知（"Planet deleted" / "Failed to delete"）

**9.3 ネイティブ confirm の使用**
```tsx
// BodiesTab.tsx:121
if (confirm(`Delete ${body.name}?`))
```
- **問題**: ブラウザのダイアログは UX が悪い
- **推奨**: カスタムモーダル with 明確な Yes/No ボタン

**9.4 フィルタ結果 0 件時のガイダンス不足**
```tsx
// BodiesTab.tsx:132-136
<div>{t('no_bodies_found')}</div>
```
- **良い点**: 空状態メッセージあり
- **問題**: 「フィルタをクリアする」ボタンがない
- **推奨**:
  ```tsx
  <button onClick={() => { setSearchTerm(''); setFilterType('all'); }}>
    Clear filters
  </button>
  ```

**9.5 数値範囲外入力時の挙動不明**
```tsx
// BodyInspectorContent.tsx:98-103
<input type="range" min="0.1" max="100" />
<input type="number" />  // min/max なし
```
- **問題**: 数値入力で範囲外の値を入力できてしまう
- **推奨**:
  - `min`, `max` 属性を追加
  - 範囲外の値を入力時に警告表示

**9.6 復旧手段の欠如**
```tsx
// Undo/Redo 機能なし
```
- **問題**: 誤操作を取り消せない
- **推奨**: Undo スタック、または一時的な「削除を元に戻す」トースト

---

### 10. ヘルプとドキュメント ⭐⭐⭐☆☆ (3/5)

#### ✅ 良い点

**10.1 ツールチップの提供**
```tsx
// TabNavigation.tsx:39
title={!selectedBodyId ? t('select_body_msg') : t('tab_inspector')}

// BodyInspectorContent.tsx:204
title={t('remove')}
```
- ボタンにホバーすると説明表示

**10.2 プレースホルダーテキスト**
```tsx
// BodiesTab.tsx:58
placeholder={t('search_placeholder')}

// UnifiedBodyCreator.tsx:122
placeholder={t('name')}
```
- 入力フィールドに使い方のヒント

**10.3 空状態のガイダンス**
```tsx
// InspectorTab.tsx:19-20
<Globe size={48} />
<p>{t('select_body_msg')}</p>
```
- 何もない状態で何をすべきか明示

#### ⚠️ 改善点

**10.4 コンテキストヘルプの欠如**
```tsx
// 各タブに "?" アイコンなし
```
- **問題**: 初めて使うユーザーが各機能の意味を理解しにくい
- **推奨**:
  - タブごとの "?" アイコン → モーダルで説明
  - または初回訪問時にツアー機能

**10.5 単位の表記なし（一部）**
```tsx
// BodyInspectorContent.tsx:46
<span>{distanceToSun} AU</span>  // ✅ 単位あり

// BodyInspectorContent.tsx:84
<input type="number" value={selectedBody.mass} />  // ❌ 単位なし
```
- **問題**: Mass の単位が不明（kg? 太陽質量?）
- **推奨**:
  ```tsx
  <label>Mass (M☉)</label>  // 太陽質量
  ```

**10.6 プリセットの説明不足**
```tsx
// UnifiedBodyCreator.tsx:94-97
{ type: 'Star', icon: Sun, color: '#facc15' },
```
- **問題**: 各プリセットの詳細（質量、半径など）が見えない
- **推奨**: ホバーまたはクリックで詳細表示

**10.7 バリデーションルールの明示なし**
```tsx
// BodyInspectorContent.tsx - 入力制約の説明なし
```
- **問題**: どの範囲の値を入れるべきか不明
- **推奨**:
  ```tsx
  <label>Mass (0.01 - 1,000,000 M☉)</label>
  ```

**10.8 検索構文のヒントなし**
```tsx
// BodiesTab.tsx:58
<input type="text" placeholder={t('search_placeholder')} />
```
- **問題**: 部分一致か完全一致か不明
- **推奨**:
  ```tsx
  placeholder="Search by name (partial match)"
  ```

---

## 🔍 発見された主要な問題

### 🔴 Critical（重大）

1. **Undo 機能の欠如**
   - ファイル: 全体的な設計
   - 影響: 誤削除したデータを復元できない
   - 優先度: 高

2. **数値検証の欠如**
   - ファイル: [BodyInspectorContent.tsx:84](../src/components/ui/BodyInspectorContent.tsx#L84)
   - 影響: 無効な値でシミュレーションがクラッシュする可能性
   - 優先度: 高

3. **エラーメッセージの欠如**
   - ファイル: 全体的な設計
   - 影響: ユーザーが問題を認識・解決できない
   - 優先度: 高

### 🟠 High（高）

4. **ネイティブ confirm の使用**
   - ファイル: [BodiesTab.tsx:121](../src/components/ui/tabs/BodiesTab.tsx#L121)
   - 影響: デザインの一貫性を損なう
   - 優先度: 中

5. **選択解除方法の不明瞭さ**
   - ファイル: [InspectorTab.tsx](../src/components/ui/tabs/InspectorTab.tsx)
   - 影響: ユーザーが Inspector から抜け出せない
   - 優先度: 中

6. **キーボードショートカットの欠如**
   - ファイル: [UnifiedSidePanel.tsx](../src/components/ui/UnifiedSidePanel.tsx)
   - 影響: パワーユーザーの効率性が低い
   - 優先度: 中

### 🟡 Medium（中）

7. **ローディング状態の欠如**
   - ファイル: [UnifiedBodyCreator.tsx:46](../src/components/ui/UnifiedBodyCreator.tsx#L46)
   - 影響: 処理中かどうか不明
   - 優先度: 低

8. **単位表記の不足**
   - ファイル: [BodyInspectorContent.tsx](../src/components/ui/BodyInspectorContent.tsx)
   - 影響: 値の意味が不明瞭
   - 優先度: 低

9. **フィルタ結果数の非表示**
   - ファイル: [BodiesTab.tsx:66](../src/components/ui/tabs/BodiesTab.tsx#L66)
   - 影響: 検索結果の規模が不明
   - 優先度: 低

---

## 💡 優先順位付き改善提案

### Phase 1: 即時対応（1週間以内）

#### 1.1 数値検証の実装
**ファイル**: `BodyInspectorContent.tsx`

```tsx
const handleMassChange = (value: string) => {
  const newMass = parseFloat(value);
  if (isNaN(newMass)) {
    setError('Invalid number');
    return;
  }
  if (newMass <= 0) {
    setError('Mass must be positive');
    return;
  }
  if (newMass > 1000000) {
    setError('Mass too large (max: 1,000,000)');
    return;
  }
  setError(null);
  updateBody(selectedBody.id, { mass: newMass });
};
```

#### 1.2 カスタム削除確認モーダル
**新規ファイル**: `src/components/ui/common/ConfirmModal.tsx`

```tsx
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, title, message, onConfirm, onCancel, danger = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={danger ? 'btn-danger' : 'btn-primary'}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
```

**使用例**:
```tsx
// BodiesTab.tsx
const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

<ConfirmModal
  isOpen={!!confirmDelete}
  title="Delete Body"
  message={`Are you sure you want to delete "${bodies.find(b => b.id === confirmDelete)?.name}"?`}
  onConfirm={() => {
    removeBody(confirmDelete!);
    setConfirmDelete(null);
  }}
  onCancel={() => setConfirmDelete(null)}
  danger
/>
```

#### 1.3 Inspector タブに選択解除ボタン追加
**ファイル**: `BodyInspectorContent.tsx:35`

```tsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
  <h3 style={{ /* ... */ }}>
    <Settings size={16} color="#60a5fa" />
    {selectedBody.name}
  </h3>
  <button
    onClick={() => selectBody(null)}
    style={{
      background: 'transparent', border: 'none',
      color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer',
      fontSize: '20px', lineHeight: 1
    }}
    title="Close inspector"
  >×</button>
</div>
```

---

### Phase 2: 短期改善（2-4週間）

#### 2.1 Undo/Redo 機能の実装
**ファイル**: `src/store/physicsStore.ts`

```typescript
interface UndoableAction {
  type: 'add' | 'remove' | 'update';
  bodyId: string;
  previousState?: CelestialBody;
  newState?: CelestialBody;
}

interface PhysicsStore {
  // 既存のフィールド...
  history: UndoableAction[];
  historyIndex: number;

  undo: () => void;
  redo: () => void;
}

// 実装
undo: () => {
  const { history, historyIndex } = get();
  if (historyIndex <= 0) return;

  const action = history[historyIndex - 1];
  // アクションを逆適用

  set({ historyIndex: historyIndex - 1 });
}
```

#### 2.2 トースト通知システム
**新規ファイル**: `src/components/ui/common/Toast.tsx`

```tsx
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (props: ToastProps) => {
    setToast(props);
    setTimeout(() => setToast(null), props.duration || 3000);
  };

  return { toast, showToast };
};
```

**使用例**:
```tsx
// BodiesTab.tsx
const { showToast } = useToast();

const handleDelete = (id: string) => {
  removeBody(id);
  showToast({ message: 'Body deleted', type: 'success' });
};
```

#### 2.3 キーボードショートカット
**ファイル**: `UnifiedSidePanel.tsx`

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === '1') { setActiveTab('controls'); e.preventDefault(); }
      if (e.key === '2') { setActiveTab('bodies'); e.preventDefault(); }
      if (e.key === '3') { setActiveTab('inspector'); e.preventDefault(); }
      if (e.key === 'f') {
        setActiveTab('bodies');
        // Focus search input
        document.querySelector('input[type="text"]')?.focus();
        e.preventDefault();
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

#### 2.4 単位の明示
**ファイル**: `BodyInspectorContent.tsx`

```tsx
// Before
<label>{t('mass')}</label>

// After
<label>
  {t('mass')} <span style={{ color: '#666', fontSize: '0.8em' }}>(M☉)</span>
</label>

// Before
<label>Radius</label>

// After
<label>
  Radius <span style={{ color: '#666', fontSize: '0.8em' }}>(km)</span>
</label>
```

---

### Phase 3: 中期改善（1-2ヶ月）

#### 3.1 複数選択機能
**ファイル**: `BodiesTab.tsx`

```tsx
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

const handleBodyClick = (id: string, e: React.MouseEvent) => {
  if (e.shiftKey || e.ctrlKey) {
    // 複数選択モード
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  } else {
    // 単一選択モード
    selectBody(id);
  }
};

// 一括削除ボタン
{selectedIds.size > 0 && (
  <button onClick={() => {
    selectedIds.forEach(id => removeBody(id));
    setSelectedIds(new Set());
  }}>
    Delete {selectedIds.size} bodies
  </button>
)}
```

#### 3.2 コンテキストヘルプ
**新規ファイル**: `src/components/ui/common/ContextHelp.tsx`

```tsx
export const ContextHelp: React.FC<{ topic: string }> = ({ topic }) => {
  const [isOpen, setIsOpen] = useState(false);

  const helpContent = {
    controls: "Control simulation speed, camera mode, and visualization options.",
    bodies: "View all celestial bodies, search, filter, and manage them.",
    inspector: "Edit properties of the selected body including mass, radius, and vectors."
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="help-icon">
        <HelpCircle size={16} />
      </button>
      {isOpen && (
        <HelpModal content={helpContent[topic]} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
};
```

#### 3.3 アクセシビリティ向上
**ファイル**: `TabNavigation.tsx`

```tsx
// ARIA 属性の追加
<div className="tab-navigation" role="tablist">
  <button
    role="tab"
    aria-selected={activeTab === 'controls'}
    aria-controls="controls-panel"
    id="controls-tab"
    onClick={() => onChange('controls')}
    className={`tab-btn ${activeTab === 'controls' ? 'active' : ''}`}
  >
    {/* ... */}
  </button>
</div>

// 対応するパネル
<div
  role="tabpanel"
  id="controls-panel"
  aria-labelledby="controls-tab"
  hidden={activeTab !== 'controls'}
>
  {/* コンテンツ */}
</div>
```

---

## 📈 改善後の期待スコア

改善実装後の予想スコア:

| 評価項目 | 現在 | Phase 1後 | Phase 2後 | Phase 3後 |
|---------|------|-----------|-----------|-----------|
| 1. システム状態の可視性 | 4/5 | **5/5** | 5/5 | 5/5 |
| 2. 現実世界との一致 | 5/5 | 5/5 | 5/5 | 5/5 |
| 3. ユーザー制御と自由 | 3/5 | **4/5** | **5/5** | 5/5 |
| 4. 一貫性と標準 | 4/5 | **5/5** | 5/5 | 5/5 |
| 5. エラー防止 | 2/5 | **4/5** | **5/5** | 5/5 |
| 6. 認識優先 | 5/5 | 5/5 | 5/5 | 5/5 |
| 7. 柔軟性と効率性 | 3/5 | 3/5 | **4/5** | **5/5** |
| 8. 美的でミニマル | 4/5 | 4/5 | **5/5** | 5/5 |
| 9. エラー認識と復旧 | 2/5 | **4/5** | **5/5** | 5/5 |
| 10. ヘルプとドキュメント | 3/5 | **4/5** | 4/5 | **5/5** |
| **総合スコア** | **35/50** | **43/50** | **48/50** | **50/50** |
| **達成率** | **70%** | **86%** | **96%** | **100%** |

---

## 🎯 まとめ

### 実装の成功点
✅ タブベースの統合UIにより、情報の整理に成功
✅ アイコンとラベルの併用で直感的な操作性を実現
✅ 現代的なデザインパターン（グラスモーフィズム）を適用
✅ レスポンシブ対応の基盤を構築
✅ 認識優先の設計（すべての操作が可視化）

### 改善が必要な領域
❌ エラー処理とバリデーションの不足
❌ Undo/Redo 機能の欠如
❌ キーボードショートカットの未実装
❌ 一括操作の未サポート
❌ コンテキストヘルプの不足

### 推奨アクション
1. **即座に対応**: 数値検証、カスタム削除確認モーダル、選択解除ボタン
2. **短期で実装**: Undo/Redo、トースト通知、キーボードショートカット
3. **中期で検討**: 複数選択、コンテキストヘルプ、アクセシビリティ向上

---

**レビュー完了日**: 2026-01-03
**次回レビュー推奨**: Phase 1 完了後（1週間後）
