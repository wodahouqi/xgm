import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './User'
import { Artwork } from './Artwork'

export enum ArtistStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

@Entity('artists')
export class Artist {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 100, nullable: false })
  name: string

  @Column({ type: 'text', nullable: true })
  bio: string

  @Column({ type: 'text', nullable: true })
  avatar: string

  @Column({ length: 255, nullable: true })
  studio: string

  @Column({ length: 255, nullable: true })
  location: string

  @Column({ type: 'text', nullable: true })
  specialties: string

  @Column({ type: 'int', default: 0 })
  yearsOfExperience: number

  @Column({ type: 'text', nullable: true })
  education: string

  @Column({ type: 'text', nullable: true })
  awards: string

  @Column({
    type: 'enum',
    enum: ArtistStatus,
    default: ArtistStatus.PENDING
  })
  status: ArtistStatus

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @Column({ type: 'int', default: 0 })
  totalArtworks: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSales: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relations
  @ManyToOne(() => User, user => user.artworks)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column({ nullable: true })
  userId: string

  @OneToMany(() => Artwork, artwork => artwork.artist)
  artworks: Artwork[]
}