# AgileTech & VibeSurfer 統合アーキテクチャ設計書

## 🎯 プロジェクト概要

### 戦略的アプローチ
**「実証実験 → プロダクト化」の段階的戦略**

1. **AgileTech（実証実験）**: Ready.ai同期システムで技術検証
2. **VibeSurfer（SaaS）**: 検証済み技術を基にした包括的ハブサービス

### ビジネス目標
- **短期**: AgileTechでReady.ai→Astro変換技術確立
- **中期**: VibeSurferでコード生成ツールハブ市場に参入
- **長期**: 月額$10K ARR達成、開発者コミュニティのデファクトスタンダード

## 🏗️ システム全体アーキテクチャ

### プロジェクト関係図
```
┌─────────────────────────────────────────────────────────────┐
│                    Strategic Overview                        │
│                                                             │
│  ┌─────────────────┐           ┌─────────────────────────┐  │
│  │   AgileTech     │   Tech    │      VibeSurfer         │  │
│  │ (Proof of       │ Transfer  │   (SaaS Product)        │  │
│  │  Concept)       │    ──→    │                         │  │
│  │                 │           │                         │  │
│  │ Ready.ai Sync   │           │ Multi-Tool Hub          │  │
│  │ System          │           │ Service                 │  │
│  └─────────────────┘           └─────────────────────────┘  │
│           │                              │                  │
│           │                              │                  │
│   ┌───────▼──────┐                ┌─────▼──────┐           │
│   │ Technical    │                │ Commercial │           │
│   │ Validation   │                │ Success    │           │
│   └──────────────┘                └────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## 📋 AgileTech Ready.ai同期システム

### 目的
- Ready.aiで作成されたコーポレートサイトの自動同期
- HTML→Astroコンポーネント変換技術の実証
- VibeSurferの核となる技術の検証

### システム構成
```
┌─────────────────────────────────────────────────────────────┐
│                 AgileTech Ready.ai Sync System              │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │   Scraper   │    │   Parser    │    │  Converter  │    │
│  │             │    │             │    │             │    │
│  │ ┌─────────┐ │    │ ┌─────────┐ │    │ ┌─────────┐ │    │
│  │ │Puppeteer│ │───▶│ │ Cheerio │ │───▶│ │ Astro   │ │    │
│  │ │ + Hash  │ │    │ │Component│ │    │ │Component│ │    │
│  │ │Detection│ │    │ │Detection│ │    │ │Generator│ │    │
│  │ └─────────┘ │    │ └─────────┘ │    │ └─────────┘ │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│                                                             │
│              ┌─────────────────────────────┐               │
│              │        CI/CD System         │               │
│              │     (GitHub Actions)        │               │
│              └─────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### 技術スタック
- **スクレイピング**: Puppeteer + 変更検知（MD5ハッシュ）
- **解析**: Cheerio + セマンティック識別アルゴリズム
- **変換**: HTML→Astro + CSS→UnoCSS
- **自動化**: GitHub Actions（6時間ごと実行）
- **管理**: TypeScript完全対応 + 構造化ログ

### ファイル構造
```
/Users/kazuki/github/agiletec/
├── scripts/
│   ├── ready-ai/
│   │   ├── scraper.ts          # メインスクレイピング
│   │   ├── parser.ts           # HTML/CSS解析
│   │   ├── converter.ts        # Astro変換
│   │   ├── config.ts           # 設定管理
│   │   └── main.ts             # CLI実行
│   ├── utils/
│   │   ├── logger.ts           # 構造化ログ
│   │   ├── file-manager.ts     # ファイル操作
│   │   └── hash.ts             # 変更検知
│   └── types/
│       └── ready-ai.d.ts       # 型定義
├── scraped-data/               # データ保存
│   ├── current/                # 最新データ
│   ├── history/                # 履歴
│   └── processed/              # 変換済み
├── .github/workflows/
│   └── ready-ai-sync.yml       # CI/CD設定
└── docs/
    ├── ARCHITECTURE.md         # このファイル
    └── TASK.md                 # タスク管理
```

## 🌟 VibeSurfer SaaSプラットフォーム

### ビジョン
「すべてのコード生成ツールを繋ぐ架け橋」として、開発者がツール間を自由に移行できる環境を提供

### 価値提案
1. **ツール間移行コストゼロ**: Ready.ai ↔ v0 ↔ Bolt等の自由な移行
2. **ベンダーロックイン回避**: どのツールにも依存しない開発環境
3. **最適ツール選択**: 状況に応じた最適なツールの使い分け

### システム構成
```
┌─────────────────────────────────────────────────────────────┐
│                    VibeSurfer Platform                      │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  │   Input Tools   │    │   Universal      │    │  Output Format  │
│  │                 │    │   Component      │    │                 │
│  │ ┌─────────────┐ │    │    System        │    │ ┌─────────────┐ │
│  │ │ Ready.ai    │ │───▶│                  │───▶│ │ React/Next  │ │
│  │ │ v0          │ │    │ ┌──────────────┐ │    │ │ Vue/Nuxt    │ │
│  │ │ Bolt        │ │    │ │ UniversalComp │ │    │ │ Svelte      │ │
│  │ │ Uizard      │ │    │ │ + Metadata   │ │    │ │ Flutter     │ │
│  │ │ Figma       │ │    │ │ + AI Engine │ │    │ │ HTML/CSS    │ │
│  │ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│  └─────────────────┘    └──────────────────┘    └─────────────────┘
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              SaaS Platform Services                    │ │
│  │                                                         │ │
│  │ Authentication  │  Project Mgmt  │  API Service  │  UI │ │
│  │ (NextAuth.js)   │  (PostgreSQL)  │  (REST+WS)    │     │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 技術スタック
```
Frontend:  Next.js 15.3+ + TypeScript + Tailwind CSS + Radix UI
Backend:   Next.js API Routes + PostgreSQL + Prisma
Auth:      NextAuth.js (GitHub/Google OAuth)
Payment:   Stripe (サブスクリプション + API課金)
Deploy:    Vercel + Supabase + Cloudflare R2
Monitor:   Sentry + PostHog + Vercel Analytics
```

### コア技術: UniversalComponent
```typescript
interface UniversalComponent {
  id: string;
  type: 'layout' | 'form' | 'display' | 'navigation';
  props: Record<string, any>;
  children: UniversalComponent[];
  styles: UniversalStyles;
  metadata: {
    originalTool: 'ready-ai' | 'v0' | 'bolt' | 'uizard' | 'figma';
    confidence: number;
    createdAt: Date;
  };
}

interface ConversionPipeline {
  parse: (input: string, format: InputFormat) => UniversalComponent[];
  transform: (components: UniversalComponent[]) => UniversalComponent[];
  export: (components: UniversalComponent[], target: OutputFormat) => string;
}
```

## 💰 収益モデル

### Freemium戦略
```
Free Plan:     月10回変換、基本フォーマット
Pro Plan:      $29/月 - 無制限変換、全フォーマット、API
Enterprise:    $99/月 - チーム機能、カスタムパーサー

API Pricing:   従量課金制
               $0.10/変換 (個人)
               $0.05/変換 (Enterprise Volume)
```

### 市場分析
- **TAM**: $50B (ローコード/ノーコード市場)
- **SAM**: $5B (デザインツール・コード生成)
- **SOM**: $500M (ツール間変換ニーズ)

## 🔄 技術移転戦略

### AgileTech → VibeSurfer技術移植計画

1. **Ready.aiパーサー移植**
   - AgileTechで検証済みのHTML解析ロジック
   - セマンティックコンポーネント識別アルゴリズム
   - CSS→フレームワーク変換技術

2. **汎用化・拡張**
   - Ready.ai専用 → 汎用パーサーシステム
   - Astro専用 → 複数フレームワーク対応
   - 単一サイト → 大量処理対応

3. **品質保証**
   - AgileTechでの実績を基にした信頼性
   - 実際の運用データによる改善
   - エラーハンドリング・リカバリー機能

## 🎯 開発フェーズ

### Phase 1: 実証実験 (AgileTech)
**目標**: Ready.ai→Astro変換技術の完全確立
- ✅ 基盤システム実装完了
- [ ] 実際のReady.aiサイトとの同期成功
- [ ] 変換精度95%以上達成
- [ ] 自動CI/CD稼働

### Phase 2: MVP開発 (VibeSurfer)
**目標**: Ready.ai→React変換のSaaS化
- [ ] Next.js 15.3+プロジェクト初期化
- [ ] 基本UI/認証システム
- [ ] Ready.aiパーサー移植
- [ ] Reactエクスポーター実装

### Phase 3: 機能拡張
**目標**: 複数ツール対応・スケールアップ
- [ ] v0、Boltパーサー追加
- [ ] API提供開始
- [ ] チーム機能・エンタープライズ対応
- [ ] AI機能強化

## 🔧 開発インフラ

### モノレポ構成
```
Separate Repositories Strategy:
- /Users/kazuki/github/agiletec     (Ready.ai同期システム)
- /Users/kazuki/github/VibeSurfer   (SaaSプラットフォーム)

利点:
- 独立した開発サイクル
- 技術スタックの最適化
- セキュリティ分離
- スケーラビリティ
```

### CI/CD戦略
```
AgileTech:
- GitHub Actions (Ready.ai同期)
- 6時間ごと自動実行
- Astroサイト自動デプロイ

VibeSurfer:
- Vercel自動デプロイ
- Preview環境自動生成
- E2Eテスト自動化
```

## 📊 成功指標

### AgileTech KPI
- 同期成功率: 95%以上
- 変換精度: 90%以上
- 処理時間: 5分以内
- 稼働率: 99%以上

### VibeSurfer KPI
- 月間アクティブユーザー: 1,000人
- 変換成功率: 95%以上
- API応答時間: 100ms以内
- 月次収益: $10K ARR

## 🔒 セキュリティ・コンプライアンス

### データ保護
- 保存時・転送時の暗号化
- GDPR完全対応
- SOC2コンプライアンス
- レート制限・不正利用防止

### 技術的セキュリティ
- NextAuth.js認証
- JWT + refresh token
- API key管理
- Puppeteerサンドボックス

## 🌐 グローバル展開計画

### 国際化対応
- 多言語UI (日本語、英語優先)
- 地域別価格設定
- タイムゾーン対応
- 法的要件への準拠

### マーケティング戦略
- 開発者コミュニティ重視
- オープンソース戦略
- 技術ブログ・カンファレンス
- インフルエンサー連携

---

**最終更新**: 2025年6月28日  
**バージョン**: 2.0.0  
**ステータス**: 実装フェーズ  
**責任者**: kazuki (1人ユニコーン創業者)
