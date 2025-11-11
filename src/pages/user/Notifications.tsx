import { useState } from 'react'
import { Bell, Mail, Smartphone, Volume2, Settings } from 'lucide-react'

export default function UserNotifications() {
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      orderUpdates: true,
      newArtworks: true,
      artistMessages: true,
      promotions: false,
      systemUpdates: true
    },
    sms: {
      orderUpdates: true,
      newArtworks: false,
      artistMessages: false,
      promotions: false,
      systemUpdates: false
    },
    push: {
      orderUpdates: true,
      newArtworks: true,
      artistMessages: true,
      promotions: false,
      systemUpdates: true
    }
  })

  const [notificationHistory, setNotificationHistory] = useState([
    {
      id: '1',
      type: 'order',
      title: '订单状态更新',
      content: '您的订单 #ORD20241201001 已确认，预计3天内发货',
      time: '2小时前',
      isRead: true
    },
    {
      id: '2',
      type: 'artwork',
      title: '新作品上架',
      content: '您关注的艺术家 张三 发布了新作品《秋日印象》',
      time: '1天前',
      isRead: true
    },
    {
      id: '3',
      type: 'system',
      title: '系统维护通知',
      content: '系统将于今晚22:00-24:00进行维护，期间可能影响正常使用',
      time: '2天前',
      isRead: false
    }
  ])

  const handleSettingChange = (channel: 'email' | 'sms' | 'push', type: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: !prev[channel][type as keyof typeof prev.email]
      }
    }))
  }

  const markAsRead = (id: string) => {
    setNotificationHistory(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    )
  }

  const clearAllHistory = () => {
    setNotificationHistory([])
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦'
      case 'artwork':
        return '🎨'
      case 'system':
        return '⚙️'
      case 'promotion':
        return '🎁'
      default:
        return '🔔'
    }
  }

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="h-5 w-5 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">通知设置</h2>
        </div>

        <div className="space-y-6">
          {/* Email Notifications */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Mail className="h-4 w-4 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">邮件通知</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(notificationSettings.email).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">
                    {key === 'orderUpdates' && '订单更新'}
                    {key === 'newArtworks' && '新作品上架'}
                    {key === 'artistMessages' && '艺术家消息'}
                    {key === 'promotions' && '促销活动'}
                    {key === 'systemUpdates' && '系统更新'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleSettingChange('email', key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* SMS Notifications */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Smartphone className="h-4 w-4 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">短信通知</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(notificationSettings.sms).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">
                    {key === 'orderUpdates' && '订单更新'}
                    {key === 'newArtworks' && '新作品上架'}
                    {key === 'artistMessages' && '艺术家消息'}
                    {key === 'promotions' && '促销活动'}
                    {key === 'systemUpdates' && '系统更新'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleSettingChange('sms', key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Push Notifications */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Volume2 className="h-4 w-4 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">推送通知</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(notificationSettings.push).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">
                    {key === 'orderUpdates' && '订单更新'}
                    {key === 'newArtworks' && '新作品上架'}
                    {key === 'artistMessages' && '艺术家消息'}
                    {key === 'promotions' && '促销活动'}
                    {key === 'systemUpdates' && '系统更新'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleSettingChange('push', key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification History */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">通知历史</h2>
          </div>
          <button
            onClick={clearAllHistory}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            清空历史
          </button>
        </div>

        <div className="space-y-4">
          {notificationHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>暂无通知记录</p>
            </div>
          ) : (
            notificationHistory.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-4 border rounded-lg cursor-pointer transition-colors',
                  notification.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                    {!notification.isRead && (
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}