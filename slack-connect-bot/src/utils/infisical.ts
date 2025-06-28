import { InfisicalSDK } from '@infisical/sdk'
import { env } from 'hono/adapter'
import type { InfisicalSecret } from '../types/infisical'

export async function getSecretsFromInfisical(c: any): Promise<InfisicalSecret[]> {
  const {
    INFISICAL_CLIENT_ID,
    INFISICAL_CLIENT_SECRET,
    INFISICAL_PROJECT_ID,
    INFISICAL_ENVIRONMENT
  } = env(c)

  const client = new InfisicalSDK()

  await client.auth().universalAuth.login({
    clientId: INFISICAL_CLIENT_ID,
    clientSecret: INFISICAL_CLIENT_SECRET,
  })

  const response = await client.secrets().listSecrets({
    projectId: INFISICAL_PROJECT_ID,
    environment: INFISICAL_ENVIRONMENT,
  })

  // レスポンス形式を変換
  return response.secrets.map(secret => ({
    secretKey: secret.secretKey,
    secretValue: secret.secretValue,
    secretComment: secret.secretComment,
  }))
}