import { Router } from 'express'
import { ArtworkController } from '../controllers/ArtworkController'
import { authMiddleware } from '../middleware/auth'
import { roleMiddleware } from '../middleware/role'
import { UserRole } from '../entities/User'

const router: Router = Router()
const artworkController = new ArtworkController()

// Public routes
router.get('/', artworkController.getAllArtworks)
router.get('/featured', artworkController.getFeaturedArtworks)
router.get('/search', artworkController.searchArtworks)
router.get('/category/:categoryId', artworkController.getArtworksByCategory)
router.get('/artist/:artistId', artworkController.getArtworksByArtist)
router.get('/:id', artworkController.getArtworkById)

// Protected routes - require authentication
router.post('/:id/favorite', authMiddleware, artworkController.toggleFavorite)
router.get('/:id/reviews', artworkController.getArtworkReviews)
router.post('/:id/reviews', authMiddleware, artworkController.createReview)

// Artist routes
router.post('/', authMiddleware, roleMiddleware([UserRole.ARTIST, UserRole.ADMIN]), artworkController.createArtwork)
router.put('/:id', authMiddleware, roleMiddleware([UserRole.ARTIST, UserRole.ADMIN]), artworkController.updateArtwork)
router.delete('/:id', authMiddleware, roleMiddleware([UserRole.ARTIST, UserRole.ADMIN]), artworkController.deleteArtwork)
router.patch('/:id/status', authMiddleware, roleMiddleware([UserRole.ARTIST, UserRole.ADMIN]), artworkController.updateArtworkStatus)

export default router