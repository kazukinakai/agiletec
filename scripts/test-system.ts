#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { parseHtmlContent } from './ready-ai/parser.js';
import { convertAllComponents } from './ready-ai/converter.js';
import { logger } from './utils/logger.js';

/**
 * テスト用HTML/CSSでパーサーとコンバーターを検証
 */
async function testParserAndConverter(): Promise<void> {
  try {
    logger.info('パーサー・コンバーターテストを開始します');
    
    // テスト用HTMLファイルを読み込み
    const testHtmlPath = path.join(process.cwd(), 'scraped-data', 'current', 'test-sample.html');
    const htmlContent = await fs.readFile(testHtmlPath, 'utf-8');
    
    // HTMLからCSSを抽出
    const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const cssContent = styleMatch ? styleMatch[1] : '';
    
    // bodyコンテンツのみを抽出
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : htmlContent;
    
    logger.info('テストデータ読み込み完了', {
      htmlSize: bodyContent.length,
      cssSize: cssContent.length
    });
    
    // HTML解析
    logger.info('HTML解析を開始...');
    const components = await parseHtmlContent(bodyContent, cssContent);
    
    logger.info('解析結果', {
      componentCount: components.length,
      components: components.map(c => ({
        name: c.name,
        type: c.type,
        confidence: c.confidence,
        propsCount: Object.keys(c.props).length
      }))
    });
    
    // 各コンポーネントの詳細を表示
    components.forEach((component, index) => {
      logger.info(`コンポーネント ${index + 1}: ${component.name}`, {
        type: component.type,
        confidence: component.confidence,
        htmlPreview: component.html.substring(0, 200) + '...',
        props: component.props,
        stylesCount: component.styles.length
      });
    });
    
    // Astroコンポーネントに変換
    logger.info('Astroコンポーネント変換を開始...');
    const conversionResults = await convertAllComponents(components);
    
    // 変換結果を表示
    conversionResults.forEach((result, index) => {
      if (result.success) {
        logger.info(`変換成功: ${result.filename}`, {
          componentPreview: result.astroComponent.substring(0, 300) + '...'
        });
        
        // ファイルとして保存
        const outputPath = path.join(process.cwd(), 'scraped-data', 'processed', `${result.filename}-test.astro`);
        fs.writeFile(outputPath, result.astroComponent, 'utf-8').catch(err => {
          logger.warn('ファイル保存エラー', { filename: result.filename, error: err.message });
        });
      } else {
        logger.error(`変換失敗: ${result.filename}`, {
          error: result.error
        });
      }
    });
    
    const successCount = conversionResults.filter(r => r.success).length;
    logger.info('テスト完了', {
      total: components.length,
      success: successCount,
      failed: components.length - successCount
    });
    
  } catch (error) {
    logger.error('テスト実行エラー', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

/**
 * ハッシュ機能のテスト
 */
async function testHashFunctions(): Promise<void> {
  try {
    logger.info('ハッシュ機能テストを開始します');
    
    const { generateHash, generateSiteHash, getShortHash } = await import('./utils/hash.js');
    
    const testHtml = '<div class="test">Hello World</div>';
    const testCss = '.test { color: red; }';
    
    const hash1 = generateHash(testHtml);
    const hash2 = generateSiteHash(testHtml, testCss);
    const shortHash = getShortHash(hash1);
    
    logger.info('ハッシュ機能テスト結果', {
      htmlHash: hash1,
      siteHash: hash2,
      shortHash,
      同じ内容のハッシュ一致: generateHash(testHtml) === hash1
    });
    
  } catch (error) {
    logger.error('ハッシュテストエラー', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * ファイル管理機能のテスト
 */
async function testFileManager(): Promise<void> {
  try {
    logger.info('ファイル管理機能テストを開始します');
    
    const { getStorageUsage, formatFileSize } = await import('./utils/file-manager.js');
    
    const usage = await getStorageUsage();
    
    logger.info('ストレージ使用量', {
      total: formatFileSize(usage.totalSize),
      current: formatFileSize(usage.currentSize),
      history: formatFileSize(usage.historySize),
      processed: formatFileSize(usage.processedSize)
    });
    
  } catch (error) {
    logger.error('ファイル管理テストエラー', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * 全テストを実行
 */
async function runAllTests(): Promise<void> {
  logger.setLevel('DEBUG');
  
  try {
    await testHashFunctions();
    await testFileManager();
    await testParserAndConverter();
    
    logger.info('🎉 全テスト完了！');
    
  } catch (error) {
    logger.error('テスト実行中にエラーが発生しました', {
      error: error instanceof Error ? error.message : String(error)
    });
    process.exit(1);
  }
}

// CLI実行時の処理
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().then(() => {
    logger.info('テストプロセス正常終了');
    process.exit(0);
  });
}

export { testParserAndConverter, testHashFunctions, testFileManager, runAllTests };
