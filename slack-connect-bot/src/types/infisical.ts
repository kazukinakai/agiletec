export interface InfisicalSecret {
  secretKey: string
  secretValue: string
  secretComment?: string
}

export interface InfisicalConfig {
  clientId: string
  clientSecret: string
  projectId: string
  environment: string
}