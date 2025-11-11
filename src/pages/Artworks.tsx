import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Search, ShoppingCart, Heart, Grid, List, Upload } from 'lucide-react'
import ImageUpload from '../components/ImageUpload'
import { useStore } from '@/stores'
import { cn, formatPrice } from '@/utils'
import type { Artwork } from '@/types'
import { api, mapArtwork } from '@/lib/api'
import ContactModal from '@/components/ContactModal'

export default function Artworks() {
  const { addToCart, setArtworks } = useStore()
  const [artworks, setLocalArtworks] = useState<Artwork[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'year' | 'name'>('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  // 获取所有分类
  const categories = useMemo(() => {
    const cats = new Set(artworks.map(artwork => artwork.category))
    return Array.from(cats)
  }, [artworks])

  // 触发后端查询
  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true)
      try {
        const sortMap = {
          'price-asc': { sortBy: 'price', sortOrder: 'ASC' as const },
          'price-desc': { sortBy: 'price', sortOrder: 'DESC' as const },
          'year': { sortBy: 'createdAt', sortOrder: 'DESC' as const },
          'name': { sortBy: 'title', sortOrder: 'ASC' as const },
        }[sortBy]

        const { data, pagination } = await api.artworks({
          page,
          limit,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          search: searchTerm || undefined,
          sortBy: sortMap.sortBy,
          sortOrder: sortMap.sortOrder,
        })

        const mapped = data.map(mapArtwork)
        // 客户端分类筛选（后端按分类ID筛选，这里用分类名称做简单筛选）
        const filtered = selectedCategory ? mapped.filter(a => a.category === selectedCategory) : mapped

        setLocalArtworks(filtered)
        setArtworks(mapped) // 同步到全局（用于其他页面可能复用）
        setTotal(pagination?.total || filtered.length)
      } catch (err) {
        console.error('加载艺术品失败:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchArtworks()
  }, [page, limit, priceRange, searchTerm, sortBy, selectedCategory, setArtworks])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">艺术品展示</h1>
          <p className="text-sm sm:text-base text-gray-600">发现独特的艺术作品，预订您喜爱的艺术品</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索艺术品或艺术家..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 sm:p-2 rounded-lg transition-colors',
                  viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 sm:p-2 rounded-lg transition-colors',
                  viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <List className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>筛选</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">全部分类</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  价格范围: ¥{priceRange[0]} - ¥{priceRange[1]}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="name">名称</option>
                  <option value="price-asc">价格从低到高</option>
                  <option value="price-desc">价格从高到低</option>
                  <option value="year">创作年份</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count & Pagination */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            共 {total} 件艺术品 · 第 {page} 页
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className={cn('px-3 py-1 border rounded-lg text-sm', page <= 1 || loading ? 'text-gray-400 border-gray-200' : 'text-gray-700 hover:bg-gray-50 border-gray-300')}
            >上一页</button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={loading || (page * limit >= total)}
              className={cn('px-3 py-1 border rounded-lg text-sm', (loading || (page * limit >= total)) ? 'text-gray-400 border-gray-200' : 'text-gray-700 hover:bg-gray-50 border-gray-300')}
            >下一页</button>
            <select
              value={limit}
              onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value)) }}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value={12}>每页 12</option>
              <option value={24}>每页 24</option>
              <option value={48}>每页 48</option>
            </select>
          </div>
        </div>

        {/* Artworks Grid/List */}
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
            : 'space-y-3 sm:space-y-4'
        )}>
          {artworks.map((artwork) => (
            viewMode === 'grid' ? (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ) : (
              <ArtworkListItem key={artwork.id} artwork={artwork} />
            )
          ))}
        </div>

        {artworks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">没有找到符合条件的艺术品</p>
            <p className="text-gray-400 mt-2">请尝试调整筛选条件</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const { addToCart } = useStore()
  const [showContactModal, setShowContactModal] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative aspect-square">
        <Link to={`/artworks/${artwork.id}`} className="block w-full h-full">
          <img
            src={artwork.images[0]}
            alt={artwork.title}
            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
          />
        </Link>
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={cn(
              'p-2 rounded-full bg-white shadow-md transition-colors',
              isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            )}
          >
            <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>
        {artwork.status === 'reserved' && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-500 text-white text-sm rounded-full">
            已预订
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{artwork.title}</h3>
        <p className="text-gray-600 mb-2">{artwork.artistName}</p>
        <p className="text-sm text-gray-500 mb-4">{artwork.category} · {artwork.year}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-purple-600">
            {formatPrice(artwork.price)}
          </span>
          <Link
            to={`/artworks/${artwork.id}`}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
          >
            查看详情
          </Link>
        </div>
      </div>
    </div>
  )
}

function ArtworkListItem({ artwork }: { artwork: Artwork }) {
  const { addToCart } = useStore()
  const [isLiked, setIsLiked] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="flex">
        <div className="relative w-48 h-48 flex-shrink-0">
          <Link to={`/artworks/${artwork.id}`} className="block w-full h-full">
            <img
              src={artwork.images[0]}
              alt={artwork.title}
              className="w-full h-full object-cover hover:opacity-95 transition-opacity"
            />
          </Link>
          {artwork.status === 'reserved' && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
              已预订
            </div>
          )}
        </div>
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{artwork.title}</h3>
              <p className="text-gray-600 mb-1">{artwork.artistName}</p>
              <p className="text-sm text-gray-500">{artwork.category} · {artwork.year}</p>
            </div>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={cn(
                'p-2 rounded-full transition-colors',
                isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              )}
            >
              <Heart className="h-5 w-5" fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-2">{artwork.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-purple-600">
              {formatPrice(artwork.price)}
            </span>
            <div className="flex space-x-2">
              <Link
                to={`/artworks/${artwork.id}`}
                className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                查看详情
              </Link>
              <Link
                to={`/artworks/${artwork.id}`}
                className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                查看详情
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}