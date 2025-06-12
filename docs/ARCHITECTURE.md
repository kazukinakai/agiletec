# Agile Technology コーポレートサイト アーキテクチャ

## プロジェクト概要

**ビジョン**: 「全ての企業に自社開発を」をビジョンとするAgile Technologyの高パフォーマンスなコーポレートサイト

**主要機能**:
- カラフルな斜線を使った印象的なアニメーション背景
- スクロール連動アニメーション（右上→左下へ移動）
- 会社情報・ビジョン・サービス紹介
- レスポンシブデザイン
- 高速パフォーマンス（SEO最適化）

## 技術スタック

### フロントエンド
- **Astro 4.x**: 静的サイト生成（SSG）メインフレームワーク
- **Motion**: アニメーションライブラリ（旧Framer Motion、軽量版使用）
- **React**: アニメーション部分のみ（Island Architecture）
- **Tailwind CSS**: スタイリング
- **TypeScript**: 型安全性

### デプロイ・インフラ
- **Cloudflare Pages**: 静的サイトホスティング
- **Domain**: agiletec.net
- **CDN**: Cloudflare Global Network

### 開発ツール
- **Vite**: ビルドツール（Astro組み込み）
- **ESLint + Prettier**: コード品質
- **Git**: バージョン管理

## アーキテクチャ設計思想

### 1. パフォーマンス最優先
- **静的生成**: 全ページSSGで高速配信
- **部分ハイドレーション**: アニメーション部分のみJavaScript
- **最小バンドルサイズ**: Motion mini (2.6kb) を使用
- **CDN最適化**: Cloudflare Pages で世界中に高速配信

### 2. Island Architecture
```
[静的HTML] + [アニメーション島] + [静的HTML]
    ↓           ↓              ↓
   SEO      インタラクティブ   軽量
```

### 3. アニメーション戦略
- **スクロール検知**: Intersection Observer API
- **GPU加速**: transform のみ使用
- **60FPS**: スムーズなアニメーション
- **レスポンシブ**: 全デバイス対応

## ディレクトリ構成

```
agiletec/
├── docs/                    # プロジェクト文書
│   ├── ARCHITECTURE.md      # このファイル
│   └── TASK.md             # タスク管理
├── src/
│   ├── components/         # 再利用可能コンポーネント
│   │   ├── common/         # 汎用コンポーネント
│   │   ├── animation/      # アニメーション専用
│   │   └── sections/       # ページセクション
│   ├── pages/              # Astroページ
│   │   ├── index.astro     # トップページ
│   │   ├── about/          # 会社情報
│   │   ├── services/       # サービス
│   │   └── contact/        # お問い合わせ
│   ├── layouts/            # ページレイアウト
│   ├── styles/             # スタイル
│   │   ├── global.css      # グローバルスタイル
│   │   └── components/     # コンポーネント別
│   ├── utils/              # ユーティリティ
│   └── types/              # TypeScript型定義
├── public/                 # 静的アセット
│   ├── images/             # 画像
│   ├── icons/              # アイコン
│   └── favicon.ico
├── astro.config.mjs        # Astro設定
├── tailwind.config.mjs     # Tailwind設定
├── tsconfig.json           # TypeScript設定
├── package.json            # 依存関係
└── README.md
```

## 状態管理とデータフロー

### 静的コンテンツ
- Astroテンプレート内で直接定義
- Markdown/MDXファイルでのコンテンツ管理
- 型安全なprops受け渡し

### アニメーション状態
- Motion hooks（useScroll, useAnimation）
- React state（useStateベース）
- スクロール位置に基づく計算

```typescript
// アニメーション状態管理例
const { scrollY } = useScroll();
const animateLines = useTransform(scrollY, [0, 1000], [0, 100]);
```

## 斜線アニメーション仕様

### デザイン要件
- **色**: 青 (#3B82F6), 赤 (#EF4444), 緑 (#10B981), 黄 (#F59E0B), オレンジ (#F97316)
- **角度**: 右上から左下へ45度
- **動き**: スクロール量に応じて右上→左下に移動
- **レスポンシブ**: 画面サイズに応じた配置調整

### 技術実装
```typescript
// 斜線アニメーション設定
const diagonalLines = [
  { color: 'blue', size: 'large', speed: 1.2 },
  { color: 'red', size: 'medium', speed: 0.8 },
  { color: 'green', size: 'small', speed: 1.5 },
  // ...
];
```

### パフォーマンス最適化
- **GPU加速**: `transform: translate3d()` 使用
- **レイヤー分離**: `will-change: transform`
- **フレーム最適化**: `requestAnimationFrame` ベース
- **可視領域判定**: `Intersection Observer`

## SEO・アクセシビリティ

### SEO最適化
- **静的HTML**: 検索エンジンに優しい
- **メタタグ**: 動的メタ情報生成
- **構造化データ**: JSON-LD対応
- **サイトマップ**: 自動生成

### アクセシビリティ
- **セマンティックHTML**: 適切なタグ使用
- **キーボードナビゲーション**: フォーカス管理
- **スクリーンリーダー**: ARIA属性
- **モーション配慮**: `prefers-reduced-motion` 対応

## パフォーマンス目標

### Core Web Vitals
- **LCP**: < 2.5秒
- **FID**: < 100ms
- **CLS**: < 0.1
- **FCP**: < 1.8秒

### バンドルサイズ目標
- **初期ページ**: < 100KB
- **JavaScript**: < 50KB
- **CSS**: < 30KB
- **画像最適化**: WebP/AVIF使用

## CI/CD フロー

### 開発フロー
1. **開発**: ローカル開発環境
2. **ビルド**: Astro SSG ビルド
3. **テスト**: Lighthouse, Jest
4. **デプロイ**: Cloudflare Pages

### 自動化
- **プレビュー**: プルリクエスト毎
- **本番デプロイ**: main ブランチマージ時
- **パフォーマンス監視**: 継続的測定

## セキュリティ

### 静的サイトの利点
- **攻撃面最小**: サーバーサイド処理なし
- **DDoS耐性**: CDN分散配信
- **更新頻度**: 低頻度で安全性維持

### 追加対策
- **HTTPS**: Cloudflare SSL
- **ヘッダー**: セキュリティヘッダー設定
- **依存関係**: 定期的な脆弱性チェック

---

**Next Step**: このアーキテクチャに基づいて `TASK.md` でMVP構築のロードマップを定義