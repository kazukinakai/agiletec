# Agile Technology コーポレートサイト

「全ての企業に自社開発を」をビジョンとするAgile Technologyの高パフォーマンスなコーポレートサイト

## 🚀 特徴

- **高パフォーマンス**: Astro + Motion による最適化されたアニメーション
- **レスポンシブデザイン**: 全デバイス対応
- **アクセシビリティ**: WCAG準拠
- **SEO最適化**: 静的サイト生成による高速配信

## 🛠️ 技術スタック

- **フレームワーク**: Astro 4.x
- **UI**: React (アニメーション部分のみ)
- **スタイリング**: Tailwind CSS
- **アニメーション**: Motion (旧Framer Motion)
- **言語**: TypeScript
- **デプロイ**: Cloudflare Pages

## 📁 プロジェクト構成

```
agiletec/
├── docs/                    # プロジェクト文書
├── src/
│   ├── components/         # 再利用可能コンポーネント
│   ├── pages/              # Astroページ
│   ├── layouts/            # ページレイアウト
│   ├── styles/             # スタイル
│   ├── utils/              # ユーティリティ
│   └── types/              # TypeScript型定義
├── public/                 # 静的アセット
└── astro.config.mjs        # Astro設定
```

## 🏃‍♂️ セットアップ

### 前提条件
- Node.js 18.x以上
- npm, yarn, または pnpm

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## 🎨 アニメーション仕様

### 斜線アニメーション
- **色**: 青 (#3B82F6), 赤 (#EF4444), 緑 (#10B981), 黄 (#F59E0B), オレンジ (#F97316)
- **動き**: 右上から左下へ45度
- **トリガー**: スクロール連動
- **パフォーマンス**: GPU加速、60FPS

## 📊 パフォーマンス目標

- **LCP**: < 2.5秒
- **FID**: < 100ms
- **CLS**: < 0.1
- **バンドルサイズ**: < 100KB (初期ページ)

## 🚀 デプロイ

Cloudflare Pagesへの自動デプロイ設定済み

```bash
# 本番ビルド
npm run build

# デプロイ (CI/CDで自動実行)
# main ブランチへのpushで自動デプロイ
```

## 📝 開発ガイド

詳細な開発ガイドは以下を参照：
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - 技術アーキテクチャ
- [TASK.md](./docs/TASK.md) - 開発タスク管理

## 🤝 コントリビューション

1. イシューを作成
2. フィーチャーブランチを作成
3. 変更をコミット
4. プルリクエストを作成

## 📄 ライセンス

Private Project - Agile Technology
