# デプロイメントガイド

## 🚀 Cloudflare Pages設定（5分で完了）

### 1. Cloudflareダッシュボードで設定

1. [Cloudflare Pages](https://pages.cloudflare.com/)にアクセス
2. "Create a project" → "Connect to Git"
3. GitHubアカウント連携
4. `kazukinakai/agiletec`リポジトリ選択

### 2. ビルド設定

```
Framework preset: Astro
Build command: pnpm build
Build output directory: dist
Root directory: /
Environment variables: (なし)
```

### 3. デプロイ

- 初回デプロイ実行
- URLが発行される: `agiletec.pages.dev`

### 4. カスタムドメイン設定

```
1. Pages → Custom domains → Add custom domain
2. "agiletec.net" を追加
3. DNSレコード設定:
   - CNAME: @ → agiletec.pages.dev
   または
   - CNAME: www → agiletec.pages.dev
```

## 🎯 推奨URL構成

```
agiletec.net         → Cloudflare Pages（Astroサイト）
dev.agiletec.net     → Ready.ai（現状維持）
app.vibesurfer.work  → VibeSurfer SaaS（将来）
```

## 📱 デプロイ後の確認項目

- [ ] トップページ表示
- [ ] スクロールアニメーション動作
- [ ] Ready.ai同期データ反映
- [ ] レスポンシブ対応
- [ ] パフォーマンス（Lighthouse 90+）

## 🔧 GitHub Secrets設定

GitHubリポジトリ → Settings → Secrets → Actions で追加:

```
CLOUDFLARE_API_TOKEN = xxxxxx
CLOUDFLARE_ACCOUNT_ID = xxxxxx  
CLOUDFLARE_ZONE_ID = xxxxxx
```

これで自動デプロイが有効になります！