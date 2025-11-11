import { Request, Response } from 'express'
import { AppDataSource } from '../config/database'
import { User, UserRole } from '../entities/User'
import { hashPassword, comparePassword, generateToken, generateRefreshToken, verifyToken } from '../utils'
import { sendSuccess, sendError, validateRequest } from '../utils'

export class UserController {
  register = async (req: Request, res: Response) => {
    try {
      const { name, email, password, phone, location, role = UserRole.COLLECTOR } = req.body

      // Validate required fields
      const missingFields = validateRequest(req, ['name', 'email', 'password'])
      if (missingFields.length > 0) {
        return sendError(res, `Missing required fields: ${missingFields.join(', ')}`)
      }

      const userRepository = AppDataSource.getRepository(User)

      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } })
      if (existingUser) {
        return sendError(res, 'User already exists with this email', 400)
      }

      // Hash password
      const hashedPassword = await hashPassword(password)

      // Create new user
      const user = userRepository.create({
        name,
        email,
        password: hashedPassword,
        phone,
        location,
        role
      })

      const savedUser = await userRepository.save(user)

      // Generate tokens
      const token = generateToken(savedUser.id)
      const refreshToken = generateRefreshToken(savedUser.id)

      // Return user data without password
      const userResponse = {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone,
        location: savedUser.location,
        role: savedUser.role,
        status: savedUser.status,
        createdAt: savedUser.createdAt
      }

      return sendSuccess(res, {
        user: userResponse,
        token,
        refreshToken
      }, 'User registered successfully')
    } catch (error) {
      console.error('Register error:', error)
      return sendError(res, 'Failed to register user', 500, error)
    }
  }

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body

      // Validate required fields
      const missingFields = validateRequest(req, ['email', 'password'])
      if (missingFields.length > 0) {
        return sendError(res, `Missing required fields: ${missingFields.join(', ')}`)
      }

      const userRepository = AppDataSource.getRepository(User)

      // Find user by email
      const user = await userRepository.findOne({ where: { email } })
      if (!user) {
        return sendError(res, 'Invalid email or password', 401)
      }

      // Check if user is active
      if (!user.isActive || user.status !== 'active') {
        return sendError(res, 'Account is inactive', 401)
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password)
      if (!isPasswordValid) {
        return sendError(res, 'Invalid email or password', 401)
      }

      // Generate tokens
      const token = generateToken(user.id)
      const refreshToken = generateRefreshToken(user.id)

      // Return user data without password
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }

      return sendSuccess(res, {
        user: userResponse,
        token,
        refreshToken
      }, 'Login successful')
    } catch (error) {
      console.error('Login error:', error)
      return sendError(res, 'Failed to login', 500, error)
    }
  }

  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return sendError(res, 'Refresh token is required', 400)
      }

      const decoded = verifyToken(refreshToken) as any
      
      if (decoded.type !== 'refresh') {
        return sendError(res, 'Invalid refresh token', 401)
      }

      const userRepository = AppDataSource.getRepository(User)
      const user = await userRepository.findOne({ 
        where: { id: decoded.userId },
        select: ['id', 'name', 'email', 'role', 'status', 'isActive']
      })

      if (!user || !user.isActive) {
        return sendError(res, 'User not found or inactive', 401)
      }

      const newToken = generateToken(user.id)
      const newRefreshToken = generateRefreshToken(user.id)

      return sendSuccess(res, {
        token: newToken,
        refreshToken: newRefreshToken
      }, 'Token refreshed successfully')
    } catch (error) {
      console.error('Refresh token error:', error)
      return sendError(res, 'Invalid refresh token', 401, error)
    }
  }

  getProfile = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id
      const userRepository = AppDataSource.getRepository(User)

      const user = await userRepository.findOne({
        where: { id: userId },
        select: ['id', 'name', 'email', 'phone', 'location', 'role', 'status', 'avatar', 'bio', 'createdAt', 'updatedAt']
      })

      if (!user) {
        return sendError(res, 'User not found', 404)
      }

      return sendSuccess(res, user, 'Profile retrieved successfully')
    } catch (error) {
      console.error('Get profile error:', error)
      return sendError(res, 'Failed to get profile', 500, error)
    }
  }

  updateProfile = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id
      const { name, phone, location, avatar, bio } = req.body

      const userRepository = AppDataSource.getRepository(User)
      const user = await userRepository.findOne({ where: { id: userId } })

      if (!user) {
        return sendError(res, 'User not found', 404)
      }

      // Update user fields
      if (name) user.name = name
      if (phone) user.phone = phone
      if (location) user.location = location
      if (avatar) user.avatar = avatar
      if (bio) user.bio = bio

      const updatedUser = await userRepository.save(user)

      // Return updated user data without password
      const userResponse = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        location: updatedUser.location,
        role: updatedUser.role,
        status: updatedUser.status,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        updatedAt: updatedUser.updatedAt
      }

      return sendSuccess(res, userResponse, 'Profile updated successfully')
    } catch (error) {
      console.error('Update profile error:', error)
      return sendError(res, 'Failed to update profile', 500, error)
    }
  }

  changePassword = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id
      const { currentPassword, newPassword } = req.body

      // Validate required fields
      const missingFields = validateRequest(req, ['currentPassword', 'newPassword'])
      if (missingFields.length > 0) {
        return sendError(res, `Missing required fields: ${missingFields.join(', ')}`)
      }

      const userRepository = AppDataSource.getRepository(User)
      const user = await userRepository.findOne({ where: { id: userId } })

      if (!user) {
        return sendError(res, 'User not found', 404)
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        return sendError(res, 'Current password is incorrect', 400)
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword)
      user.password = hashedNewPassword

      await userRepository.save(user)

      return sendSuccess(res, null, 'Password changed successfully')
    } catch (error) {
      console.error('Change password error:', error)
      return sendError(res, 'Failed to change password', 500, error)
    }
  }

  logout = async (req: Request, res: Response) => {
    try {
      // In a more complex implementation, you might want to blacklist the token
      // For now, we'll just return success
      return sendSuccess(res, null, 'Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      return sendError(res, 'Failed to logout', 500, error)
    }
  }

  // Admin methods
  getAllUsers = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, role, status, search } = req.query

      const userRepository = AppDataSource.getRepository(User)
      const queryBuilder = userRepository.createQueryBuilder('user')

      // Apply filters
      if (role) {
        queryBuilder.andWhere('user.role = :role', { role })
      }
      if (status) {
        queryBuilder.andWhere('user.status = :status', { status })
      }
      if (search) {
        queryBuilder.andWhere('(user.name LIKE :search OR user.email LIKE :search)', { search: `%${search}%` })
      }

      // Get total count
      const total = await queryBuilder.getCount()

      // Get paginated results
      const users = await queryBuilder
        .select(['user.id', 'user.name', 'user.email', 'user.phone', 'user.role', 'user.status', 'user.isActive', 'user.createdAt'])
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy('user.createdAt', 'DESC')
        .getMany()

      return sendSuccess(res, users, 'Users retrieved successfully', {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      })
    } catch (error) {
      console.error('Get all users error:', error)
      return sendError(res, 'Failed to get users', 500, error)
    }
  }

  getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userRepository = AppDataSource.getRepository(User)

      const user = await userRepository.findOne({
        where: { id },
        select: ['id', 'name', 'email', 'phone', 'location', 'role', 'status', 'avatar', 'bio', 'isActive', 'createdAt', 'updatedAt']
      })

      if (!user) {
        return sendError(res, 'User not found', 404)
      }

      return sendSuccess(res, user, 'User retrieved successfully')
    } catch (error) {
      console.error('Get user by ID error:', error)
      return sendError(res, 'Failed to get user', 500, error)
    }
  }

  updateUserStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { status, isActive } = req.body

      const userRepository = AppDataSource.getRepository(User)
      const user = await userRepository.findOne({ where: { id } })

      if (!user) {
        return sendError(res, 'User not found', 404)
      }

      if (status) user.status = status
      if (typeof isActive === 'boolean') user.isActive = isActive

      const updatedUser = await userRepository.save(user)

      return sendSuccess(res, {
        id: updatedUser.id,
        status: updatedUser.status,
        isActive: updatedUser.isActive
      }, 'User status updated successfully')
    } catch (error) {
      console.error('Update user status error:', error)
      return sendError(res, 'Failed to update user status', 500, error)
    }
  }

  deleteUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userRepository = AppDataSource.getRepository(User)

      const user = await userRepository.findOne({ where: { id } })
      if (!user) {
        return sendError(res, 'User not found', 404)
      }

      await userRepository.remove(user)

      return sendSuccess(res, null, 'User deleted successfully')
    } catch (error) {
      console.error('Delete user error:', error)
      return sendError(res, 'Failed to delete user', 500, error)
    }
  }
}