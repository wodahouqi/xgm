import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Star, Heart, ShoppingCart } from 'lucide-react'
import { useStore } from '@/stores'
import { cn, formatPrice } from '@/utils'
import type { Artwork, Artist, Category } from '@/types'
import { api, mapArtwork, mapArtist, mapCategory } from '@/lib/api'
// 主页不提供预订弹窗，预订仅在详情页

export default function Home() {
  const { featuredArtworks, addToCart, setFeaturedArtworks } = useStore()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [artists, setArtists] = useState<Artist[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // 轮播图数据
  const bannerArtworks = featuredArtworks.slice(0, 3)

  useEffect(() => {
    // Load featured artworks, artists, categories from API
    ;(async () => {
      try {
        const [fa, ar, cat] = await Promise.all([
          api.featuredArtworks(6),
          api.featuredArtists(6),
          api.categories(8)
        ])
        setFeaturedArtworks(fa.map(mapArtwork))
        setArtists(ar.map(mapArtist))
        setCategories(cat.map(mapCategory))
      } catch (e) {
        console.error('Failed to load home data', e)
      }
    })()
  }, [])

  useEffect(() => {
    if (bannerArtworks.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % bannerArtworks.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [bannerArtworks.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerArtworks.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerArtworks.length) % bannerArtworks.length)
  }
  // 注意：已移除重复的 useEffect，避免重复请求导致限流 429

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-red-600 to-red-800 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              发现独特的艺术品
            </h1>
            <p className="text-lg sm:text-xl text-red-100 mb-6 sm:mb-8">
              预订您喜爱的艺术品，支持原创艺术家
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                to="/artworks"
                className="bg-white text-red-600 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors text-center"
              >
                浏览艺术品
              </Link>
              <Link
                to="/artists"
                className="border-2 border-white text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors text-center"
              >
                发现艺术家
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">精选艺术品</h2>
            <p className="text-base sm:text-lg text-gray-600">发现最受欢迎的艺术作品</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {featuredArtworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
          <div className="text-center mt-8 sm:mt-12">
            <Link
              to="/artworks"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              查看更多艺术品
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">推荐艺术家</h2>
            <p className="text-lg text-gray-600">认识才华横溢的艺术家们</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">艺术品分类</h2>
            <p className="text-lg text-gray-600">探索不同类型的艺术作品</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const { addToCart } = useStore()
  const navigate = useNavigate()
  const [isLiked, setIsLiked] = useState(false)

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/artworks/${artwork.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/artworks/${artwork.id}`)
        }
      }}
    >
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
            onClick={(e) => {
              e.stopPropagation()
              setIsLiked(!isLiked)
            }}
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
          {/* 首页不显示查看详情按钮，点击图片进入详情 */}
        </div>
      </div>
    </div>
  )
}

function ArtistCard({ artist }: { artist: Artist }) {
  const navigate = useNavigate()
  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/artists/${artist.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/artists/${artist.id}`)
        }
      }}
    >
      <div className="aspect-square relative">
        <Link to={`/artists/${artist.id}`} className="block w-full h-full">
          <img
            src={artist.avatar || '/favicon.svg'}
            alt={artist.name}
            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement
              if (img.src !== window.location.origin + '/favicon.svg') {
                img.src = '/favicon.svg'
              }
            }}
          />
        </Link>
        {artist.verified && (
          <div className="absolute top-4 right-4 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
            已认证
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{artist.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{artist.bio}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {artist.artworks.length} 件作品
          </span>
          {/* 首页不显示查看详情按钮，点击图片进入详情 */}
        </div>
      </div>
    </div>
  )
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/artworks?category=${category.id}`}
      className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="aspect-square">
        <img
          src={category.image || '/favicon.svg'}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement
            if (img.src !== window.location.origin + '/favicon.svg') {
              img.src = '/favicon.svg'
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
        <p className="text-sm opacity-90 mb-2">{category.description}</p>
        <p className="text-xs opacity-75">{category.count} 件作品</p>
      </div>
    </Link>
  )
}