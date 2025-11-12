import { Request, Response, NextFunction } from 'express'

export const rateLimiter = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV !== 'production') {
      return next()
    }
    if (req.method === 'GET' || req.method === 'OPTIONS') {
      return next()
    }
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    const now = Date.now()
    const requestInfo = requests.get(ip)

    if (!requestInfo || now > requestInfo.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs })
      return next()
    }

    if (requestInfo.count >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.'
      })
    }

    requestInfo.count++
    next()
  }
}
