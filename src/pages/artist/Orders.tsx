import { useState } from 'react'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  Eye,
  MessageSquare,
  DollarSign,
  Calendar,
  Filter,
  Search
} from 'lucide-react'

export default function ArtistOrders() {
  const [orders] = useState([
    {
      id: 'ORD20241201001',
      artwork: {
        title: '《山水意境》',
        image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20landscape%20painting%2C%20mountains%20and%20rivers%2C%20ink%20wash%20style%2C%20serene%20and%20peaceful&image_size=landscape_4_3'
      },
      customer: {
        name: '李先生',
        phone: '138****8000',
        address: '北京市朝阳区某某街道123号'
      },
      amount: 8500,
      status: 'confirmed',
      orderDate: '2024-12-01',
      paymentStatus: 'paid',
      notes: '请仔细包装，谢谢'
    },
    {
      id: 'ORD20241130002',
      artwork: {
        title: '《花鸟情韵》',
        image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20flower%20and%20bird%20painting%2C%20delicate%20brushwork%2C%20vibrant%20colors%2C%20traditional%20style&image_size=landscape_4_3'
      },
      customer: {
        name: '王女士',
        phone: '139****9000',
        address: '上海市浦东新区某某路456号'
      },
      amount: 12000,
      status: 'shipped',
      orderDate: '2024-11-30',
      paymentStatus: 'paid',
      notes: '希望尽快发货'
    },
    {
      id: 'ORD20241129003',
      artwork: {
        title: '《抽象印象》',
        image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Abstract%20art%20painting%2C%20bold%20colors%2C%20expressive%20brushstrokes%2C%20modern%20art%20style&image_size=landscape_4_3'
      },
      customer: {
        name: '张总',
        phone: '136****6000',
        address: '广州市天河区某某大道789号'
      },
      amount: 15800,
      status: 'pending',
      orderDate: '2024-11-29',
      paymentStatus: 'pending',
      notes: '公司收藏用'
    }
  ])

  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'shipped':
        return <Truck className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
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
      case 'cancelled':
        return '已取消'
      default:
        return '未知'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return '已支付'
      case 'pending':
        return '待支付'
      case 'failed':
        return '支付失败'
      default:
        return '未知'
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleConfirmOrder = (orderId: string) => {
    alert(`确认订单: ${orderId}`)
  }

  const handleShipOrder = (orderId: string) => {
    alert(`发货订单: ${orderId}`)
  }

  const handleCancelOrder = (orderId: string) => {
    if (confirm('确定要取消这个订单吗？')) {
      alert(`取消订单: ${orderId}`)
    }
  }

  const handleContactCustomer = (customerName: string) => {
    alert(`联系客户: ${customerName}`)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">订单管理</h1>
          <p className="text-gray-600 mt-1">管理您的订单和客户信息</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Package className="h-4 w-4" />
          <span>共 {filteredOrders.length} 个订单</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索订单号、作品或客户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">全部状态</option>
            <option value="pending">待确认</option>
            <option value="confirmed">已确认</option>
            <option value="shipped">已发货</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={order.artwork.image}
                  alt={order.artwork.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{order.artwork.title}</h3>
                  <p className="text-sm text-gray-600">订单号: {order.id}</p>
                  <p className="text-sm text-gray-600">下单时间: {order.orderDate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">¥{order.amount.toLocaleString()}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span>{getStatusText(order.status)}</span>
                  </span>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {getPaymentStatusText(order.paymentStatus)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">客户信息</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">姓名:</span>
                  <span className="ml-2 text-gray-900">{order.customer.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">电话:</span>
                  <span className="ml-2 text-gray-900">{order.customer.phone}</span>
                </div>
                <div className="md:col-span-3">
                  <span className="text-gray-600">地址:</span>
                  <span className="ml-2 text-gray-900">{order.customer.address}</span>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-1">订单备注</h4>
                <p className="text-sm text-blue-800">{order.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleContactCustomer(order.customer.name)}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>联系客户</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Eye className="h-4 w-4" />
                  <span>查看详情</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleConfirmOrder(order.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      确认订单
                    </button>
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      拒绝订单
                    </button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => handleShipOrder(order.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    标记发货
                  </button>
                )}
                {order.status === 'shipped' && (
                  <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                    等待收货
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
          <p className="text-gray-600">没有找到符合条件的订单</p>
        </div>
      )}
    </div>
  )
}