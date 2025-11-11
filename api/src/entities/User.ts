import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm'
import { Artwork } from './Artwork'
import { Order } from './Order'
import { Favorite } from './Favorite'
import { Review } from './Review'

export enum UserRole {
  COLLECTOR = 'collector',
  ARTIST = 'artist',
  GALLERY = 'gallery',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 100, nullable: false })
  name: string

  @Column({ length: 100, unique: true, nullable: false })
  email: string

  @Column({ length: 255, nullable: false })
  password: string

  @Column({ length: 20, nullable: true })
  phone: string

  @Column({ length: 255, nullable: true })
  location: string

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.COLLECTOR
  })
  role: UserRole

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status: UserStatus

  @Column({ type: 'text', nullable: true })
  avatar: string

  @Column({ type: 'text', nullable: true })
  bio: string

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relations
  @OneToMany(() => Artwork, artwork => artwork.artist)
  artworks: Artwork[]

  @OneToMany(() => Order, order => order.user)
  orders: Order[]

  @OneToMany(() => Favorite, favorite => favorite.user)
  favorites: Favorite[]

  @OneToMany(() => Review, review => review.user)
  reviews: Review[]
}