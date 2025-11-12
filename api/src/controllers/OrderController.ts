import { Request, Response } from 'express'
import { AppDataSource } from '../config/database'
import { Order, OrderStatus, PaymentStatus } from '../entities/Order'
import { OrderItem } from '../entities/OrderItem'
import { Artwork } from '../entities/Artwork'
import { User } from '../entities/User'
import { sendSuccess, sendError, formatPagination } from '../utils'
import { generateOrderNumber } from '../utils'

export class OrderController {
  getAllOrders = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20, status, userId } = req.query

      const orderRepository = AppDataSource.getRepository(Order)
      const queryBuilder = orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.items', 'items')
        .leftJoinAndSelect('items.artwork', 'artwork')

      if (status) {
        queryBuilder.where('order.status = :status', { status })
      }

      if (userId) {
        queryBuilder.andWhere('order.userId = :userId', { userId })
      }

      queryBuilder.orderBy('order.createdAt', 'DESC')

      // Get total count
      const total = await queryBuilder.getCount()

      // Get paginated results
      const orders = await queryBuilder
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .getMany()

      return sendSuccess(res, orders, 'Orders retrieved successfully', formatPagination(Number(page), Number(limit), total))
    } catch (error) {
      console.error('Get all orders error:', error)
      return sendError(res, 'Failed to get orders', 500, error)
    }
  }

  getUserOrders = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10 } = req.query
      const userId = (req as any).user?.id

      if (!userId) {
        return sendError(res, 'User not authenticated', 401)
      }

      const orderRepository = AppDataSource.getRepository(Order)
      const queryBuilder = orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'items')
        .leftJoinAndSelect('items.artwork', 'artwork')
        .where('order.userId = :userId', { userId })
        .orderBy('order.createdAt', 'DESC')

      // Get total count
      const total = await queryBuilder.getCount()

      // Get paginated results
      const orders = await queryBuilder
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .getMany()

      return sendSuccess(res, orders, 'User orders retrieved successfully', formatPagination(Number(page), Number(limit), total))
    } catch (error) {
      console.error('Get user orders error:', error)
      return sendError(res, 'Failed to get user orders', 500, error)
    }
  }

  getOrderById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = (req as any).user?.id

      if (!userId) {
        return sendError(res, 'User not authenticated', 401)
      }

      const orderRepository = AppDataSource.getRepository(Order)
      const order = await orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.items', 'items')
        .leftJoinAndSelect('items.artwork', 'artwork')
        .where('order.id = :id', { id })
        .getOne()

      if (!order) {
        return sendError(res, 'Order not found', 404)
      }

      // Check if user owns the order or is admin
      if (order.userId !== userId && (req as any).user?.role !== 'admin') {
        return sendError(res, 'Access denied', 403)
      }

      return sendSuccess(res, order, 'Order retrieved successfully')
    } catch (error) {
      console.error('Get order by ID error:', error)
      return sendError(res, 'Failed to get order', 500, error)
    }
  }

  createOrder = async (req: Request, res: Response) => {
    try {
      const { items, notes } = req.body
      const userId = (req as any).user?.id

      if (!userId) {
        return sendError(res, 'User not authenticated', 401)
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return sendError(res, 'Order items are required', 400)
      }

      // Validate items
      const artworkRepository = AppDataSource.getRepository(Artwork)
      let totalAmount = 0
      const orderItems = []

      for (const item of items) {
        const { artworkId, quantity = 1 } = item

        if (!artworkId) {
          return sendError(res, 'Artwork ID is required for each item', 400)
        }

        const artwork = await artworkRepository.findOne({ where: { id: artworkId, isActive: true } })
        if (!artwork) {
          return sendError(res, `Artwork with ID ${artworkId} not found or inactive`, 404)
        }

        const subtotal = artwork.price * quantity
        totalAmount += subtotal

        orderItems.push({
          artworkId,
          price: artwork.price,
          quantity,
          subtotal
        })
      }

      // Create order
      const orderRepository = AppDataSource.getRepository(Order)
      const orderItemRepository = AppDataSource.getRepository(OrderItem)

      const order = orderRepository.create({
        userId,
        orderNumber: generateOrderNumber(),
        totalAmount,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        finalAmount: totalAmount,
        notes,
      })

      const savedOrder: Order = await orderRepository.save(order)

      // Create order items
      for (const itemData of orderItems) {
        const orderItem = orderItemRepository.create({
          orderId: savedOrder.id,
          artworkId: itemData.artworkId,
          price: itemData.price,
          quantity: itemData.quantity,
          subtotal: itemData.subtotal
        })
        await orderItemRepository.save(orderItem)
      }

      // Get complete order with items
      const completeOrder = await orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'items')
        .leftJoinAndSelect('items.artwork', 'artwork')
        .where('order.id = :id', { id: savedOrder.id })
        .getOne()

      return sendSuccess(res, completeOrder, 'Order created successfully')
    } catch (error) {
      console.error('Create order error:', error)
      return sendError(res, 'Failed to create order', 500, error)
    }
  }

  updateOrderStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { status } = req.body

      if (!status) {
        return sendError(res, 'Status is required', 400)
      }

      const validStatuses: OrderStatus[] = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
      ]
      if (!validStatuses.includes(status as OrderStatus)) {
        return sendError(res, 'Invalid status', 400)
      }

      const orderRepository = AppDataSource.getRepository(Order)
      const order = await orderRepository.findOne({ where: { id } })

      if (!order) {
        return sendError(res, 'Order not found', 404)
      }

      order.status = status as OrderStatus
      order.updatedAt = new Date()

      const updatedOrder = await orderRepository.save(order)

      return sendSuccess(res, updatedOrder, 'Order status updated successfully')
    } catch (error) {
      console.error('Update order status error:', error)
      return sendError(res, 'Failed to update order status', 500, error)
    }
  }

  updatePaymentStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { paymentStatus, paymentMethod, transactionId } = req.body

      if (!paymentStatus) {
        return sendError(res, 'Payment status is required', 400)
      }

      const validPaymentStatuses: PaymentStatus[] = [
        PaymentStatus.PENDING,
        PaymentStatus.PAID,
        PaymentStatus.FAILED,
        PaymentStatus.REFUNDED,
      ]
      if (!validPaymentStatuses.includes(paymentStatus as PaymentStatus)) {
        return sendError(res, 'Invalid payment status', 400)
      }

      const orderRepository = AppDataSource.getRepository(Order)
      const order = await orderRepository.findOne({ where: { id } })

      if (!order) {
        return sendError(res, 'Order not found', 404)
      }

      order.paymentStatus = paymentStatus as PaymentStatus
      if (paymentMethod) order.paymentMethod = paymentMethod
      if (transactionId) order.paymentId = transactionId
      order.updatedAt = new Date()

      const updatedOrder = await orderRepository.save(order)

      return sendSuccess(res, updatedOrder, 'Payment status updated successfully')
    } catch (error) {
      console.error('Update payment status error:', error)
      return sendError(res, 'Failed to update payment status', 500, error)
    }
  }

  cancelOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = (req as any).user?.id

      if (!userId) {
        return sendError(res, 'User not authenticated', 401)
      }

      const orderRepository = AppDataSource.getRepository(Order)
      const order = await orderRepository.findOne({ where: { id } })

      if (!order) {
        return sendError(res, 'Order not found', 404)
      }

      // Check if user owns the order or is admin
      if (order.userId !== userId && (req as any).user?.role !== 'admin') {
        return sendError(res, 'Access denied', 403)
      }

      // Check if order can be cancelled
      if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
        return sendError(res, 'Order cannot be cancelled at this stage', 400)
      }

      order.status = OrderStatus.CANCELLED
      order.updatedAt = new Date()

      const updatedOrder = await orderRepository.save(order)

      return sendSuccess(res, updatedOrder, 'Order cancelled successfully')
    } catch (error) {
      console.error('Cancel order error:', error)
      return sendError(res, 'Failed to cancel order', 500, error)
    }
  }
}
