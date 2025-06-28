import puppeteer from 'puppeteer';
import crypto from 'crypto';
import { CONFIG, ERROR_MESSAGES } from './config.js';
import { logger } from '../utils/logger.js';
import { saveScrapedData } from '../utils/file-manager.js';
import type { ReadyAiSiteData } from '../types/ready-ai.d.ts';

/**
 * Ready.aiサイトからHTMLコンテンツを取得する
 */
export async function scrapeReadyAiSite(): Promise<ReadyAiSiteData> {
  let browser: puppeteer.Browser | null = null;
  
  try {
    logger.info('Ready.aiサイトのスクレイピングを開始します', {
      url: CONFIG.sourceUrl
    });

    // ブラウザ起動
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // User-Agent設定
    await page.setUserAgent(CONFIG.scraping.userAgent);
    
    // ビューポート設定
    await page.setViewport({ width: 1920, height: 1080 });

    // ページアクセス
    logger.info('ページにアクセスしています...');
    await page.goto(CONFIG.sourceUrl, {
      waitUntil: CONFIG.scraping.waitUntil,
      timeout: CONFIG.scraping.timeout
    });

    // HTMLコンテンツ取得
    const html = await page.content();
    
    // CSS取得（インラインスタイルと外部CSS）
    const css = await page.evaluate(() => {
      const styles: string[] = [];
      
      // 外部CSSファイル
      const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
      linkElements.forEach(link => {
        const href = (link as HTMLLinkElement).href;
        if (href) styles.push(`/* External CSS: ${href} */`);
      });
      
      // 内部style要素
      const styleElements = document.querySelectorAll('style');
      styleElements.forEach(style => {
        styles.push(style.innerHTML);
      });
      
      return styles.join('\n\n');
    });

    // ハッシュ生成
    const hash = crypto
      .createHash('md5')
      .update(html + css)
      .digest('hex');

    const result: ReadyAiSiteData = {
      html,
      css,
      hash,
      timestamp: new Date(),
      sourceUrl: CONFIG.sourceUrl
    };

    logger.info('スクレイピング完了', {
      htmlSize: html.length,
      cssSize: css.length,
      hash
    });

    // データ保存
    await saveScrapedData(result);

    return result;

  } catch (error) {
    logger.error('スクレイピングエラー', {
      error: error instanceof Error ? error.message : String(error),
      url: CONFIG.sourceUrl
    });
    
    if (error instanceof puppeteer.TimeoutError) {
      throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
    }
    
    throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * サイトの変更をチェックする
 */
export async function checkForChanges(): Promise<{
  hasChanges: boolean;
  previousHash?: string;
  currentHash: string;
}> {
  try {
    // 前回のハッシュを取得
    const previousHash = await getPreviousHash();
    
    // 現在のデータを取得
    const currentData = await scrapeReadyAiSite();
    
    const hasChanges = previousHash !== currentData.hash;
    
    logger.info('変更チェック完了', {
      previousHash,
      currentHash: currentData.hash,
      hasChanges
    });

    return {
      hasChanges,
      previousHash,
      currentHash: currentData.hash
    };

  } catch (error) {
    logger.error('変更チェックエラー', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * 前回のハッシュを取得する
 */
async function getPreviousHash(): Promise<string | undefined> {
  try {
    // ここでは簡単な実装として、ファイルから前回のハッシュを読み取る
    // 実際の実装では、データベースや専用のメタデータファイルを使用
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const hashFilePath = path.join(CONFIG.paths.scrapedData, 'current', 'hash.txt');
    
    try {
      const hash = await fs.readFile(hashFilePath, 'utf-8');
      return hash.trim();
    } catch {
      // ファイルが存在しない場合は初回実行
      return undefined;
    }
    
  } catch (error) {
    logger.warn('前回ハッシュの取得に失敗', {
      error: error instanceof Error ? error.message : String(error)
    });
    return undefined;
  }
}

/**
 * CSS外部ファイルの内容を取得する
 */
export async function fetchExternalCSS(page: puppeteer.Page): Promise<string[]> {
  try {
    const cssUrls = await page.evaluate(() => {
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      return Array.from(links)
        .map(link => (link as HTMLLinkElement).href)
        .filter(href => href && !href.startsWith('data:'));
    });

    const cssContents: string[] = [];
    
    for (const url of cssUrls) {
      try {
        const response = await page.goto(url);
        if (response) {
          const cssContent = await response.text();
          cssContents.push(`/* From: ${url} */\n${cssContent}`);
        }
      } catch (error) {
        logger.warn('外部CSS取得失敗', { url, error });
        cssContents.push(`/* Failed to fetch: ${url} */`);
      }
    }

    return cssContents;
    
  } catch (error) {
    logger.error('外部CSS処理エラー', {
      error: error instanceof Error ? error.message : String(error)
    });
    return [];
  }
}
