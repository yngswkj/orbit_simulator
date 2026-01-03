# Laboratory Mode UI 修正計画 (Laboratory Mode UI Fix Plan)

## 目的 (Goal)
Laboratory Mode（研究所モード）のUIコンポーネント実装において、プロジェクトに導入されていないTailwind CSSのクラスが使用されていました。
その結果、UIのスタイルが適用されず、トグルボタンやパネルが正しく表示されない（画面外や透明になる）問題が発生しています。
これらのコンポーネントを標準的なCSS（`LabMode.css`）を使用するようにリファクタリングし、UIを正常に表示させます。

## ユーザーレビュー事項 (User Review Required)
> [!IMPORTANT]
> 既存のTailwindクラス記述を削除し、新しいCSSファイル `src/components/ui/lab/LabMode.css` を導入します。機能的な変更はありませんが、見た目のスタイル定義が変更されます。

## 変更内容 (Proposed Changes)

### スタイル定義 (Styles)

#### [NEW] [LabMode.css](file:///c:/Users/yngsw/dev/orbit-simulator/src/components/ui/lab/LabMode.css)
以下のクラスを定義します：
- `.lab-toggle`: 固定配置のトグルボタン用（フラスコアイコン）。`fixed`, `top`, `right`, `z-index` を適切に設定。
- `.lab-panel`: パネル共通のスタイル（背景色のぼかし、ボーダー、角丸）。
- `.lab-list-panel`: 天体リストパネル用。
- `.lab-inspector`: プロパティインスペクタ用。
- `.lab-modal`: 天体追加モーダル用。
- その他: 入力フィールド、ボタンスタイルなど。

### コンポーネント修正 (Components)

以下のファイルで、Tailwindクラス（`className="..."`）を削除し、`LabMode.css` のクラスを適用します。

#### [MODIFY] [LabModeToggle.tsx](file:///c:/Users/yngsw/dev/orbit-simulator/src/components/ui/lab/LabModeToggle.tsx)
- `LabMode.css` をインポート。
- CSSクラス `.lab-toggle` を適用。

#### [MODIFY] [BodyListPanel.tsx](file:///c:/Users/yngsw/dev/orbit-simulator/src/components/ui/lab/BodyListPanel.tsx)
- `LabMode.css` をインポート。
- コンテナに `.lab-panel`, `.lab-list-panel` を適用。

#### [MODIFY] [PropertyInspector.tsx](file:///c:/Users/yngsw/dev/orbit-simulator/src/components/ui/lab/PropertyInspector.tsx)
- `LabMode.css` をインポート。
- コンテナに `.lab-panel`, `.lab-inspector` を適用。

#### [MODIFY] [AddBodyModal.tsx](file:///c:/Users/yngsw/dev/orbit-simulator/src/components/ui/lab/AddBodyModal.tsx)
- `LabMode.css` をインポート。
- モーダルオーバーレイとコンテンツのスタイルを適用。

## 検証計画 (Verification Plan)

### 自動検証 (Automated Verification)
- **Browser Subagent**:
    - アプリケーションを開き、"Laboratory Mode" トグルボタンが画面内に表示されているか確認（`fixed` ポジションが効いているか）。
    - トグルボタンをクリックし、天体リストパネルが表示されるか確認。
    - パネル背景やボタンがスタイルされているか（透明になっていないか）確認。

### 手動検証 (Manual Verification)
- ユーザーにスクリーンショット等でアイコンが表示されたことを確認してもらう。
