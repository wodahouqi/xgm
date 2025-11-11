import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { 
  Palette, 
  ShoppingBag, 
  BarChart3, 
  Users, 
  Settings, 
  MessageSquare,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { cn } from '@/utils'

export default function ArtistDashboard() {
  const location = useLocation()
  const [stats] = useState({
    totalArtworks: 24,
    activeOrders: 8,
    totalRevenue: 128500,
    newMessages: 3
  })

  const sidebarItems = [
    { 
      id: 'overview', 
      label: '概览', 
      icon: BarChart3,
      path: '/artist-dashboard'
    },
    { 
      id: 'artworks', 
      label: '作品管理', 
      icon: Palette,
      path: '/artist-dashboard/artworks'
    },
    { 
      id: 'orders', 
      label: '订单管理', 
      icon: ShoppingBag,
      path: '/artist-dashboard/orders'
    },
    { 
      id: 'customers', 
      label: '客户管理', 
      icon: Users,
      path: '/artist-dashboard/customers'
    },
    { 
      id: 'messages', 
      label: '消息中心', 
      icon: MessageSquare,
      path: '/artist-dashboard/messages'
    },
    { 
      id: 'analytics', 
      label: '数据分析', 
      icon: TrendingUp,
      path: '/artist-dashboard/analytics'
    },
    { 
      id: 'settings', 
      label: '设置', 
      icon: Settings,
      path: '/artist-dashboard/settings'
    }
  ]

  const getActiveItem = () => {
    const currentPath = location.pathname
    return sidebarItems.find(item => currentPath.startsWith(item.path)) || sidebarItems[0]
  }

  const activeItem = getActiveItem()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">艺术家后台</h2>
                <p className="text-sm text-gray-500">Artist Dashboard</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.totalArtworks}</div>
                <div className="text-xs text-purple-600">作品总数</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.activeOrders}</div>
                <div className="text-xs text-green-600">活跃订单</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">¥{stats.totalRevenue.toLocaleString()}</div>
                <div className="text-xs text-blue-600">总收入</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.newMessages}</div>
                <div className="text-xs text-orange-600">新消息</div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = activeItem.id === item.id
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                      isActive 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.id === 'messages' && stats.newMessages > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {stats.newMessages}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}