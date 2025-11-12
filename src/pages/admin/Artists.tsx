import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Edit, Trash2, Search, Filter, Award, CheckCircle, XCircle, Clock, MoreVertical, PlusCircle } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiArtist } from '@/lib/api'

const statusOptions = [
  { value: '', label: '全部' },
  { value: 'active', label: '已激活' },
  { value: 'inactive', label: '未激活' },
  { value: 'pending', label: '待审核' },
]

function StatusBadge({ s }: { s: 'active' | 'inactive' | 'pending' }) {
  const map = {
    active: { icon: CheckCircle, cls: 'text-green-600 bg-green-50', label: '已激活' },
    inactive: { icon: XCircle, cls: 'text-red-600 bg-red-50', label: '未激活' },
    pending: { icon: Clock, cls: 'text-yellow-600 bg-yellow-50', label: '待审核' },
  } as const
  const I = map[s].icon
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${map[s].cls}`}>
      <I className="h-4 w-4 mr-1" />{map[s].label}
    </span>
  )
}

export default function AdminArtists() {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<ApiArtist[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [status, setStatusFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ApiArtist | null>(null)
  const [form, setForm] = useState<{ name: string; bio?: string; location?: string; status?: 'active' | 'inactive' | 'pending'; isActive?: boolean }>({ name: '', bio: '', location: '', status: 'active', isActive: true })

  async function load() {
    setLoading(true)
    try {
      const res = await api.adminArtists({ page, limit, status: (status || undefined) as any, search: search || undefined })
      setList(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, limit, status])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return list.filter(a => !keyword || a.name.toLowerCase().includes(keyword) || (a.bio || '').toLowerCase().includes(keyword) || (a.location || '').toLowerCase().includes(keyword))
  }, [list, search])

  function openCreate() {
    setEditing(null)
    setForm({ name: '', bio: '', location: '', status: 'active', isActive: true })
    setShowForm(true)
  }

  function openEdit(a: ApiArtist) {
    setEditing(a)
    setForm({ name: a.name, bio: a.bio || '', location: a.location || '', status: a.status as any, isActive: a.isActive })
    setShowForm(true)
  }

  async function submit() {
    const payload = { ...form, status: form.status || 'active' }
    if (!payload.name) return
    if (editing) {
      await api.updateArtist(editing.id, payload as any)
    } else {
      await api.createArtist(payload as any)
    }
    setShowForm(false)
    await load()
  }

  async function remove(id: string) {
    await api.deleteArtist(id)
    await load()
  }

  async function updateStatus(id: string, s: 'active' | 'inactive' | 'pending') {
    await api.updateArtistStatus(id, s)
    await load()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Award className="h-6 w-6 text-indigo-600" />
          <h2 className="text-2xl font-semibold">艺术家管理</h2>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" onClick={openCreate}>
          <PlusCircle className="h-5 w-5 mr-2" />新增艺术家
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center px-3 py-2 border rounded-md">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <input className="w-full outline-none" placeholder="搜索姓名/简介/城市" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center px-3 py-2 border rounded-md">
          <Filter className="h-4 w-4 text-gray-400 mr-2" />
          <select className="w-full" value={status} onChange={(e) => setStatusFilter(e.target.value)}>
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex items-center px-3 py-2 border rounded-md">
          <span className="text-gray-500">每页</span>
          <select className="ml-2" value={limit} onChange={e => setLimit(Number(e.target.value))}>
            {[10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-end text-sm text-gray-500">{loading ? '加载中...' : `共 ${filtered.length} 位`}</div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-3">姓名</th>
              <th className="px-4 py-3">简介</th>
              <th className="px-4 py-3">城市</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">作品数</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <img src={a.avatar || 'https://picsum.photos/seed/artist-admin/80/80'} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-gray-500">{a.createdAt?.slice(0,10)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 truncate max-w-[320px]">{a.bio || '-'}</td>
                <td className="px-4 py-3">{a.location || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <StatusBadge s={a.status as any} />
                    <select className="text-sm border rounded px-1 py-0.5" value={a.status} onChange={e => updateStatus(a.id, e.target.value as any)}>
                      {statusOptions.filter(o=>o.value).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </td>
                <td className="px-4 py-3">{a.totalArtworks || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <button className="inline-flex items-center px-3 py-1 border rounded hover:bg-gray-50" onClick={() => openEdit(a)}>
                      <Edit className="h-4 w-4 mr-1" />编辑
                    </button>
                    <Link to={`/artists/${a.id}`} className="inline-flex items-center px-3 py-1 border rounded hover:bg-gray-50">
                      详情
                    </Link>
                    <button className="inline-flex items-center px-3 py-1 border rounded hover:bg-red-50 text-red-600" onClick={() => remove(a.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-xl p-6">
            <h3 className="text-lg font-semibold mb-4">{editing ? '编辑艺术家' : '新增艺术家'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">姓名</label>
                <input className="w-full border rounded px-3 py-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">简介</label>
                <textarea className="w-full border rounded px-3 py-2" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">城市</label>
                  <input className="w-full border rounded px-3 py-2" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">状态</label>
                  <select className="w-full border rounded px-3 py-2" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                    {statusOptions.filter(o=>o.value).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button className="px-4 py-2 border rounded" onClick={() => setShowForm(false)}>取消</button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={submit}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
