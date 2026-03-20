// Save as: app/student/login/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
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
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return }
      if (data.user.role !== 'student') {
        setError('This portal is for students only. Use Faculty Login instead.')
        setLoading(false)
        return
      }
      router.push('/student/dashboard')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-nfsu-offwhite flex flex-col">
      <div className="nfsu-header-bg text-white px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/15 rounded-lg border border-nfsu-gold/40 flex items-center justify-center">⚖️</div>
            <div>
              <div className="text-xs text-white/60">NFSU</div>
              <div className="text-sm font-semibold">Projects Database</div>
            </div>
          </Link>
          <Link href="/student/register" className="text-white/60 text-sm hover:text-white transition-colors">
            New student? Register →
          </Link>
        </div>
      </div>
      <div className="gold-line" />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {registered && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4 text-center">
              ✅ Account created successfully! Please login.
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-nfsu-navy px-8 py-6 text-white text-center">
              <div className="w-14 h-14 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center text-2xl mx-auto mb-3">🎓</div>
              <h1 className="text-xl font-heading font-bold">Student Login</h1>
              <p className="text-white/65 text-sm mt-1">Access your project guidance dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="p-8">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">⚠️ {error}</div>}

              <div className="mb-5">
                <label className="form-label">NFSU Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="yourname@nfsu.ac.in" className="form-input" />
              </div>
              <div className="mb-6">
                <label className="form-label">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} required
                    placeholder="Enter your password" className="form-input pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
                {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in...</> : 'Sign In'}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Don&apos;t have an account?{' '}
                <Link href="/student/register" className="text-nfsu-blue hover:underline font-medium">Register here</Link>
              </p>
            </form>
          </div>
          <div className="text-center mt-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-nfsu-blue transition-colors">← Back to Projects Database</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentLoginPage() {
  return <Suspense><LoginForm /></Suspense>
}