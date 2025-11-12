import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Palette, Eye, Edit, Trash2, Search, Filter, Image, CheckCircle, XCircle, Clock, MoreVertical, PlusCircle } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiArtist } from '@/lib/api'
import type { ApiArtwork } from '@/lib/api'

export default function AdminArtworks() {
  const [artworks, setArtworks] = useState<ApiArtwork[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(9)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'reserved' | 'sold' | 'hidden'>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newArtwork, setNewArtwork] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    artistId: '',
    type: 'painting',
  })
  const [uploadedMain, setUploadedMain] = useState<File | null>(null)
  const [uploadedGallery, setUploadedGallery] = useState<File[]>([])
  const [artistOptions, setArtistOptions] = useState<ApiArtist[]>([])
  const [categoryOptions, setCategoryOptions] = useState<{ id: string; name: string }[]>([])

  const statusLabels: Record<'available' | 'reserved' | 'sold' | 'hidden', string> = {
    available: '在售',
    reserved: '已预留',
    sold: '已售出',
    hidden: '已隐藏'
  }
  const statusColors: Record<'available' | 'reserved' | 'sold' | 'hidden', string> = {
    available: 'text-green-600 bg-green-100',
    reserved: 'text-yellow-600 bg-yellow-100',
    sold: 'text-red-600 bg-red-100',
    hidden: 'text-gray-600 bg-gray-100'
  }

  async function loadArtworks() {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, any> = { page, limit }
      if (searchTerm.trim()) params.search = searchTerm.trim()
      if (statusFilter !== 'all') params.status = statusFilter
      if (categoryFilter !== 'all') params.category = categoryFilter
      const { data, pagination } = await api.adminArtworks(params)
      setArtworks(data)
      setTotalPages(pagination?.totalPages || 1)
    } catch (e: any) {
      setError(e?.message || '加载作品失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArtworks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter, categoryFilter])

  useEffect(() => {
    // Fetch artists for selection when opening create modal
    (async () => {
      try {
        const artists = await api.artists({ limit: 50 })
        setArtistOptions(artists)
      } catch (e) {
        console.warn('加载艺术家列表失败', e)
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const categories = await api.categories(50)
        setCategoryOptions(categories.map(c => ({ id: c.id, name: c.name })))
      } catch {}
    })()
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadArtworks()
  }

  async function handleUpdateStatus(id: string, status: 'available' | 'reserved' | 'sold' | 'hidden') {
    setLoading(true)
    try {
      await api.adminUpdateArtworkStatus(id, status)
      await loadArtworks()
    } catch (e) {
      console.error('更新作品状态失败', e)
      setError('更新作品状态失败')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确认删除该作品？')) return
    setLoading(true)
    try {
      await api.adminDeleteArtwork(id)
      await loadArtworks()
    } catch (e) {
      console.error('删除作品失败', e)
      setError('删除作品失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">作品管理</h1>
          <p className="text-gray-600">管理平台上的所有艺术品</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <PlusCircle className="h-4 w-4" />
            <span>新增作品</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <Image className="h-4 w-4" />
            <span>批量审核</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Palette className="h-4 w-4" />
            <span>分类管理</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索作品或艺术家..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
            >
              <option value="all">所有分类</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">所有状态</option>
              <option value="available">在售</option>
              <option value="reserved">已预留</option>
              <option value="sold">已售出</option>
              <option value="hidden">已隐藏</option>
            </select>
            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">搜索</button>
          </form>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            <span>高级筛选</span>
          </button>
        </div>
      </div>

      {/* List */}
      {loading && (
        <div className="text-center text-gray-600">加载中...</div>
      )}
      {error && (
        <div className="text-center text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((artwork) => (
          <div key={artwork.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative">
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full h-48 object-cover"
              />
              {artwork.isFeatured && (
                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                  推荐
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusColors[artwork.status]}`}>
                  {statusLabels[artwork.status]}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{artwork.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{artwork.artist?.name || ''}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-red-600">¥{Number(artwork.price || 0).toLocaleString()}</span>
                <span className="text-xs text-gray-500">{artwork.category?.name || ''}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{artwork.viewCount} 浏览</span>
                <span>{artwork.reviewCount} 评论</span>
                <span>{new Date(artwork.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link to={`/artworks/${artwork.id}`} className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  <Eye className="inline h-4 w-4 mr-1" /> 查看
                </Link>
                <button onClick={() => handleUpdateStatus(artwork.id, 'available')} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  <CheckCircle className="inline h-4 w-4 mr-1" /> 设为在售
                </button>
                <button onClick={() => handleUpdateStatus(artwork.id, 'reserved')} className="px-3 py-2 border border-yellow-300 text-yellow-600 rounded-lg hover:bg-yellow-50 text-sm">
                  <Clock className="inline h-4 w-4 mr-1" /> 预留
                </button>
                <button onClick={() => handleUpdateStatus(artwork.id, 'sold')} className="px-3 py-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-50 text-sm">
                  <CheckCircle className="inline h-4 w-4 mr-1" /> 标记售出
                </button>
                <button onClick={() => handleUpdateStatus(artwork.id, 'hidden')} className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                  <XCircle className="inline h-4 w-4 mr-1" /> 隐藏
                </button>
                <button onClick={() => handleDelete(artwork.id)} className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm">
                  <Trash2 className="inline h-4 w-4 mr-1" /> 删除
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  <Edit className="inline h-4 w-4 mr-1" /> 编辑
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  <MoreVertical className="inline h-4 w-4 mr-1" /> 更多
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">第 {page} / {totalPages} 页</div>
        <div className="space-x-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50">上一页</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50">下一页</button>
          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }} className="px-3 py-2 border border-gray-300 rounded-lg">
            <option value={6}>每页 6</option>
            <option value={9}>每页 9</option>
            <option value={12}>每页 12</option>
          </select>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">新增作品</h2>
              <button className="text-gray-600" onClick={() => setShowCreate(false)}>关闭</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">作品标题</label>
                  <input
                    value={newArtwork.title}
                    onChange={e => setNewArtwork(a => ({ ...a, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">价格（元）</label>
                  <input
                    type="number"
                    value={newArtwork.price}
                    onChange={e => setNewArtwork(a => ({ ...a, price: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">库存</label>
                  <input
                    type="number"
                    value={newArtwork.stock}
                    onChange={e => setNewArtwork(a => ({ ...a, stock: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">分类</label>
                  <select
                    value={newArtwork.categoryId}
                    onChange={e => setNewArtwork(a => ({ ...a, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">选择分类</option>
                    {categoryOptions.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">艺术家</label>
                  <select
                    value={newArtwork.artistId}
                    onChange={e => setNewArtwork(a => ({ ...a, artistId: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">选择艺术家</option>
                    {artistOptions.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">作品描述</label>
                <textarea
                  value={newArtwork.description}
                  onChange={e => setNewArtwork(a => ({ ...a, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              {/* Upload main image */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">主图上传</label>
                <input type="file" accept="image/*" onChange={e => setUploadedMain(e.target.files?.[0] || null)} />
              </div>

              {/* Upload gallery images */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">图集上传（可选，最多 5 张）</label>
                <input type="file" accept="image/*" multiple onChange={e => setUploadedGallery(Array.from(e.target.files || []).slice(0, 5))} />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-3">
              <button className="px-4 py-2 border rounded-lg" onClick={() => setShowCreate(false)}>取消</button>
              <button
                disabled={creating}
                onClick={async () => {
                  if (!newArtwork.title || !newArtwork.price || !newArtwork.stock || !uploadedMain || !newArtwork.artistId) {
                    alert('请填写必填项（标题、价格、库存、艺术家）并上传主图')
                    return
                  }
                  try {
                    setCreating(true)
                    const mainRes = await api.uploadImage(uploadedMain)
                    let galleryUrls: string[] = []
                    if (uploadedGallery.length > 0) {
                      const files = await api.uploadImages(uploadedGallery)
                      galleryUrls = files.map(f => f.url)
                    }
                    await api.createArtwork({
                      title: newArtwork.title,
                      description: newArtwork.description || undefined,
                      imageUrl: mainRes.url,
                      additionalImages: galleryUrls.join(','),
                      price: Number(newArtwork.price),
                      stock: Number(newArtwork.stock),
                      categoryId: newArtwork.categoryId || undefined,
                      artistId: newArtwork.artistId,
                      type: 'painting',
                    })
                    setShowCreate(false)
                    setNewArtwork({ title: '', description: '', price: '', stock: '', categoryId: '', artistId: '', type: 'painting' })
                    setUploadedMain(null)
                    setUploadedGallery([])
                    await loadArtworks()
                  } catch (e: any) {
                    alert(e?.message || '创建作品失败')
                  } finally {
                    setCreating(false)
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {creating ? '创建中...' : '创建作品'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
