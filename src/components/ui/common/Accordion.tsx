import React, { useState } from 'react';
import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react';
import './Accordion.css';

export interface AccordionProps {
  /** アコーディオンのタイトル */
  title: string;
  /** 初期状態で開いているか */
  defaultOpen?: boolean;
  /** タイトル横のアイコン */
  icon?: LucideIcon;
  /** 子要素 */
  children: React.ReactNode;
  /** カスタムクラス名 */
  className?: string;
  /** 開閉状態が変更されたときのコールバック */
  onToggle?: (isOpen: boolean) => void;
}

/**
 * アコーディオンコンポーネント
 * 情報を折りたたんで表示し、認知的負荷を軽減
 *
 * @example
 * ```tsx
 * <Accordion title="詳細設定" icon={Settings} defaultOpen={false}>
 *   <CheckboxGroup items={advancedSettings} />
 * </Accordion>
 * ```
 */
export const Accordion: React.FC<AccordionProps> = ({
  title,
  defaultOpen = true,
  icon: Icon,
  children,
  className = '',
  onToggle,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  return (
    <div className={`accordion ${className}`}>
      <button
        className="accordion-header"
        onClick={handleToggle}
        aria-expanded={isOpen}
        type="button"
      >
        <span className="accordion-title">
          {Icon && <Icon size={16} className="accordion-icon" aria-hidden="true" />}
          {title}
        </span>
        <span className="accordion-toggle" aria-hidden="true">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {isOpen && (
        <div className="accordion-content">
          {children}
        </div>
      )}
    </div>
  );
};
