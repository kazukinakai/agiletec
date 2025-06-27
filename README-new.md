# Agile Technology - 全ての企業に自社開発を

[![Astro](https://img.shields.io/badge/Astro-5.8.0-orange.svg)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.10-38B2AC.svg)](https://tailwindcss.com/)

株式会社アジャイルテクノロジーの公式ウェブサイト

## 🚀 概要

生成AIの力で全ての企業に自社開発を提供するフリーランス法人のウェブサイトです。
モダンで高性能、SEOに最適化されたサイトを構築しています。

### 主な特徴

- **モダンなデザイン**: Tailwind CSSを使用したレスポンシブデザイン
- **高性能**: Astroによる静的サイト生成で高速表示
- **SEO最適化**: メタタグ、構造化データ、サイトマップ完備
- **営業特化**: 問い合わせ導線を重視した設計

## 🛠 技術スタック

- **フレームワーク**: [Astro](https://astro.build/) 5.8.0
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/) 4.1.10
- **言語**: TypeScript 5.7.3
- **ビルドツール**: Vite
- **画像最適化**: Sharp
- **サイトマップ**: @astrojs/sitemap

## 📁 プロジェクト構造

```
src/
├── components/
│   ├── common/          # 共通コンポーネント
│   └── sections/        # セクション別コンポーネント
├── layouts/
│   └── BaseLayout.astro # ベースレイアウト
├── pages/
│   └── index.astro      # メインページ
├── styles/
│   └── global.css       # グローバルスタイル
└── types/
    └── index.ts         # 型定義
```

## 🚀 クイックスタート

### 前提条件

- Node.js 18.20.8 以上
- npm 9.0.0 以上

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd agiletec-website

# 依存関係をインストール
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でサイトが開きます。

### ビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

## 📋 サイト構成

### 1. Heroセクション
- キャッチコピー「全ての企業に、自社開発を。」
- 生成AIによる開発支援の訴求
- CTAボタン配置

### 2. TOPメッセージ
- 代表からのメッセージ
- フリーランス法人としての価値提案
- 生成AI活用の背景説明

### 3. NEWSセクション
- PR TIMESとの連携（予定）
- 最新ニュース・プレスリリース表示

### 4. サービス一覧
- AIris（AI電話受付サービス）
- クラウドCTOサービス
- MVP制作支援
- Web制作
- LP制作
- 資料・スライド制作

### 5. 代表プロフィール
- 中井一機のプロフィール
- 技術スキル
- 経歴・実績

### 6. プロダクト紹介
- 自社開発プロダクトの紹介
- 受託開発実績

### 7. CTAセクション
- お問い合わせフォーム
- 無料相談の申し込み

### 8. フッター
- 会社情報
- 法的情報
- SNSリンク

## 🔧 開発ガイドライン

### コンポーネント作成

新しいセクションを追加する場合：

```astro
---
// TypeScript部分
---

<!-- HTML部分 -->
<section class="py-20">
  <!-- セクション内容 -->
</section>

<!-- スタイル部分（必要に応じて） -->
<style>
  /* カスタムスタイル */
</style>
```

### SEO対応

- メタタグの適切な設定
- 構造化データ（JSON-LD）の実装
- サイトマップの自動生成
- robots.txtの設置

## 📈 パフォーマンス

- Lighthouse スコア：90点以上を目標
- Core Web Vitals 対応
- 画像最適化
- CSS/JS最小化

## 🚀 デプロイ

本サイトは以下のプラットフォームでのデプロイに対応：

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

```bash
# 本番ビルド
npm run build

# dist/ フォルダをデプロイ
```

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトは私的利用のため、ライセンスは設定されていません。

## 📞 お問い合わせ

- **会社名**: 株式会社アジャイルテクノロジー
- **代表**: 中井 一機
- **メール**: contact@agiletec.net
- **電話**: 080-1234-5678
- **ウェブサイト**: https://agiletec.net

---

© 2025 株式会社アジャイルテクノロジー. All rights reserved.