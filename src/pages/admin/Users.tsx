import { useEffect, useMemo, useState } from 'react'
import { Users, UserCheck, UserX, TrendingUp, Filter, Search, MoreVertical, Mail, UserPlus, AlertCircle, Trash2 } from 'lucide-react'
import { api, mapUser } from '@/lib/api'
import type { User } from '@/types'

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    activeArtists: 0,
    pendingUsers: 0,
    inactiveUsers: 0
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const roleLabels = {
    user: '用户',
    artist: '艺术家',
    collector: '收藏家',
    gallery: '画廊',
    admin: '管理员'
  }

  const statusLabels: Record<string, string> = {
    active: '活跃',
    inactive: '非活跃',
    pending: '待审核'
  }

  const statusColors: Record<string, string> = {
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100',
    pending: 'text-yellow-600 bg-yellow-100'
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const userStatus = (user as any).status as string | undefined
      const matchesStatus = statusFilter === 'all' || userStatus === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, roleFilter, statusFilter])

  async function loadUsers() {
    setLoading(true)
    setError(null)
    try {
      const { data, pagination } = await api.adminUsers({
        page,
        limit,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      })
      const mapped = data.map(mapUser)
      setUsers(mapped)
      if (pagination?.total != null) setTotal(pagination.total)
    } catch (err: any) {
      setError(err?.message || '加载用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    try {
      const activeArtistsRes = await api.adminUsers({ limit: 1, role: 'artist', status: 'active' })
      const pendingUsersRes = await api.adminUsers({ limit: 1, status: 'pending' })
      const inactiveUsersRes = await api.adminUsers({ limit: 1, status: 'inactive' })
      setStats({
        activeArtists: activeArtistsRes.pagination?.total || 0,
        pendingUsers: pendingUsersRes.pagination?.total || 0,
        inactiveUsers: inactiveUsersRes.pagination?.total || 0,
      })
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadUsers()
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit])

  async function handleApprove(id: string) {
    setActionLoadingId(id)
    try {
      await api.adminUpdateUserStatus(id, { status: 'active', isActive: true })
      await loadUsers()
      await loadStats()
    } catch (err: any) {
      setError(err?.message || '审核用户失败')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleSuspend(id: string) {
    setActionLoadingId(id)
    try {
      await api.adminUpdateUserStatus(id, { status: 'inactive', isActive: false })
      await loadUsers()
      await loadStats()
    } catch (err: any) {
      setError(err?.message || '暂停用户失败')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确认删除该用户？此操作不可撤销。')) return
    setActionLoadingId(id)
    try {
      await api.adminDeleteUser(id)
      await loadUsers()
      await loadStats()
    } catch (err: any) {
      setError(err?.message || '删除用户失败')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-gray-600">管理系统中的所有用户</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <UserPlus className="h-4 w-4" />
            <span>添加用户</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Mail className="h-4 w-4" />
            <span>批量通知</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总用户数</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>本月活跃增长</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">活跃艺术家</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeArtists}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify_between">
            <div>
              <p className="text-sm text-gray-600">待审核用户</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingUsers}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">已暂停/非活跃</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactiveUsers}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索用户..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); loadUsers() } }}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); loadUsers() }}
            >
              <option value="all">所有角色</option>
              <option value="user">用户</option>
              <option value="artist">艺术家</option>
              <option value="collector">收藏家</option>
              <option value="gallery">画廊</option>
              <option value="admin">管理员</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); loadUsers() }}
            >
              <option value="all">所有状态</option>
              <option value="active">活跃</option>
              <option value="pending">待审核</option>
              <option value="inactive">非活跃</option>
            </select>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            <span>高级筛选</span>
          </button>
        </div>
        {error && (
          <div className="mt-4 flex items-center text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                角色
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                加入时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最后登录
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作品/订单
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td className="px-6 py-4" colSpan={7}>加载中...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td className="px-6 py-4" colSpan={7}>暂无数据</td>
              </tr>
            ) : filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-gray-600">
                        {user.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {roleLabels[user.role as keyof typeof roleLabels] || user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[((user as any).status as string)] || 'bg-gray-100 text-gray-600'}`}>
                    {statusLabels[((user as any).status as string)] || (user as any).status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="text-xs">
                    <div>作品: -</div>
                    <div>订单: -</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      查看
                    </button>
                    {((user as any).status as string) === 'pending' && (
                      <button
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        disabled={actionLoadingId === user.id}
                        onClick={() => handleApprove(user.id)}
                      >
                        审核
                      </button>
                    )}
                    {((user as any).status as string) === 'active' && (
                      <button
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        disabled={actionLoadingId === user.id}
                        onClick={() => handleSuspend(user.id)}
                      >
                        暂停
                      </button>
                    )}
                    <button
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 inline-flex items-center"
                      disabled={actionLoadingId === user.id}
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> 删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t">
          <div className="text-sm text-gray-600">共 {total} 条</div>
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => { setPage(p => Math.max(1, p - 1)); loadUsers() }}
            >上一页</button>
            <span className="text-sm">第 {page} 页</span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page * limit >= total}
              onClick={() => { setPage(p => p + 1); loadUsers() }}
            >下一页</button>
            <select
              className="px-2 py-1 border rounded"
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); loadUsers() }}
            >
              {[10, 20, 50].map(n => (
                <option key={n} value={n}>{n}/页</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}