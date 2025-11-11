import { Router } from 'express'
import { DashboardController } from '../controllers/DashboardController'
import { authMiddleware } from '../middleware/auth'
import { roleMiddleware } from '../middleware/role'
import { UserRole } from '../entities/User'

const router: Router = Router()
const dashboardController = new DashboardController()

// Admin dashboard routes
router.get('/stats', authMiddleware, roleMiddleware([UserRole.ADMIN]), dashboardController.getDashboardStats)
router.get('/recent-orders', authMiddleware, roleMiddleware([UserRole.ADMIN]), dashboardController.getRecentOrders)
router.get('/popular-artworks', authMiddleware, roleMiddleware([UserRole.ADMIN]), dashboardController.getPopularArtworks)
router.get('/sales-chart', authMiddleware, roleMiddleware([UserRole.ADMIN]), dashboardController.getSalesChartData)

// Artist dashboard routes
router.get('/artist/stats', authMiddleware, roleMiddleware([UserRole.ARTIST]), dashboardController.getArtistDashboardStats)
router.get('/artist/artworks', authMiddleware, roleMiddleware([UserRole.ARTIST]), dashboardController.getArtistArtworks)
router.get('/artist/orders', authMiddleware, roleMiddleware([UserRole.ARTIST]), dashboardController.getArtistOrders)

export default router