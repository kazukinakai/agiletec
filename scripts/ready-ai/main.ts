#!/usr/bin/env tsx

import { parseArgs } from 'node:util';
import { scrapeReadyAiSite, checkForChanges } from './scraper.js';
import { parseHtmlContent } from './parser.js';
import { convertAllComponents, resolveDependencies } from './converter.js';
import { compareWithPrevious } from '../utils/hash.js';
import { saveConversionResult, cleanupOldHistory, getStorageUsage } from '../utils/file-manager.js';
import { logger } from '../utils/logger.js';
import type { SyncResult } from '../types/ready-ai.d.ts';

/**
 * Ready.ai同期メイン処理
 */
async function main(): Promise<void> {
  const startTime = Date.now();
  
  try {
    // コマンドライン引数の解析
    const { values } = parseArgs({
      args: process.argv.slice(2),
      options: {
        verbose: { type: 'boolean', short: 'v' },
        'force-sync': { type: 'boolean', short: 'f' },
        'skip-cleanup': { type: 'boolean' },
        'dry-run': { type: 'boolean', short: 'd' }
      }
    });
    
    // ログレベル設定
    if (values.verbose) {
      logger.setLevel('DEBUG');
    }
    
    logger.info('Ready.ai同期処理を開始します', {
      verbose: values.verbose,
      forceSync: values['force-sync'],
      dryRun: values['dry-run']
    });
    
    // ストレージ使用量をチェック
    const storageUsage = await getStorageUsage();
    logger.info('現在のストレージ使用量', {
      total: formatBytes(storageUsage.totalSize),
      current: formatBytes(storageUsage.currentSize),
      history: formatBytes(storageUsage.historySize),
      processed: formatBytes(storageUsage.processedSize)
    });
    
    // 変更チェック
    const changeCheck = await checkForChanges();
    
    if (!changeCheck.hasChanges && !values['force-sync']) {
      logger.info('変更が検出されませんでした。同期をスキップします。', {
        previousHash: changeCheck.previousHash,
        currentHash: changeCheck.currentHash
      });
      return;
    }
    
    logger.info('変更が検出されました。同期処理を開始します。', {
      hasChanges: changeCheck.hasChanges,
      forceSync: values['force-sync']
    });
    
    // データ取得
    const siteData = await scrapeReadyAiSite();
    
    // HTML解析
    const components = await parseHtmlContent(siteData.html, siteData.css);
    
    if (components.length === 0) {
      logger.warn('コンポーネントが見つかりませんでした');
      return;
    }
    
    logger.info('コンポーネント解析完了', {
      componentCount: components.length,
      types: components.reduce((acc: Record<string, number>, comp) => {
        acc[comp.type] = (acc[comp.type] || 0) + 1;
        return acc;
      }, {})
    });
    
    // Dry-runモードの場合はここで終了
    if (values['dry-run']) {
      logger.info('Dry-runモード: 実際の変換は行いません', {
        wouldConvert: components.map(c => ({
          name: c.name,
          type: c.type,
          confidence: c.confidence
        }))
      });
      return;
    }
    
    // Astroコンポーネントに変換
    const conversionResults = await convertAllComponents(components);
    
    // 依存関係を解決
    const resolvedResults = resolveDependencies(conversionResults);
    
    // ファイル保存
    const savePromises = resolvedResults
      .filter(result => result.success)
      .map(result => saveConversionResult(result));
    
    await Promise.all(savePromises);
    
    // 結果サマリー
    const successCount = resolvedResults.filter(r => r.success).length;
    const failedResults = resolvedResults.filter(r => !r.success);
    
    logger.info('同期処理完了', {
      total: components.length,
      success: successCount,
      failed: failedResults.length,
      duration: `${Date.now() - startTime}ms`
    });
    
    // 失敗したコンポーネントをログ出力
    if (failedResults.length > 0) {
      logger.warn('変換に失敗したコンポーネント', {
        failed: failedResults.map(r => ({
          name: r.filename,
          error: r.error
        }))
      });
    }
    
    // 古い履歴のクリーンアップ（スキップオプションがない場合）
    if (!values['skip-cleanup']) {
      const deletedCount = await cleanupOldHistory(30);
      if (deletedCount > 0) {
        logger.info('古い履歴を削除しました', { deletedCount });
      }
    }
    
    // 最終的なストレージ使用量
    const finalStorageUsage = await getStorageUsage();
    logger.info('最終ストレージ使用量', {
      total: formatBytes(finalStorageUsage.totalSize),
      増減: formatBytes(finalStorageUsage.totalSize - storageUsage.totalSize)
    });
    
  } catch (error) {
    logger.error('同期処理エラー', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${Date.now() - startTime}ms`
    });
    
    process.exit(1);
  }
}

/**
 * バイト数を人間が読みやすい形式にフォーマット
 */
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * エラーハンドリング
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未処理のPromise拒否', {
    reason: reason instanceof Error ? reason.message : String(reason),
    promise: promise.toString()
  });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('未捕捉の例外', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

/**
 * 統計情報を表示
 */
async function showStats(): Promise<void> {
  try {
    const { getHashStatistics } = await import('../utils/hash.js');
    const stats = await getHashStatistics();
    
    console.log('\n📊 Ready.ai同期統計');
    console.log('==================');
    console.log(`総ハッシュ数: ${stats.totalHashes}`);
    console.log(`ユニークハッシュ数: ${stats.uniqueHashes}`);
    console.log(`重複数: ${stats.duplicateCount}`);
    console.log(`最新変更: ${stats.mostRecentChange || 'なし'}`);
    
    const storageUsage = await getStorageUsage();
    console.log('\n💾 ストレージ使用量');
    console.log('==================');
    console.log(`合計: ${formatBytes(storageUsage.totalSize)}`);
    console.log(`現在: ${formatBytes(storageUsage.currentSize)}`);
    console.log(`履歴: ${formatBytes(storageUsage.historySize)}`);
    console.log(`処理済み: ${formatBytes(storageUsage.processedSize)}`);
    
  } catch (error) {
    logger.error('統計情報取得エラー', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * ヘルプを表示
 */
function showHelp(): void {
  console.log(`
Ready.ai同期システム

使用方法:
  pnpm sync:ready-ai [オプション]

オプション:
  -v, --verbose       詳細ログを出力
  -f, --force-sync    変更がなくても強制同期
  -d, --dry-run       実際の変換は行わず、処理内容のみ表示
  --skip-cleanup      古い履歴の削除をスキップ
  --stats             統計情報を表示
  --help              このヘルプを表示

例:
  pnpm sync:ready-ai --verbose
  pnpm sync:ready-ai --dry-run
  pnpm sync:ready-ai --force-sync --skip-cleanup
`);
}

// CLI実行時の処理
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  if (args.includes('--stats')) {
    showStats().then(() => process.exit(0));
  } else {
    main().then(() => {
      logger.info('プロセス正常終了');
      process.exit(0);
    });
  }
}

export { main, showStats, showHelp };
