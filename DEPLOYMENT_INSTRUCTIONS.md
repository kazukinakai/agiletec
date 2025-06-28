# 🚀 Cloudflare Pages デプロイ手順

## 手順1: Cloudflareで新プロジェクト作成

### Cloudflareダッシュボード
1. https://dash.cloudflare.com/ → Pages
2. "Create a project" → "Connect to Git"
3. GitHub連携後、リポジトリ選択: `kazukinakai/agiletec`

### ビルド設定
```
Project name: agiletec-demo
Framework preset: Astro
Build command: pnpm build
Build output directory: dist
Root directory: /
Node.js version: 18
```

### Environment Variables
```
NODE_VERSION=18
PNPM_VERSION=9
```

## 手順2: カスタムドメイン設定

### Pages設定
1. 作成されたプロジェクト → Custom domains
2. "Set up a custom domain"
3. ドメイン入力: `demo.agiletec.net`

### DNS設定（agiletec.netのDNS管理）
```
Type: CNAME
Name: demo
Target: agiletec-demo.pages.dev
TTL: Auto
Proxy status: Proxied（オレンジ雲）
```

## 手順3: GitHub Secrets設定

リポジトリ → Settings → Secrets and variables → Actions

```
CLOUDFLARE_API_TOKEN = your_api_token
CLOUDFLARE_ACCOUNT_ID = your_account_id
CLOUDFLARE_ZONE_ID = your_zone_id (agiletec.net)
```

### API Token作成方法
1. Cloudflareダッシュボード → My Profile → API Tokens
2. "Create Token" → "Custom token"
3. Permissions:
   - Account: Cloudflare Pages:Edit
   - Zone: Zone:Read, Cache Purge:Edit
   - Zone Resources: Include Specific zone: agiletec.net

## 手順4: 確認

### 初回デプロイ確認
1. Cloudflare Pages → agiletec-demo → Deployments
2. ビルドログ確認
3. https://agiletec-demo.pages.dev でアクセステスト

### カスタムドメイン確認  
1. DNS伝播確認: https://www.whatsmydns.net/
2. https://demo.agiletec.net でアクセステスト

### 自動デプロイ確認
1. GitHub → Actions タブ
2. "Deploy to Cloudflare Pages" ワークフロー実行確認

## 🎯 最終的なURL構成

```
https://demo.agiletec.net     → 新しいAstroサイト（今回のプロジェクト）
https://dev.agiletec.net      → Ready.ai（既存、維持）
https://agiletec.net          → 既存サイト（維持）
```

## 🔧 トラブルシューティング

### ビルドエラーの場合
```bash
# ローカルでテスト
pnpm install
pnpm build
```

### DNSが反映されない場合
- 最大48時間かかる場合あり
- Cloudflare DNS Checkerで確認

### 自動デプロイが動かない場合
- GitHub Secrets再確認
- API Token権限確認
- Cloudflareプロジェクト名確認

---

この設定で既存のページとバッティングせず、`demo.agiletec.net`でアクセスできるようになります！