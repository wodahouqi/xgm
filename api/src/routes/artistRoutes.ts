import { Router } from 'express'
import { ArtistController } from '../controllers/ArtistController'
import { authMiddleware } from '../middleware/auth'
import { roleMiddleware } from '../middleware/role'
import { UserRole } from '../entities/User'

const router: Router = Router()
const artistController = new ArtistController()

// Public routes
router.get('/', artistController.getAllArtists)
router.get('/featured', artistController.getFeaturedArtists)
router.get('/search', artistController.searchArtists)
router.get('/:id', artistController.getArtistById)
router.get('/:id/artworks', artistController.getArtistArtworks)

// Protected routes
router.post('/:id/follow', authMiddleware, artistController.toggleFollow)

// Admin routes
router.post('/', authMiddleware, roleMiddleware([UserRole.ADMIN]), artistController.createArtist)
router.put('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN]), artistController.updateArtist)
router.delete('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN]), artistController.deleteArtist)
router.patch('/:id/status', authMiddleware, roleMiddleware([UserRole.ADMIN]), artistController.updateArtistStatus)

export default router