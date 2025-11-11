import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Grid, List, Award, Palette, Phone, Mail, Globe } from 'lucide-react'
import { useStore } from '@/stores'
import { cn, formatPrice } from '@/utils'
import type { Artist } from '@/types'
import { api, mapArtist } from '@/lib/api'

export default function Artists() {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)

  // 加载艺术家列表
  useEffect(() => {
    ;(async () => {
      try {
        const list = await api.artists({ limit: 50 })
        setArtists(list.map(mapArtist))
      } catch (e) {
        console.error('Failed to load artists', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // 过滤艺术家
  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.bio.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">艺术家</h1>
          <p className="text-gray-600">认识才华横溢的艺术家们，了解他们的创作故事</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索艺术家..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>筛选</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">认证状态</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="">全部</option>
                  <option value="verified">已认证</option>
                  <option value="unverified">未认证</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">作品数量</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="">全部</option>
                  <option value="1-5">1-5件</option>
                  <option value="6-10">6-10件</option>
                  <option value="11+">11件以上</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? '加载中...' : `找到 ${filteredArtists.length} 位艺术家`}
          </p>
        </div>

        {/* Artists Grid/List */}
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-6'
        )}>
          {filteredArtists.map((artist) => (
            viewMode === 'grid' ? (
              <ArtistCard key={artist.id} artist={artist} />
            ) : (
              <ArtistListItem key={artist.id} artist={artist} />
            )
          ))}
        </div>

        {filteredArtists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">没有找到符合条件的艺术家</p>
            <p className="text-gray-400 mt-2">请尝试调整搜索条件</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="aspect-square relative">
        <img
          src={artist.avatar || '/favicon.svg'}
          alt={artist.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement
            if (img.src !== window.location.origin + '/favicon.svg') {
              img.src = '/favicon.svg'
            }
          }}
        />
        {artist.verified && (
          <div className="absolute top-4 right-4 px-2 py-1 bg-blue-500 text-white text-xs rounded-full flex items-center space-x-1">
            <Award className="h-3 w-3" />
            <span>已认证</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{artist.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{artist.bio}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Palette className="h-4 w-4" />
            <span>{artist.artworks.length} 件作品</span>
          </div>
        </div>

        <Link
          to={`/artists/${artist.id}`}
          className="w-full block text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          查看详情
        </Link>
      </div>
    </div>
  )
}

function ArtistListItem({ artist }: { artist: Artist }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="flex">
        <div className="w-48 h-48 flex-shrink-0 relative">
          <img
            src={artist.avatar || '/favicon.svg'}
            alt={artist.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement
              if (img.src !== window.location.origin + '/favicon.svg') {
                img.src = '/favicon.svg'
              }
            }}
          />
          {artist.verified && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full flex items-center space-x-1">
              <Award className="h-3 w-3" />
              <span>已认证</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{artist.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                <div className="flex items-center space-x-1">
                  <Palette className="h-4 w-4" />
                  <span>{artist.artworks.length} 件作品</span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-3">{artist.bio}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            {artist.email && (
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>{artist.email}</span>
              </div>
            )}
            {artist.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>{artist.phone}</span>
              </div>
            )}
            {artist.website && (
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>{artist.website}</span>
              </div>
            )}
          </div>

          <Link
            to={`/artists/${artist.id}`}
            className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            查看详情
          </Link>
        </div>
      </div>
    </div>
  )
}