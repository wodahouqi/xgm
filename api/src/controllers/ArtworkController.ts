import { Request, Response } from 'express'
import { AppDataSource } from '../config/database'
import { Artwork, ArtworkStatus, ArtworkType } from '../entities/Artwork'
import { Category } from '../entities/Category'
import { Artist } from '../entities/Artist'
import { Favorite } from '../entities/Favorite'
import { Review } from '../entities/Review'
import { User } from '../entities/User'
import { sendSuccess, sendError, formatPagination } from '../utils'
import { In, Like, MoreThan, LessThan, Between } from 'typeorm'

export class ArtworkController {
  getAllArtworks = async (req: Request, res: Response) => {
    try {
      const { 
        page = 1, 
        limit = 12, 
        category, 
        artist, 
        status = ArtworkStatus.AVAILABLE,
        type,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        search 
      } = req.query

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const queryBuilder = artworkRepository.createQueryBuilder('artwork')
        .leftJoinAndSelect('artwork.category', 'category')
        .leftJoinAndSelect('artwork.artist', 'artist')
        .where('artwork.isActive = :isActive', { isActive: true })

      // Apply filters
      if (status) {
        queryBuilder.andWhere('artwork.status = :status', { status })
      }

      if (category) {
        queryBuilder.andWhere('category.id = :categoryId', { categoryId: category })
      }

      if (artist) {
        queryBuilder.andWhere('artist.id = :artistId', { artistId: artist })
      }

      if (type) {
        queryBuilder.andWhere('artwork.type = :type', { type })
      }

      if (minPrice && maxPrice) {
        queryBuilder.andWhere('artwork.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice })
      } else if (minPrice) {
        queryBuilder.andWhere('artwork.price >= :minPrice', { minPrice })
      } else if (maxPrice) {
        queryBuilder.andWhere('artwork.price <= :maxPrice', { maxPrice })
      }

      if (search) {
        queryBuilder.andWhere('(artwork.title LIKE :search OR artwork.description LIKE :search)', { search: `%${search}%` })
      }

      // Apply sorting
      const validSortFields = ['title', 'price', 'createdAt', 'viewCount', 'rating']
      const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'createdAt'
      const sortDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC'
      queryBuilder.orderBy(`artwork.${sortField}`, sortDirection)

      // Get total count
      const total = await queryBuilder.getCount()

      // Get paginated results
      const artworks = await queryBuilder
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .getMany()

      return sendSuccess(res, artworks, 'Artworks retrieved successfully', formatPagination(Number(page), Number(limit), total))
    } catch (error) {
      console.error('Get all artworks error:', error)
      return sendError(res, 'Failed to get artworks', 500, error)
    }
  }

  getFeaturedArtworks = async (req: Request, res: Response) => {
    try {
      // Safe fallback when database is not initialized
      if (!AppDataSource.isInitialized) {
        const { limit = 8 } = req.query as any
        const count = Number(limit) || 8
        const base = [
          {
            id: 'art-fallback-001',
            title: '示例艺术品 A',
            description: '数据库未初始化时的示例数据',
            imageUrl: 'https://picsum.photos/seed/art-a/800/800',
            additionalImages: JSON.stringify([
              'https://picsum.photos/seed/art-a2/800/800',
              'https://picsum.photos/seed/art-a3/800/800'
            ]),
            type: 'painting',
            price: 1999,
            stock: 1,
            width: 60,
            height: 80,
            depth: 2,
            unit: 'cm',
            materials: '油画布',
            year: new Date().getFullYear(),
            status: ArtworkStatus.AVAILABLE,
            isActive: true,
            isFeatured: true,
            viewCount: 0,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            category: { id: 'cat-fallback', name: '示例分类' },
            artist: { id: 'artist-fallback', name: '示例艺术家' }
          },
          {
            id: 'art-fallback-002',
            title: '示例艺术品 B',
            description: '数据库未初始化时的示例数据',
            imageUrl: 'https://picsum.photos/seed/art-b/800/800',
            additionalImages: JSON.stringify([
              'https://picsum.photos/seed/art-b2/800/800'
            ]),
            type: 'sculpture',
            price: 2999,
            stock: 1,
            width: 30,
            height: 50,
            depth: 30,
            unit: 'cm',
            materials: '石膏',
            year: new Date().getFullYear(),
            status: ArtworkStatus.AVAILABLE,
            isActive: true,
            isFeatured: true,
            viewCount: 0,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            category: { id: 'cat-fallback', name: '示例分类' },
            artist: { id: 'artist-fallback', name: '示例艺术家' }
          },
          {
            id: 'art-fallback-003',
            title: '示例艺术品 C',
            description: '数据库未初始化时的示例数据',
            imageUrl: 'https://picsum.photos/seed/art-c/800/800',
            additionalImages: JSON.stringify([]),
            type: 'digital',
            price: 999,
            stock: 1,
            width: 1920,
            height: 1080,
            unit: 'px',
            materials: '数字艺术',
            year: new Date().getFullYear(),
            status: ArtworkStatus.AVAILABLE,
            isActive: true,
            isFeatured: true,
            viewCount: 0,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            category: { id: 'cat-fallback', name: '示例分类' },
            artist: { id: 'artist-fallback', name: '示例艺术家' }
          }
        ]
        const data = base.slice(0, Math.max(1, Math.min(count, base.length)))
        return sendSuccess(res, data, 'Featured artworks (fallback, DB not initialized)')
      }
      const { limit = 8 } = req.query

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const artworks = await artworkRepository.find({
        where: {
          isActive: true,
          isFeatured: true,
          status: ArtworkStatus.AVAILABLE
        },
        relations: ['category', 'artist'],
        order: { createdAt: 'DESC' },
        take: Number(limit)
      })

      return sendSuccess(res, artworks, 'Featured artworks retrieved successfully')
    } catch (error) {
      console.error('Get featured artworks error:', error)
      // Graceful fallback: return empty list instead of 500 to avoid breaking homepage
      return sendSuccess(res, [], 'Featured artworks temporarily unavailable')
    }
  }

  searchArtworks = async (req: Request, res: Response) => {
    try {
      const { q, page = 1, limit = 12 } = req.query

      if (!q) {
        return sendError(res, 'Search query is required', 400)
      }

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const queryBuilder = artworkRepository.createQueryBuilder('artwork')
        .leftJoinAndSelect('artwork.category', 'category')
        .leftJoinAndSelect('artwork.artist', 'artist')
        .where('artwork.isActive = :isActive', { isActive: true })
        .andWhere('(artwork.title LIKE :search OR artwork.description LIKE :search OR artist.name LIKE :search)', { search: `%${q}%` })

      // Get total count
      const total = await queryBuilder.getCount()

      // Get paginated results
      const artworks = await queryBuilder
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy('artwork.createdAt', 'DESC')
        .getMany()

      return sendSuccess(res, artworks, 'Search results retrieved successfully', formatPagination(Number(page), Number(limit), total))
    } catch (error) {
      console.error('Search artworks error:', error)
      return sendError(res, 'Failed to search artworks', 500, error)
    }
  }

  getArtworksByCategory = async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params
      const { page = 1, limit = 12 } = req.query

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const queryBuilder = artworkRepository.createQueryBuilder('artwork')
        .leftJoinAndSelect('artwork.category', 'category')
        .leftJoinAndSelect('artwork.artist', 'artist')
        .where('artwork.categoryId = :categoryId', { categoryId })
        .andWhere('artwork.isActive = :isActive', { isActive: true })

      // Get total count
      const total = await queryBuilder.getCount()

      // Get paginated results
      const artworks = await queryBuilder
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy('artwork.createdAt', 'DESC')
        .getMany()

      return sendSuccess(res, artworks, 'Category artworks retrieved successfully', formatPagination(Number(page), Number(limit), total))
    } catch (error) {
      console.error('Get artworks by category error:', error)
      return sendError(res, 'Failed to get category artworks', 500, error)
    }
  }

  getArtworksByArtist = async (req: Request, res: Response) => {
    try {
      const { artistId } = req.params
      const { page = 1, limit = 12 } = req.query

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const queryBuilder = artworkRepository.createQueryBuilder('artwork')
        .leftJoinAndSelect('artwork.category', 'category')
        .leftJoinAndSelect('artwork.artist', 'artist')
        .where('artwork.artistId = :artistId', { artistId })
        .andWhere('artwork.isActive = :isActive', { isActive: true })

      // Get total count
      const total = await queryBuilder.getCount()

      // Get paginated results
      const artworks = await queryBuilder
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy('artwork.createdAt', 'DESC')
        .getMany()

      return sendSuccess(res, artworks, 'Artist artworks retrieved successfully', formatPagination(Number(page), Number(limit), total))
    } catch (error) {
      console.error('Get artworks by artist error:', error)
      return sendError(res, 'Failed to get artist artworks', 500, error)
    }
  }

  getArtworkById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = (req as any).user?.id

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const artwork = await artworkRepository.findOne({
        where: { id },
        relations: ['category', 'artist', 'reviews', 'reviews.user']
      })

      if (!artwork) {
        return sendError(res, 'Artwork not found', 404)
      }

      // Increment view count
      artwork.viewCount += 1
      await artworkRepository.save(artwork)

      // Check if user has favorited this artwork
      let isFavorited = false
      if (userId) {
        const favoriteRepository = AppDataSource.getRepository(Favorite)
        const favorite = await favoriteRepository.findOne({
          where: { userId, artworkId: id }
        })
        isFavorited = !!favorite
      }

      const artworkResponse = {
        ...artwork,
        isFavorited
      }

      return sendSuccess(res, artworkResponse, 'Artwork retrieved successfully')
    } catch (error) {
      console.error('Get artwork by ID error:', error)
      return sendError(res, 'Failed to get artwork', 500, error)
    }
  }

  createArtwork = async (req: Request, res: Response) => {
    try {
      const {
        title,
        description,
        imageUrl,
        additionalImages,
        type,
        price,
        stock,
        width,
        height,
        depth,
        unit,
        materials,
        year,
        categoryId,
        artistId
      } = req.body

      // Validate required fields
      if (!title || !imageUrl || !price || !stock) {
        return sendError(res, 'Missing required fields: title, imageUrl, price, stock', 400)
      }

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const categoryRepository = AppDataSource.getRepository(Category)
      const artistRepository = AppDataSource.getRepository(Artist)

      // Normalize ids: treat empty string as null to avoid FK errors
      const normalizedCategoryId = categoryId ? String(categoryId) : null
      const normalizedArtistId = artistId ? String(artistId) : null

      // Validate category
      if (normalizedCategoryId) {
        const category = await categoryRepository.findOne({ where: { id: categoryId } })
        if (!category) {
          return sendError(res, 'Category not found', 404)
        }
      }

      // Validate artist
      if (normalizedArtistId) {
        const artist = await artistRepository.findOne({ where: { id: artistId } })
        if (!artist) {
          return sendError(res, 'Artist not found', 404)
        }
      }

      // Create artwork
      const artworkData: Partial<Artwork> = {
        title: String(title),
        description: description ? String(description) : null as any,
        imageUrl: String(imageUrl),
        additionalImages: Array.isArray(additionalImages) ? JSON.stringify(additionalImages) : (additionalImages ?? ''),
        type: (Object.values(ArtworkType) as string[]).includes(String(type)) ? (String(type) as ArtworkType) : ArtworkType.PAINTING,
        price: Number(price),
        stock: Number(stock),
        width: width !== undefined ? Number(width) as any : undefined,
        height: height !== undefined ? Number(height) as any : undefined,
        depth: depth !== undefined ? Number(depth) as any : undefined,
        unit: unit ? String(unit) : undefined,
        materials: materials ? String(materials) : undefined,
        year: year !== undefined ? Number(year) : undefined,
        categoryId: normalizedCategoryId || null,
        artistId: normalizedArtistId || null,
        isActive: true,
        status: ArtworkStatus.AVAILABLE,
      }

      const artwork = artworkRepository.create(artworkData)

      const savedArtwork = await artworkRepository.save(artwork)

      // Update artist artwork count
      if (normalizedArtistId) {
        const artist = await artistRepository.findOne({ where: { id: normalizedArtistId } })
        if (artist) {
          artist.totalArtworks += 1
          await artistRepository.save(artist)
        }
      }

      return sendSuccess(res, savedArtwork, 'Artwork created successfully')
    } catch (error) {
      console.error('Create artwork error:', error)
      return sendError(res, 'Failed to create artwork', 500, error)
    }
  }

  updateArtwork = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const updateData = req.body

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const artwork = await artworkRepository.findOne({ where: { id } })

      if (!artwork) {
        return sendError(res, 'Artwork not found', 404)
      }

      // Update artwork fields
      Object.assign(artwork, updateData)

      const updatedArtwork = await artworkRepository.save(artwork)

      return sendSuccess(res, updatedArtwork, 'Artwork updated successfully')
    } catch (error) {
      console.error('Update artwork error:', error)
      return sendError(res, 'Failed to update artwork', 500, error)
    }
  }

  deleteArtwork = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const artwork = await artworkRepository.findOne({ where: { id } })

      if (!artwork) {
        return sendError(res, 'Artwork not found', 404)
      }

      await artworkRepository.remove(artwork)

      return sendSuccess(res, null, 'Artwork deleted successfully')
    } catch (error) {
      console.error('Delete artwork error:', error)
      return sendError(res, 'Failed to delete artwork', 500, error)
    }
  }

  updateArtworkStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { status } = req.body

      if (!status || !Object.values(ArtworkStatus).includes(status)) {
        return sendError(res, 'Invalid status', 400)
      }

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const artwork = await artworkRepository.findOne({ where: { id } })

      if (!artwork) {
        return sendError(res, 'Artwork not found', 404)
      }

      artwork.status = status
      const updatedArtwork = await artworkRepository.save(artwork)

      return sendSuccess(res, updatedArtwork, 'Artwork status updated successfully')
    } catch (error) {
      console.error('Update artwork status error:', error)
      return sendError(res, 'Failed to update artwork status', 500, error)
    }
  }

  toggleFavorite = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const favoriteRepository = AppDataSource.getRepository(Favorite)

      // Check if artwork exists
      const artwork = await artworkRepository.findOne({ where: { id } })
      if (!artwork) {
        return sendError(res, 'Artwork not found', 404)
      }

      // Check if already favorited
      const existingFavorite = await favoriteRepository.findOne({
        where: { userId, artworkId: id }
      })

      if (existingFavorite) {
        // Remove favorite
        await favoriteRepository.remove(existingFavorite)
        return sendSuccess(res, { isFavorited: false }, 'Artwork removed from favorites')
      } else {
        // Add favorite
        const favorite = favoriteRepository.create({
          userId,
          artworkId: id
        })
        await favoriteRepository.save(favorite)
        return sendSuccess(res, { isFavorited: true }, 'Artwork added to favorites')
      }
    } catch (error) {
      console.error('Toggle favorite error:', error)
      return sendError(res, 'Failed to toggle favorite', 500, error)
    }
  }

  getArtworkReviews = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { page = 1, limit = 10 } = req.query

      const reviewRepository = AppDataSource.getRepository(Review)
      const queryBuilder = reviewRepository.createQueryBuilder('review')
        .leftJoinAndSelect('review.user', 'user')
        .where('review.artworkId = :artworkId', { artworkId: id })
        .andWhere('review.isActive = :isActive', { isActive: true })

      // Get total count
      const total = await queryBuilder.getCount()

      // Get paginated results
      const reviews = await queryBuilder
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy('review.createdAt', 'DESC')
        .getMany()

      return sendSuccess(res, reviews, 'Artwork reviews retrieved successfully', formatPagination(Number(page), Number(limit), total))
    } catch (error) {
      console.error('Get artwork reviews error:', error)
      return sendError(res, 'Failed to get artwork reviews', 500, error)
    }
  }

  createReview = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = (req as any).user.id
      const { rating, comment } = req.body

      if (!rating || rating < 1 || rating > 5) {
        return sendError(res, 'Rating must be between 1 and 5', 400)
      }

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const reviewRepository = AppDataSource.getRepository(Review)

      // Check if artwork exists
      const artwork = await artworkRepository.findOne({ where: { id } })
      if (!artwork) {
        return sendError(res, 'Artwork not found', 404)
      }

      // Check if user already reviewed this artwork
      const existingReview = await reviewRepository.findOne({
        where: { userId, artworkId: id }
      })

      if (existingReview) {
        return sendError(res, 'You have already reviewed this artwork', 400)
      }

      // Create review
      const review = reviewRepository.create({
        rating,
        comment,
        userId,
        artworkId: id
      })

      const savedReview = await reviewRepository.save(review)

      // Update artwork rating
      const allReviews = await reviewRepository.find({
        where: { artworkId: id, isActive: true }
      })

      const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
      artwork.rating = Math.round(averageRating * 100) / 100
      artwork.reviewCount = allReviews.length
      await artworkRepository.save(artwork)

      return sendSuccess(res, savedReview, 'Review created successfully')
    } catch (error) {
      console.error('Create review error:', error)
      return sendError(res, 'Failed to create review', 500, error)
    }
  }
}
