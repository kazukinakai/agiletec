import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { SlackService } from '../services/slack'
import { Logger } from '../utils/logger'
import type { InfisicalSecret } from '../types/infisical'

const connect = new Hono()

interface ConnectRequestBody {
  channel_name?: string
  emails?: string[]
  user_ids?: string[]
  team_id?: string
  is_private?: boolean
}

connect.post('/invite', async (c) => {
  const logger = new Logger({ endpoint: 'connect_invite' })
  
  try {
    const body = await c.req.json<ConnectRequestBody>()
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header')
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const accessToken = authHeader.substring(7)
    const slackService = new SlackService(accessToken)
    
    logger.info('Connect invite request', {
      has_channel_name: !!body.channel_name,
      email_count: body.emails?.length || 0,
      user_id_count: body.user_ids?.length || 0,
    })
    
    // チャンネル名が指定されていない場合はエラー
    if (!body.channel_name) {
      return c.json({ error: 'channel_name is required' }, 400)
    }
    
    // チャンネルを作成または取得
    const channelResult = await slackService.createChannel(
      body.channel_name,
      body.is_private || false
    )
    
    if (!channelResult.ok) {
      if (channelResult.error === 'name_taken') {
        // 既存のチャンネルを検索
        const listResult = await slackService.listChannels()
        const existingChannel = listResult.channels?.find(
          ch => ch.name === body.channel_name
        )
        
        if (existingChannel) {
          // 既存チャンネルにSlack Connect招待を送信
          const inviteResult = await slackService.inviteSharedChannel({
            channel: existingChannel.id,
            emails: body.emails,
            user_ids: body.user_ids,
          })
          
          logger.info('Sent invites to existing channel', {
            channel_id: existingChannel.id,
            channel_name: body.channel_name,
            ok: inviteResult.ok,
          })
          
          return c.json({
            ok: inviteResult.ok,
            channel_id: existingChannel.id,
            channel_name: body.channel_name,
            invite_id: inviteResult.invite_id,
            error: inviteResult.error,
          })
        }
      }
      
      logger.error('Failed to create channel', {
        error: channelResult.error,
        channel_name: body.channel_name,
      })
      
      return c.json({
        ok: false,
        error: channelResult.error,
      }, 500)
    }
    
    // 新しいチャンネルが作成された場合
    if (channelResult.channel) {
      const inviteResult = await slackService.inviteSharedChannel({
        channel: channelResult.channel.id,
        emails: body.emails,
        user_ids: body.user_ids,
      })
      
      logger.info('Created channel and sent invites', {
        channel_id: channelResult.channel.id,
        channel_name: channelResult.channel.name,
        ok: inviteResult.ok,
      })
      
      return c.json({
        ok: inviteResult.ok,
        channel_id: channelResult.channel.id,
        channel_name: channelResult.channel.name,
        invite_id: inviteResult.invite_id,
        error: inviteResult.error,
      })
    }
    
    return c.json({ ok: false, error: 'Unknown error' }, 500)
    
  } catch (error) {
    logger.error('Connect invite error', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

connect.post('/accept', async (c) => {
  const logger = new Logger({ endpoint: 'connect_accept' })
  
  try {
    const body = await c.req.json<{
      channel_name: string
      invite_id?: string
      team_id?: string
    }>()
    
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header')
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const accessToken = authHeader.substring(7)
    const slackService = new SlackService(accessToken)
    
    logger.info('Accept invite request', body)
    
    const result = await slackService.acceptSharedInvite(
      body.channel_name,
      body.invite_id,
      body.team_id
    )
    
    logger.info('Accept invite result', {
      ok: result.ok,
      channel_id: result.channel_id,
      error: result.error,
    })
    
    return c.json(result)
    
  } catch (error) {
    logger.error('Accept invite error', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default connect