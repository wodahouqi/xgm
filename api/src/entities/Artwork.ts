import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Category } from './Category'
import { Artist } from './Artist'
import { OrderItem } from './OrderItem'
import { Favorite } from './Favorite'
import { Review } from './Review'

export enum ArtworkStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  RESERVED = 'reserved',
  HIDDEN = 'hidden'
}

export enum ArtworkType {
  PAINTING = 'painting',
  SCULPTURE = 'sculpture',
  PHOTOGRAPHY = 'photography',
  DIGITAL = 'digital',
  MIXED_MEDIA = 'mixed_media',
  CERAMICS = 'ceramics',
  PRINT = 'print'
}

@Entity('artworks')
export class Artwork {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 200, nullable: false })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'text', nullable: false })
  imageUrl: string

  @Column({ type: 'text', nullable: true })
  additionalImages: string

  @Column({
    type: 'enum',
    enum: ArtworkType,
    default: ArtworkType.PAINTING
  })
  type: ArtworkType

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number

  @Column({ type: 'int', nullable: false })
  stock: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  width: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  height: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  depth: number

  @Column({ length: 20, nullable: true })
  unit: string

  @Column({ length: 100, nullable: true })
  materials: string

  @Column({ type: 'int', nullable: true })
  year: number

  @Column({
    type: 'enum',
    enum: ArtworkStatus,
    default: ArtworkStatus.AVAILABLE
  })
  status: ArtworkStatus

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean

  @Column({ type: 'int', default: 0 })
  viewCount: number

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number

  @Column({ type: 'int', default: 0 })
  reviewCount: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relations
  @ManyToOne(() => Category, category => category.artworks)
  @JoinColumn({ name: 'categoryId' })
  category: Category

  @Column({ nullable: true })
  categoryId: string | null

  @ManyToOne(() => Artist, artist => artist.artworks)
  @JoinColumn({ name: 'artistId' })
  artist: Artist

  @Column({ nullable: true })
  artistId: string | null

  @OneToMany(() => OrderItem, orderItem => orderItem.artwork)
  orderItems: OrderItem[]

  @OneToMany(() => Favorite, favorite => favorite.artwork)
  favorites: Favorite[]

  @OneToMany(() => Review, review => review.artwork)
  reviews: Review[]
}
