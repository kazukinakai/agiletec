// Ready.ai同期システム用型定義

export interface ReadyAiSiteData {
  /** 取得したHTMLコンテンツ */
  html: string;
  /** CSSコンテンツ */
  css: string;
  /** JSコンテンツ（もしあれば） */
  js?: string;
  /** コンテンツのMD5ハッシュ */
  hash: string;
  /** 取得日時 */
  timestamp: Date;
  /** ソースURL */
  sourceUrl: string;
}

export interface ParsedComponent {
  /** コンポーネント名 */
  name: string;
  /** コンポーネントタイプ */
  type: 'header' | 'hero' | 'features' | 'footer' | 'section' | 'unknown';
  /** HTMLコンテンツ */
  html: string;
  /** 関連するCSS */
  styles: string[];
  /** 抽出されたprops */
  props: ComponentProps;
  /** 信頼度（0-1） */
  confidence: number;
}

export interface ComponentProps {
  /** テキストコンテンツ */
  text?: Record<string, string>;
  /** 画像URL */
  images?: Record<string, string>;
  /** リンクURL */
  links?: Record<string, string>;
  /** カスタムプロパティ */
  custom?: Record<string, any>;
}

export interface ConversionResult {
  /** 生成されたAstroコンポーネント */
  astroComponent: string;
  /** 関連するスタイル（UnoCSS） */
  styles: string;
  /** コンポーネントファイル名 */
  filename: string;
  /** 変換成功フラグ */
  success: boolean;
  /** エラーメッセージ（もしあれば） */
  error?: string;
}

export interface SyncConfig {
  /** Ready.aiサイトURL */
  sourceUrl: string;
  /** スクレイピング設定 */
  scraping: {
    waitUntil: 'networkidle0' | 'networkidle2' | 'domcontentloaded';
    timeout: number;
    userAgent: string;
  };
  /** ファイルパス設定 */
  paths: {
    scrapedData: string;
    components: string;
    config: string;
  };
  /** 変換設定 */
  conversion: {
    componentPrefix: string;
    removeSelectors: string[];
  };
}

export interface SyncResult {
  /** 同期成功フラグ */
  success: boolean;
  /** 変更があったかどうか */
  hasChanges: boolean;
  /** 処理されたコンポーネント数 */
  componentCount: number;
  /** 実行時間（ミリ秒） */
  duration: number;
  /** エラー情報（もしあれば） */
  error?: string;
  /** 詳細ログ */
  logs: string[];
}

export interface HashComparison {
  /** 前回のハッシュ */
  previousHash?: string;
  /** 現在のハッシュ */
  currentHash: string;
  /** 変更があるかどうか */
  hasChanged: boolean;
  /** 比較日時 */
  comparedAt: Date;
}

// VibeSurfer用の拡張型定義

export interface UniversalComponent {
  /** 一意のID */
  id: string;
  /** コンポーネントタイプ */
  type: 'layout' | 'form' | 'display' | 'navigation';
  /** プロパティ */
  props: Record<string, any>;
  /** 子コンポーネント */
  children: UniversalComponent[];
  /** スタイル情報 */
  styles: UniversalStyles;
  /** メタデータ */
  metadata: {
    /** 元のツール */
    originalTool: 'ready-ai' | 'v0' | 'bolt' | 'uizard' | 'figma';
    /** 信頼度 */
    confidence: number;
    /** 作成日時 */
    createdAt: Date;
  };
}

export interface UniversalStyles {
  /** レイアウト関連 */
  layout?: {
    display?: string;
    position?: string;
    width?: string;
    height?: string;
    margin?: string;
    padding?: string;
  };
  /** カラー関連 */
  colors?: {
    background?: string;
    color?: string;
    border?: string;
  };
  /** タイポグラフィ */
  typography?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    textAlign?: string;
  };
  /** エフェクト */
  effects?: {
    boxShadow?: string;
    borderRadius?: string;
    opacity?: string;
    transform?: string;
  };
}

export type InputFormat = 
  | 'ready-ai-html'
  | 'v0-tsx'
  | 'bolt-vue'
  | 'uizard-json'
  | 'figma-api';

export type OutputFormat = 
  | 'react-tsx'
  | 'vue-sfc'
  | 'svelte-component'
  | 'astro-component'
  | 'html-css'
  | 'flutter-dart';

export interface ConversionPipeline {
  /** 入力データのパース */
  parse: (input: string, format: InputFormat) => UniversalComponent[];
  /** コンポーネントの変換・最適化 */
  transform: (components: UniversalComponent[]) => UniversalComponent[];
  /** 指定フォーマットでのエクスポート */
  export: (components: UniversalComponent[], target: OutputFormat) => string;
}
