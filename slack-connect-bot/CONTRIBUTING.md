# Contributing Guide

## 🔐 セキュリティファースト

このプロジェクトでは、機密情報保護を最優先事項としています。

### 開発前の準備

1. **Infisicalアクセス権限の取得**
   - プロジェクト管理者に連絡してアクセス権限をリクエスト
   - https://app.infisical.com でログイン確認

2. **Infisical CLIのセットアップ**
   ```bash
   # CLIでログイン
   pnpm infisical:login
   ```

3. **`.cursorignore` の確認**
   - プロジェクトルートに `.cursorignore` があることを確認
   - AIツール（Cursor、Copilot等）が環境変数を読み取れないことを確認

### 開発ルール

#### ❌ 絶対にやってはいけないこと

1. **`.env` ファイルの作成**
   ```bash
   # ❌ 悪い例
   echo "SLACK_CLIENT_ID=xxx" > .env
   
   # ✅ 良い例（Infisical経由で実行）
   pnpm dev  # infisical run が自動実行される
   ```

2. **Secretの直接記述**
   ```typescript
   // ❌ 悪い例
   const token = "xoxb-1234567890-abcdef"
   
   // ✅ 良い例
   const token = env(c).SLACK_BOT_TOKEN
   ```

3. **Secretのログ出力**
   ```typescript
   // ❌ 悪い例
   console.log(`Token: ${token}`)
   logger.info('Config', { token })
   
   // ✅ 良い例
   logger.info('Auth successful', { has_token: !!token })
   ```

#### ✅ 推奨される実装パターン

1. **環境変数の参照**
   ```typescript
   // Hono with env adapter
   import { env } from 'hono/adapter'
   
   const config = env(c)
   const clientId = config.SLACK_CLIENT_ID
   ```

2. **エラーハンドリング**
   ```typescript
   // Secretを含まないエラーメッセージ
   if (!token) {
     throw new Error('Authentication configuration missing')
     // NOT: throw new Error(`Token ${token} is invalid`)
   }
   ```

3. **デバッグ情報**
   ```typescript
   logger.debug('OAuth config', {
     has_client_id: !!clientId,
     has_client_secret: !!clientSecret,
     redirect_uri: redirectUri, // URLは安全
   })
   ```

### コミット前のチェックリスト

- [ ] `pnpm lint` でシークレット検出チェックを実行
- [ ] `.env` ファイルが存在しないことを確認
- [ ] 環境変数の値がコードに含まれていないことを確認
- [ ] エラーメッセージにSecretが含まれていないことを確認
- [ ] ログ出力にSecretが含まれていないことを確認

### Pull Request時の注意

1. **PR説明にSecretを書かない**
2. **スクリーンショットにSecretが映っていないか確認**
3. **レビュアーはセキュリティ観点でもレビュー**

### トラブルシューティング

#### Infisical認証エラー
```bash
# 再ログイン
infisical logout
infisical login
```

#### 環境変数が読み込まれない
```bash
# プロジェクトとの紐付け確認
infisical init
```

#### ローカルテスト用の一時的な環境変数
```bash
# セッション内でのみ有効（推奨）
SLACK_CLIENT_ID=test pnpm dev:local

# ❌ .envファイルは作成しない
```

### セキュリティインシデント発生時

1. **即座に報告** - セキュリティチームまたはプロジェクト管理者に連絡
2. **Secret無効化** - Infisicalで該当Secretを無効化
3. **履歴確認** - git履歴にSecretが含まれていないか確認
4. **再発防止** - インシデントレポートを作成

### 質問・サポート

- セキュリティに関する質問は遠慮なく管理者へ
- 「これは安全？」と思ったら、必ず確認してから実装