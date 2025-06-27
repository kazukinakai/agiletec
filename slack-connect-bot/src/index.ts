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

    const secrets = await getSecretsFromInfisical(c)
    
    const slackClientId = secrets.find(s => s.secretKey === 'SLACK_CLIENT_ID')?.secretValue
    const slackClientSecret = secrets.find(s => s.secretKey === 'SLACK_CLIENT_SECRET')?.secretValue
    const redirectUri = secrets.find(s => s.secretKey === 'SLACK_REDIRECT_URI')?.secretValue || 'https://api.agiletec.net/slack/oauth/callback'

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
      const defaultChannelName = secrets.find(s => s.secretKey === 'DEFAULT_CHANNEL_NAME')?.secretValue || 'agiletec-connect'
      const partnerEmails = secrets.find(s => s.secretKey === 'PARTNER_EMAILS')?.secretValue?.split(',') || []
      
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
// 条件分岐でドメインごとに処理を変える
app.get('*', async (c) => {
  const hostname = new URL(c.req.url).hostname
  
  // stg.agiletec.netの場合はプロキシ処理
  if (hostname === 'stg.agiletec.net' || hostname === 'localhost') {
    return siteProxy.fetch(c.req.raw, c.env, c.executionCtx)
  }
  
  // api.agiletec.netの場合は通常のAPI
  return app.fetch(c.req.raw, c.env, c.executionCtx)
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
    }
  })
})

export default app