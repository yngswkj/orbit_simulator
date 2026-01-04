import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** ボタンのバリエーション */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  /** ボタンのサイズ */
  size?: 'sm' | 'md' | 'lg';
  /** 左側のアイコン */
  leftIcon?: LucideIcon;
  /** 右側のアイコン */
  rightIcon?: LucideIcon;
  /** アイコンのみ表示 */
  iconOnly?: boolean;
  /** 全幅表示 */
  fullWidth?: boolean;
  /** 読み込み中状態 */
  loading?: boolean;
  /** 子要素 */
  children?: React.ReactNode;
}

/**
 * 統一ボタンコンポーネント
 *
 * デザインシステムに基づいた一貫性のあるボタンコンポーネント。
 * 様々なバリエーション、サイズ、アイコン表示に対応。
 *
 * @example
 * ```tsx
 * // 基本的な使用
 * <Button variant="primary" onClick={handleClick}>
 *   保存
 * </Button>
 *
 * // アイコン付き
 * <Button variant="success" leftIcon={Play}>
 *   再生
 * </Button>
 *
 * // アイコンのみ
 * <Button variant="secondary" leftIcon={Settings} iconOnly title="設定" />
 *
 * // 全幅
 * <Button variant="primary" fullWidth>
 *   送信
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      iconOnly = false,
      fullWidth = false,
      loading = false,
      disabled,
      className = '',
      children,
      style,
      ...props
    },
    ref
  ) => {
    const classes = [
      'btn',
      `btn-${variant}`,
      size !== 'md' && `btn-${size}`,
      iconOnly && 'btn-icon',
      fullWidth && 'btn-full',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // アイコンサイズをボタンサイズに応じて調整
    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        style={style}
        {...props}
      >
        {loading && (
          <span className="btn-spinner" aria-hidden="true" style={{
            display: 'inline-block',
            animation: 'spin 1s linear infinite'
          }}>
            ⟳
          </span>
        )}
        {!loading && LeftIcon && <LeftIcon size={iconSize} aria-hidden="true" />}
        {!iconOnly && children}
        {!loading && RightIcon && <RightIcon size={iconSize} aria-hidden="true" />}
      </button>
    );
  }
);

Button.displayName = 'Button';

// スピナーアニメーション用のスタイルを追加
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
