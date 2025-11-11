import { useState } from 'react'
import { BarChart3, TrendingUp, Users, Palette, ShoppingBag, DollarSign, Eye, Calendar, Filter } from 'lucide-react'

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('7d')
  
  const stats = {
    totalRevenue: 1285000,
    totalOrders: 892,
    totalUsers: 1250,
    totalArtworks: 3456,
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
    userGrowth: 15.2,
    artworkGrowth: 23.1
  }

  const topArtworks = [
    { name: '山水意境', artist: '张艺术', views: 234, likes: 45, sales: 12 },
    { name: '现代抽象', artist: '李现代', views: 156, likes: 23, sales: 8 },
    { name: '古典人物', artist: '王古典', views: 89, likes: 12, sales: 5 }
  ]

  const topArtists = [
    { name: '张艺术', artworks: 23, sales: 15, revenue: 180000 },
    { name: '李现代', artworks: 18, sales: 12, revenue: 150000 },
    { name: '王古典', artworks: 15, sales: 8, revenue: 120000 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据分析</h1>
          <p className="text-gray-600">平台运营数据统计和分析</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">最近7天</option>
            <option value="30d">最近30天</option>
            <option value="90d">最近90天</option>
            <option value="1y">最近1年</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Calendar className="h-4 w-4" />
            <span>自定义时间</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <BarChart3 className="h-4 w-4" />
            <span>导出报告</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+{stats.revenueGrowth}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">总收入</p>
            <p className="text-2xl font-bold text-gray-900">¥{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+{stats.orderGrowth}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">总订单数</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+{stats.userGrowth}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">总用户数</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Palette className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+{stats.artworkGrowth}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">总作品数</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalArtworks.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">收入趋势</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <Eye className="h-5 w-5" />
            </button>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">收入趋势图表</p>
              <p className="text-sm text-gray-400">显示每日/月收入变化</p>
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">用户增长</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <Eye className="h-5 w-5" />
            </button>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">用户增长图表</p>
              <p className="text-sm text-gray-400">显示新用户注册趋势</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Artworks */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">热门作品</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <Filter className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            {topArtworks.map((artwork, index) => (
              <div key={artwork.name} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-red-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{artwork.name}</h4>
                  <p className="text-sm text-gray-500">by {artwork.artist}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{artwork.views} 浏览</div>
                  <div className="text-xs text-gray-500">{artwork.sales} 销售</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Artists */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">热门艺术家</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <Filter className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            {topArtists.map((artist, index) => (
              <div key={artist.name} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-green-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{artist.name}</h4>
                  <p className="text-sm text-gray-500">{artist.artworks} 作品</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">¥{artist.revenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{artist.sales} 销售</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}