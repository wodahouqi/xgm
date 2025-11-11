import { ReactNode, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '@/stores'
import { api, mapUser } from '@/lib/api'

interface RequireRoleProps {
  role: 'admin' | 'artist' | 'user'
  children: ReactNode
}

export default function RequireRole({ role, children }: RequireRoleProps) {
  const { currentUser, isAuthenticated, setCurrentUser } = useStore()
  const location = useLocation()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let canceled = false
    async function hydrateUser() {
      try {
        const token = localStorage.getItem('auth.token')
        // 当直接刷新或直达受保护页面时，尝试使用 token 拉取用户信息
        if (token && (!currentUser || !isAuthenticated)) {
          const user = await api.profile()
          if (!canceled && user) {
            setCurrentUser(mapUser(user))
          }
        }
      } catch {
        // 拉取失败则后续走登录重定向
      } finally {
        if (!canceled) setChecking(false)
      }
    }
    hydrateUser()
    return () => { canceled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 等待权限校验完成，避免持久化未完成导致的误跳转
  if (checking) {
    return <div className="p-8 text-center text-gray-600">正在验证权限...</div>
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (currentUser.role !== role) {
    // 非权限用户统一跳转首页，避免暴露后台路径
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}