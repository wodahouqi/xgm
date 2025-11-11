import { useState } from 'react'
import { CreditCard, Plus, Trash2, Edit2, Shield } from 'lucide-react'

export default function UserPayment() {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'alipay',
      name: '支付宝',
      account: '138****8000',
      isDefault: true
    },
    {
      id: '2',
      type: 'wechat',
      name: '微信支付',
      account: '微信用户',
      isDefault: false
    }
  ])

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: 'card' as 'alipay' | 'wechat' | 'card',
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  })

  const paymentIcons = {
    alipay: '💰',
    wechat: '💚',
    card: '💳'
  }

  const handleAddPayment = () => {
    const newMethod = {
      id: Date.now().toString(),
      type: formData.type,
      name: formData.type === 'card' ? '银行卡' : formData.type === 'alipay' ? '支付宝' : '微信支付',
      account: formData.type === 'card' 
        ? `****${formData.cardNumber.slice(-4)}` 
        : formData.type === 'alipay' 
          ? '支付宝账户' 
          : '微信账户',
      isDefault: false
    }
    setPaymentMethods([...paymentMethods, newMethod])
    setIsAdding(false)
    setFormData({
      type: 'card',
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: ''
    })
  }

  const handleDeletePayment = (id: string) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id))
  }

  const setDefaultPayment = (id: string) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">支付方式</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>添加支付方式</span>
        </button>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4 mb-6">
        {paymentMethods.map((method) => (
          <div key={method.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                  {paymentIcons[method.type as keyof typeof paymentIcons]}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">{method.name}</h4>
                    {method.isDefault && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        默认
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{method.account}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!method.isDefault && (
                  <button
                    onClick={() => setDefaultPayment(method.id)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    设为默认
                  </button>
                )}
                <button
                  onClick={() => handleDeletePayment(method.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Payment Form */}
      {isAdding && (
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">添加支付方式</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">支付类型</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'alipay', name: '支付宝', icon: '💰' },
                { type: 'wechat', name: '微信支付', icon: '💚' },
                { type: 'card', name: '银行卡', icon: '💳' }
              ].map((option) => (
                <label
                  key={option.type}
                  className={cn(
                    'flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50',
                    formData.type === option.type && 'border-purple-600 bg-purple-50'
                  )}
                >
                  <input
                    type="radio"
                    name="paymentType"
                    value={option.type}
                    checked={formData.type === option.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-2">{option.icon}</span>
                  <span className="text-sm font-medium">{option.name}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.type === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="h-4 w-4 inline mr-1" />
                  银行卡号
                </label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="请输入银行卡号"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">持卡人姓名</label>
                <input
                  type="text"
                  value={formData.cardholderName}
                  onChange={(e) => setFormData({...formData, cardholderName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="请输入持卡人姓名"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">有效期</label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="CVV"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600">您的支付信息将被安全加密</span>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsAdding(false)
                setFormData({
                  type: 'card',
                  cardNumber: '',
                  cardholderName: '',
                  expiryDate: '',
                  cvv: ''
                })
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddPayment}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              添加
            </button>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">安全提示</h4>
            <p className="text-sm text-blue-700">
              我们使用行业标准的加密技术来保护您的支付信息安全。所有支付信息都经过安全加密处理，
              我们不会存储您的敏感支付信息。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}