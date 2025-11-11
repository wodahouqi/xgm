import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CreditCard, Truck, User, MapPin, Phone, Mail, Calendar, Check } from 'lucide-react'
import { useStore } from '@/stores'
import { formatPrice } from '@/utils'
import type { Address } from '@/types'
import { api, mapArtwork, mapOrder } from '@/lib/api'

export default function Booking() {
  const { artworkId } = useParams<{ artworkId: string }>()
  const navigate = useNavigate()
  const { currentUser, addOrder } = useStore()
  const [artwork, setArtwork] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchArtwork() {
      if (!artworkId) return
      try {
        setLoading(true)
        const data = await api.artworkById(artworkId)
        if (cancelled) return
        setArtwork(mapArtwork(data))
        setError(null)
      } catch (e: any) {
        setError(e?.message || '加载作品失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchArtwork()
    return () => { cancelled = true }
  }, [artworkId])

  // 表单状态
  const [step, setStep] = useState(1)
  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '中国',
  })
  const [recipientName, setRecipientName] = useState(currentUser?.name || '')
  const [recipientPhone, setRecipientPhone] = useState(currentUser?.phone || '')
  
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat' | 'card'>('alipay')
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard')
  const [notes, setNotes] = useState('')

  // 计算总价
  const deliveryFee = deliveryMethod === 'express' ? 200 : 100
  const totalPrice = (artwork?.price || 0) + deliveryFee

  const handleSubmitOrder = async () => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    if (!artwork) return
    try {
      const created = await api.createOrder([{ artworkId: artwork.id, quantity: 1 }], notes)
      addOrder(mapOrder(created))
      navigate('/user-center/orders')
    } catch (e: any) {
      alert(e?.message || '创建订单失败')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">预订艺术品</h1>
          <p className="text-gray-600">确认您的订单信息并完成支付</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                  step >= stepNum ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                )}>
                  {step > stepNum ? <Check className="h-5 w-5" /> : stepNum}
                </div>
                <div className="ml-3">
                  <p className={cn(
                    'font-medium',
                    step >= stepNum ? 'text-purple-600' : 'text-gray-500'
                  )}>
                    {stepNum === 1 ? '确认作品' : stepNum === 2 ? '收货信息' : '支付订单'}
                  </p>
                </div>
                {stepNum < 3 && (
                  <div className={cn(
                    'w-24 h-1 mx-4',
                    step > stepNum ? 'bg-purple-600' : 'bg-gray-200'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Artwork Confirmation */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">作品信息</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={artwork?.images?.[0]}
                    alt={artwork?.title || ''}
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{artwork?.title}</h3>
                  <p className="text-gray-600 mb-4">{artwork?.artistName}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">尺寸：</span>
                      <span className="font-medium">{artwork?.dimensions?.width} x {artwork?.dimensions?.height} {artwork?.dimensions?.depth ? `x ${artwork?.dimensions?.depth}` : ''} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">材质：</span>
                      <span className="font-medium">{artwork?.material}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">创作年份：</span>
                      <span className="font-medium">{artwork?.year}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-semibold text-gray-900">作品价格：</span>
                      <span className="text-2xl font-bold text-purple-600">{formatPrice(artwork?.price || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                返回
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Shipping Information */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">收货信息</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    收货人姓名
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入收货人姓名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    联系电话
                  </label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入联系电话"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    详细地址
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入详细地址"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">城市</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入城市"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">省份</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入省份"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">邮政编码</label>
                  <input
                    type="text"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入邮政编码"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  配送方式
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="delivery"
                      value="standard"
                      checked={deliveryMethod === 'standard'}
                      onChange={(e) => setDeliveryMethod(e.target.value as 'standard' | 'express')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">标准配送</span>
                        <span className="text-purple-600 font-semibold">{formatPrice(100)}</span>
                      </div>
                      <p className="text-sm text-gray-500">预计3-5个工作日送达</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="delivery"
                      value="express"
                      checked={deliveryMethod === 'express'}
                      onChange={(e) => setDeliveryMethod(e.target.value as 'standard' | 'express')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">快速配送</span>
                        <span className="text-purple-600 font-semibold">{formatPrice(200)}</span>
                      </div>
                      <p className="text-sm text-gray-500">预计1-2个工作日送达</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">备注信息</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="请输入特殊要求或备注信息（可选）"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                上一步
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">订单确认</h2>
              
              <div className="border rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={artwork.images[0]}
                    alt={artwork.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{artwork.title}</h3>
                    <p className="text-gray-600">by {artwork.artist}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">作品价格：</span>
                    <span className="font-medium">{formatPrice(artwork.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">配送费用：</span>
                    <span className="font-medium">{formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-gray-900 font-semibold">总计：</span>
                    <span className="text-purple-600 font-bold text-lg">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">收货信息</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <p className="font-medium">{shippingAddress.name}</p>
                  <p>{shippingAddress.phone}</p>
                  <p>{shippingAddress.address}, {shippingAddress.city}, {shippingAddress.province}</p>
                  <p>{shippingAddress.postalCode}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  <CreditCard className="h-5 w-5 inline mr-2" />
                  支付方式
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="alipay"
                      checked={paymentMethod === 'alipay'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'alipay' | 'wechat' | 'card')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="font-medium">支付宝</span>
                      <p className="text-sm text-gray-500">使用支付宝进行支付</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="wechat"
                      checked={paymentMethod === 'wechat'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'alipay' | 'wechat' | 'card')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="font-medium">微信支付</span>
                      <p className="text-sm text-gray-500">使用微信进行支付</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'alipay' | 'wechat' | 'card')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="font-medium">银行卡</span>
                      <p className="text-sm text-gray-500">使用银行卡进行支付</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                上一步
              </button>
              <button
                onClick={handleSubmitOrder}
                className="px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                确认支付 {formatPrice(totalPrice)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}