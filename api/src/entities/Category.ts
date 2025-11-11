import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { Artwork } from './Artwork'

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 100, nullable: false, unique: true })
  name: string

  @Column({ length: 100, nullable: false, unique: true })
  slug: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'text', nullable: true })
  imageUrl: string

  @Column({ type: 'int', default: 0 })
  sortOrder: number

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relations
  @OneToMany(() => Artwork, artwork => artwork.category)
  artworks: Artwork[]
}