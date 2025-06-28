# Cloudflare Pages サブドメイン設定

## 🎯 推奨サブドメイン構成

```
demo.agiletec.net     → 新しいAstroサイト（このプロジェクト）
dev.agiletec.net      → Ready.ai（現状維持）
agiletec.net          → 既存サイト（現状維持）
```

## 🚀 Cloudflare Pages新プロジェクト作成手順

### 1. 新しいPagesプロジェクト作成

1. Cloudflareダッシュボード → Pages
2. "Create a project" → "Connect to Git"
3. リポジトリ: `kazukinakai/agiletec`
4. **プロジェクト名**: `agiletec-demo` （重要：既存と区別）

### 2. ビルド設定

```
Framework preset: Astro
Build command: pnpm build
Build output directory: dist
Root directory: /（空欄でOK）
Node.js version: 18
```

### 3. Environment Variables

```
NODE_VERSION=18
PNPM_VERSION=9
```

### 4. カスタムドメイン設定

プロジェクト作成後：
1. Pages → agiletec-demo → Custom domains
2. "Set up a custom domain"
3. **ドメイン入力**: `demo.agiletec.net`
4. DNS設定（自動または手動）

## 📋 DNS設定（agiletec.netドメイン管理画面）

```
Type: CNAME
Name: demo
Target: agiletec-demo.pages.dev
TTL: Auto
```

## 🔧 GitHub Actions更新

既存のワークフローを修正して、正しいプロジェクト名を指定：