/**
 * デザイントークン定義
 * 全UIコンポーネントで使用する色、サイズ、スペーシング等の定数
 *
 * @module styles/tokens
 */

// ========== カラーパレット ==========

export const colors = {
  // Primary（メインカラー）
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',  // メインの青
    500: '#3b82f6',  // 濃い青
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Semantic Colors（意味のある色）
  bg: {
    panel: 'rgba(20, 20, 30, 0.85)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    hover: 'rgba(255, 255, 255, 0.05)',
    active: 'rgba(96, 165, 250, 0.2)',
    input: 'rgba(0, 0, 0, 0.3)',
    card: 'rgba(255, 255, 255, 0.02)',
  },

  border: {
    default: 'rgba(255, 255, 255, 0.1)',
    focus: 'rgba(96, 165, 250, 0.5)',
    hover: 'rgba(255, 255, 255, 0.2)',
  },

  text: {
    primary: 'rgba(255, 255, 255, 0.95)',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    disabled: 'rgba(255, 255, 255, 0.3)',
  },

  // Status Colors
  success: '#00ce7c',
  error: '#ff4050',
  warning: '#ffb302',
  info: '#60a5fa',
} as const;

// ========== スペーシング ==========

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
} as const;

// ========== ボーダー半径 ==========

export const radius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
} as const;

// ========== タイポグラフィ ==========

export const typography = {
  size: {
    xs: '0.7rem',    // 11.2px
    sm: '0.85rem',   // 13.6px
    base: '0.9rem',  // 14.4px
    lg: '1rem',      // 16px
    xl: '1.1rem',    // 17.6px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
  },
  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
} as const;

// ========== 影 ==========

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

// ========== アニメーション ==========

export const animations = {
  duration: {
    fast: '0.1s',
    normal: '0.2s',
    slow: '0.3s',
  },
  easing: {
    default: 'ease',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;

// ========== z-index階層 ==========

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ========== ヘルパー関数 ==========

/**
 * HEX色をRGBA形式に変換
 * @param color - HEX色コード（例: "#3b82f6"）
 * @param opacity - 透明度（0-1）
 * @returns RGBA文字列（例: "rgba(59, 130, 246, 0.5)"）
 */
export const rgba = (color: string, opacity: number): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * スペーシング値を数値として取得
 * @param size - スペーシングキー
 * @returns ピクセル値（例: 8）
 */
export const getSpacingValue = (size: keyof typeof spacing): number => {
  return parseInt(spacing[size], 10);
};
