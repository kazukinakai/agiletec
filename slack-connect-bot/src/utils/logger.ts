export interface LogContext {
  [key: string]: any
}

export class Logger {
  private context: LogContext

  constructor(context: LogContext = {}) {
    this.context = context
  }

  private log(level: string, message: string, extra?: LogContext) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      ...this.context,
      ...extra,
    }
    
    console.log(JSON.stringify(logEntry))
  }

  info(message: string, extra?: LogContext) {
    this.log('INFO', message, extra)
  }

  error(message: string, error?: Error | unknown, extra?: LogContext) {
    const errorDetails: LogContext = {}
    
    if (error instanceof Error) {
      errorDetails.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    } else if (error) {
      errorDetails.error = error
    }

    this.log('ERROR', message, { ...errorDetails, ...extra })
  }

  warn(message: string, extra?: LogContext) {
    this.log('WARN', message, extra)
  }

  debug(message: string, extra?: LogContext) {
    this.log('DEBUG', message, extra)
  }

  withContext(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context })
  }
}