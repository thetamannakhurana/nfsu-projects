'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
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

      if (data.user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/faculty/dashboard')
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-nfsu-offwhite flex flex-col">
      {/* Header */}
      <div className="nfsu-header-bg text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-lg border border-nfsu-gold/40 flex items-center justify-center text-lg">⚖️</div>
            <div>
              <div className="text-xs text-white/60 leading-none">National Forensic Sciences University</div>
              <div className="text-sm font-semibold leading-snug">NFSU Projects Database</div>
            </div>
          </Link>
          <Link href="/admin/login" className="text-white/60 text-sm hover:text-white transition-colors">
            Admin Login →
          </Link>
        </div>
      </div>
      <div className="gold-line" />

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Form header */}
            <div className="bg-nfsu-navy px-8 py-6 text-white text-center">
              <div className="w-14 h-14 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center text-2xl mx-auto mb-3">
                👩‍🏫
              </div>
              <h1 className="text-xl font-heading font-bold">Faculty Login</h1>
              <p className="text-white/65 text-sm mt-1">Sign in to add and manage student projects</p>
            </div>

            <form onSubmit={handleLogin} className="p-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
                  ⚠️ {error}
                </div>
              )}

              <div className="mb-5">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="your.email@nfsu.ac.in"
                  className="form-input"
                  autoComplete="email"
                />
              </div>

              <div className="mb-6">
                <label className="form-label">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="form-input pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>

              <p className="text-center text-sm text-gray-500 mt-5">
                Contact your admin if you don't have an account
              </p>
            </form>
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-nfsu-blue transition-colors">
              ← Back to Projects Database
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
