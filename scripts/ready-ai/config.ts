import type { SyncConfig } from '../types/ready-ai.d.ts';

/**
 * Ready.ai同期システムの設定
 */
export const CONFIG: SyncConfig = {
  // Ready.aiサイトURL
  sourceUrl: 'https://dev.agiletec.net',
  
  // スクレイピング設定
  scraping: {
    waitUntil: 'networkidle0',
    timeout: 30000,
    userAgent: 'AgileTech-Sync-Bot/1.0'
  },
  
  // ファイルパス設定
  paths: {
    scrapedData: './scraped-data',
    components: './src/components/ready-ai',
    config: './uno.config.ts'
  },
  
  // 変換設定
  conversion: {
    componentPrefix: 'ReadyAi',
    removeSelectors: [
      '[data-ready-ai]',
      'script[src*="ready"]',
      '.ready-watermark',
      '.ready-branding',
      '[class*="ready-"]'
    ]
  }
};

/**
 * ログレベル定義
 */
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
} as const;

/**
 * コンポーネント識別パターン
 */
export const COMPONENT_PATTERNS = {
  header: ['header', 'nav', '.navbar', '.header'],
  hero: ['.hero', '.landing', '.banner', 'section:first-child'],
  features: ['.features', '.services', '.benefits', '.advantages'],
  testimonials: ['.testimonials', '.reviews', '.feedback'],
  cta: ['.cta', '.call-to-action', '.action'],
  footer: ['footer', '.footer']
} as const;

/**
 * CSS → UnoCSS変換マッピング
 */
export const CSS_MAPPING = {
  // 色関連
  colors: {
    '#667eea': 'blue-500',
    '#764ba2': 'purple-600',
    '#f093fb': 'pink-400',
    '#f5f7fa': 'gray-50',
    '#c3cfe2': 'gray-300'
  },
  
  // スペーシング関連
  spacing: {
    '10px': '2.5',
    '20px': '5',
    '40px': '10',
    '80px': '20'
  },
  
  // フォントサイズ
  fontSize: {
    '14px': 'text-sm',
    '16px': 'text-base',
    '18px': 'text-lg',
    '24px': 'text-xl',
    '32px': 'text-2xl',
    '48px': 'text-4xl'
  }
} as const;

/**
 * Astroコンポーネントテンプレート
 */
export const ASTRO_TEMPLATE = `---
export interface Props {
  {{PROPS_INTERFACE}}
}

const { {{PROPS_DESTRUCTURE}} } = Astro.props;
---

{{COMPONENT_HTML}}

<style>
{{COMPONENT_STYLES}}
</style>
`;

/**
 * エラーメッセージ定義
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  PARSE_ERROR: 'HTML解析エラーが発生しました',
  CONVERSION_ERROR: 'コンポーネント変換エラーが発生しました',
  FILE_ERROR: 'ファイル操作エラーが発生しました',
  TIMEOUT_ERROR: 'タイムアウトが発生しました'
} as const;
