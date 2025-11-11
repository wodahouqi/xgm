import { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  ShoppingCart,
  Filter,
  Search,
  Upload,
  Tag,
  DollarSign,
  Calendar,
  Palette,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical
} from 'lucide-react'
import ImageUpload from '../../components/ImageUpload'

export default function ArtistArtworks() {
  const [artworks, setArtworks] = useState([
    {
      id: '1',
      title: '《山水意境》',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20landscape%20painting%2C%20mountains%20and%20rivers%2C%20ink%20wash%20style%2C%20serene%20and%20peaceful&image_size=landscape_4_3',
      price: 8500,
      category: '山水画',
      year: 2024,
      dimensions: '80x60cm',
      material: '宣纸水墨',
      status: 'available',
      views: 1247,
      likes: 89,
      createdAt: '2024-11-15'
    },
    {
      id: '2',
      title: '《花鸟情韵》',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20flower%20and%20bird%20painting%2C%20delicate%20brushwork%2C%20vibrant%20colors%2C%20traditional%20style&image_size=landscape_4_3',
      price: 12000,
      category: '花鸟画',
      year: 2024,
      dimensions: '70x50cm',
      material: '设色纸本',
      status: 'sold',
      views: 892,
      likes: 67,
      createdAt: '2024-10-20'
    },
    {
      id: '3',
      title: '《抽象印象》',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Abstract%20art%20painting%2C%20bold%20colors%2C%20expressive%20brushstrokes%2C%20modern%20art%20style&image_size=landscape_4_3',
      price: 15800,
      category: '抽象画',
      year: 2024,
      dimensions: '100x80cm',
      material: '油画布面',
      status: 'reserved',
      views: 756,
      likes: 45,
      createdAt: '2024-09-30'
    }
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [uploadedImages, setUploadedImages] = useState<File[]>([])

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    year: '',
    dimensions: '',
    material: '',
    description: '',
    images: [] as string[]
  })

  const categories = ['山水画', '花鸟画', '人物画', '抽象画', '书法']
  const statuses = [
    { value: 'all', label: '全部状态' },
    { value: 'available', label: '可售' },
    { value: 'sold', label: '已售' },
    { value: 'reserved', label: '预留' }
  ]

  const filteredArtworks = artworks.filter(artwork => {
    const matchesSearch = artwork.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || artwork.category === filterCategory
    const matchesStatus = filterStatus === 'all' || artwork.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleAddArtwork = () => {
    const newArtwork = {
      id: Date.now().toString(),
      ...formData,
      price: parseFloat(formData.price),
      year: parseInt(formData.year),
      status: 'available',
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }
    setArtworks([...artworks, newArtwork])
    setShowAddForm(false)
    setFormData({
      title: '',
      price: '',
      category: '',
      year: '',
      dimensions: '',
      material: '',
      description: '',
      images: []
    })
  }

  const handleEditArtwork = (artwork: any) => {
    setEditingArtwork(artwork)
    setFormData({
      title: artwork.title,
      price: artwork.price.toString(),
      category: artwork.category,
      year: artwork.year.toString(),
      dimensions: artwork.dimensions,
      material: artwork.material,
      description: artwork.description || '',
      images: artwork.images || []
    })
  }

  const handleUpdateArtwork = () => {
    const updatedArtworks = artworks.map(artwork =>
      artwork.id === editingArtwork.id
        ? {
            ...artwork,
            ...formData,
            price: parseFloat(formData.price),
            year: parseInt(formData.year)
          }
        : artwork
    )
    setArtworks(updatedArtworks)
    setEditingArtwork(null)
    setFormData({
      title: '',
      price: '',
      category: '',
      year: '',
      dimensions: '',
      material: '',
      description: '',
      images: []
    })
  }

  const handleDeleteArtwork = (id: string) => {
    if (confirm('确定要删除这件作品吗？')) {
      setArtworks(artworks.filter(artwork => artwork.id !== id))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'sold':
        return 'bg-red-100 text-red-800'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return '可售'
      case 'sold':
        return '已售'
      case 'reserved':
        return '预留'
      default:
        return '未知'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">作品管理</h1>
          <p className="text-gray-600 mt-1">管理您的艺术作品</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>添加作品</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索作品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">所有分类</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Artworks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtworks.map((artwork) => (
          <div key={artwork.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <img
              src={artwork.image}
              alt={artwork.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{artwork.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(artwork.status)}`}>
                  {getStatusText(artwork.status)}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Tag className="h-4 w-4 mr-2" />
                  <span>{artwork.category}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span className="font-semibold text-gray-900">¥{artwork.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{artwork.year}年</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Eye className="h-4 w-4 mr-2" />
                  <span>{artwork.views} 浏览</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Heart className="h-4 w-4 mr-2" />
                  <span>{artwork.likes} 收藏</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditArtwork(artwork)}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>编辑</span>
                </button>
                <button
                  onClick={() => handleDeleteArtwork(artwork.id)}
                  className="flex items-center justify-center p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingArtwork) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingArtwork ? '编辑作品' : '添加新作品'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">作品标题</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入作品标题"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">价格 (¥)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="请输入价格"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">创作年份</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="请输入年份"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">选择分类</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">尺寸</label>
                    <input
                      type="text"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="如: 80x60cm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">材质</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({...formData, material: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="如: 宣纸水墨"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">作品描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入作品描述"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    作品图片 *
                  </label>
                  <ImageUpload
                    onImageUpload={(files) => setUploadedImages(files)}
                    maxImages={5}
                    maxSize={10}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingArtwork(null)
                    setFormData({
                      title: '',
                      price: '',
                      category: '',
                      year: '',
                      dimensions: '',
                      material: '',
                      description: '',
                      images: []
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={editingArtwork ? handleUpdateArtwork : handleAddArtwork}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingArtwork ? '更新作品' : '添加作品'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}