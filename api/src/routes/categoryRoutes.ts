import { Router } from 'express'
import { CategoryController } from '../controllers/CategoryController'
import { authMiddleware } from '../middleware/auth'
import { roleMiddleware } from '../middleware/role'
import { UserRole } from '../entities/User'

const router: Router = Router()
const categoryController = new CategoryController()

// Public routes
router.get('/', categoryController.getAllCategories)
router.get('/:id', categoryController.getCategoryById)
router.get('/:id/artworks', categoryController.getCategoryArtworks)

// Admin routes
router.post('/', authMiddleware, roleMiddleware([UserRole.ADMIN]), categoryController.createCategory)
router.put('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN]), categoryController.updateCategory)
router.delete('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN]), categoryController.deleteCategory)

export default router