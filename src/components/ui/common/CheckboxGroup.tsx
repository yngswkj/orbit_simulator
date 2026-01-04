import React from 'react';
import { AlertCircle, Zap } from 'lucide-react';

export interface CheckboxItem {
  /** チェックボックスのID */
  id: string;
  /** ラベルテキスト */
  label: string;
  /** チェック状態 */
  checked: boolean;
  /** 変更ハンドラー */
  onChange: (checked: boolean) => void;
  /** 無効状態 */
  disabled?: boolean;
  /** 警告アイコン表示 */
  warning?: boolean;
  /** バッジテキスト */
  badge?: string;
  /** バッジタイプ */
  badgeType?: 'success' | 'warning' | 'error';
}

export interface CheckboxGroupProps {
  /** チェックボックスのリスト */
  items: CheckboxItem[];
  /** グループラベル（オプション） */
  label?: string;
}

/**
 * チェックボックスグループコンポーネント
 * 複数のチェックボックスを統一されたスタイルで表示
 *
 * @example
 * ```tsx
 * <CheckboxGroup
 *   label="表示設定"
 *   items={[
 *     { id: 'grid', label: 'グリッド', checked: true, onChange: toggleGrid },
 *     { id: 'prediction', label: '軌道予測', checked: false, onChange: togglePrediction, warning: true },
 *   ]}
 * />
 * ```
 */
export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ items, label }) => {
  return (
    <div className="checkbox-group">
      {label && <div className="checkbox-group-label">{label}</div>}
      <div className="checkbox-group-items">
        {items.map((item) => (
          <label
            key={item.id}
            className={`checkbox-wrapper ${item.disabled ? 'disabled' : ''}`}
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => item.onChange(e.target.checked)}
              disabled={item.disabled}
            />
            <span className="checkbox-label">{item.label}</span>

            {item.warning && (
              <span title="High performance cost" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                <AlertCircle
                  size={14}
                  className="checkbox-icon-warning"
                  style={{ color: 'var(--color-warning)' }}
                />
              </span>
            )}

            {item.badge && (
              <span className={`badge badge-${item.badgeType || 'primary'} badge-sm`} style={{ marginLeft: 'auto' }}>
                {item.badgeType === 'success' && <Zap size={10} fill="currentColor" />}
                {item.badge}
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
};
