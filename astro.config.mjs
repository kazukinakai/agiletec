import { defineConfig } from 'astro/config';
import UnoCSS from '@unocss/astro';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://agiletec.net',
  output: 'static',
  
  integrations: [
    UnoCSS(),
    sitemap()
  ],
  
  // SEO最適化
  compressHTML: true,
  
  // パフォーマンス最適化
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto'
  },
  
  // 開発サーバー設定
  server: {
    port: 3000,
    host: true
  }
});