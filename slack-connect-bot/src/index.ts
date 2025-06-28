import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'
import { InfisicalClient, Auth } from '@infisical/sdk'
import type { SlackOAuthResponse } from './types/slack'
import type { InfisicalSecret } from './types/infisical'
import { SlackService } from './services/slack'
import { Logger } from './utils/logger'
import { getSecretsFromInfisical } from './utils/infisical'
import connect from './routes/connect'
import bot from './routes/bot'
import events from './routes/events'
import publicApi from './routes/public'
import siteProxy from './routes/site-proxy'
import { errorHandler } from './middleware/error'

type Bindings = {
  INFISICAL_CLIENT_ID: string
  INFISICAL_CLIENT_SECRET: string
  INFISICAL_PROJECT_ID: string
  INFISICAL_ENVIRONMENT: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', errorHandler)

app.use('/*', cors({
  origin: ['https://agiletec.net', 'https://slack.com'],
  credentials: true,
}))


// Slack OAuth認証URL生成
app.get('/slack/oauth/url', async (c) => {
  const logger = new Logger({ endpoint: 'oauth_url' })
  try {
    logger.info('Starting OAuth URL generation')
    
    // Infisical統合により環境変数として同期されている
    const secrets = await getSecretsFromInfisical(c)
    const allSecrets: AllSecrets = secrets.reduce((acc, secret) => {
      acc[secret.secretKey as keyof AllSecrets] = secret.secretValue
      return acc
    }, {} as AllSecrets)

    const slackClientId = allSecrets.SLACK_CLIENT_ID
    const redirectUri = allSecrets.SLACK_REDIRECT_URI || 'https://api.agiletec.net/slack/oauth/callback'
    
    logger.info('Slack config', { 
      has_client_id: !!slackClientId,
      redirect_uri: redirectUri,
    })
    
    if (!slackClientId) {
      logger.error('Missing Slack Client ID')
      return c.json({ error: 'Server configuration error' }, 500)
    }

    // Slack OAuth認証URLを生成
    const scopes = [
      'channels:manage',
      'channels:read', 
      'channels:write.invites',
      'groups:read',
      'groups:write',
      'groups:write.invites',
      'chat:write',
      'users:read',
      'app_mentions:read'
    ].join(',')

    const state = Math.random().toString(36).substring(2, 15)
    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${slackClientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
    
    logger.info('OAuth URL generated')
    
    return c.json({
      ok: true,
      auth_url: authUrl,
      state: state
    })
  } catch (error) {
    logger.error('OAuth URL generation error', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.get('/slack/oauth/callback', async (c) => {
  const logger = new Logger({ endpoint: 'oauth_callback' })
  try {
    logger.info('OAuth callback initiated')
    const code = c.req.query('code')
    const state = c.req.query('state')
    
    if (!code) {
      logger.warn('No authorization code provided')
      return c.text('No authorization code provided', 400)
    }

    const envVars = env(c)
    
    const slackClientId = envVars.SLACK_CLIENT_ID
    const slackClientSecret = envVars.SLACK_CLIENT_SECRET
    const redirectUri = envVars.SLACK_REDIRECT_URI || 'https://api.agiletec.net/slack/oauth/callback'

    if (!slackClientId || !slackClientSecret) {
      logger.error('Missing Slack credentials in Infisical')
      return c.text('Server configuration error', 500)
    }

    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: slackClientId,
        client_secret: slackClientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json() as SlackOAuthResponse

    if (!tokenData.ok) {
      logger.error('OAuth error', { error: tokenData.error })
      return c.text(`OAuth error: ${tokenData.error}`, 500)
    }

    logger.info('OAuth successful', {
      team_id: tokenData.team?.id,
      team_name: tokenData.team?.name,
      has_access_token: !!tokenData.access_token,
    })

    // Slack Connectの処理
    const botAccessToken = envVars.SLACK_BOT_TOKEN; // envVarsは既に取得済み

    if (!botAccessToken) {
      logger.error('Missing SLACK_BOT_TOKEN in environment variables for OAuth callback');
      return c.text('Server configuration error: SLACK_BOT_TOKEN is missing', 500);
    }

    const slackService = new SlackService(botAccessToken); // ボットのトークンで初期化

    if (tokenData.team?.name && tokenData.authed_user?.email) {
      const organizationName = tokenData.team.name;
      const userEmail = tokenData.authed_user.email;

      // 組織名からチャンネル名を生成
      const formattedOrgName = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const channelName = `contact-${formattedOrgName}-agiletec`;

      try {
        logger.info('Attempting to create or get channel for Slack Connect', { channelName, userEmail });

        // チャンネルの作成または取得
        const channelResult = await slackService.createChannel(channelName);

        let targetChannelId: string | undefined;

        if (channelResult.ok && channelResult.channel) {
          targetChannelId = channelResult.channel.id;
          logger.info('Channel created or found successfully', { channelId: targetChannelId });
        } else if (channelResult.error === 'name_taken') {
          logger.info('Channel already exists, attempting to find it', { channelName });
          const listResult = await slackService.listChannels(); // listChannels now handles pagination
          const existingChannel = listResult.channels?.find(ch => ch.name === channelName);

          if (existingChannel) {
            targetChannelId = existingChannel.id;
            logger.info('Found existing channel', { channelId: targetChannelId });
          } else {
            logger.error('Channel name taken but could not find existing channel', { channelName, error: listResult.error });
            return c.text('Failed to find existing channel after name conflict', 500);
          }
        } else {
          logger.error('Failed to create channel for Slack Connect', { error: channelResult.error });
          return c.text(`Failed to create channel: ${channelResult.error}`, 500);
        }

        if (targetChannelId) {
          // Slack Connect招待を送信
          logger.info('Sending Slack Connect invite', { channelId: targetChannelId, email: userEmail });
          const inviteResult = await slackService.inviteSharedChannel({
            channel: targetChannelId,
            emails: [userEmail],
          });

          if (inviteResult.ok) {
            logger.info('Slack Connect invitation sent successfully', {
              channelId: targetChannelId,
              inviteId: inviteResult.invite_id,
            });
          } else {
            logger.error('Failed to send Slack Connect invitation', { error: inviteResult.error });
            // ここでエラーを返すか、成功ページにリダイレクトするかは要検討
            // 今回は成功ページにリダイレクトするが、ログには残す
          }
        } else {
          logger.error('No target channel ID available for invitation');
          return c.text('Internal server error: No channel to invite to', 500);
        }

      } catch (error) {
        logger.error('Slack Connect automated flow failed', error);
        return c.text('Internal server error during Slack Connect process', 500);
      }
    } else {
      logger.warn('Missing team name or user email from OAuth response, cannot proceed with automated Slack Connect', {
        has_team_name: !!tokenData.team?.name,
        has_user_email: !!tokenData.authed_user?.email,
      });
      // ユーザーにエラーメッセージを表示するか、別のフローに誘導する
      return c.text('Required Slack information missing for automated Connect setup', 400);
    }

    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Slack連携完了</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f4f4f4;
            }
            .container {
              text-align: center;
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 { color: #2eb67d; }
            p { color: #666; }
            .close-btn {
              margin-top: 1rem;
              padding: 0.5rem 1rem;
              background: #2eb67d;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Slack連携が完了しました！</h1>
            <p>このウィンドウは閉じていただいて構いません。</p>
            <button class="close-btn" onclick="window.close()">ウィンドウを閉じる</button>
          </div>
        </body>
      </html>
    `)
  } catch (error) {
    logger.error('Callback error', error)
    return c.text('Internal server error', 500)
  }
})

// APIエンドポイント
app.route('/slack/connect', connect)
app.route('/slack/bot', bot)
app.route('/slack/events', events)
app.route('/api', publicApi)

// stg.agiletec.net用のプロキシ
// localhostでテストする場合は /proxy/* でアクセス
app.route('/proxy', siteProxy)


// デバッグ用
app.get('/debug/env', async (c) => { // asyncを追加
  const envVars = env(c)
  let infisicalSecrets = {}
  try {
    const secrets = await getSecretsFromInfisical(c)
    secrets.forEach(s => {
      infisicalSecrets[s.secretKey] = s.secretValue ? 'SET' : 'NOT_SET' // 値自体は表示せず、設定されているかのみ
    })
  } catch (e) {
    infisicalSecrets = { error: 'Failed to fetch from Infisical', message: e.message }
  }

  return c.json({
    env_vars_from_worker: {
      INFISICAL_CLIENT_ID: !!envVars.INFISICAL_CLIENT_ID,
      INFISICAL_CLIENT_SECRET: !!envVars.INFISICAL_CLIENT_SECRET,
      INFISICAL_PROJECT_ID: !!envVars.INFISICAL_PROJECT_ID,
      INFISICAL_ENVIRONMENT: !!envVars.INFISICAL_ENVIRONMENT,
      all_other_keys: Object.keys(envVars).filter(k => !k.startsWith('INFISICAL_'))
    },
    secrets_from_infisical: infisicalSecrets
  })
})

app.get('/', (c) => {
  return c.json({ 
    service: 'Slack Connect Bot API',
    version: '1.0.0',
    endpoints: {
      public: [
        'POST /api/create-channel - 公開API：チャンネル作成',
      ],
      oauth: [
        'GET /slack/oauth/url - OAuth認証URL生成',
        'GET /slack/oauth/callback - OAuth認証',
      ],
      connect: [
        'POST /slack/connect/invite - Slack Connect招待',
        'POST /slack/connect/accept - 招待受諾',
      ],
      bot: [
        'POST /slack/bot/message - メッセージ送信',
        'GET /slack/bot/channels - チャンネル一覧',
        'GET /slack/bot/users - ユーザー一覧',
        'POST /slack/bot/invite - ユーザー招待',
      ],
      events: [
        'POST /slack/events - イベント受信',
      ],
      proxy: [
        'GET /proxy/* - サイトプロキシ（開発用）',
      ],
    }
  })
})

export default app