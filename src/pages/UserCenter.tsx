import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { User, Heart, ShoppingBag, Settings, CreditCard, MapPin, Bell } from 'lucide-react'
import { cn } from '@/utils'

export default function UserCenter() {
  const location = useLocation()
  
  const menuItems = [
    { path: '/user/profile', icon: User, label: '个人信息' },
    { path: '/user/favorites', icon: Heart, label: '我的收藏' },
    { path: '/user/orders', icon: ShoppingBag, label: '历史订单' },
    { path: '/user/addresses', icon: MapPin, label: '收货地址' },
    { path: '/user/payment', icon: CreditCard, label: '支付方式' },
    { path: '/user/notifications', icon: Bell, label: '消息通知' },
    { path: '/user/settings', icon: Settings, label: '账户设置' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">用户昵称</h3>
                  <p className="text-sm text-gray-500">user@example.com</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}