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
    const envVars = env(c)
    const slackClientId = envVars.SLACK_CLIENT_ID
    const redirectUri = envVars.SLACK_REDIRECT_URI || 'https://api.agiletec.net/slack/oauth/callback'
    
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
    if (tokenData.access_token) {
      const slackService = new SlackService(tokenData.access_token)
      
      // デフォルトチャンネル名を取得
      const defaultChannelName = envVars.DEFAULT_CHANNEL_NAME || 'agiletec-connect'
      const partnerEmails = envVars.PARTNER_EMAILS?.split(',') || []
      
      try {
        // チャンネルの作成または取得
        logger.info('Creating or getting channel', { channelName: defaultChannelName })
        const channelResult = await slackService.createChannel(defaultChannelName)
        
        if (channelResult.ok && channelResult.channel) {
          logger.info('Channel ready', { channelId: channelResult.channel.id })
          
          // Slack Connect招待を送信
          if (partnerEmails.length > 0) {
            const inviteResult = await slackService.inviteSharedChannel({
              channel: channelResult.channel.id,
              emails: partnerEmails,
            })
            
            if (inviteResult.ok) {
              logger.info('Slack Connect invitations sent', { 
                channelId: channelResult.channel.id,
                emailCount: partnerEmails.length 
              })
            } else {
              logger.error('Failed to send invitations', { error: inviteResult.error })
            }
          }
        } else if (channelResult.error === 'name_taken') {
          logger.info('Channel already exists', { channelName: defaultChannelName })
        } else {
          logger.error('Failed to create channel', { error: channelResult.error })
        }
      } catch (error) {
        logger.error('Slack Connect processing failed', error)
      }
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
app.get('/debug/env', (c) => {
  const envVars = env(c)
  return c.json({
    slack_client_id: !!envVars.SLACK_CLIENT_ID,
    slack_client_secret: !!envVars.SLACK_CLIENT_SECRET,
    slack_redirect_uri: !!envVars.SLACK_REDIRECT_URI,
    default_channel_name: !!envVars.DEFAULT_CHANNEL_NAME,
    all_keys: Object.keys(envVars).filter(k => k.startsWith('SLACK_') || k.startsWith('DEFAULT_'))
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