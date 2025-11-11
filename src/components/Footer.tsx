import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">艺</span>
              </div>
              <span className="text-xl font-bold">艺术品预订</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              专业的艺术品展示和预订平台，连接艺术家与艺术爱好者，提供安全可靠的交易环境，促进艺术市场的发展。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/artworks" className="text-gray-300 hover:text-white transition-colors">
                  艺术品
                </Link>
              </li>
              <li>
                <Link to="/artists" className="text-gray-300 hover:text-white transition-colors">
                  艺术家
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-gray-300 hover:text-white transition-colors">
                  预订服务
                </Link>
              </li>
              <li>
                <Link to="/user-center" className="text-gray-300 hover:text-white transition-colors">
                  用户中心
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">联系我们</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-300" />
                <span className="text-gray-300">contact@artbooking.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-300" />
                <span className="text-gray-300">400-123-4567</span>
              </li>
              <li className="text-gray-300">
                工作时间：周一至周五 9:00-18:00
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2024 艺术品预订平台. 保留所有权利.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors">
              隐私政策
            </Link>
            <Link to="/terms" className="text-gray-300 hover:text-white text-sm transition-colors">
              服务条款
            </Link>
            <Link to="/help" className="text-gray-300 hover:text-white text-sm transition-colors">
              帮助中心
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}