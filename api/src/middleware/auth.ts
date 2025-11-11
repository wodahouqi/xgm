import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { AppDataSource } from '../config/database'
import { User } from '../entities/User'

export interface AuthRequest extends Request {
  user?: User
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      })
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({ 
      where: { id: decoded.userId },
      select: ['id', 'name', 'email', 'role', 'status', 'isActive']
    })

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      })
    }

    if (!user.isActive || user.status !== 'active') {
      return res.status(401).json({ 
        success: false, 
        message: 'User account is inactive.' 
      })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    })
  }
}