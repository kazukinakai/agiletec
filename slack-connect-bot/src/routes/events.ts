import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { Logger } from '../utils/logger'
import { getSecretsFromInfisical } from '../utils/infisical'
import { SlackService } from '../services/slack'
import crypto from 'crypto'

const events = new Hono()

interface SlackEvent {
  type: string
  event?: {
    type: string
    channel?: string
    user?: string
    text?: string
    ts?: string
    thread_ts?: string
    channel_type?: string
    team?: string
    subtype?: string
  }
  challenge?: string
  token?: string
  team_id?: string
  api_app_id?: string
  event_id?: string
  event_time?: number
}

function verifySlackSignature(
  signature: string,
  timestamp: string,
  body: string,
  signingSecret: string
): boolean {
  const baseString = `v0:${timestamp}:${body}`
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', signingSecret)
    .update(baseString)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(mySignature, 'utf8'),
    Buffer.from(signature, 'utf8')
  )
}

events.post('/', async (c) => {
  const logger = new Logger({ endpoint: 'slack_events' })
  
  try {
    const body = await c.req.text()
    const signature = c.req.header('X-Slack-Signature')
    const timestamp = c.req.header('X-Slack-Request-Timestamp')
    
    if (!signature || !timestamp) {
      logger.warn('Missing Slack headers')
      return c.text('Unauthorized', 401)
    }
    
    // タイムスタンプの検証（5分以内）
    const currentTime = Math.floor(Date.now() / 1000)
    if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
      logger.warn('Request timestamp too old')
      return c.text('Request timeout', 401)
    }
    
    const secrets = await getSecretsFromInfisical(c)
    const signingSecret = secrets.find(s => s.secretKey === 'SLACK_SIGNING_SECRET')?.secretValue
    
    if (!signingSecret) {
      logger.error('Signing secret not found')
      return c.text('Server configuration error', 500)
    }
    
    // 署名の検証
    if (!verifySlackSignature(signature, timestamp, body, signingSecret)) {
      logger.warn('Invalid signature')
      return c.text('Unauthorized', 401)
    }
    
    const event = JSON.parse(body) as SlackEvent
    
    // URL検証チャレンジ
    if (event.type === 'url_verification' && event.challenge) {
      logger.info('URL verification challenge received')
      return c.text(event.challenge)
    }
    
    // イベント処理
    if (event.type === 'event_callback' && event.event) {
      logger.info('Event received', {
        event_type: event.event.type,
        channel: event.event.channel,
        user: event.event.user,
        team: event.team_id,
      })
      
      // イベントタイプごとの処理
      switch (event.event.type) {
        case 'message':
          await handleMessageEvent(c, event.event, logger)
          break
          
        case 'channel_created':
          await handleChannelCreatedEvent(c, event.event, logger)
          break
          
        case 'member_joined_channel':
          await handleMemberJoinedEvent(c, event.event, logger)
          break
          
        case 'app_mention':
          await handleAppMentionEvent(c, event.event, logger)
          break
          
        default:
          logger.info('Unhandled event type', { type: event.event.type })
      }
    }
    
    // Slackには即座に200を返す
    return c.text('ok', 200)
    
  } catch (error) {
    logger.error('Event processing error', error)
    return c.text('Internal server error', 500)
  }
})

async function handleMessageEvent(c: any, event: any, logger: Logger) {
  // メッセージイベントの処理
  if (event.subtype) {
    // bot_message, channel_join などのサブタイプは無視
    return
  }
  
  logger.info('Message event', {
    channel: event.channel,
    user: event.user,
    text_length: event.text?.length || 0,
  })
  
  // 必要に応じてメッセージに反応
  if (event.text?.toLowerCase().includes('help')) {
    const secrets = await getSecretsFromInfisical(c)
    const botToken = secrets.find(s => s.secretKey === 'SLACK_BOT_TOKEN')?.secretValue
    
    if (botToken) {
      const slackService = new SlackService(botToken)
      
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: event.channel,
          thread_ts: event.ts,
          text: 'こんにちは！何かお手伝いできることはありますか？',
        }),
      })
    }
  }
}

async function handleChannelCreatedEvent(c: any, event: any, logger: Logger) {
  logger.info('Channel created', {
    channel: event.channel.id,
    name: event.channel.name,
    creator: event.channel.creator,
  })
  
  // 新しいチャンネルが作成されたときの処理
}

async function handleMemberJoinedEvent(c: any, event: any, logger: Logger) {
  logger.info('Member joined channel', {
    channel: event.channel,
    user: event.user,
  })
  
  // メンバーがチャンネルに参加したときの処理
}

async function handleAppMentionEvent(c: any, event: any, logger: Logger) {
  logger.info('App mentioned', {
    channel: event.channel,
    user: event.user,
    text: event.text,
  })
  
  const secrets = await getSecretsFromInfisical(c)
  const botToken = secrets.find(s => s.secretKey === 'SLACK_BOT_TOKEN')?.secretValue
  
  if (botToken) {
    // メンションに応答
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: event.channel,
        thread_ts: event.ts,
        text: `<@${event.user}> メンションありがとうございます！`,
      }),
    })
  }
}

export default events