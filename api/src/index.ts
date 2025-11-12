import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import path from 'path'

import { config } from './config'
import { initializeDatabase } from './config/database'
import apiRoutes from './routes'
import { corsMiddleware, errorHandler, rateLimiter } from './middleware'
import { AppDataSource } from './config/database'
import { User, UserRole, UserStatus } from './entities/User'
import { hashPassword } from './utils'

const app = express()

// Middlewares
// Configure Helmet to be friendlier for local development and cross-origin assets
app.use(helmet({
  // Allow loading images and other assets from the API origin in the front-end
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // Disable COEP for dev to avoid blocking when not using proper headers
  crossOriginEmbedderPolicy: false,
  // Permit same-origin popups (useful for some OAuth/dev tools)
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}))
app.use(morgan('dev'))
app.use(express.json({ limit: `${process.env.BODY_LIMIT_MB || '10'}mb` }))
app.use(express.urlencoded({ extended: true }))
app.use(corsMiddleware)
app.use(rateLimiter(config.rateLimit.windowMs, config.rateLimit.max))

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv })
})

// API routes
app.use('/api', apiRoutes)

// Error handler
app.use(errorHandler)

// Start server
const start = async () => {
  try {
    await initializeDatabase()
  } catch (err) {
    // Log the error but continue starting the server to allow front-end dev
    console.error('Database init failed. Server will still start for development.', err)
  }

  app.listen(config.port, () => {
    console.log(`🚀 API server listening on http://localhost:${config.port}`)
  })

  // Ensure default admin user exists for local development
  try {
    if (AppDataSource.isInitialized) {
      const repo = AppDataSource.getRepository(User)
      const email = 'admin@example.com'
      let admin = await repo.findOne({ where: { email } })
      if (!admin) {
        const password = await hashPassword('password')
        admin = repo.create({
          name: 'Admin',
          email,
          password,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          isActive: true,
          isEmailVerified: true,
        })
        await repo.save(admin)
        console.log('✅ Default admin created:', email)
      } else {
        // Ensure admin is active
        let patched = false
        if (admin.role !== UserRole.ADMIN) { admin.role = UserRole.ADMIN; patched = true }
        if (admin.status !== UserStatus.ACTIVE) { admin.status = UserStatus.ACTIVE; patched = true }
        if (!admin.isActive) { admin.isActive = true; patched = true }
        if (patched) { await repo.save(admin); console.log('✅ Default admin patched to active/admin role') }
      }

      const email2 = 'admin@artbooking.com'
      let admin2 = await repo.findOne({ where: { email: email2 } })
      if (!admin2) {
        const password2 = await hashPassword('password')
        admin2 = repo.create({
          name: 'Admin',
          email: email2,
          password: password2,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          isActive: true,
          isEmailVerified: true,
        })
        await repo.save(admin2)
        console.log('✅ Admin created:', email2)
      } else {
        let patched2 = false
        if (admin2.role !== UserRole.ADMIN) { admin2.role = UserRole.ADMIN; patched2 = true }
        if (admin2.status !== UserStatus.ACTIVE) { admin2.status = UserStatus.ACTIVE; patched2 = true }
        if (!admin2.isActive) { admin2.isActive = true; patched2 = true }
        if (patched2) { await repo.save(admin2); console.log('✅ Admin patched to active/admin role:', email2) }
      }
    }
  } catch (e) {
    console.error('Failed ensuring default admin:', e)
  }
}

start()
