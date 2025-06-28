# Ready.ai 同期システム設計書

## 🎯 概要

Ready.aiで作成されたコーポレートサイト（dev.agiletec.net）を自動で同期し、既存のAstroプロジェクトに統合するシステム。VibeSurferプロダクトの技術検証も兼ねる。

## 🏗️ システム構成

### ディレクトリ構造
```
/Users/kazuki/github/agiletec/
├── scripts/
│   ├── ready-ai/
│   │   ├── scraper.ts          # メインスクレイパー
│   │   ├── parser.ts           # HTML解析・コンポーネント識別
│   │   ├── converter.ts        # Astro/UnoCSS変換
│   │   └── config.ts           # 設定管理
│   ├── utils/
│   │   ├── hash.ts             # 変更検知（MD5ハッシュ）
│   │   ├── file-manager.ts     # ファイル操作
│   │   └── logger.ts           # ログ管理
│   └── types/
│       └── ready-ai.d.ts       # 型定義
├── .github/workflows/
│   └── ready-ai-sync.yml       # 自動同期CI
├── scraped-data/               # 取得データ保存
│   ├── current/                # 最新データ
│   ├── history/                # 履歴（タイムスタンプ付き）
│   └── processed/              # 変換済みAstroコンポーネント
└── docs/
    ├── READY_AI_SYNC.md        # このファイル
    └── TASK.md                 # タスク管理
```

## 🔄 処理フロー

### 1. データ取得フェーズ
1. **スクレイピング**: dev.agiletec.netからHTML/CSS取得
2. **変更検知**: 前回のハッシュと比較
3. **データ保存**: scraped-data/current/ に保存

### 2. 解析フェーズ
1. **HTML解析**: Cheerioを使用してDOM構造解析
2. **コンポーネント識別**: セマンティックな単位でコンポーネント分割
3. **スタイル抽出**: CSS解析とUnoCSS変換

### 3. 変換フェーズ
1. **Astroコンポーネント生成**: .astroファイル形式に変換
2. **スタイル統合**: 既存のUnoCSS設定に統合
3. **ファイル配置**: src/components/ready-ai/ に配置

### 4. 統合フェーズ
1. **インポート更新**: 必要なコンポーネントをページに統合
2. **テスト実行**: ビルドテストと表示確認
3. **コミット**: 変更があった場合のみGitコミット

## 🛠️ 技術スタック

### Core Dependencies
- **puppeteer**: ヘッドレスブラウザでのスクレイピング
- **cheerio**: HTML解析（jQuery-likeなAPI）
- **crypto-js**: ハッシュ生成（変更検知用）

### 開発支援
- **prettier**: コード整形
- **eslint**: 静的解析
- **typescript**: 型安全性

## 📝 設定管理

### config.ts
```typescript
export const CONFIG = {
  // Ready.aiサイトURL
  sourceUrl: 'https://dev.agiletec.net',
  
  // スクレイピング設定
  scraping: {
    waitUntil: 'networkidle0' as const,
    timeout: 30000,
    userAgent: 'AgileTech-Sync-Bot/1.0'
  },
  
  // ファイルパス
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
      '.ready-watermark'
    ]
  }
};
```

## 🎨 コンポーネント変換ルール

### HTML → Astro変換
1. **セマンティック分割**:
   - `<header>` → `Header.astro`
   - `.hero, .landing` → `Hero.astro`
   - `.features, .services` → `Features.astro`
   - `<footer>` → `Footer.astro`

2. **Props化**:
   - テキストコンテンツ → props
   - 画像URL → props
   - リンクURL → props

3. **スタイル処理**:
   - CSS → UnoCSS変換
   - グラデーション → UnoCSS gradient
   - アニメーション → UnoCSS transition

### CSS → UnoCSS変換例
```css
/* Ready.ai CSS */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 20px;
  text-align: center;
}

/* UnoCSS equivalent */
.hero-section {
  @apply bg-gradient-to-br from-blue-500 to-purple-600 py-20 px-5 text-center;
}
```

## 🔧 自動化設定

### GitHub Actions ワークフロー
```yaml
name: Ready.ai Sync
on:
  schedule:
    - cron: '0 */6 * * *'  # 6時間ごと
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run Ready.ai Sync
        run: pnpm run sync:ready-ai
        
      - name: Commit changes
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: '🔄 Ready.ai sync update'
```

## 📊 監視・ログ

### ログレベル
- **INFO**: 正常な同期完了
- **WARN**: 軽微な問題（一部要素の変換失敗等）
- **ERROR**: 重大な問題（サイトアクセス不可等）

### メトリクス
- 同期頻度
- 変更検知率
- 変換成功率
- ビルド時間

## 🎯 VibeSurferへの活用

この実証実験で得られる知見：

1. **Ready.ai特有のHTML構造パターン**
2. **効率的なコンポーネント分割手法**
3. **CSS → UnoCSS変換アルゴリズム**
4. **変更検知・差分管理システム**

これらの知見をVibeSurferの汎用パーサーに応用し、Ready.ai以外のツール（v0、Bolt、Uizard等）にも対応可能な基盤技術を確立する。

## 🚀 実装マイルストーン

### Week 1: 基盤構築
- [x] ディレクトリ構造作成
- [ ] 基本的なスクレイパー実装
- [ ] HTML解析ロジック実装

### Week 2: 変換システム
- [ ] Astroコンポーネント変換
- [ ] UnoCSS変換ロジック
- [ ] ファイル管理システム

### Week 3: 自動化
- [ ] GitHub Actions設定
- [ ] エラーハンドリング
- [ ] ログ・監視システム

### Week 4: 最適化・ドキュメント
- [ ] パフォーマンス最適化
- [ ] ドキュメント完成
- [ ] VibeSurfer設計開始

---

**更新日**: 2025年6月28日  
**バージョン**: 1.0.0  
**ステータス**: 設計完了・実装開始
