# Slack Connect Bot

Hono + Cloudflare Workers で実装したSlack Connect統合API。

## 機能

- Slack OAuth認証
- Slack Connectチャンネルの自動作成
- 外部組織への招待送信
- チャンネル招待の受諾

## セットアップ

### 1. Infisicalの設定

#### 必要な環境変数

Infisicalプロジェクトの `/slack` パスに以下のシークレットを設定：

**必須項目:**
| キー | 説明 |
|------|------|
| `SLACK_CLIENT_ID` | Slack AppのClient ID |
| `SLACK_CLIENT_SECRET` | Slack AppのClient Secret |
| `SLACK_REDIRECT_URI` | `https://api.agiletec.net/slack/oauth/callback` |
| `SLACK_BOT_TOKEN` | Bot User OAuth Token（xoxb-で始まる） |
| `SLACK_SIGNING_SECRET` | App Credentials の Signing Secret |

**オプション項目（OAuth時の自動処理用）:**
| キー | 説明 | デフォルト値 |
|------|------|------------|
| `DEFAULT_CHANNEL_NAME` | 自動作成するチャンネル名 | `agiletec-connect` |
| `PARTNER_EMAILS` | 招待するメールアドレス（カンマ区切り） | なし |

⚠️ **重要**: これらの値は**Infisical GUIでのみ**設定してください。ローカルに`.env`ファイルは作成しません。

### 2. wrangler.tomlの設定

```toml
[vars]
INFISICAL_CLIENT_ID = "YOUR_INFISICAL_CLIENT_ID"
INFISICAL_CLIENT_SECRET = "YOUR_INFISICAL_CLIENT_SECRET"
INFISICAL_PROJECT_ID = "YOUR_PROJECT_ID"
INFISICAL_ENVIRONMENT = "prod"
```

### 3. デプロイ

```bash
# 依存関係のインストール
pnpm install

# 開発環境
pnpm dev

# 本番環境へデプロイ
pnpm deploy:production
```

### 4. Cloudflare DNS設定

以下のCNAMEレコードを追加：

```
api  CNAME  slack-connect-bot.workers.dev
stg  CNAME  slack-connect-bot.workers.dev
```

または、既存のProxiedレコードがある場合はWorkers Routesで制御されます。

## API エンドポイント

### 認証
- `GET /slack/oauth/callback` - Slack OAuthコールバック

### Slack Connect
- `POST /slack/connect/invite` - Slack Connectチャンネルへの招待
- `POST /slack/connect/accept` - Slack Connect招待の受諾

### Bot機能
- `POST /slack/bot/message` - メッセージ送信
- `GET /slack/bot/channels` - チャンネル一覧取得
- `GET /slack/bot/users` - ユーザー一覧取得
- `POST /slack/bot/invite` - ユーザーをチャンネルに招待

### イベント
- `POST /slack/events` - Slackイベントの受信

### ヘルスチェック
- `GET /` - APIステータス

## APIリファレンス

### POST /slack/connect/invite

外部組織をSlack Connectチャンネルに招待します。

**Headers:**
```
Authorization: Bearer {slack_access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "channel_name": "project-collab",
  "emails": ["user@external.com"],
  "user_ids": ["U1234567890"],
  "is_private": false
}
```

**Response:**
```json
{
  "ok": true,
  "channel_id": "C1234567890",
  "channel_name": "project-collab",
  "invite_id": "I1234567890"
}
```

### POST /slack/connect/accept

Slack Connect招待を受諾します。

**Headers:**
```
Authorization: Bearer {slack_access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "channel_name": "project-collab",
  "invite_id": "I1234567890",
  "team_id": "T1234567890"
}
```

## Slack Appの設定

1. https://api.slack.com/apps でアプリを作成

2. OAuth & Permissions:
   - Redirect URL: `https://api.agiletec.net/slack/oauth/callback`
   - Bot Token Scopes:
     - `channels:manage`
     - `channels:read`
     - `channels:write.invites`
     - `groups:read`
     - `groups:write`
     - `groups:write.invites`
     - `chat:write`
     - `users:read`
     - `app_mentions:read`

3. Event Subscriptions:
   - Request URL: `https://api.agiletec.net/slack/events`
   - Subscribe to bot events:
     - `message.channels`
     - `message.groups`
     - `app_mention`
     - `channel_created`
     - `member_joined_channel`

4. Slack Connect:
   - Enable Slack Connect for your app

## ログ

構造化ログをJSON形式で出力:
```json
{
  "timestamp": "2025-06-27T10:00:00.000Z",
  "level": "INFO",
  "message": "OAuth successful",
  "team_id": "T1234567890",
  "team_name": "Example Team"
}
```

## 🔒 セキュリティルール（必読）

このプロジェクトでは、機密情報を保護するため以下のルールを厳守してください：

### ✅ 必須ルール

1. **`.env` ファイルは絶対に作成しない**
   - すべての環境変数は `infisical run --` 経由で実行時に注入
   - 以下のパターンはすべて自動検出・ブロックされます：
     - `.env`, `.ENV`, `.EnV`（大文字小文字問わず）
     - `.env.production`, `.env.staging`, `.env.任意の名前`
     - `.env-production`, `.env_test`（ハイフン、アンダースコア）
     - `production.env`, `local.env`, `*.env`
     - `test-env`, `myapp-env`, `*-env`
     - `.env.json`, `.secret-env`

2. **Secretsの管理はInfisical GUIで行う**
   - https://app.infisical.com でのみ値を設定・変更
   - コード内に直接値を書かない

3. **環境変数はキー名のみ参照**
   ```typescript
   // ✅ 良い例
   const clientId = env(c).SLACK_CLIENT_ID
   
   // ❌ 悪い例
   const clientId = "xoxb-1234567890"  // 絶対にダメ！
   ```

4. **`.cursorignore` を設定済み**
   - `.env` ファイルはCursorやCopilotから読み取れません
   - 誤って作成してもAIツールには表示されません

5. **Secretsをコピー・共有しない**
   - Slack、メール、ドキュメントに貼り付けない
   - 必要な場合はInfisicalへのアクセス権限を付与

### 🛡️ セキュリティチェック

```bash
# Lintでシークレットの検出
pnpm lint

# プッシュ前に必ず実行
git diff --cached | grep -E "(xox[baprs]-|sk-|ghp_|ghs_|pat_)"
```

### 📝 開発フロー

```bash
# 1. Infisicalにログイン（初回のみ）
pnpm infisical:login

# 2. 開発環境で実行（環境変数は自動注入）
pnpm dev

# 3. デプロイ（環境変数は自動注入）
pnpm deploy:production

# 4. Lintチェック
pnpm lint
```

### ⚠️ 緊急時の対応

もしSecretが漏洩した場合：
1. 即座にInfisicalで該当のSecretを無効化
2. 新しいSecretを生成してInfisicalに登録
3. セキュリティチームに報告

### 🚫 禁止事項

- `console.log(process.env)` の使用
- 環境変数の値をエラーメッセージに含める
- デバッグ目的でもSecretをログ出力しない
- `.env.example` にも実際の値を書かない