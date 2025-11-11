import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Award, Palette, Phone, Mail, Globe, Heart, Share2, Calendar, MapPin } from 'lucide-react'
import { useStore } from '@/stores'
import { formatPrice, formatDate } from '@/utils'
import { api, mapArtist, mapArtwork } from '@/lib/api'
import type { Artist, Artwork } from '@/types'

export default function ArtistDetail() {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useStore()
  const [activeTab, setActiveTab] = useState<'works' | 'about' | 'contact'>('works')
  const [artist, setArtist] = useState<Artist | null>(null)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const ar = await api.artistById(id)
        setArtist(mapArtist(ar))
        const aw = await api.artworksByArtist(id, 50)
        setArtworks(aw.map(mapArtwork))
      } catch (e) {
        console.error('Failed to load artist detail', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">加载中...</div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">艺术家未找到</h1>
          <p className="text-gray-600 mb-4">抱歉，该艺术家不存在或已被删除</p>
          <Link to="/artists" className="text-purple-600 hover:text-purple-700">
            返回艺术家列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Artist Avatar */}
            <div className="lg:w-1/3">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Artist Info */}
            <div className="lg:w-2/3">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-4xl font-bold text-gray-900">{artist.name}</h1>
                    {artist.verified && (
                      <div className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full flex items-center space-x-1">
                        <Award className="h-4 w-4" />
                        <span>已认证艺术家</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xl text-gray-600">{artist.specialty}</p>
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <Heart className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <p className="text-gray-700 text-lg mb-6 leading-relaxed">{artist.bio}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Palette className="h-5 w-5" />
                  <span>{artist.artworks.length} 件作品</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span>加入时间 {formatDate(artist.createdAt)}</span>
                </div>
                {artist.location && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-5 w-5" />
                    <span>{artist.location}</span>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4">
                {artist.email && (
                  <a href={`mailto:${artist.email}`} className="flex items-center space-x-2 text-purple-600 hover:text-purple-700">
                    <Mail className="h-5 w-5" />
                    <span>{artist.email}</span>
                  </a>
                )}
                {artist.phone && (
                  <a href={`tel:${artist.phone}`} className="flex items-center space-x-2 text-purple-600 hover:text-purple-700">
                    <Phone className="h-5 w-5" />
                    <span>{artist.phone}</span>
                  </a>
                )}
                {artist.website && (
                  <a href={artist.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-purple-600 hover:text-purple-700">
                    <Globe className="h-5 w-5" />
                    <span>个人网站</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('works')}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'works'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
            作品集 ({artworks.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'about'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              关于艺术家
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'contact'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              联系方式
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'works' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">关于 {artist.name}</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {artist.name} 是一位才华横溢的艺术家，专注于 {artist.specialty} 领域。自 {new Date(artist.createdAt).getFullYear()} 年加入我们的平台以来，
                已经创作了 {artist.artworks.length} 件精美的艺术品。
              </p>
              <p className="text-gray-700 leading-relaxed">
                艺术家的创作灵感来源于对生活的深刻理解和独特的艺术视角。每一件作品都体现了他们对美的追求和对艺术的执着。
                通过我们的平台，您可以预订和收藏这些珍贵的艺术品，感受艺术带来的美好体验。
              </p>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">联系 {artist.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">联系方式</h3>
                <div className="space-y-4">
                  {artist.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <a href={`mailto:${artist.email}`} className="text-purple-600 hover:text-purple-700">
                        {artist.email}
                      </a>
                    </div>
                  )}
                  {artist.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <a href={`tel:${artist.phone}`} className="text-purple-600 hover:text-purple-700">
                        {artist.phone}
                      </a>
                    </div>
                  )}
                  {artist.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                        访问个人网站
                      </a>
                    </div>
                  )}
                  {artist.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{artist.location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">发送消息</h3>
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="您的姓名"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="您的邮箱"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <textarea
                    rows={4}
                    placeholder="消息内容"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    发送消息
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ArtworkCard({ artwork }: { artwork: Artwork }) {
  
  return (
    <Link to={`/artworks/${artwork.id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="aspect-square relative overflow-hidden">
          <img
            src={artwork.images[0]}
            alt={artwork.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1">{artwork.title}</h3>
          <p className="text-purple-600 font-bold">{formatPrice(artwork.price)}</p>
        </div>
      </div>
    </Link>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}