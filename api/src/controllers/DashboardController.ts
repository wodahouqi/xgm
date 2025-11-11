import { Request, Response } from 'express'
import { AppDataSource } from '../config/database'
import { Order } from '../entities/Order'
import { OrderItem } from '../entities/OrderItem'
import { Artwork } from '../entities/Artwork'
import { User } from '../entities/User'
import { sendSuccess, sendError, formatPagination } from '../utils'

export class DashboardController {
  getAdminDashboard = async (req: Request, res: Response) => {
    try {
      const orderRepository = AppDataSource.getRepository(Order)
      const artworkRepository = AppDataSource.getRepository(Artwork)
      const userRepository = AppDataSource.getRepository(User)

      // Get statistics
      const totalOrders = await orderRepository.count()
      const totalArtworks = await artworkRepository.count({ where: { isActive: true } })
      const totalUsers = await userRepository.count({ where: { isActive: true } })
      const totalRevenue = await orderRepository
        .createQueryBuilder('order')
        .where('order.paymentStatus = :paymentStatus', { paymentStatus: 'paid' })
        .select('SUM(order.totalAmount)', 'total')
        .getRawOne()

      // Get recent orders
      const recentOrders = await orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.items', 'items')
        .orderBy('order.createdAt', 'DESC')
        .limit(10)
        .getMany()

      // Get popular artworks (by view count)
      const popularArtworks = await artworkRepository
        .createQueryBuilder('artwork')
        .leftJoinAndSelect('artwork.artist', 'artist')
        .where('artwork.isActive = :isActive', { isActive: true })
        .orderBy('artwork.viewCount', 'DESC')
        .limit(10)
        .getMany()

      // Get monthly sales data
      const monthlySales = await orderRepository
        .createQueryBuilder('order')
        .select('DATE_FORMAT(order.createdAt, "%Y-%m")', 'month')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(order.totalAmount)', 'revenue')
        .where('order.paymentStatus = :paymentStatus', { paymentStatus: 'paid' })
        .andWhere('order.createdAt >= :startDate', { startDate: new Date(new Date().getFullYear(), 0, 1) })
        .groupBy('month')
        .orderBy('month', 'ASC')
        .getRawMany()

      const dashboardData = {
        statistics: {
          totalOrders,
          totalArtworks,
          totalUsers,
          totalRevenue: totalRevenue?.total || 0
        },
        recentOrders,
        popularArtworks,
        monthlySales
      }

      return sendSuccess(res, dashboardData, 'Admin dashboard data retrieved successfully')
    } catch (error) {
      console.error('Get admin dashboard error:', error)
      return sendError(res, 'Failed to get admin dashboard data', 500, error)
    }
  }

  // Admin: Recent orders
  getRecentOrders = async (req: Request, res: Response) => {
    try {
      const orderRepository = AppDataSource.getRepository(Order)
      const recentOrders = await orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.items', 'items')
        .orderBy('order.createdAt', 'DESC')
        .limit(10)
        .getMany()

      return sendSuccess(res, recentOrders, 'Recent orders retrieved successfully')
    } catch (error) {
      console.error('Get recent orders error:', error)
      return sendError(res, 'Failed to get recent orders', 500, error)
    }
  }

  // Admin: Popular artworks
  getPopularArtworks = async (req: Request, res: Response) => {
    try {
      const artworkRepository = AppDataSource.getRepository(Artwork)
      const popularArtworks = await artworkRepository
        .createQueryBuilder('artwork')
        .leftJoinAndSelect('artwork.artist', 'artist')
        .where('artwork.isActive = :isActive', { isActive: true })
        .orderBy('artwork.viewCount', 'DESC')
        .limit(10)
        .getMany()

      return sendSuccess(res, popularArtworks, 'Popular artworks retrieved successfully')
    } catch (error) {
      console.error('Get popular artworks error:', error)
      return sendError(res, 'Failed to get popular artworks', 500, error)
    }
  }

  // Admin: Sales chart data
  getSalesChartData = async (req: Request, res: Response) => {
    try {
      const orderRepository = AppDataSource.getRepository(Order)
      const monthlySales = await orderRepository
        .createQueryBuilder('order')
        .select('DATE_FORMAT(order.createdAt, "%Y-%m")', 'month')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(order.totalAmount)', 'revenue')
        .where('order.paymentStatus = :paymentStatus', { paymentStatus: 'paid' })
        .andWhere('order.createdAt >= :startDate', { startDate: new Date(new Date().getFullYear(), 0, 1) })
        .groupBy('month')
        .orderBy('month', 'ASC')
        .getRawMany()

      return sendSuccess(res, monthlySales, 'Sales chart data retrieved successfully')
    } catch (error) {
      console.error('Get sales chart data error:', error)
      return sendError(res, 'Failed to get sales chart data', 500, error)
    }
  }

  // Artist: Dashboard stats
  getArtistDashboardStats = async (req: Request, res: Response) => {
    try {
      const artistId = (req as any).user?.id
      if (!artistId) return sendError(res, 'Artist not authenticated', 401)

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const orderItemRepository = AppDataSource.getRepository(OrderItem)

      const totalArtworks = await artworkRepository.count({ where: { artistId, isActive: true } })
      const totalViews = await artworkRepository
        .createQueryBuilder('artwork')
        .where('artwork.artistId = :artistId', { artistId })
        .select('SUM(artwork.viewCount)', 'total')
        .getRawOne()

      const salesData = await orderItemRepository
        .createQueryBuilder('orderItem')
        .leftJoin('orderItem.order', 'order')
        .leftJoin('orderItem.artwork', 'artwork')
        .where('artwork.artistId = :artistId', { artistId })
        .andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: 'paid' })
        .select('SUM(orderItem.subtotal)', 'totalRevenue')
        .addSelect('COUNT(*)', 'totalSales')
        .getRawOne()

      return sendSuccess(res, {
        totalArtworks,
        totalViews: totalViews?.total || 0,
        totalRevenue: salesData?.totalRevenue || 0,
        totalSales: salesData?.totalSales || 0
      }, 'Artist dashboard stats retrieved successfully')
    } catch (error) {
      console.error('Get artist dashboard stats error:', error)
      return sendError(res, 'Failed to get artist dashboard stats', 500, error)
    }
  }

  // Artist: Artworks list
  getArtistArtworks = async (req: Request, res: Response) => {
    try {
      const artistId = (req as any).user?.id
      if (!artistId) return sendError(res, 'Artist not authenticated', 401)

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const artworks = await artworkRepository.find({ where: { artistId, isActive: true } })
      return sendSuccess(res, artworks, 'Artist artworks retrieved successfully')
    } catch (error) {
      console.error('Get artist artworks error:', error)
      return sendError(res, 'Failed to get artist artworks', 500, error)
    }
  }

  // Artist: Orders related to artist artworks
  getArtistOrders = async (req: Request, res: Response) => {
    try {
      const artistId = (req as any).user?.id
      if (!artistId) return sendError(res, 'Artist not authenticated', 401)

      const orderItemRepository = AppDataSource.getRepository(OrderItem)
      const items = await orderItemRepository
        .createQueryBuilder('orderItem')
        .leftJoinAndSelect('orderItem.order', 'order')
        .leftJoinAndSelect('orderItem.artwork', 'artwork')
        .leftJoinAndSelect('order.user', 'user')
        .where('artwork.artistId = :artistId', { artistId })
        .orderBy('order.createdAt', 'DESC')
        .limit(20)
        .getMany()

      return sendSuccess(res, items, 'Artist orders retrieved successfully')
    } catch (error) {
      console.error('Get artist orders error:', error)
      return sendError(res, 'Failed to get artist orders', 500, error)
    }
  }

  getArtistDashboard = async (req: Request, res: Response) => {
    try {
      const artistId = req.user?.id

      if (!artistId) {
        return sendError(res, 'Artist not authenticated', 401)
      }

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const orderRepository = AppDataSource.getRepository(Order)
      const orderItemRepository = AppDataSource.getRepository(OrderItem)

      // Get artist artworks statistics
      const totalArtworks = await artworkRepository.count({ where: { artistId, isActive: true } })
      const totalViews = await artworkRepository
        .createQueryBuilder('artwork')
        .where('artwork.artistId = :artistId', { artistId })
        .select('SUM(artwork.viewCount)', 'total')
        .getRawOne()

      // Get sales data for artist's artworks
      const salesData = await orderItemRepository
        .createQueryBuilder('orderItem')
        .leftJoin('orderItem.order', 'order')
        .leftJoin('orderItem.artwork', 'artwork')
        .where('artwork.artistId = :artistId', { artistId })
        .andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: 'paid' })
        .select('SUM(orderItem.subtotal)', 'totalRevenue')
        .addSelect('COUNT(*)', 'totalSales')
        .getRawOne()

      // Get recent orders for artist's artworks
      const recentOrders = await orderItemRepository
        .createQueryBuilder('orderItem')
        .leftJoinAndSelect('orderItem.order', 'order')
        .leftJoinAndSelect('orderItem.artwork', 'artwork')
        .leftJoinAndSelect('order.user', 'user')
        .where('artwork.artistId = :artistId', { artistId })
        .andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: 'paid' })
        .orderBy('order.createdAt', 'DESC')
        .limit(10)
        .getMany()

      // Get monthly sales data for artist
      const monthlySales = await orderItemRepository
        .createQueryBuilder('orderItem')
        .leftJoin('orderItem.order', 'order')
        .leftJoin('orderItem.artwork', 'artwork')
        .where('artwork.artistId = :artistId', { artistId })
        .andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: 'paid' })
        .select('DATE_FORMAT(order.createdAt, "%Y-%m")', 'month')
        .addSelect('SUM(orderItem.subtotal)', 'revenue')
        .addSelect('COUNT(*)', 'sales')
        .andWhere('order.createdAt >= :startDate', { startDate: new Date(new Date().getFullYear(), 0, 1) })
        .groupBy('month')
        .orderBy('month', 'ASC')
        .getRawMany()

      // Get top performing artworks
      const topArtworks = await artworkRepository
        .createQueryBuilder('artwork')
        .leftJoinAndSelect('artwork.category', 'category')
        .where('artwork.artistId = :artistId', { artistId })
        .andWhere('artwork.isActive = :isActive', { isActive: true })
        .orderBy('artwork.viewCount', 'DESC')
        .limit(5)
        .getMany()

      const dashboardData = {
        statistics: {
          totalArtworks,
          totalViews: totalViews?.total || 0,
          totalRevenue: salesData?.totalRevenue || 0,
          totalSales: salesData?.totalSales || 0
        },
        recentOrders,
        monthlySales,
        topArtworks
      }

      return sendSuccess(res, dashboardData, 'Artist dashboard data retrieved successfully')
    } catch (error) {
      console.error('Get artist dashboard error:', error)
      return sendError(res, 'Failed to get artist dashboard data', 500, error)
    }
  }

  getDashboardStats = async (req: Request, res: Response) => {
    try {
      const orderRepository = AppDataSource.getRepository(Order)
      const artworkRepository = AppDataSource.getRepository(Artwork)
      const userRepository = AppDataSource.getRepository(User)

      // Get current date and date ranges
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // Get order statistics
      const todayOrders = await orderRepository.count({ where: { createdAt: { $gte: today } } })
      const weekOrders = await orderRepository.count({ where: { createdAt: { $gte: thisWeek } } })
      const monthOrders = await orderRepository.count({ where: { createdAt: { $gte: thisMonth } } })

      // Get revenue statistics
      const todayRevenue = await orderRepository
        .createQueryBuilder('order')
        .where('order.createdAt >= :today', { today })
        .andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: 'paid' })
        .select('SUM(order.totalAmount)', 'total')
        .getRawOne()

      const weekRevenue = await orderRepository
        .createQueryBuilder('order')
        .where('order.createdAt >= :thisWeek', { thisWeek })
        .andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: 'paid' })
        .select('SUM(order.totalAmount)', 'total')
        .getRawOne()

      const monthRevenue = await orderRepository
        .createQueryBuilder('order')
        .where('order.createdAt >= :thisMonth', { thisMonth })
        .andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: 'paid' })
        .select('SUM(order.totalAmount)', 'total')
        .getRawOne()

      // Get user statistics
      const todayUsers = await userRepository.count({ where: { createdAt: { $gte: today } } })
      const weekUsers = await userRepository.count({ where: { createdAt: { $gte: thisWeek } } })
      const monthUsers = await userRepository.count({ where: { createdAt: { $gte: thisMonth } } })

      // Get artwork statistics
      const todayArtworks = await artworkRepository.count({ where: { createdAt: { $gte: today } } })
      const weekArtworks = await artworkRepository.count({ where: { createdAt: { $gte: thisWeek } } })
      const monthArtworks = await artworkRepository.count({ where: { createdAt: { $gte: thisMonth } } })

      const stats = {
        orders: {
          today: todayOrders,
          week: weekOrders,
          month: monthOrders
        },
        revenue: {
          today: todayRevenue?.total || 0,
          week: weekRevenue?.total || 0,
          month: monthRevenue?.total || 0
        },
        users: {
          today: todayUsers,
          week: weekUsers,
          month: monthUsers
        },
        artworks: {
          today: todayArtworks,
          week: weekArtworks,
          month: monthArtworks
        }
      }

      return sendSuccess(res, stats, 'Dashboard statistics retrieved successfully')
    } catch (error) {
      console.error('Get dashboard stats error:', error)
      return sendError(res, 'Failed to get dashboard statistics', 500, error)
    }
  }
}