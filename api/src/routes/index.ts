import { Router } from 'express'
import userRoutes from './userRoutes'
import artworkRoutes from './artworkRoutes'
import artistRoutes from './artistRoutes'
import categoryRoutes from './categoryRoutes'
import orderRoutes from './orderRoutes'
import uploadRoutes from './uploadRoutes'
import dashboardRoutes from './dashboardRoutes'

const router = Router()

// Mount all route modules
router.use('/users', userRoutes)
router.use('/artworks', artworkRoutes)
router.use('/artists', artistRoutes)
router.use('/categories', categoryRoutes)
router.use('/orders', orderRoutes)
router.use('/uploads', uploadRoutes)
router.use('/dashboard', dashboardRoutes)

export default router