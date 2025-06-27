import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { SlackService } from '../services/slack'
import { Logger } from '../utils/logger'
import { getSecretsFromInfisical } from '../utils/infisical'

const bot = new Hono()

interface SlackMessage {
  channel: string
  text: string
  thread_ts?: string
  blocks?: any[]
  attachments?: any[]
}

interface ChannelListRequest {
  types?: string
  exclude_archived?: boolean
  limit?: number
  cursor?: string
}

bot.post('/message', async (c) => {
  const logger = new Logger({ endpoint: 'bot_message' })
  
  try {
    const body = await c.req.json<SlackMessage>()
    const secrets = await getSecretsFromInfisical(c)
    
    const botToken = secrets.find(s => s.secretKey === 'SLACK_BOT_TOKEN')?.secretValue
    
    if (!botToken) {
      logger.error('Bot token not found in Infisical')
      return c.json({ error: 'Bot configuration missing' }, 500)
    }
    
    const slackService = new SlackService(botToken)
    
    logger.info('Sending message', {
      channel: body.channel,
      has_text: !!body.text,
      has_blocks: !!body.blocks,
      is_thread: !!body.thread_ts,
    })
    
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: body.channel,
        text: body.text,
        thread_ts: body.thread_ts,
        blocks: body.blocks,
        attachments: body.attachments,
      }),
    })
    
    const result = await response.json()
    
    if (!result.ok) {
      logger.error('Failed to send message', { error: result.error })
      return c.json({ error: result.error }, 400)
    }
    
    logger.info('Message sent successfully', {
      channel: body.channel,
      ts: result.ts,
    })
    
    return c.json({
      ok: true,
      channel: result.channel,
      ts: result.ts,
      message: result.message,
    })
    
  } catch (error) {
    logger.error('Message send error', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

bot.get('/channels', async (c) => {
  const logger = new Logger({ endpoint: 'bot_channels' })
  
  try {
    const query = c.req.query() as ChannelListRequest
    const secrets = await getSecretsFromInfisical(c)
    
    const botToken = secrets.find(s => s.secretKey === 'SLACK_BOT_TOKEN')?.secretValue
    
    if (!botToken) {
      logger.error('Bot token not found in Infisical')
      return c.json({ error: 'Bot configuration missing' }, 500)
    }
    
    const slackService = new SlackService(botToken)
    
    logger.info('Fetching channels', {
      types: query.types || 'public_channel,private_channel',
      exclude_archived: query.exclude_archived !== false,
      limit: query.limit || 100,
    })
    
    const params = new URLSearchParams({
      types: query.types || 'public_channel,private_channel',
      exclude_archived: String(query.exclude_archived !== false),
      limit: String(query.limit || 100),
    })
    
    if (query.cursor) {
      params.append('cursor', query.cursor)
    }
    
    const response = await fetch(`https://slack.com/api/conversations.list?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${botToken}`,
      },
    })
    
    const result = await response.json()
    
    if (!result.ok) {
      logger.error('Failed to fetch channels', { error: result.error })
      return c.json({ error: result.error }, 400)
    }
    
    logger.info('Channels fetched', {
      count: result.channels?.length || 0,
      has_more: !!result.response_metadata?.next_cursor,
    })
    
    return c.json({
      ok: true,
      channels: result.channels,
      response_metadata: result.response_metadata,
    })
    
  } catch (error) {
    logger.error('Channel list error', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

bot.get('/users', async (c) => {
  const logger = new Logger({ endpoint: 'bot_users' })
  
  try {
    const secrets = await getSecretsFromInfisical(c)
    const botToken = secrets.find(s => s.secretKey === 'SLACK_BOT_TOKEN')?.secretValue
    
    if (!botToken) {
      logger.error('Bot token not found in Infisical')
      return c.json({ error: 'Bot configuration missing' }, 500)
    }
    
    const limit = c.req.query('limit') || '100'
    const cursor = c.req.query('cursor')
    
    const params = new URLSearchParams({ limit })
    if (cursor) params.append('cursor', cursor)
    
    const response = await fetch(`https://slack.com/api/users.list?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${botToken}`,
      },
    })
    
    const result = await response.json()
    
    if (!result.ok) {
      logger.error('Failed to fetch users', { error: result.error })
      return c.json({ error: result.error }, 400)
    }
    
    logger.info('Users fetched', {
      count: result.members?.length || 0,
      has_more: !!result.response_metadata?.next_cursor,
    })
    
    return c.json({
      ok: true,
      members: result.members,
      response_metadata: result.response_metadata,
    })
    
  } catch (error) {
    logger.error('User list error', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

bot.post('/invite', async (c) => {
  const logger = new Logger({ endpoint: 'bot_invite' })
  
  try {
    const body = await c.req.json<{
      channel: string
      users: string[]
    }>()
    
    const secrets = await getSecretsFromInfisical(c)
    const botToken = secrets.find(s => s.secretKey === 'SLACK_BOT_TOKEN')?.secretValue
    
    if (!botToken) {
      logger.error('Bot token not found in Infisical')
      return c.json({ error: 'Bot configuration missing' }, 500)
    }
    
    const slackService = new SlackService(botToken)
    
    logger.info('Inviting users to channel', {
      channel: body.channel,
      user_count: body.users.length,
    })
    
    const result = await slackService.inviteToChannel(
      body.channel,
      body.users
    )
    
    if (!result.ok) {
      logger.error('Failed to invite users', { error: result.error })
      return c.json({ error: result.error }, 400)
    }
    
    logger.info('Users invited successfully', {
      channel: body.channel,
      user_count: body.users.length,
    })
    
    return c.json(result)
    
  } catch (error) {
    logger.error('Invite error', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default bot