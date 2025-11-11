import { Request, Response, NextFunction } from 'express'
import { config } from '../config'

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = new Set([
    config.cors.origin,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
  ])

  const origin = req.headers.origin as string | undefined

  const localRegex = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/
  const privateLanRegex = /^https?:\/\/(10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?::\d{1,5})?$/

  const isAllowed = !!origin && (
    allowedOrigins.has(origin) || localRegex.test(origin) || privateLanRegex.test(origin)
  )

  if (isAllowed && origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Credentials', String(config.cors.credentials))
    res.header('Vary', 'Origin')
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Expose-Headers', 'Authorization, Content-Type, X-Total-Count, X-Request-Id')
  res.header('Access-Control-Max-Age', '86400')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  next()
}