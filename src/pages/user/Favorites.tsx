import { useStore } from '@/stores'
import { useState } from 'react'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
// 收藏页不提供预订弹窗，预订仅在详情页
import { formatPrice } from '@/utils'

export default function UserFavorites() {
  const { favorites } = useStore()

  // 模拟收藏数据
  const mockFavorites = [
    {
      id: '1',
      title: '抽象艺术 #1',
      price: 15000,
      images: ['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20art%20painting%20with%20vibrant%20colors&image_size=square'],
      artist: '张三',
      isAvailable: true,
      views: 128
    },
    {
      id: '2',
      title: '现代雕塑',
      price: 25000,
      images: ['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20sculpture%20with%20geometric%20shapes&image_size=square'],
      artist: '李四',
      isAvailable: true,
      views: 95
    },
    {
      id: '3',
      title: '风景油画',
      price: 8000,
      images: ['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=landscape%20oil%20painting%20with%20mountains%20and%20lake&image_size=square'],
      artist: '王五',
      isAvailable: false,
      views: 156
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">我的收藏</h2>
        <span className="text-sm text-gray-500">{mockFavorites.length} 件作品</span>
      </div>

      {mockFavorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无收藏作品</h3>
          <p className="text-gray-500 mb-4">您还没有收藏任何艺术品</p>
          <Link
            to="/artworks"
            className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            浏览作品
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockFavorites.map((artwork) => (
            <div key={artwork.id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                <img
                  src={artwork.images[0]}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
                {!artwork.isAvailable && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">已售出</span>
                  </div>
                )}
                <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
                  <Heart className="h-5 w-5 text-red-500 fill-current" />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{artwork.title}</h3>
                <p className="text-gray-600 text-sm mb-2">by {artwork.artist}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-purple-600">{formatPrice(artwork.price)}</span>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Eye className="h-4 w-4" />
                    <span>{artwork.views}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/artworks/${artwork.id}`}
                    className="flex-1 text-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    查看详情
                  </Link>
                  {artwork.isAvailable && (
                    <Link
                      to={`/artworks/${artwork.id}`}
                      className="flex-1 text-center px-3 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm"
                    >
                      查看详情
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collection Stats */}
      {mockFavorites.length > 0 && (
        <div className="mt-8 pt-8 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">收藏统计</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">{mockFavorites.length}</div>
              <div className="text-sm text-gray-600">总收藏数</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {mockFavorites.filter(item => item.isAvailable).length}
              </div>
              <div className="text-sm text-gray-600">可预订</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatPrice(mockFavorites.reduce((sum, item) => sum + item.price, 0))}
              </div>
              <div className="text-sm text-gray-600">总价值</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 已移除预订弹窗与按钮