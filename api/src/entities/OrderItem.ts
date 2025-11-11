import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Order } from './Order'
import { Artwork } from './Artwork'

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number

  @Column({ type: 'int', nullable: false })
  quantity: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  subtotal: number

  @Column({ type: 'text', nullable: true })
  notes: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relations
  @ManyToOne(() => Order, order => order.orderItems)
  @JoinColumn({ name: 'orderId' })
  order: Order

  @Column({ nullable: false })
  orderId: string

  @ManyToOne(() => Artwork, artwork => artwork.orderItems)
  @JoinColumn({ name: 'artworkId' })
  artwork: Artwork

  @Column({ nullable: false })
  artworkId: string
}