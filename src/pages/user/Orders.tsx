import { useState } from 'react'
import { Eye, Package, Truck, Clock, CheckCircle, XCircle, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice, formatDate } from '@/utils'

export default function UserOrders() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'>('all')

  // 模拟订单数据
  const mockOrders = [
    {
      id: 'ORD-2024-001',
      artwork: {
        id: '1',
        title: '抽象艺术 #1',
        images: ['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20art%20painting%20with%20vibrant%20colors&image_size=square'],
        artist: '张三'
      },
      price: 15000,
      deliveryFee: 100,
      totalPrice: 15100,
      status: 'pending',
      createdAt: new Date('2024-01-15'),
      estimatedDelivery: new Date('2024-01-20')
    },
    {
      id: 'ORD-2024-002',
      artwork: {
        id: '2',
        title: '现代雕塑',
        images: ['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20sculpture%20with%20geometric%20shapes&image_size=square'],
        artist: '李四'
      },
      price: 25000,
      deliveryFee: 200,
      totalPrice: 25200,
      status: 'confirmed',
      createdAt: new Date('2024-01-10'),
      estimatedDelivery: new Date('2024-01-25')
    },
    {
      id: 'ORD-2024-003',
      artwork: {
        id: '3',
        title: '风景油画',
        images: ['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=landscape%20oil%20painting%20with%20mountains%20and%20lake&image_size=square'],
        artist: '王五'
      },
      price: 8000,
      deliveryFee: 100,
      totalPrice: 8100,
      status: 'completed',
      createdAt: new Date('2024-01-05'),
      completedAt: new Date('2024-01-12')
    }
  ]

  const statusConfig = {
    pending: { label: '待确认', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    confirmed: { label: '已确认', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    shipped: { label: '已发货', color: 'bg-purple-100 text-purple-800', icon: Truck },
    completed: { label: '已完成', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: '已取消', color: 'bg-red-100 text-red-800', icon: XCircle }
  }

  const filteredOrders = activeTab === 'all' 
    ? mockOrders 
    : mockOrders.filter(order => order.status === activeTab)

  const tabs = [
    { key: 'all', label: '全部', count: mockOrders.length },
    { key: 'pending', label: '待确认', count: mockOrders.filter(o => o.status === 'pending').length },
    { key: 'confirmed', label: '已确认', count: mockOrders.filter(o => o.status === 'confirmed').length },
    { key: 'shipped', label: '已发货', count: mockOrders.filter(o => o.status === 'shipped').length },
    { key: 'completed', label: '已完成', count: mockOrders.filter(o => o.status === 'completed').length },
    { key: 'cancelled', label: '已取消', count: mockOrders.filter(o => o.status === 'cancelled').length }
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">历史订单</h2>
        <span className="text-sm text-gray-500">{mockOrders.length} 个订单</span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.key
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  'ml-2 px-2 py-1 text-xs rounded-full',
                  activeTab === tab.key
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-100 text-gray-600'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
          <p className="text-gray-500 mb-4">您还没有任何订单记录</p>
          <Link
            to="/artworks"
            className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            浏览作品
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig]
            const StatusIcon = status.icon
            
            return (
              <div key={order.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 mb-2 md:mb-0">
                    <span className="text-sm text-gray-500">订单号：</span>
                    <span className="font-mono text-sm font-medium">{order.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={cn('px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1', status.color)}>
                      <StatusIcon className="h-4 w-4" />
                      <span>{status.label}</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4">
                    <img
                      src={order.artwork.images[0]}
                      alt={order.artwork.title}
                      className="w-full aspect-square rounded-lg object-cover"
                    />
                  </div>
                  
                  <div className="md:w-3/4">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{order.artwork.title}</h3>
                      <p className="text-gray-600">by {order.artwork.artist}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">作品价格</p>
                        <p className="font-medium">{formatPrice(order.price)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">配送费用</p>
                        <p className="font-medium">{formatPrice(order.deliveryFee)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">总计</p>
                        <p className="font-bold text-purple-600">{formatPrice(order.totalPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">下单时间</p>
                        <p className="font-medium">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={`/artworks/${order.artwork.id}`}
                        className="flex items-center space-x-1 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>查看作品</span>
                      </Link>
                      
                      {order.status === 'pending' && (
                        <>
                          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            确认订单
                          </button>
                          <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                            取消订单
                          </button>
                        </>
                      )}
                      
                      {order.status === 'confirmed' && (
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                          申请退款
                        </button>
                      )}
                      
                      {order.status === 'shipped' && (
                        <>
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            确认收货
                          </button>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            查看物流
                          </button>
                        </>
                      )}
                      
                      {order.status === 'completed' && (
                        <>
                          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            再次预订
                          </button>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            评价
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}