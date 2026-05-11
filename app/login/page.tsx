'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UnifiedLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [checking, setChecking] = useState(true)

  // If already logged in, redirect to correct dashboard
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.user) {
        const role = data.user.role
        if (role === 'admin') window.location.href = '/admin/dashboard'
        else if (role === 'faculty') window.location.href = '/faculty/dashboard'
        else if (role === 'student') window.location.href = '/student/dashboard'
      }
      setChecking(false)
    }).catch(() => setChecking(false))
  }, [])

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
      const role = data.user.role
      if (role === 'admin') window.location.href = '/admin/dashboard'
      else if (role === 'faculty') window.location.href = '/faculty/dashboard'
      else if (role === 'student') window.location.href = '/student/dashboard'
      else { setError('Unknown role. Contact administrator.'); setLoading(false) }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #001833 0%, #002244 50%, #003366 100%)' }}>
      <div className="w-8 h-8 border-4 border-nfsu-gold/40 border-t-nfsu-gold rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #001833 0%, #002244 50%, #003366 100%)' }}>

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12 border-r border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl border border-nfsu-gold/40 flex items-center justify-center text-xl">⚖️</div>
          <div>
            <div className="text-white font-semibold text-sm">NFSU Projects Database</div>
            <div className="text-white/40 text-xs">National Forensic Sciences University</div>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-heading font-bold text-white leading-tight mb-4">
            Student Project<br />Repository
          </h1>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Official academic project repository of NFSU. Access is restricted to NFSU students, faculty, and administrators only.
          </p>
          <div className="space-y-3">
            {[
              { icon: '🎓', label: 'Students', desc: 'Submit guidance requests & track project progress' },
              { icon: '👨‍🏫', label: 'Faculty', desc: 'Review requests, guide students & manage projects' },
              { icon: '🛡️', label: 'Admins', desc: 'Manage users, courses & the entire repository' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                <span className="text-lg mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/25 text-xs">
          © {new Date().getFullYear()} NFSU · Created & Managed by Tamanna Khurana
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-white/10 rounded-xl border border-nfsu-gold/40 flex items-center justify-center text-xl">⚖️</div>
            <div>
              <div className="text-white font-semibold text-sm">NFSU Projects Database</div>
              <div className="text-white/40 text-xs">National Forensic Sciences University</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-white">Sign In</h2>
            <p className="text-white/50 text-sm mt-1">Use your NFSU email address and password</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">NFSU Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="yourname@nfsu.ac.in" autoComplete="email"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nfsu-gold/60 focus:bg-white/15 transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} required
                    placeholder="Enter your password" autoComplete="current-password"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-nfsu-gold/60 focus:bg-white/15 transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 text-sm">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #C8972A, #E8A820)', color: 'white' }}>
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in...</>
                  : '🔐 Sign In'
                }
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">New student?{' '}
              <a href="/student/register" className="text-nfsu-amber hover:text-white transition-colors font-medium">
                Register here
              </a>
            </p>
            <p className="text-white/25 text-xs mt-3">
              Access restricted to @nfsu.ac.in accounts only
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}