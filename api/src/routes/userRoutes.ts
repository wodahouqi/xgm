import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { authMiddleware } from '../middleware/auth'
import { roleMiddleware } from '../middleware/role'
import { UserRole } from '../entities/User'

const router: Router = Router()
const userController = new UserController()

// Public routes
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/refresh-token', userController.refreshToken)

// Protected routes
router.get('/profile', authMiddleware, userController.getProfile)
router.put('/profile', authMiddleware, userController.updateProfile)
router.post('/change-password', authMiddleware, userController.changePassword)
router.post('/logout', authMiddleware, userController.logout)

// Admin routes
router.get('/', authMiddleware, roleMiddleware([UserRole.ADMIN]), userController.getAllUsers)
router.get('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN]), userController.getUserById)
router.put('/:id/status', authMiddleware, roleMiddleware([UserRole.ADMIN]), userController.updateUserStatus)
router.delete('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN]), userController.deleteUser)

export default router