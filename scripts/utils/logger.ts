import { LOG_LEVELS } from '../ready-ai/config.js';

type LogLevel = keyof typeof LOG_LEVELS;
type LogData = Record<string, any>;

/**
 * 構造化ログシステム
 */
class Logger {
  private currentLevel: number = LOG_LEVELS.INFO;

  /**
   * ログレベルを設定
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = LOG_LEVELS[level];
  }

  /**
   * エラーログ
   */
  error(message: string, data?: LogData): void {
    this.log('ERROR', message, data);
  }

  /**
   * 警告ログ
   */
  warn(message: string, data?: LogData): void {
    this.log('WARN', message, data);
  }

  /**
   * 情報ログ
   */
  info(message: string, data?: LogData): void {
    this.log('INFO', message, data);
  }

  /**
   * デバッグログ
   */
  debug(message: string, data?: LogData): void {
    this.log('DEBUG', message, data);
  }

  /**
   * ログ出力の共通処理
   */
  private log(level: LogLevel, message: string, data?: LogData): void {
    const levelValue = LOG_LEVELS[level];
    
    if (levelValue > this.currentLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };

    // コンソール出力（開発環境）
    if (process.env.NODE_ENV !== 'production') {
      const colorizedOutput = this.colorizeLog(level, logEntry);
      console.log(colorizedOutput);
    }

    // 構造化ログ出力（本番環境）
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logEntry));
    }

    // ファイル出力（必要に応じて）
    this.writeToFile(logEntry);
  }

  /**
   * ログの色付け（開発環境用）
   */
  private colorizeLog(level: LogLevel, logEntry: any): string {
    const colors = {
      ERROR: '\x1b[31m', // 赤
      WARN: '\x1b[33m',  // 黄
      INFO: '\x1b[36m',  // シアン
      DEBUG: '\x1b[90m'  // グレー
    };
    
    const reset = '\x1b[0m';
    const color = colors[level];
    
    const { timestamp, message, data } = logEntry;
    let output = `${color}[${level}] ${timestamp} - ${message}${reset}`;
    
    if (data) {
      output += `\n${JSON.stringify(data, null, 2)}`;
    }
    
    return output;
  }

  /**
   * ファイルへのログ出力
   */
  private async writeToFile(logEntry: any): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, `ready-ai-sync-${this.getDateString()}.log`);
      
      // ログディレクトリ作成（存在しない場合）
      try {
        await fs.mkdir(logDir, { recursive: true });
      } catch {
        // ディレクトリが既に存在する場合は無視
      }
      
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(logFile, logLine);
      
    } catch (error) {
      // ファイル出力エラーは無視（コンソールには出力されている）
      console.error('ログファイル出力エラー:', error);
    }
  }

  /**
   * 日付文字列取得（YYYY-MM-DD形式）
   */
  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * 実行時間を測定してログ出力
   */
  async timeAsync<T>(
    operation: string, 
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.info(`開始: ${operation}`);
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.info(`完了: ${operation}`, { duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(`失敗: ${operation}`, { 
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 同期実行時間を測定してログ出力
   */
  time<T>(operation: string, fn: () => T): T {
    const startTime = Date.now();
    this.info(`開始: ${operation}`);
    
    try {
      const result = fn();
      const duration = Date.now() - startTime;
      this.info(`完了: ${operation}`, { duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(`失敗: ${operation}`, { 
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}

/**
 * グローバルロガーインスタンス
 */
export const logger = new Logger();

/**
 * 環境変数からログレベルを設定
 */
const envLogLevel = process.env.LOG_LEVEL as LogLevel;
if (envLogLevel && envLogLevel in LOG_LEVELS) {
  logger.setLevel(envLogLevel);
}
