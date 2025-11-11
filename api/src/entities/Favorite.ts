import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm'
import { User } from './User'
import { Artwork } from './Artwork'

@Entity('favorites')
@Unique(['userId', 'artworkId'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relations
  @ManyToOne(() => User, user => user.favorites)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column({ nullable: false })
  userId: string

  @ManyToOne(() => Artwork, artwork => artwork.favorites)
  @JoinColumn({ name: 'artworkId' })
  artwork: Artwork

  @Column({ nullable: false })
  artworkId: string
}