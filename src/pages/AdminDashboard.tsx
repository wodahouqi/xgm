import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { 
  Users, 
  Palette, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Tag
} from 'lucide-react'
import { cn } from '@/utils'

export default function AdminDashboard() {
  const location = useLocation()
  const [stats] = useState({
    totalUsers: 1250,
    totalArtworks: 3456,
    totalOrders: 892,
    pendingOrders: 23,
    newUsersToday: 15,
    activeArtists: 89
  })

  const sidebarItems = [
    { 
      id: 'overview', 
      label: '概览', 
      icon: BarChart3,
      path: '/admin-dashboard'
    },
    { 
      id: 'users', 
      label: '用户管理', 
      icon: Users,
      path: '/admin-dashboard/users'
    },
    { 
      id: 'artworks', 
      label: '作品管理', 
      icon: Palette,
      path: '/admin-dashboard/artworks'
    },
    { 
      id: 'orders', 
      label: '订单管理', 
      icon: ShoppingBag,
      path: '/admin-dashboard/orders'
    },
    { 
      id: 'categories', 
      label: '分类管理', 
      icon: Tag,
      path: '/admin-dashboard/categories'
    },
    { 
      id: 'analytics', 
      label: '数据分析', 
      icon: TrendingUp,
      path: '/admin-dashboard/analytics'
    },
    { 
      id: 'reports', 
      label: '举报处理', 
      icon: AlertCircle,
      path: '/admin-dashboard/reports'
    },
    { 
      id: 'settings', 
      label: '系统设置', 
      icon: Settings,
      path: '/admin-dashboard/settings'
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
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">管理员后台</h2>
                <p className="text-sm text-gray-500">Admin Dashboard</p>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-600">总用户数</span>
                <span className="text-sm font-semibold text-blue-600">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                <span className="text-sm text-green-600">活跃艺术家</span>
                <span className="text-sm font-semibold text-green-600">{stats.activeArtists}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                <span className="text-sm text-orange-600">待处理订单</span>
                <span className="text-sm font-semibold text-orange-600">{stats.pendingOrders}</span>
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
                        ? 'bg-red-100 text-red-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.id === 'orders' && stats.pendingOrders > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {stats.pendingOrders}
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