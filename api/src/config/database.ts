import { DataSource } from 'typeorm'
import { config } from './index'
import { User } from '../entities/User'
import { Artist } from '../entities/Artist'
import { Artwork } from '../entities/Artwork'
import { Category } from '../entities/Category'
import { Order } from '../entities/Order'
import { OrderItem } from '../entities/OrderItem'
import { Favorite } from '../entities/Favorite'
import { Review } from '../entities/Review'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.database.synchronize,
  logging: config.database.logging,
  entities: [User, Artist, Artwork, Category, Order, OrderItem, Favorite, Review],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
})

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize()
    console.log('✅ Database connection established successfully')
  } catch (error) {
    console.error('❌ Error during database initialization:', error)
    throw error
  }
}