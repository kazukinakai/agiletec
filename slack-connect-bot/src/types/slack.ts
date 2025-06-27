export interface SlackOAuthResponse {
  ok: boolean
  access_token?: string
  token_type?: string
  scope?: string
  bot_user_id?: string
  app_id?: string
  team?: {
    id: string
    name: string
  }
  enterprise?: {
    id: string
    name: string
  }
  authed_user?: {
    id: string
    scope?: string
    access_token?: string
    token_type?: string
  }
  is_enterprise_install?: boolean
  error?: string
  error_description?: string
}

export interface SlackConnectInviteParams {
  channel: string
  emails?: string[]
  user_ids?: string[]
  external_limited?: boolean
}

export interface SlackConnectInviteResponse {
  ok: boolean
  error?: string
  invite_id?: string
  is_legacy_shared_channel?: boolean
}