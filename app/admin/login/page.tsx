'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      if (data.user.role !== 'admin') {
        setError('This portal is for administrators only. Use Faculty Login instead.')
        setLoading(false)
        return
      }

      router.push('/admin/dashboard')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #001833 0%, #002244 50%, #003366 100%)' }}>
      {/* Top bar */}
      <div className="px-6 py-3 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg border border-nfsu-gold/40 flex items-center justify-center text-base">⚖️</div>
            <span className="text-white/80 text-sm">NFSU Projects Database</span>
          </Link>
          <Link href="/login" className="text-white/50 text-sm hover:text-white transition-colors">
            Faculty Login
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo area */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white/10 rounded-2xl border-2 border-nfsu-gold/50 flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl">
              🛡️
            </div>
            <h1 className="text-2xl font-heading font-bold text-white">Admin Portal</h1>
            <p className="text-white/50 text-sm mt-1">National Forensic Sciences University</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-5">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-white/70 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@nfsu.ac.in"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-nfsu-gold/60 focus:bg-white/15 transition-all"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter admin password"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-nfsu-gold/60 focus:bg-white/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 text-sm"
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #C8972A, #E8A820)', color: 'white' }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>🔐 Sign In as Admin</>
                )}
              </button>
            </form>
          </div>

          <div className="text-center mt-4 space-y-2">
            <Link href="/" className="block text-sm text-white/40 hover:text-white/70 transition-colors">
              ← Back to Projects Database
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
