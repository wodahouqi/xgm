import { useState } from 'react'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Eye, 
  Heart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export default function ArtistOverview() {
  const [stats] = useState([
    {
      title: '本月收入',
      value: '¥45,200',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: '订单数量',
      value: '156',
      change: '+8.3%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      title: '作品浏览',
      value: '2,847',
      change: '-2.1%',
      trend: 'down',
      icon: Eye,
      color: 'purple'
    },
    {
      title: '收藏数量',
      value: '423',
      change: '+15.7%',
      trend: 'up',
      icon: Heart,
      color: 'red'
    }
  ])

  const [recentOrders] = useState([
    {
      id: 'ORD20241201001',
      artwork: '《山水意境》',
      customer: '李先生',
      amount: '¥8,500',
      status: 'confirmed',
      date: '2024-12-01'
    },
    {
      id: 'ORD20241130002',
      artwork: '《花鸟情韵》',
      customer: '王女士',
      amount: '¥12,000',
      status: 'shipped',
      date: '2024-11-30'
    },
    {
      id: 'ORD20241129003',
      artwork: '《抽象印象》',
      customer: '张总',
      amount: '¥15,800',
      status: 'pending',
      date: '2024-11-29'
    }
  ])

  const [popularArtworks] = useState([
    {
      id: '1',
      title: '《山水意境》',
      views: 1247,
      likes: 89,
      price: '¥8,500',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20landscape%20painting%20with%20mountains%20and%20rivers%2C%20ink%20wash%20style%2C%20serene%20and%20peaceful&image_size=landscape_4_3'
    },
    {
      id: '2',
      title: '《花鸟情韵》',
      views: 892,
      likes: 67,
      price: '¥12,000',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20flower%20and%20bird%20painting%2C%20delicate%20brushwork%2C%20vibrant%20colors%2C%20traditional%20style&image_size=landscape_4_3'
    },
    {
      id: '3',
      title: '《抽象印象》',
      views: 756,
      likes: 45,
      price: '¥15,800',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Abstract%20art%20painting%2C%20bold%20colors%2C%20expressive%20brushstrokes%2C%20modern%20art%20style&image_size=landscape_4_3'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待确认'
      case 'confirmed':
        return '已确认'
      case 'shipped':
        return '已发货'
      default:
        return '未知'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">概览</h1>
          <p className="text-gray-600 mt-1">欢迎回来，查看您的艺术事业表现</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>最后更新: {new Date().toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="flex items-center space-x-1">
                  <TrendIcon className={`h-4 w-4 text-${stat.trend === 'up' ? 'green' : 'red'}-500`} />
                  <span className={`text-sm font-medium text-${stat.trend === 'up' ? 'green' : 'red'}-600`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">最近订单</h2>
            <a href="/artist-dashboard/orders" className="text-sm text-purple-600 hover:text-purple-700">
              查看全部
            </a>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{order.artwork}</h3>
                  <p className="text-sm text-gray-600">{order.customer} • {order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{order.amount}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Artworks */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">热门作品</h2>
            <a href="/artist-dashboard/artworks" className="text-sm text-purple-600 hover:text-purple-700">
              管理作品
            </a>
          </div>
          <div className="space-y-4">
            {popularArtworks.map((artwork) => (
              <div key={artwork.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{artwork.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{artwork.views}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{artwork.likes}</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{artwork.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">快速操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/artist-dashboard/artworks/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">发布新作品</p>
          </a>
          
          <a
            href="/artist-dashboard/orders"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">处理订单</p>
          </a>
          
          <a
            href="/artist-dashboard/analytics"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">查看数据</p>
          </a>
          
          <a
            href="/artist-dashboard/messages"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">回复消息</p>
          </a>
        </div>
      </div>
    </div>
  )
}