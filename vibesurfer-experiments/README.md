# VibeSurfer実験環境

AgileTech内でVibeSurfer技術を検証するための実験環境です。

## 🎯 実験の目的

1. **Ready.ai → React変換**の精度検証
2. **ユニバーサルパーサー**のプロトタイプ実装
3. **v0、Bolt等の他ツール対応**の基盤構築
4. **VibeSurfer SaaS**の技術検証

## 🚀 使用方法

### 1. Ready.ai → React変換テスト

```bash
# Ready.aiデータを最新に同期
pnpm sync:ready-ai

# VibeSurfer変換テスト実行
pnpm vibesurfer:test
```

### 2. ユニバーサルパーサー単体テスト

```bash
# パーサーの基本動作確認
pnpm vibesurfer:parse
```

### 3. 出力結果の確認

```bash
# 変換結果ディレクトリに移動
cd vibesurfer-experiments/output

# 生成されたReactコンポーネントを確認
ls -la
cat HeaderFixed.tsx
cat HeroRelative.tsx
```

## 📁 ディレクトリ構造

```
vibesurfer-experiments/
├── universal-parser.ts     # ユニバーサルパーサー本体
├── test-converter.ts       # 変換テストスイート
├── output/                 # 変換結果出力先
│   ├── *.tsx              # Reactコンポーネント
│   └── package.json       # 依存関係定義
└── README.md              # このファイル
```

## 🧪 実験結果

### Ready.ai解析精度

- **検出コンポーネント数**: 18個（header, hero, footer, sections）
- **平均信頼度**: 約70%
- **主な課題**: sectionコンポーネントの分類精度向上が必要

### 変換品質

- **React変換**: TypeScript + Tailwind対応
- **Props抽出**: テキストコンテンツの自動props化
- **スタイル変換**: UnoCSS → Tailwind変換（要改善）

## 🎯 今後の改善点

### Phase 1: 精度向上（Ready.ai特化）
- [ ] コンポーネント分類アルゴリズム改善
- [ ] CSS変換精度向上（UnoCSS → Tailwind）
- [ ] Props抽出の自動化強化
- [ ] アクセシビリティチェック機能

### Phase 2: マルチツール対応
- [ ] v0パーサー実装
- [ ] Boltパーサー実装
- [ ] Cursorパーサー実装
- [ ] 統一インターフェース完成

### Phase 3: SaaS機能
- [ ] Web UI実装
- [ ] リアルタイムプレビュー
- [ ] プロジェクト管理機能
- [ ] API提供

## 🔬 技術検証項目

### ✅ 検証済み
- Puppeteerによる安定したスクレイピング
- Cheerioベースの高速HTML解析
- TypeScript型安全な変換パイプライン
- GitHub Actions自動化

### 🚧 検証中
- マルチフレームワーク出力（React, Vue, Astro）
- AIによるコンポーネント名前付け
- 自動アクセシビリティ改善
- バンドルサイズ最適化

### 📋 未検証
- リアルタイム変換性能
- 大規模サイト対応
- エンタープライズ機能
- 商用利用時の安定性

## 💡 VibeSurfer MVP への移行戦略

1. **技術移植**: 検証済みの変換エンジンをライブラリ化
2. **UI開発**: Next.js 15.3+でのWeb UI実装
3. **API設計**: 変換機能のREST API化
4. **認証**: NextAuth.jsによるユーザー管理
5. **課金**: Stripe統合による月額課金

この実験環境での成果を基に、独立したVibeSurferプロダクトを開発します。