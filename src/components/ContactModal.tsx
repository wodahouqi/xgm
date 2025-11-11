import { useState } from 'react'
import { cn } from '@/utils'

export default function ContactModal({ artworkTitle, onClose, onSubmitted }: { artworkTitle: string; onClose: () => void; onSubmitted: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const valid = name.trim() && (phone.trim() || email.trim())

  async function submit() {
    if (!valid) return
    try {
      setSubmitting(true)
      // TODO: 接入后端提交预定意向接口
      setTimeout(() => {
        setSubmitting(false)
        onSubmitted()
        alert('我们已收到您的预定意向，会尽快与您联系并安排寄送。')
      }, 500)
    } catch (e) {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">留下联系方式</h3>
        <p className="text-gray-600 mb-4">我们已得知您对《{artworkTitle}》的预定意向，会在与您联系后安排寄出。</p>
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg p-2" placeholder="姓名" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg p-2" placeholder="电话（可选）" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg p-2" placeholder="邮箱（可选）" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border rounded-lg p-2" placeholder="留言（选填）" />
        </div>
        <div className="flex space-x-4 mt-4">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">取消</button>
          <button onClick={submit} disabled={!valid || submitting} className={cn('flex-1 px-4 py-2 rounded-lg', !valid || submitting ? 'bg-gray-300 text-gray-600' : 'bg-purple-600 text-white hover:bg-purple-700')}>{submitting ? '提交中...' : '提交'}</button>
        </div>
      </div>
    </div>
  )
}