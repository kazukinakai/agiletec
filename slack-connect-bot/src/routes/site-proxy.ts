import { Hono } from 'hono'
import { Logger } from '../utils/logger'

const siteProxy = new Hono()

// テスト用：背景アニメーションを注入
siteProxy.get('/*', async (c) => {
  const logger = new Logger({ endpoint: 'site_proxy' })
  
  try {
    // dev.agiletec.netから元のHTMLを取得
    const path = c.req.path === '/' ? '' : c.req.path
    const response = await fetch(`https://dev.agiletec.net${path}`)
    
    // HTMLの場合のみ処理
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      // CSS/JS/画像などはそのまま返す
      return new Response(response.body, {
        headers: response.headers,
      })
    }
    
    // HTMLを取得して処理
    let html = await response.text()
    
    logger.info('Processing HTML', { path })
    
    // カスタムスタイルを注入
    const customStyles = `
    <style>
      /* Agiletec Custom Styles */
      
      /* グラデーション背景 */
      .agiletec-gradient-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, 
          rgba(102, 126, 234, 0.1) 0%, 
          rgba(118, 75, 162, 0.1) 100%);
        z-index: -2;
        pointer-events: none;
      }
      
      /* 斜線アニメーション */
      .agiletec-diagonal-lines {
        position: fixed;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background-image: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 50px,
          rgba(255, 255, 255, 0.03) 50px,
          rgba(255, 255, 255, 0.03) 100px
        );
        z-index: -1;
        pointer-events: none;
        transform: translate(0, 0);
        will-change: transform;
      }
      
      /* SVGバージョン（background-line.svg使用時） */
      .agiletec-diagonal-lines-svg {
        position: fixed;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background-image: url('https://agiletec.net/background-line.svg');
        background-size: 100px 100px;
        background-repeat: repeat;
        opacity: 0.05;
        z-index: -1;
        pointer-events: none;
        transform: translate(0, 0);
        will-change: transform;
      }
    </style>
    `
    
    // カスタムスクリプトを注入
    const customScript = `
    <script>
      // Agiletec Background Animation
      (function() {
        // 背景要素を追加
        const gradientBg = document.createElement('div');
        gradientBg.className = 'agiletec-gradient-bg';
        document.body.appendChild(gradientBg);
        
        const diagonalLines = document.createElement('div');
        diagonalLines.className = 'agiletec-diagonal-lines';
        document.body.appendChild(diagonalLines);
        
        // スクロールアニメーション
        let ticking = false;
        
        function updateAnimation() {
          const scrollY = window.scrollY || window.pageYOffset;
          const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
          const scrollPercent = Math.min(scrollY / maxScroll, 1);
          
          // 右上から左下への動き
          const moveDistance = 100; // ピクセル
          const translateX = -scrollPercent * moveDistance;
          const translateY = scrollPercent * moveDistance;
          
          diagonalLines.style.transform = \`translate(\${translateX}px, \${translateY}px)\`;
          
          ticking = false;
        }
        
        function requestTick() {
          if (!ticking) {
            requestAnimationFrame(updateAnimation);
            ticking = true;
          }
        }
        
        // イベントリスナー
        window.addEventListener('scroll', requestTick, { passive: true });
        window.addEventListener('resize', requestTick, { passive: true });
        
        // 初期化
        setTimeout(updateAnimation, 100);
      })();
    </script>
    `
    
    // Ready.aiのトラッキングコードを削除（オプション）
    html = html.replace(/<script[^>]*ready\.ai[^>]*>.*?<\/script>/gs, '')
    
    // </head>の前にスタイルを注入
    html = html.replace('</head>', customStyles + '</head>')
    
    // </body>の前にスクリプトを注入
    html = html.replace('</body>', customScript + '</body>')
    
    logger.info('HTML processing completed')
    
    return c.html(html)
    
  } catch (error) {
    logger.error('Proxy error', error)
    return c.text('Proxy error', 500)
  }
})

export default siteProxy