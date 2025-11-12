import bcrypt from 'bcryptjs'
import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import { config } from '../config'
import { User } from '../entities/User'

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const generateToken = (userId: string): string => {
  const secret: Secret = config.jwt.secret as Secret
  const options: SignOptions = { expiresIn: config.jwt.expiresIn as any }
  return jwt.sign({ userId }, secret, options)
}

export const generateRefreshToken = (userId: string): string => {
  const secret: Secret = config.jwt.secret as Secret
  const options: SignOptions = { expiresIn: '30d' }
  return jwt.sign({ userId, type: 'refresh' }, secret, options)
}

export const verifyToken = (token: string): any => {
  const secret: Secret = config.jwt.secret as Secret
  return jwt.verify(token, secret)
}

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `ART${timestamp.slice(-8)}${random}`
}

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const calculateAverageRating = (ratings: number[]): number => {
  if (ratings.length === 0) return 0
  const sum = ratings.reduce((acc, rating) => acc + rating, 0)
  return Math.round((sum / ratings.length) * 100) / 100
}
