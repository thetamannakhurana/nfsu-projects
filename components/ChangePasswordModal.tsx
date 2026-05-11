// Save as: components/ChangePasswordModal.tsx
'use client'
import { useState } from 'react'

interface Props {
  onClose: () => void
}

export default function ChangePasswordModal({ onClose }: Props) {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [show, setShow] = useState({ current: false, new: false, confirm: false })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.newPass !== form.confirm) { setError('New passwords do not match'); return }
    if (form.newPass.length < 6) { setError('New password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: form.current, new_password: form.newPass })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      setSuccess(true)
      setTimeout(() => onClose(), 2000)
    } catch {
      setError('Failed to change password. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-nfsu-navy text-lg">🔐 Change Password</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">⚠️ {error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">✅ Password changed successfully! Closing...</div>}

          {[
            { label: 'Current Password', key: 'current', showKey: 'current' },
            { label: 'New Password', key: 'newPass', showKey: 'new' },
            { label: 'Confirm New Password', key: 'confirm', showKey: 'confirm' },
          ].map(field => (
            <div key={field.key}>
              <label className="form-label">{field.label}</label>
              <div className="relative">
                <input
                  type={show[field.showKey as keyof typeof show] ? 'text' : 'password'}
                  value={form[field.key as keyof typeof form]}
                  onChange={e => set(field.key, e.target.value)}
                  required
                  placeholder={field.label}
                  className="form-input pr-10"
                />
                <button type="button"
                  onClick={() => setShow(s => ({ ...s, [field.showKey]: !s[field.showKey as keyof typeof s] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {show[field.showKey as keyof typeof show] ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading || success} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {loading ? 'Changing...' : '🔐 Change Password'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline px-4">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}