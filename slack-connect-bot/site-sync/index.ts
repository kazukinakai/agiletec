import { Hono } from 'hono'
import { Logger } from '../src/utils/logger'

const siteSyncApp = new Hono()

interface SyncConfig {
  sourceUrl: string  // dev.agiletec.net
  targetBucket?: string  // Cloudflare R2 or KV
  transformations?: {
    removeReadyAiTracking?: boolean
    optimizeImages?: boolean
    injectComponents?: boolean
  }
}

// Webhookエンドポイント（Ready.aiが更新を通知）
siteSyncApp.post('/webhook/site-updated', async (c) => {
  const logger = new Logger({ endpoint: 'site_sync_webhook' })
  
  try {
    logger.info('Site update webhook received')
    
    // 1. dev.agiletec.netからHTMLを取得
    const response = await fetch('https://dev.agiletec.net/')
    const html = await response.text()
    
    // 2. HTMLを処理
    let processedHtml = html
    
    // Ready.aiのトラッキングコードを削除
    processedHtml = processedHtml.replace(/<script[^>]*ready\.ai[^>]*>.*?<\/script>/gs, '')
    
    // カスタムコンポーネントを注入（背景アニメーションなど）
    processedHtml = injectCustomComponents(processedHtml)
    
    // 3. Cloudflare KVまたはR2に保存
    // ここではKVの例
    await c.env.SITE_CONTENT.put('index.html', processedHtml, {
      metadata: {
        lastUpdated: new Date().toISOString(),
        source: 'ready.ai',
      }
    })
    
    // 4. Cloudflareのキャッシュをパージ
    await purgeCache(c.env)
    
    logger.info('Site sync completed')
    return c.json({ success: true })
    
  } catch (error) {
    logger.error('Site sync failed', error)
    return c.json({ success: false, error: 'Sync failed' }, 500)
  }
})

// メインサイトのハンドラー
siteSyncApp.get('/', async (c) => {
  try {
    // KVから最新のHTMLを取得
    const html = await c.env.SITE_CONTENT.get('index.html')
    
    if (!html) {
      // フォールバック: 直接dev.agiletec.netから取得
      const response = await fetch('https://dev.agiletec.net/')
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        }
      })
    }
    
    return c.html(html)
  } catch (error) {
    return c.text('Site temporarily unavailable', 503)
  }
})

function injectCustomComponents(html: string): string {
  // </head>の前にカスタムCSS/JSを注入
  const customStyles = `
    <style>
      /* グラデーション背景 */
      .gradient-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: -2;
      }
      
      /* 斜線アニメーション */
      .diagonal-lines {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('/background-line.svg');
        background-size: 50px 50px;
        background-repeat: repeat;
        z-index: -1;
        opacity: 0.1;
        transform: translateX(0) translateY(0);
        will-change: transform;
      }
    </style>
  `
  
  const customScript = `
    <script>
      // スクロール連動アニメーション
      (function() {
        let ticking = false;
        const diagonalLines = document.querySelector('.diagonal-lines');
        
        function updateAnimation() {
          const scrollY = window.scrollY || window.pageYOffset;
          const scrollPercent = scrollY / (document.body.scrollHeight - window.innerHeight);
          
          // 右上から左下への動き
          const translateX = -scrollPercent * 100;
          const translateY = scrollPercent * 100;
          
          if (diagonalLines) {
            diagonalLines.style.transform = \`translateX(\${translateX}px) translateY(\${translateY}px)\`;
          }
          
          ticking = false;
        }
        
        function requestTick() {
          if (!ticking) {
            requestAnimationFrame(updateAnimation);
            ticking = true;
          }
        }
        
        window.addEventListener('scroll', requestTick);
        window.addEventListener('resize', requestTick);
      })();
    </script>
  `
  
  // bodyの直後に背景要素を追加
  const backgroundElements = `
    <div class="gradient-background"></div>
    <div class="diagonal-lines"></div>
  `
  
  html = html.replace('</head>', customStyles + '</head>')
  html = html.replace('<body', '<body>' + backgroundElements + '<')
  html = html.replace('</body>', customScript + '</body>')
  
  return html
}

async function purgeCache(env: any) {
  // Cloudflare APIを使ってキャッシュをパージ
  const zoneId = env.CF_ZONE_ID
  const apiToken = env.CF_API_TOKEN
  
  await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      purge_everything: true
    })
  })
}

export default siteSyncApp