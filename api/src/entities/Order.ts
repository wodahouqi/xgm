import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { User } from './User'
import { OrderItem } from './OrderItem'

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 50, unique: true, nullable: false })
  orderNumber: string

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalAmount: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingAmount: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  finalAmount: number

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  paymentStatus: PaymentStatus

  @Column({ length: 50, nullable: true })
  paymentMethod: string

  @Column({ length: 100, nullable: true })
  paymentId: string

  @Column({ type: 'text', nullable: true })
  shippingAddress: string

  @Column({ type: 'text', nullable: true })
  billingAddress: string

  @Column({ length: 100, nullable: true })
  shippingName: string

  @Column({ length: 20, nullable: true })
  shippingPhone: string

  @Column({ type: 'text', nullable: true })
  notes: string

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date

  @Column({ type: 'datetime', nullable: true })
  shippedAt: Date

  @Column({ type: 'datetime', nullable: true })
  deliveredAt: Date

  @Column({ type: 'datetime', nullable: true })
  cancelledAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relations
  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column({ nullable: false })
  userId: string

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  orderItems: OrderItem[]
}