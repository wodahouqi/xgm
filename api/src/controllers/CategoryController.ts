import { Request, Response } from 'express'
import { AppDataSource } from '../config/database'
import { Category } from '../entities/Category'
import { Artwork } from '../entities/Artwork'
import { sendSuccess, sendError, formatPagination } from '../utils'

export class CategoryController {
  getAllCategories = async (req: Request, res: Response) => {
    try {
      // Safe fallback when DB not initialized
      if (!AppDataSource.isInitialized) {
        const { limit = 20 } = req.query as any
        const count = Number(limit) || 20
        const base = [
          {
            id: 'cat-fallback-001',
            name: '绘画',
            slug: 'painting',
            description: '示例分类',
            imageUrl: 'https://picsum.photos/seed/cat-painting/600/400',
            sortOrder: 1,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            artworkCount: 3,
          },
          {
            id: 'cat-fallback-002',
            name: '雕塑',
            slug: 'sculpture',
            description: '示例分类',
            imageUrl: 'https://picsum.photos/seed/cat-sculpture/600/400',
            sortOrder: 2,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            artworkCount: 2,
          },
          {
            id: 'cat-fallback-003',
            name: '数字艺术',
            slug: 'digital',
            description: '示例分类',
            imageUrl: 'https://picsum.photos/seed/cat-digital/600/400',
            sortOrder: 3,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            artworkCount: 1,
          }
        ]
        const data = base.slice(0, Math.max(1, Math.min(count, base.length)))
        return sendSuccess(res, data, 'Categories (fallback, DB not initialized)')
      }
      const { page = 1, limit = 20 } = req.query

      // Robustly parse isActive from query string; default to true when absent
      const isActiveParam = (req.query as any).isActive

      const categoryRepository = AppDataSource.getRepository(Category)
      const queryBuilder = categoryRepository.createQueryBuilder('category')

      // Apply isActive filter only when provided, otherwise default to active categories
      // Express query params are strings; coerce correctly
      const applyIsActiveFilter = isActiveParam !== undefined
      const isActiveValue = applyIsActiveFilter
        ? String(isActiveParam).toLowerCase() === 'true'
        : true

      queryBuilder.where('category.isActive = :isActive', { isActive: isActiveValue })

      // Attach artworks count (only active artworks) to each category
      queryBuilder.loadRelationCountAndMap(
        'category.artworkCount',
        'category.artworks',
        'artwork',
        qb => qb.andWhere('artwork.isActive = :aActive', { aActive: true })
      )

      // Get total count
      const total = await queryBuilder.getCount()

      // Get paginated results
      const categories = await queryBuilder
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy('category.sortOrder', 'ASC')
        .addOrderBy('category.name', 'ASC')
        .getMany()

      return sendSuccess(res, categories, 'Categories retrieved successfully', formatPagination(Number(page), Number(limit), total))
    } catch (error) {
      console.error('Get all categories error:', error)
      // Graceful fallback: return empty list with pagination to keep homepage working
      return sendSuccess(res, [], 'Categories temporarily unavailable', formatPagination(1, Number((req.query as any)?.limit) || 20, 0))
    }
  }

  getCategoryById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const categoryRepository = AppDataSource.getRepository(Category)
      const category = await categoryRepository.findOne({ where: { id } })

      if (!category) {
        return sendError(res, 'Category not found', 404)
      }

      return sendSuccess(res, category, 'Category retrieved successfully')
    } catch (error) {
      console.error('Get category by ID error:', error)
      return sendError(res, 'Failed to get category', 500, error)
    }
  }

  getCategoryArtworks = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { page = 1, limit = 12 } = req.query

      const artworkRepository = AppDataSource.getRepository(Artwork)
      const queryBuilder = artworkRepository.createQueryBuilder('artwork')
        .leftJoinAndSelect('artwork.category', 'category')
        .leftJoinAndSelect('artwork.artist', 'artist')
        .where('artwork.categoryId = :categoryId', { categoryId: id })
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
      console.error('Get category artworks error:', error)
      return sendError(res, 'Failed to get category artworks', 500, error)
    }
  }

  createCategory = async (req: Request, res: Response) => {
    try {
      const { name, description, imageUrl, sortOrder = 0 } = req.body

      if (!name) {
        return sendError(res, 'Category name is required', 400)
      }

      const categoryRepository = AppDataSource.getRepository(Category)

      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

      // Check if category with same slug already exists
      const existingCategory = await categoryRepository.findOne({ where: { slug } })
      if (existingCategory) {
        return sendError(res, 'Category with this name already exists', 400)
      }

      const category = categoryRepository.create({
        name,
        slug,
        description,
        imageUrl,
        sortOrder
      })

      const savedCategory = await categoryRepository.save(category)

      return sendSuccess(res, savedCategory, 'Category created successfully')
    } catch (error) {
      console.error('Create category error:', error)
      return sendError(res, 'Failed to create category', 500, error)
    }
  }

  updateCategory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { name, description, imageUrl, sortOrder, isActive } = req.body

      const categoryRepository = AppDataSource.getRepository(Category)
      const category = await categoryRepository.findOne({ where: { id } })

      if (!category) {
        return sendError(res, 'Category not found', 404)
      }

      // Update category fields
      if (name) {
        category.name = name
        category.slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      }
      if (description !== undefined) category.description = description
      if (imageUrl !== undefined) category.imageUrl = imageUrl
      if (sortOrder !== undefined) category.sortOrder = sortOrder
      if (typeof isActive === 'boolean') category.isActive = isActive

      const updatedCategory = await categoryRepository.save(category)

      return sendSuccess(res, updatedCategory, 'Category updated successfully')
    } catch (error) {
      console.error('Update category error:', error)
      return sendError(res, 'Failed to update category', 500, error)
    }
  }

  deleteCategory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const categoryRepository = AppDataSource.getRepository(Category)
      const category = await categoryRepository.findOne({ where: { id } })

      if (!category) {
        return sendError(res, 'Category not found', 404)
      }

      // Check if category has artworks
      const artworkRepository = AppDataSource.getRepository(Artwork)
      const artworkCount = await artworkRepository.count({ where: { categoryId: id } })

      if (artworkCount > 0) {
        return sendError(res, 'Cannot delete category with existing artworks', 400)
      }

      await categoryRepository.remove(category)

      return sendSuccess(res, null, 'Category deleted successfully')
    } catch (error) {
      console.error('Delete category error:', error)
      return sendError(res, 'Failed to delete category', 500, error)
    }
  }
}