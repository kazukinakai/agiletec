import app from './index'
import siteProxy from './routes/site-proxy'

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    
    // stg.agiletec.netの場合はプロキシ処理
    if (url.hostname === 'stg.agiletec.net') {
      return siteProxy.fetch(request, env, ctx)
    }
    
    // api.agiletec.netやlocalhostの場合は通常のAPI
    return app.fetch(request, env, ctx)
  }
}