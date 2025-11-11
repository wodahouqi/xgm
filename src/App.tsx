import { Toaster } from 'sonner'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import Routes from './routes'
import { cn } from './utils'

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">艺术品预订</h1>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Mobile menu */}
            <div className={cn(
              mobileMenuOpen ? 'block' : 'hidden',
              'lg:hidden bg-white border-b'
            )}>
              <div className="pt-2 pb-3 space-y-1">
                <a
                  href="/"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  首页
                </a>
                <a
                  href="/artworks"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  艺术品
                </a>
                <a
                  href="/artists"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  艺术家
                </a>
                <a
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  登录
                </a>
              </div>
            </div>
          </nav>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">艺术品预订</h1>
              </div>
              <div className="flex items-center space-x-8">
                <a href="/" className="text-gray-700 hover:text-gray-900 font-medium">
                  首页
                </a>
                <a href="/artworks" className="text-gray-700 hover:text-gray-900 font-medium">
                  艺术品
                </a>
                <a href="/artists" className="text-gray-700 hover:text-gray-900 font-medium">
                  艺术家
                </a>
                <a href="/login" className="text-gray-700 hover:text-gray-900 font-medium">
                  登录
                </a>
              </div>
            </div>
          </div>
        </nav>

        <Routes />
        <Toaster position="top-right" />
      </div>
  )
}

export default App
