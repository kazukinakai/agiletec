import crypto from 'crypto';
import { logger } from './logger.js';
import { loadScrapedData } from './file-manager.js';
import type { HashComparison } from '../types/ready-ai.d.ts';

/**
 * 文字列のMD5ハッシュを生成
 */
export function generateHash(content: string): string {
  return crypto.createHash('md5').update(content, 'utf8').digest('hex');
}

/**
 * 複数のコンテンツを結合してハッシュ生成
 */
export function generateCombinedHash(contents: string[]): string {
  const combined = contents.join('');
  return generateHash(combined);
}

/**
 * HTMLとCSSの内容から統合ハッシュを生成
 */
export function generateSiteHash(html: string, css: string): string {
  // Ready.ai固有の要素やタイムスタンプなど、変更検知に不要な部分を除去
  const cleanedHtml = cleanHtmlForHashing(html);
  const cleanedCss = cleanCssForHashing(css);
  
  return generateCombinedHash([cleanedHtml, cleanedCss]);
}

/**
 * ハッシュ比較を実行
 */
export async function compareWithPrevious(currentHash: string): Promise<HashComparison> {
  try {
    const previousData = await loadScrapedData();
    const previousHash = previousData?.hash;
    
    const comparison: HashComparison = {
      previousHash,
      currentHash,
      hasChanged: previousHash !== currentHash,
      comparedAt: new Date()
    };
    
    logger.info('ハッシュ比較完了', {
      previousHash: previousHash || 'なし',
      currentHash,
      hasChanged: comparison.hasChanged
    });
    
    return comparison;
    
  } catch (error) {
    logger.error('ハッシュ比較エラー', {
      error: error instanceof Error ? error.message : String(error),
      currentHash
    });
    
    // エラーの場合は変更ありとして扱う
    return {
      currentHash,
      hasChanged: true,
      comparedAt: new Date()
    };
  }
}

/**
 * HTMLコンテンツをハッシュ計算用にクリーニング
 */
function cleanHtmlForHashing(html: string): string {
  let cleaned = html;
  
  // Ready.ai固有の要素を除去
  const removePatterns = [
    // Ready.ai固有のデータ属性
    /data-ready-[^=]*="[^"]*"/gi,
    // タイムスタンプや動的に変わる可能性のあるID
    /id="[^"]*\d{10,}[^"]*"/gi,
    // 動的なスタイル属性（位置やアニメーション）
    /style="[^"]*transform[^"]*"/gi,
    // コメント
    /<!--[\s\S]*?-->/g,
    // 空白の正規化
    /\s+/g
  ];
  
  removePatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, pattern === /\s+/g ? ' ' : '');
  });
  
  // HTMLエンティティを正規化
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
  
  return cleaned.trim();
}

/**
 * CSSコンテンツをハッシュ計算用にクリーニング
 */
function cleanCssForHashing(css: string): string {
  let cleaned = css;
  
  // CSS内の動的要素を除去
  const removePatterns = [
    // コメント
    /\/\*[\s\S]*?\*\//g,
    // アニメーション関連（フレーム番号など動的要素）
    /@keyframes[^}]+\{[^}]*\}/gi,
    // 動的に変わる可能性のあるカスタムプロパティ
    /--[^:]*-\d+[^:]*:[^;]+;/gi,
    // 空白の正規化
    /\s+/g
  ];
  
  removePatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, pattern === /\s+/g ? ' ' : '');
  });
  
  // CSS値の正規化
  cleaned = cleaned
    // 色の正規化（hex, rgb, hslを統一）
    .replace(/#([0-9a-f]{3})\b/gi, (match, p1) => {
      // 3桁hexを6桁に展開
      return `#${p1[0]}${p1[0]}${p1[1]}${p1[1]}${p1[2]}${p1[2]}`;
    })
    .replace(/#([0-9a-f]{6})\b/gi, (match) => match.toLowerCase())
    // 単位の正規化
    .replace(/(\d+)px/g, '$1px') // 不要だが統一性のため
    .replace(/(\d+\.0+)(px|em|rem|%)/g, '$1$2') // 小数点以下の0を除去
    // セミコロンの統一
    .replace(/;\s*}/g, '}');
  
  return cleaned.trim();
}

/**
 * ハッシュの短縮版を生成（ログ表示用）
 */
export function getShortHash(hash: string, length: number = 8): string {
  return hash.substring(0, length);
}

/**
 * 2つのハッシュの差分を文字で表現
 */
export function getHashDifference(hash1?: string, hash2?: string): string {
  if (!hash1 || !hash2) {
    return '初回または比較不可';
  }
  
  if (hash1 === hash2) {
    return '変更なし';
  }
  
  // ハッシュの差分を簡単に表現
  let diffCount = 0;
  const minLength = Math.min(hash1.length, hash2.length);
  
  for (let i = 0; i < minLength; i++) {
    if (hash1[i] !== hash2[i]) {
      diffCount++;
    }
  }
  
  const diffPercentage = Math.round((diffCount / minLength) * 100);
  return `${diffPercentage}%の差分`;
}

/**
 * ハッシュの履歴を取得
 */
export async function getHashHistory(limit: number = 10): Promise<{
  timestamp: string;
  hash: string;
  shortHash: string;
}[]> {
  try {
    const { getHistoryList } = await import('./file-manager.js');
    const historyList = await getHistoryList();
    
    const hashHistory = [];
    
    for (const timestamp of historyList.slice(0, limit)) {
      const data = await loadScrapedData(timestamp);
      if (data) {
        hashHistory.push({
          timestamp,
          hash: data.hash,
          shortHash: getShortHash(data.hash)
        });
      }
    }
    
    // 現在のデータも追加
    const currentData = await loadScrapedData();
    if (currentData) {
      hashHistory.unshift({
        timestamp: 'current',
        hash: currentData.hash,
        shortHash: getShortHash(currentData.hash)
      });
    }
    
    return hashHistory;
    
  } catch (error) {
    logger.error('ハッシュ履歴取得エラー', {
      error: error instanceof Error ? error.message : String(error)
    });
    return [];
  }
}

/**
 * 重複するハッシュをチェック（同じコンテンツの重複保存を防ぐ）
 */
export async function checkForDuplicateHash(hash: string): Promise<boolean> {
  try {
    const hashHistory = await getHashHistory(50); // 過去50件をチェック
    return hashHistory.some(item => item.hash === hash);
    
  } catch (error) {
    logger.warn('重複ハッシュチェックエラー', {
      error: error instanceof Error ? error.message : String(error),
      hash: getShortHash(hash)
    });
    return false;
  }
}

/**
 * ハッシュ統計情報を取得
 */
export async function getHashStatistics(): Promise<{
  totalHashes: number;
  uniqueHashes: number;
  duplicateCount: number;
  mostRecentChange: string | null;
}> {
  try {
    const hashHistory = await getHashHistory(100);
    const uniqueHashes = new Set(hashHistory.map(item => item.hash));
    
    let mostRecentChange = null;
    for (let i = 1; i < hashHistory.length; i++) {
      if (hashHistory[i-1].hash !== hashHistory[i].hash) {
        mostRecentChange = hashHistory[i-1].timestamp;
        break;
      }
    }
    
    return {
      totalHashes: hashHistory.length,
      uniqueHashes: uniqueHashes.size,
      duplicateCount: hashHistory.length - uniqueHashes.size,
      mostRecentChange
    };
    
  } catch (error) {
    logger.error('ハッシュ統計取得エラー', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return {
      totalHashes: 0,
      uniqueHashes: 0,
      duplicateCount: 0,
      mostRecentChange: null
    };
  }
}
