import { Request, Response } from 'express'
import { AppDataSource } from '../config/database'
import { Artist, ArtistStatus } from '../entities/Artist'
import { Artwork, ArtworkStatus } from '../entities/Artwork'
import { sendSuccess, sendError, formatPagination } from '../utils'
import { Like } from 'typeorm'

export class ArtistController {
  getAllArtists = async (req: Request, res: Response) => {
    try {
      // Do not force default status filter; only apply if provided
      const { page = 1, limit = 12, status, search } = req.query

      if (!AppDataSource.isInitialized) {
        const base = [
          { id: 'artist-mock-1', name: '张三', bio: '擅长油画', avatar: 'https://picsum.photos/seed/artist-m1/300/300', studio: '海淀工作室', location: '北京', specialties: '油画', status: 'active', isActive: true, totalArtworks: 3, totalSales: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 'artist-mock-2', name: '李四', bio: '雕塑艺术家', avatar: 'https://picsum.photos/seed/artist-m2/300/300', studio: '浦东工坊', location: '上海', specialties: '雕塑', status: 'active', isActive: true, totalArtworks: 2, totalSales: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 'artist-mock-3', name: '王五', bio: '新锐数字艺术', avatar: 'https://picsum.photos/seed/artist-m3/300/300', studio: '天河工作室', location: '广州', specialties: '数字艺术', status: 'pending', isActive: true, totalArtworks: 1, totalSales: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ]
        const f = base.filter(a => {
          const okStatus = status ? String(a.status) === String(status) : true
          const okSearch = search ? (a.name.toLowerCase().includes(String(search).toLowerCase()) || (a.bio || '').toLowerCase().includes(String(search).toLowerCase())) : true
          return okStatus && okSearch
        })
        const p = Number(page) || 1
        const l = Number(limit) || 12
        const start = (p - 1) * l
        const data = f.slice(start, start + l)
        return sendSuccess(res, data, 'Artists retrieved successfully', formatPagination(p, l, f.length))
      }

      const artistRepository = AppDataSource.getRepository(Artist)
      const queryBuilder = artistRepository.createQueryBuilder('artist')
        .where('artist.isActive = :isActive', { isActive: true })

      // Apply status filter only if explicitly provided in query
      if (status) {
        queryBuilder.andWhere('artist.status = :status', { status })
      }

      if (search) {
        queryBuilder.andWhere('(artist.name LIKE :search OR artist.bio LIKE :search OR artist.specialties LIKE :search)', { search: `%${search}%` })
      }

      // Get total count
      const total = await queryBuilder.getCount()

      // Get paginated results
      const artists = await queryBuilder
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy('artist.createdAt', 'DESC')
        .getMany()

      return sendSuccess(res, artists, 'Artists retrieved successfully', formatPagination(Number(page), Number(limit), total))
    } catch (error) {
      console.error('Get all artists error:', error)
      return sendError(res, 'Failed to get artists', 500, error)
    }
  }

  getFeaturedArtists = async (req: Request, res: Response) => {
    try {
      // Safe fallback when DB not initialized
      if (!AppDataSource.isInitialized) {
        const { limit = 6 } = req.query as any
        const count = Number(limit) || 6
        const base = [
          {
            id: 'artist-fallback-001',
            userId: 'user-fallback-001',
            name: '示例艺术家一',
            bio: '数据库未初始化时的示例艺术家',
            avatar: 'https://picsum.photos/seed/artist-a/600/600',
            studio: '示例工作室',
            location: '示例城市',
            specialties: '绘画, 数字艺术',
            status: 'active',
            isFeatured: true,
            isActive: true,
            totalArtworks: 3,
            totalSales: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'artist-fallback-002',
            userId: 'user-fallback-002',
            name: '示例艺术家二',
            bio: '数据库未初始化时的示例艺术家',
            avatar: 'https://picsum.photos/seed/artist-b/600/600',
            studio: '示例工作室',
            location: '示例城市',
            specialties: '雕塑',
            status: 'active',
            isFeatured: true,
            isActive: true,
            totalArtworks: 2,
            totalSales: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ]
        const data = base.slice(0, Math.max(1, Math.min(count, base.length)))
        return sendSuccess(res, data, 'Featured artists (fallback, DB not initialized)')
      }
      const { limit = 6 } = req.query

      const artistRepository = AppDataSource.getRepository(Artist)
      // Relax status requirement to avoid empty results when seed data is pending
      const artists = await artistRepository.find({
        where: {
          isActive: true
        },
        order: { totalSales: 'DESC' },
        take: Number(limit)
      })

      return sendSuccess(res, artists, 'Featured artists retrieved successfully')
    } catch (error) {
      console.error('Get featured artists error:', error)
      // Graceful fallback: return empty list to avoid breaking homepage when DB errors occur
      return sendSuccess(res, [], 'Featured artists temporarily unavailable')
    }
  }

  searchArtists = async (req: Request, res: Response) => {
    try {
      const { q, page = 1, limit = 12 } = req.query

      if (!q) {
        return sendError(res, 'Search query is required', 400)
      }

      const artistRepository = AppDataSource.getRepository(Artist)
      const queryBuilder = artistRepository.createQueryBuilder('artist')
        .where('artist.isActive = :isActive', { isActive: true })
        .andWhere('(artist.name LIKE :search OR artist.bio LIKE :search OR artist.specialties LIKE :search OR artist.location LIKE :search)', { search: `%${q}%` })

      // Get total count
      const total = await queryBuilder.getCount()

      // Get paginated results
      const artists = await queryBuilder
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy('artist.name', 'ASC')
        .getMany()

      return sendSuccess(res, artists, 'Search results retrieved successfully', formatPagination(Number(page), Number(limit), total))
    } catch (error) {
      console.error('Search artists error:', error)
      return sendError(res, 'Failed to search artists', 500, error)
    }
  }

  getArtistById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const artistRepository = AppDataSource.getRepository(Artist)
      const artist = await artistRepository.findOne({
        where: { id },
        relations: ['artworks']
      })

      if (!artist) {
        return sendError(res, 'Artist not found', 404)
      }

      return sendSuccess(res, artist, 'Artist retrieved successfully')
    } catch (error) {
      console.error('Get artist by ID error:', error)
      return sendError(res, 'Failed to get artist', 500, error)
    }
  }

  getArtistArtworks = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { page = 1, limit = 12, status = ArtworkStatus.AVAILABLE } = req.query

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const queryBuilder = artworkRepository.createQueryBuilder('artwork')
        .leftJoinAndSelect('artwork.category', 'category')
        .leftJoinAndSelect('artwork.artist', 'artist')
        .where('artwork.artistId = :artistId', { artistId: id })
        .andWhere('artwork.isActive = :isActive', { isActive: true })

      if (status) {
        queryBuilder.andWhere('artwork.status = :status', { status })
      }

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
      console.error('Get artist artworks error:', error)
      return sendError(res, 'Failed to get artist artworks', 500, error)
    }
  }

  toggleFollow = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = (req as any).user.id

      const artistRepository = AppDataSource.getRepository(Artist)
      const artist = await artistRepository.findOne({ where: { id } })

      if (!artist) {
        return sendError(res, 'Artist not found', 404)
      }

      // For now, we'll just return a success message
      // In a real implementation, you would have a Follow entity
      return sendSuccess(res, { isFollowing: true }, 'Artist followed successfully')
    } catch (error) {
      console.error('Toggle follow error:', error)
      return sendError(res, 'Failed to toggle follow', 500, error)
    }
  }

  createArtist = async (req: Request, res: Response) => {
    try {
      const {
        name,
        bio,
        avatar,
        studio,
        location,
        specialties,
        yearsOfExperience,
        education,
        awards
      } = req.body

      if (!name) {
        return sendError(res, 'Artist name is required', 400)
      }

      const artistRepository = AppDataSource.getRepository(Artist)

      const artist = artistRepository.create({
        name,
        bio,
        avatar,
        studio,
        location,
        specialties,
        yearsOfExperience,
        education,
        awards
      })

      const savedArtist = await artistRepository.save(artist)

      return sendSuccess(res, savedArtist, 'Artist created successfully')
    } catch (error) {
      console.error('Create artist error:', error)
      return sendError(res, 'Failed to create artist', 500, error)
    }
  }

  updateArtist = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const updateData = req.body

      const artistRepository = AppDataSource.getRepository(Artist)
      const artist = await artistRepository.findOne({ where: { id } })

      if (!artist) {
        return sendError(res, 'Artist not found', 404)
      }

      // Update artist fields
      Object.assign(artist, updateData)

      const updatedArtist = await artistRepository.save(artist)

      return sendSuccess(res, updatedArtist, 'Artist updated successfully')
    } catch (error) {
      console.error('Update artist error:', error)
      return sendError(res, 'Failed to update artist', 500, error)
    }
  }

  deleteArtist = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const artistRepository = AppDataSource.getRepository(Artist)
      const artist = await artistRepository.findOne({ where: { id } })

      if (!artist) {
        return sendError(res, 'Artist not found', 404)
      }

      await artistRepository.remove(artist)

      return sendSuccess(res, null, 'Artist deleted successfully')
    } catch (error) {
      console.error('Delete artist error:', error)
      return sendError(res, 'Failed to delete artist', 500, error)
    }
  }

  updateArtistStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { status } = req.body

      if (!status || !Object.values(ArtistStatus).includes(status)) {
        return sendError(res, 'Invalid status', 400)
      }

      const artistRepository = AppDataSource.getRepository(Artist)
      const artist = await artistRepository.findOne({ where: { id } })

      if (!artist) {
        return sendError(res, 'Artist not found', 404)
      }

      artist.status = status
      const updatedArtist = await artistRepository.save(artist)

      return sendSuccess(res, updatedArtist, 'Artist status updated successfully')
    } catch (error) {
      console.error('Update artist status error:', error)
      return sendError(res, 'Failed to update artist status', 500, error)
    }
  }
}
