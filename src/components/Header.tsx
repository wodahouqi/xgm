import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react'
import { useStore } from '@/stores'
import { cn } from '@/utils'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { currentUser, cart, isAuthenticated, setCurrentUser } = useStore()
  const navigate = useNavigate()
  const logoUrl = (import.meta as any).env?.VITE_LOGO_URL || '/logo.png'

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleLogout = () => {
    try {
      localStorage.removeItem('auth.token')
      localStorage.removeItem('auth.refresh')
    } catch {}
    setCurrentUser(null)
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={logoUrl}
              alt="Logo"
              className="h-6 sm:h-8 w-auto object-contain"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement
                img.src = '/favicon.svg'
              }}
            />
            <span className="text-lg sm:text-xl font-bold text-gray-900">艺术品预订</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
              首页
            </Link>
            <Link to="/artworks" className="text-gray-700 hover:text-purple-600 transition-colors">
              艺术品
            </Link>
            <Link to="/artists" className="text-gray-700 hover:text-purple-600 transition-colors">
              艺术家
            </Link>
            <Link to="/booking" className="text-gray-700 hover:text-purple-600 transition-colors">
              预订
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center space-x-3 sm:space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索艺术品..."
                className="w-48 sm:w-64 pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              />
              <Search className="absolute left-2.5 sm:left-3 top-1.5 sm:top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            
            {/* Cart */}
            <button
              onClick={() => navigate('/booking')}
              className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-purple-600 transition-colors">
                  <User className="h-6 w-6" />
                  <span className="text-sm">{currentUser?.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    to="/user-center"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                  >
                    个人中心
                  </Link>
                  {currentUser?.role === 'artist' && (
                    <Link
                      to="/artist-dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      艺术家后台
                    </Link>
                  )}
                  {currentUser?.role === 'admin' && (
                    <Link
                      to="/admin-dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      管理后台
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-purple-600 transition-colors"
          >
            {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={cn('lg:hidden', isMenuOpen ? 'block' : 'hidden')}>
          <nav className="py-2 sm:py-4 space-y-1 sm:space-y-2">
            <Link
              to="/"
              className="block px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-purple-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              首页
            </Link>
            <Link
              to="/artworks"
              className="block px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-purple-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              艺术品
            </Link>
            <Link
              to="/artists"
              className="block px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-purple-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              艺术家
            </Link>
            <Link
              to="/booking"
              className="block px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-purple-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              预订
            </Link>
            {!isAuthenticated && (
              <div className="flex space-x-2 px-3 sm:px-4 py-2">
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  注册
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
