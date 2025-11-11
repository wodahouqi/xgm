import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './User'
import { Artwork } from './Artwork'

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'int', nullable: false })
  rating: number

  @Column({ type: 'text', nullable: true })
  comment: string

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relations
  @ManyToOne(() => User, user => user.reviews)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column({ nullable: false })
  userId: string

  @ManyToOne(() => Artwork, artwork => artwork.reviews)
  @JoinColumn({ name: 'artworkId' })
  artwork: Artwork

  @Column({ nullable: false })
  artworkId: string
}