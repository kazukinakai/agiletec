import fs from 'fs/promises';
import path from 'path';
import { CONFIG } from '../ready-ai/config.js';
import { logger } from './logger.js';
import type { ReadyAiSiteData, ConversionResult } from '../types/ready-ai.d.ts';

/**
 * スクレイピングしたデータを保存する
 */
export async function saveScrapedData(data: ReadyAiSiteData): Promise<void> {
  try {
    await logger.timeAsync('データ保存', async () => {
      const { scrapedData } = CONFIG.paths;
      
      // ディレクトリ作成
      await ensureDirectoryExists(path.join(scrapedData, 'current'));
      await ensureDirectoryExists(path.join(scrapedData, 'history'));
      
      // 現在のデータを履歴に移動（存在する場合）
      await moveCurrentToHistory();
      
      // 新しいデータを保存
      const currentDir = path.join(scrapedData, 'current');
      
      await Promise.all([
        fs.writeFile(
          path.join(currentDir, 'index.html'), 
          data.html, 
          'utf-8'
        ),
        fs.writeFile(
          path.join(currentDir, 'styles.css'), 
          data.css, 
          'utf-8'
        ),
        fs.writeFile(
          path.join(currentDir, 'hash.txt'), 
          data.hash, 
          'utf-8'
        ),
        fs.writeFile(
          path.join(currentDir, 'metadata.json'),
          JSON.stringify({
            timestamp: data.timestamp.toISOString(),
            sourceUrl: data.sourceUrl,
            hash: data.hash,
            htmlSize: data.html.length,
            cssSize: data.css.length
          }, null, 2),
          'utf-8'
        )
      ]);
    });

    logger.info('データ保存完了', {
      htmlSize: data.html.length,
      cssSize: data.css.length,
      hash: data.hash
    });

  } catch (error) {
    logger.error('データ保存エラー', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * 現在のデータを履歴に移動
 */
async function moveCurrentToHistory(): Promise<void> {
  try {
    const { scrapedData } = CONFIG.paths;
    const currentDir = path.join(scrapedData, 'current');
    const historyDir = path.join(scrapedData, 'history');
    
    // 現在のデータが存在するかチェック
    const metadataPath = path.join(currentDir, 'metadata.json');
    
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent);
      
      // タイムスタンプを使って履歴フォルダ名を生成
      const timestamp = new Date(metadata.timestamp);
      const historyFolderName = timestamp.toISOString().replace(/[:.]/g, '-');
      const historyPath = path.join(historyDir, historyFolderName);
      
      // 履歴ディレクトリ作成
      await ensureDirectoryExists(historyPath);
      
      // ファイルを移動
      const files = ['index.html', 'styles.css', 'hash.txt', 'metadata.json'];
      
      await Promise.all(files.map(async (file) => {
        const sourcePath = path.join(currentDir, file);
        const destPath = path.join(historyPath, file);
        
        try {
          await fs.rename(sourcePath, destPath);
        } catch {
          // ファイルが存在しない場合は無視
        }
      }));
      
    } catch {
      // メタデータファイルが存在しない場合は初回実行なので無視
    }
    
  } catch (error) {
    logger.warn('履歴移動エラー', {
      error: error instanceof Error ? error.message : String(error)
    });
    // エラーがあっても処理を継続
  }
}

/**
 * 変換結果を保存する
 */
export async function saveConversionResult(result: ConversionResult): Promise<void> {
  try {
    await logger.timeAsync('変換結果保存', async () => {
      const { scrapedData, components } = CONFIG.paths;
      
      // 処理済みディレクトリに保存
      const processedDir = path.join(scrapedData, 'processed');
      await ensureDirectoryExists(processedDir);
      
      // Astroコンポーネントディレクトリに保存
      await ensureDirectoryExists(components);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // 処理済みとして記録
      await fs.writeFile(
        path.join(processedDir, `${result.filename}-${timestamp}.astro`),
        result.astroComponent,
        'utf-8'
      );
      
      // 実際のコンポーネントファイルとして保存
      if (result.success) {
        await fs.writeFile(
          path.join(components, `${result.filename}.astro`),
          result.astroComponent,
          'utf-8'
        );
        
        // スタイルファイルも保存（必要に応じて）
        if (result.styles) {
          await fs.writeFile(
            path.join(components, `${result.filename}.css`),
            result.styles,
            'utf-8'
          );
        }
      }
    });

    logger.info('変換結果保存完了', {
      filename: result.filename,
      success: result.success
    });

  } catch (error) {
    logger.error('変換結果保存エラー', {
      error: error instanceof Error ? error.message : String(error),
      filename: result.filename
    });
    throw error;
  }
}

/**
 * ディレクトリが存在しない場合は作成する
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // すでに存在する場合はエラーにならないが、権限エラー等は再throw
    if (error instanceof Error && !error.message.includes('EEXIST')) {
      throw error;
    }
  }
}

/**
 * 過去のスクレイピングデータを読み込む
 */
export async function loadScrapedData(timestamp?: string): Promise<ReadyAiSiteData | null> {
  try {
    const { scrapedData } = CONFIG.paths;
    let targetDir: string;
    
    if (timestamp) {
      // 特定のタイムスタンプのデータを読み込み
      targetDir = path.join(scrapedData, 'history', timestamp);
    } else {
      // 最新のデータを読み込み
      targetDir = path.join(scrapedData, 'current');
    }
    
    const [html, css, hash, metadataStr] = await Promise.all([
      fs.readFile(path.join(targetDir, 'index.html'), 'utf-8'),
      fs.readFile(path.join(targetDir, 'styles.css'), 'utf-8'),
      fs.readFile(path.join(targetDir, 'hash.txt'), 'utf-8'),
      fs.readFile(path.join(targetDir, 'metadata.json'), 'utf-8')
    ]);
    
    const metadata = JSON.parse(metadataStr);
    
    return {
      html,
      css,
      hash: hash.trim(),
      timestamp: new Date(metadata.timestamp),
      sourceUrl: metadata.sourceUrl
    };
    
  } catch (error) {
    logger.warn('データ読み込みエラー', {
      error: error instanceof Error ? error.message : String(error),
      timestamp
    });
    return null;
  }
}

/**
 * 履歴データの一覧を取得する
 */
export async function getHistoryList(): Promise<string[]> {
  try {
    const { scrapedData } = CONFIG.paths;
    const historyDir = path.join(scrapedData, 'history');
    
    try {
      const entries = await fs.readdir(historyDir, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort()
        .reverse(); // 新しい順
    } catch {
      // ディレクトリが存在しない場合
      return [];
    }
    
  } catch (error) {
    logger.error('履歴一覧取得エラー', {
      error: error instanceof Error ? error.message : String(error)
    });
    return [];
  }
}

/**
 * 古い履歴データを削除する（保持期間を超えたもの）
 */
export async function cleanupOldHistory(retentionDays: number = 30): Promise<number> {
  try {
    const historyList = await getHistoryList();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    let deletedCount = 0;
    
    for (const historyItem of historyList) {
      try {
        // タイムスタンプから日付を復元
        const dateStr = historyItem.replace(/-/g, ':').replace(/T(\d{2}):(\d{2}):(\d{2})/, 'T$1:$2:$3');
        const itemDate = new Date(dateStr);
        
        if (itemDate < cutoffDate) {
          const { scrapedData } = CONFIG.paths;
          const historyPath = path.join(scrapedData, 'history', historyItem);
          await fs.rm(historyPath, { recursive: true });
          deletedCount++;
        }
      } catch (error) {
        logger.warn('履歴削除エラー', {
          historyItem,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    logger.info('履歴クリーンアップ完了', {
      deletedCount,
      retentionDays
    });
    
    return deletedCount;
    
  } catch (error) {
    logger.error('履歴クリーンアップエラー', {
      error: error instanceof Error ? error.message : String(error)
    });
    return 0;
  }
}

/**
 * ファイルサイズを人間が読みやすい形式で取得
 */
export function formatFileSize(bytes: number): string {
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
 * ディスク使用量を取得
 */
export async function getStorageUsage(): Promise<{
  totalSize: number;
  currentSize: number;
  historySize: number;
  processedSize: number;
}> {
  try {
    const { scrapedData } = CONFIG.paths;
    
    const [currentSize, historySize, processedSize] = await Promise.all([
      getDirectorySize(path.join(scrapedData, 'current')),
      getDirectorySize(path.join(scrapedData, 'history')),
      getDirectorySize(path.join(scrapedData, 'processed'))
    ]);
    
    const totalSize = currentSize + historySize + processedSize;
    
    return {
      totalSize,
      currentSize,
      historySize,
      processedSize
    };
    
  } catch (error) {
    logger.error('ストレージ使用量取得エラー', {
      error: error instanceof Error ? error.message : String(error)
    });
    return {
      totalSize: 0,
      currentSize: 0,
      historySize: 0,
      processedSize: 0
    };
  }
}

/**
 * ディレクトリのサイズを計算
 */
async function getDirectorySize(dirPath: string): Promise<number> {
  try {
    let totalSize = 0;
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        totalSize += await getDirectorySize(fullPath);
      } else {
        const stats = await fs.stat(fullPath);
        totalSize += stats.size;
      }
    }
    
    return totalSize;
    
  } catch {
    // ディレクトリが存在しない場合は0を返す
    return 0;
  }
}
