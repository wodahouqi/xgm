import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Share2, Star, User, Calendar, Ruler, Palette } from 'lucide-react'
import { useStore } from '@/stores'
import { cn, formatPrice } from '@/utils'
import type { Artwork, Review } from '@/types'
import { api, mapArtwork, mapReview } from '@/lib/api'
import ContactModal from '@/components/ContactModal'

export default function ArtworkDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart, currentUser } = useStore()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      if (!id) return
      try {
        setLoading(true)
        const data = await api.artworkById(id)
        if (cancelled) return
        setArtwork(mapArtwork(data))
        const rv = (data.reviews || []).map(mapReview)
        setReviews(rv)
        // If backend doesn't include reviews in artwork detail, fetch separately
        if (!data.reviews) {
          const rfull = await api.artworkReviews(id, { page: 1, limit: 10 })
          if (cancelled) return
          setReviews((rfull.data || []).map(mapReview))
        }
        setError(null)
      } catch (e: any) {
        setError(e?.message || '加载作品失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">加载中...</h1>
        </div>
      </div>
    )
  }

  if (error || !artwork) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error ? error : '艺术品未找到'}</h1>
          <button
            onClick={() => navigate('/artworks')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            返回艺术品列表
          </button>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % artwork.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + artwork.images.length) % artwork.images.length)
  }

  const handleBooking = () => {
    // 点击后弹出联系信息表单，不强制登录
    setShowContactModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-purple-600">首页</Link>
          <span>/</span>
          <Link to="/artworks" className="hover:text-purple-600">艺术品</Link>
          <span>/</span>
          <span className="text-gray-900">{artwork.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-xl overflow-hidden shadow-lg">
              <img
                src={artwork.images[currentImageIndex] || '/favicon.svg'}
                alt={artwork.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement
                  if (img.src !== window.location.origin + '/favicon.svg') {
                    img.src = '/favicon.svg'
                  }
                }}
              />
              
              {artwork.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-80 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-80 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-800" />
                  </button>
                </>
              )}

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  artwork.status === 'available' ? 'bg-green-100 text-green-800' :
                  artwork.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                )}>
                  {artwork.status === 'available' ? '可预订' :
                   artwork.status === 'reserved' ? '已预订' : '已售出'}
                </span>
              </div>
            </div>

            {/* Thumbnail Images */}
            {artwork.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {artwork.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                      index === currentImageIndex ? 'border-purple-600' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <img
                      src={image || '/favicon.svg'}
                      alt={`${artwork.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement
                        if (img.src !== window.location.origin + '/favicon.svg') {
                          img.src = '/favicon.svg'
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Artwork Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{artwork.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{artwork.artistName}</p>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-purple-600">
                  {formatPrice(artwork.price)}
                </span>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('h-5 w-5', i < Math.round((reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1))) ? 'text-yellow-400 fill-current' : 'text-gray-300')} />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">({(reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1)).toFixed(1)})</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleBooking}
                disabled={artwork.status !== 'available'}
                className={cn(
                  'flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors',
                  artwork.status === 'available'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                )}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>{artwork.status === 'available' ? '立即预订' : '不可预订'}</span>
              </button>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={cn(
                  'px-6 py-3 border rounded-lg font-semibold transition-colors',
                  isLiked
                    ? 'border-red-500 text-red-500 bg-red-50'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                )}
              >
                <Heart className="h-5 w-5" fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            {/* Artwork Details */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">作品信息</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">创作年份</p>
                    <p className="font-medium">{artwork.year}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Ruler className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">尺寸</p>
                    <p className="font-medium">
                      {artwork.dimensions.width} × {artwork.dimensions.height}cm
                      {artwork.dimensions.depth && ` × ${artwork.dimensions.depth}cm`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Palette className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">材质</p>
                    <p className="font-medium">{artwork.material}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">艺术家</p>
                    <Link
                      to={`/artists/${artwork.artistId}`}
                      className="font-medium text-purple-600 hover:text-purple-700"
                    >
                      {artwork.artistName}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          {/* Description */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">作品描述</h3>
            <p className="text-gray-700 leading-relaxed">{artwork.description}</p>
          </div>

          {/* Highlights to enhance desire */}
          <div className="bg-purple-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">作品亮点</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>原创作品，艺术家签名保证唯一性</li>
              <li>高品质材料与精湛工艺，持久保存</li>
              <li>适配现代与经典空间，提升居住与办公格调</li>
              <li>配套证书与安全包装，寄送全程可追踪</li>
            </ul>
          </div>

            {/* Reviews */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">作品评价</h3>
              {reviews.length === 0 ? (
                <p className="text-gray-600">暂无评价</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rv) => (
                    <div key={rv.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{rv.userName || '匿名用户'}</span>
                        </div>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn('h-4 w-4', i < rv.rating ? 'text-yellow-400 fill-current' : 'text-gray-300')} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{rv.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(rv.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}

              {currentUser && (
                <ReviewForm artworkId={artwork.id} onCreated={(r) => setReviews([mapReview(r), ...reviews])} />
              )}
            </div>

            {/* Artist Info */}
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{artwork.artistName}</h4>
                  <p className="text-sm text-gray-600">艺术家</p>
                </div>
              </div>
              <Link
                to={`/artists/${artwork.artistId}`}
                className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                查看艺术家详情
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal for booking intention */}
      {showContactModal && (
        <ContactModal
          artworkTitle={artwork.title}
          onClose={() => setShowContactModal(false)}
          onSubmitted={() => setShowContactModal(false)}
        />
      )}
    </div>
  )
}

function ReviewForm({ artworkId, onCreated }: { artworkId: string; onCreated: (r: any) => void }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!comment.trim()) return
    try {
      setSubmitting(true)
      const created = await api.createReview(artworkId, { rating, comment })
      onCreated(created)
      setComment('')
      setRating(5)
    } catch (e) {
      // noop: 可添加错误提示
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-6 border-t pt-6">
      <h4 className="font-semibold text-gray-900 mb-3">发表评价</h4>
      <div className="flex items-center space-x-3 mb-3">
        <span className="text-sm text-gray-600">评分：</span>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border rounded px-2 py-1">
          {[5,4,3,2,1].map(r => (<option key={r} value={r}>{r}</option>))}
        </select>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full border rounded-lg p-3"
        placeholder="写下你对作品的看法..."
      />
      <div className="mt-3">
        <button onClick={submit} disabled={submitting} className={cn('px-4 py-2 rounded-lg', submitting ? 'bg-gray-300 text-gray-600' : 'bg-purple-600 text-white hover:bg-purple-700')}>
          {submitting ? '提交中...' : '提交评价'}
        </button>
      </div>
    </div>
  )
}