import type { SlackConnectInviteParams, SlackConnectInviteResponse } from '../types/slack'

export class SlackService {
  constructor(private accessToken: string) {}

  async createChannel(name: string, isPrivate: boolean = false): Promise<{ ok: boolean; channel?: { id: string; name: string }; error?: string }> {
    const response = await fetch('https://slack.com/api/conversations.create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        is_private: isPrivate,
      }),
    })

    return response.json()
  }

  async inviteToChannel(channelId: string, userIds: string[]): Promise<{ ok: boolean; error?: string }> {
    const response = await fetch('https://slack.com/api/conversations.invite', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: channelId,
        users: userIds.join(','),
      }),
    })

    return response.json()
  }

  async inviteSharedChannel(params: SlackConnectInviteParams): Promise<SlackConnectInviteResponse> {
    const response = await fetch('https://slack.com/api/conversations.inviteShared', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: params.channel,
        emails: params.emails,
        user_ids: params.user_ids,
        external_limited: params.external_limited,
      }),
    })

    return response.json()
  }

  async acceptSharedInvite(channelName: string, inviteId?: string, teamId?: string): Promise<{ ok: boolean; error?: string; implicit_approval?: boolean; channel_id?: string; invite_id?: string }> {
    const body: any = {
      channel_name: channelName,
      is_private: false,
    }
    
    if (inviteId) body.invite_id = inviteId
    if (teamId) body.team_id = teamId

    const response = await fetch('https://slack.com/api/conversations.acceptSharedInvite', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return response.json()
  }

  async listChannels(types: string = 'public_channel,private_channel'): Promise<{ ok: boolean; channels?: Array<{ id: string; name: string; is_shared?: boolean }>; error?: string }> {
    let channels: Array<{ id: string; name: string; is_shared?: boolean }> = []
    let nextCursor: string | undefined
    const url = new URL('https://slack.com/api/conversations.list')
    url.searchParams.set('types', types)
    url.searchParams.set('limit', '1000') // 1000 is max

    do {
      if (nextCursor) {
        url.searchParams.set('cursor', nextCursor)
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })

      const data = await response.json()

      if (!data.ok) {
        return { ok: false, error: data.error }
      }

      channels = channels.concat(data.channels)
      nextCursor = data.response_metadata?.next_cursor

    } while (nextCursor)

    return { ok: true, channels }
  }

  