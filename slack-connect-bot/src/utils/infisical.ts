import { InfisicalClient } from '@infisical/sdk'
import { env } from 'hono/adapter'
import type { InfisicalSecret } from '../types/infisical'

export async function getSecretsFromInfisical(c: any): Promise<InfisicalSecret[]> {
  const {
    INFISICAL_CLIENT_ID,
    INFISICAL_CLIENT_SECRET,
    INFISICAL_PROJECT_ID,
    INFISICAL_ENVIRONMENT
  } = env(c)

  const client = new InfisicalClient({
    auth: {
      universalAuth: {
        clientId: INFISICAL_CLIENT_ID,
        clientSecret: INFISICAL_CLIENT_SECRET,
      },
    },
  })

  const secrets = await client.getSecret({
    projectId: INFISICAL_PROJECT_ID,
    environment: INFISICAL_ENVIRONMENT,
    path: "/slack",
    type: "shared",
  })

  return secrets
}