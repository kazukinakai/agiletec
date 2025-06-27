import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Logger } from '../utils/logger'
import { getSecretsFromInfisical } from '../utils/infisical'
import { SlackService } from '../services/slack'
import { ValidationError } from '../middleware/error'

const publicApi = new Hono()

// 公開API用のCORS設定
publicApi.use('/*', cors({
  origin: [
    'https://agiletec.net',
    'https://dev.agiletec.net',
    'https://www.agiletec.net',
    'http://localhost:3000', // 開発用
  ],
  credentials: true,
  allowMethods: ['POST', 'GET', 'OPTIONS'],
}))

interface ContactRequest {
  company?: string
  name?: string
  email?: string
  message?: string
  type?: 'consultation' | 'partnership' | 'general'
}

publicApi.post('/create-channel', async (c) => {
  const logger = new Logger({ endpoint: 'public_create_channel' })
  
  try {
    const body = await c.req.json<ContactRequest>()
    
    // 基本的なバリデーション
    if (!body.email && !body.company && !body.name) {
      throw new ValidationError('少なくとも1つの連絡先情報が必要です')
    }
    
    logger.info('Channel creation request', {
      has_company: !!body.company,
      has_name: !!body.name,
      has_email: !!body.email,
      type: body.type || 'general',
    })
    
    // Infisicalから設定を取得
    const secrets = await getSecretsFromInfisical(c)
    const botToken = secrets.find(s => s.secretKey === 'SLACK_BOT_TOKEN')?.secretValue
    const defaultWorkspaceEmail = secrets.find(s => s.secretKey === 'DEFAULT_WORKSPACE_EMAIL')?.secretValue
    
    if (!botToken) {
      logger.error('Bot token not found')
      return c.json({ 
        success: false, 
        error: 'サーバー設定エラー' 
      }, 500)
    }
    
    const slackService = new SlackService(botToken)
    
    // チャンネル名を生成（日本語対応）
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const companyPart = body.company ? 
      body.company.replace(/[^a-zA-Z0-9ぁ-んァ-ン一-龥]/g, '').slice(0, 20) : 
      'guest'
    const channelName = `connect-${companyPart}-${timestamp}`.toLowerCase()
      .replace(/[^\w\-]/g, '') // Slackのチャンネル名制限に対応
      .slice(0, 80) // 最大80文字
    
    // チャンネルを作成
    logger.info('Creating channel', { channelName })
    const channelResult = await slackService.createChannel(channelName, true) // プライベートチャンネル
    
    if (!channelResult.ok) {
      logger.error('Failed to create channel', { error: channelResult.error })
      return c.json({ 
        success: false, 
        error: 'チャンネルの作成に失敗しました' 
      }, 500)
    }
    
    const channelId = channelResult.channel!.id
    
    // 最初のメッセージを投稿
    const initialMessage = `
🎉 新しいお問い合わせがありました！

${body.company ? `**会社名**: ${body.company}` : ''}
${body.name ? `**お名前**: ${body.name}` : ''}
${body.email ? `**メール**: ${body.email}` : ''}
${body.message ? `**メッセージ**: ${body.message}` : ''}

**種別**: ${getTypeLabel(body.type)}

このチャンネルでお客様とのやり取りを行ってください。
Slack Connectでの外部連携も可能です。
    `.trim()
    
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: channelId,
        text: initialMessage,
        mrkdwn: true,
      }),
    })
    
    // Slack Connect招待を送信（メールアドレスがある場合）
    if (body.email && defaultWorkspaceEmail) {
      logger.info('Sending Slack Connect invitation', { email: body.email })
      
      const inviteResult = await slackService.inviteSharedChannel({
        channel: channelId,
        emails: [body.email],
      })
      
      if (inviteResult.ok) {
        await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${botToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channel: channelId,
            text: `📧 ${body.email} にSlack Connect招待を送信しました`,
          }),
        })
      }
    }
    
    logger.info('Channel created successfully', {
      channelId,
      channelName,
      hasInvite: !!body.email,
    })
    
    return c.json({
      success: true,
      message: 'チャンネルを作成しました。Slackをご確認ください。',
      channelName: channelResult.channel!.name,
    })
    
  } catch (error) {
    if (error instanceof ValidationError) {
      return c.json({ 
        success: false, 
        error: error.message 
      }, 400)
    }
    
    logger.error('Channel creation error', error)
    return c.json({ 
      success: false, 
      error: '予期しないエラーが発生しました' 
    }, 500)
  }
})

function getTypeLabel(type?: string): string {
  switch (type) {
    case 'consultation':
      return '技術相談'
    case 'partnership':
      return 'パートナーシップ'
    case 'general':
    default:
      return '一般お問い合わせ'
  }
}

export default publicApi