// Agile Technology Project Types

// 斜線アニメーション用の型定義
export interface DiagonalLine {
  id: string;
  color: 'blue' | 'red' | 'green' | 'yellow' | 'orange';
  size: 'small' | 'medium' | 'large';
  speed: number;
  startX: number;
  startY: number;
  width: number;
  height: number;
}

// ページ設定用の型定義
export interface PageMeta {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
}

// 会社情報の型定義
export interface CompanyInfo {
  name: string;
  vision: string;
  founder: {
    nameJa: string;
    nameEn: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
  };
}

// サービス情報の型定義
export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
}

// アニメーション設定の型定義
export interface AnimationConfig {
  enabled: boolean;
  speed: number;
  lineCount: number;
  respectReducedMotion: boolean;
}
