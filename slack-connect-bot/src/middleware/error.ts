import { Context, Next } from 'hono'
import { Logger } from '../utils/logger'

export async function errorHandler(c: Context, next: Next) {
  const logger = new Logger({ 
    path: c.req.path,
    method: c.req.method,
  })

  try {
    await next()
  } catch (error) {
    logger.error('Unhandled error', error)
    
    if (error instanceof Error) {
      // 特定のエラータイプに基づいたレスポンス
      if (error.name === 'ValidationError') {
        return c.json({
          error: 'Validation Error',
          message: error.message,
        }, 400)
      }
      
      if (error.message.includes('Unauthorized')) {
        return c.json({
          error: 'Unauthorized',
          message: 'Invalid or missing authentication',
        }, 401)
      }
      
      if (error.message.includes('Not Found')) {
        return c.json({
          error: 'Not Found',
          message: error.message,
        }, 404)
      }
    }
    
    // デフォルトのエラーレスポンス
    return c.json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    }, 500)
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Not Found') {
    super(message)
    this.name = 'NotFoundError'
  }
}