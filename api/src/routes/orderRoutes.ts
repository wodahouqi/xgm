import { Router } from 'express'
import { OrderController } from '../controllers/OrderController'
import { authMiddleware } from '../middleware/auth'
import { roleMiddleware } from '../middleware/role'
import { UserRole } from '../entities/User'

const router: Router = Router()
const orderController = new OrderController()

// Protected routes
router.get('/', authMiddleware, orderController.getUserOrders)
router.post('/', authMiddleware, orderController.createOrder)
router.get('/:id', authMiddleware, orderController.getOrderById)
router.put('/:id/cancel', authMiddleware, orderController.cancelOrder)

// Admin routes
router.get('/admin/all', authMiddleware, roleMiddleware([UserRole.ADMIN]), orderController.getAllOrders)
router.put('/admin/:id/status', authMiddleware, roleMiddleware([UserRole.ADMIN]), orderController.updateOrderStatus)
router.put('/admin/:id/payment-status', authMiddleware, roleMiddleware([UserRole.ADMIN]), orderController.updatePaymentStatus)

export default router