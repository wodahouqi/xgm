import { useState } from 'react'
import { Plus, Edit2, Trash2, MapPin, Check } from 'lucide-react'
import { cn } from '@/utils'
import type { Address } from '@/types'

export default function UserAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      userId: '1',
      name: '张三',
      phone: '13800138000',
      address: '北京市朝阳区建国门外大街1号',
      city: '北京市',
      province: '北京市',
      postalCode: '100001',
      isDefault: true
    },
    {
      id: '2',
      userId: '1',
      name: '张三',
      phone: '13800138000',
      address: '上海市浦东新区陆家嘴环路1000号',
      city: '上海市',
      province: '上海市',
      postalCode: '200001',
      isDefault: false
    }
  ])

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    isDefault: false
  })

  const handleAddAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      userId: '1',
      ...formData
    }
    setAddresses([...addresses, newAddress])
    setIsAdding(false)
    setFormData({
      name: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      isDefault: false
    })
  }

  const handleEditAddress = (id: string) => {
    const address = addresses.find(a => a.id === id)
    if (address) {
      setFormData({
        name: address.name,
        phone: address.phone,
        address: address.address,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        isDefault: address.isDefault
      })
      setEditingId(id)
    }
  }

  const handleUpdateAddress = () => {
    setAddresses(addresses.map(a => 
      a.id === editingId 
        ? { ...a, ...formData }
        : a
    ))
    setEditingId(null)
    setFormData({
      name: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      isDefault: false
    })
  }

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id))
  }

  const setDefaultAddress = (id: string) => {
    setAddresses(addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    })))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">收货地址</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>添加地址</span>
        </button>
      </div>

      {/* Address List */}
      <div className="space-y-4 mb-6">
        {addresses.map((address) => (
          <div key={address.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">{address.name}</span>
                {address.isDefault && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>默认</span>
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                {!address.isDefault && (
                  <button
                    onClick={() => setDefaultAddress(address.id)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    设为默认
                  </button>
                )}
                <button
                  onClick={() => handleEditAddress(address.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>{address.phone}</p>
              <p>{address.province} {address.city}</p>
              <p>{address.address}</p>
              <p>{address.postalCode}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Address Form */}
      {(isAdding || editingId) && (
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isAdding ? '添加新地址' : '编辑地址'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">收货人姓名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="请输入收货人姓名"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">联系电话</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="请输入联系电话"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">省份</label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({...formData, province: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="请输入省份"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">城市</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="请输入城市"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">详细地址</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="请输入详细地址"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮政编码</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="请输入邮政编码"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                设为默认地址
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setIsAdding(false)
                setEditingId(null)
                setFormData({
                  name: '',
                  phone: '',
                  address: '',
                  city: '',
                  province: '',
                  postalCode: '',
                  isDefault: false
                })
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={isAdding ? handleAddAddress : handleUpdateAddress}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {isAdding ? '添加' : '保存'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}