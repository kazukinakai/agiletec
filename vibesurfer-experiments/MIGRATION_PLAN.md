# VibeSurfer独立移行計画

## 🎯 移行戦略

現在のAgileTech内での実験成功を受けて、VibeSurferを独立プロジェクトに移行します。

### Option A: Turborepoモノレポ構造 ⭐️ 推奨

```bash
/Users/kazuki/github/agiletec/
├── packages/
│   ├── vibesurfer-core/          # 変換エンジン（共通ライブラリ）
│   ├── vibesurfer-web/           # Next.js SaaS UI
│   ├── vibesurfer-cli/           # CLI ツール
│   └── agiletec-website/         # 既存のコーポレートサイト
├── apps/
│   └── playground/               # テスト・実験環境
└── packages.json                 # モノレポ設定
```

**メリット**:
- コード共有が簡単
- 統一的な開発環境
- 技術検証が継続的
- Git履歴が保持される

### Option B: 独立リポジトリ

```bash
/Users/kazuki/github/VibeSurfer/   # 完全独立
├── packages/
│   ├── core/                     # 変換エンジン
│   ├── web/                      # Next.js SaaS
│   └── cli/                      # CLI
└── examples/
    └── ready-ai-conversion/      # AgileTechから移植
```

**メリット**:
- 完全な分離
- 異なるライセンス可能
- 商用化が明確

## 🚀 推奨移行手順（Option A）

### Phase 1: モノレポ化（今週）

```bash
# 1. Turborepo初期化
cd /Users/kazuki/github/agiletec
npx create-turbo@latest . --use-pnpm

# 2. 既存プロジェクトを移動
mkdir -p packages/agiletec-website
mv src/ packages/agiletec-website/
mv scripts/ packages/agiletec-website/
mv astro.config.mjs packages/agiletec-website/

# 3. VibeSurfer Core抽出
mkdir -p packages/vibesurfer-core
mv vibesurfer-experiments/ packages/vibesurfer-core/src/
```

### Phase 2: VibeSurfer Web開発（来月）

```bash
# Next.js 15.3+ プロジェクト作成
mkdir packages/vibesurfer-web
cd packages/vibesurfer-web
npx create-next-app@latest . --typescript --tailwind --app

# Core依存関係設定
{
  "dependencies": {
    "@vibesurfer/core": "workspace:*"
  }
}
```

### Phase 3: 商用化準備（3ヶ月後）

```bash
# 独立リポジトリへの移行
cd /Users/kazuki/github
git clone agiletec/ VibeSurfer/
cd VibeSurfer
# AgileTech固有ファイルの削除
# VibeSurfer専用設定
```

## 📁 モノレポ構造詳細

### packages/vibesurfer-core/

```typescript
// パッケージ構造
export * from './parsers/universal-parser.js';
export * from './converters/framework-converter.js';
export * from './analyzers/component-analyzer.js';
export * from './types/index.js';

// 使用例
import { UniversalParser } from '@vibesurfer/core';
const parser = new UniversalParser();
```

### packages/vibesurfer-web/

```
src/
├── app/                          # Next.js App Router
│   ├── (dashboard)/
│   │   ├── projects/
│   │   └── convert/
│   ├── api/
│   │   ├── convert/route.ts      # 変換API
│   │   └── auth/
│   └── layout.tsx
├── components/
│   ├── ui/                       # Radix UI + Tailwind
│   ├── conversion/               # 変換関連UI
│   └── dashboard/                # ダッシュボード
└── lib/
    ├── auth.ts                   # NextAuth設定
    ├── db.ts                     # Prisma設定
    └── stripe.ts                 # 課金設定
```

### packages/agiletec-website/

```
# 既存のAstroサイト（そのまま維持）
# VibeSurfer Coreを使って継続的にReady.ai同期
```

## 🔧 技術スタック統一

### 共通設定

```json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.7.2",
    "@types/node": "^20.0.0"
  }
}
```

### Turbo設定

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

## 📈 開発フロー

### 日常開発

```bash
# 全体ビルド
pnpm build

# 並列開発
pnpm dev  # 全packages同時起動

# 個別開発
pnpm --filter agiletec-website dev
pnpm --filter vibesurfer-web dev
pnpm --filter vibesurfer-core test
```

### CI/CD

```yaml
# .github/workflows/ci.yml
- name: Build all packages
  run: pnpm build
  
- name: Test all packages  
  run: pnpm test

- name: Deploy AgileTech
  if: changed('packages/agiletec-website/**')
  # Cloudflare Pages

- name: Deploy VibeSurfer
  if: changed('packages/vibesurfer-web/**')  
  # Vercel
```

## 🎯 移行メリット

### 技術的メリット
- **コード再利用**: Core engineを両方で使用
- **型安全性**: TypeScriptでの統一
- **テスト効率**: 共通テストスイート
- **開発効率**: ホットリロード共有

### ビジネス的メリット
- **技術実証**: AgileTechでの継続検証
- **段階的移行**: リスク分散
- **商用準備**: 明確な分離準備
- **投資効率**: 既存資産活用

## 📅 実行タイムライン

### 今週（2025年6月28日〜）
- [ ] Turborepo導入
- [ ] 基本モノレポ構造作成
- [ ] VibeSurfer Core抽出

### 来週（2025年7月5日〜）
- [ ] VibeSurfer Web初期実装
- [ ] 認証システム基盤
- [ ] 基本UI/UX

### 来月（2025年8月）
- [ ] MVP機能完成
- [ ] βテスト開始
- [ ] 商用化準備

### 3ヶ月後（2025年10月）
- [ ] 独立リポジトリ検討
- [ ] 正式ローンチ
- [ ] スケールアップ

この計画で進めることで、既存の技術検証成果を最大限活用しながら、VibeSurferの商用化を効率的に進められます。