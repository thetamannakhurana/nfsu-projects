'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Stats {
  totalProjects: number
  byType: { project_type: string; count: string }[]
  byCampus: { name: string; code: string; count: string }[]
  recentProjects: { id: number; title: string; student_name: string; project_type: string; created_at: string; campus_name: string }[]
  users: { total: number; byRole: { role: string; count: string }[] }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'users'>('overview')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.user.role !== 'admin') { router.push('/login'); return }
        setUser(data.user)
        return fetch('/api/admin/stats')
      })
      .then(r => r?.json())
      .then(data => { if (data) setStats(data); setLoading(false) })
      .catch(() => router.push('/admin/login'))
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-nfsu-offwhite flex items-center justify-center">
      <div className="w-8 h-8 border-nfsu-blue border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
    </div>
  )

  const majorCount = stats?.byType.find(b => b.project_type === 'major')?.count || 0
  const minorCount = stats?.byType.find(b => b.project_type === 'minor')?.count || 0
  const adminCount = stats?.users.byRole.find(r => r.role === 'admin')?.count || 0
  const facultyCount = stats?.users.byRole.find(r => r.role === 'faculty')?.count || 0

  return (
    <div className="min-h-screen bg-nfsu-offwhite flex">
      {/* Sidebar */}
      <aside className="w-60 bg-nfsu-navy flex flex-col fixed h-full z-20 hidden md:flex">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/10 rounded-xl border border-nfsu-gold/40 flex items-center justify-center text-base">⚖️</div>
            <div>
              <div className="text-xs text-white/50">NFSU Admin</div>
              <div className="text-sm font-semibold text-white">Projects Database</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {[
            { href: '/admin/dashboard', label: 'Dashboard', icon: '📊', active: true },
            { href: '/admin/projects', label: 'Manage Projects', icon: '📁' },
            { href: '/admin/users', label: 'Manage Users', icon: '👥' },
            { href: '/admin/projects/new', label: 'Add Project', icon: '➕' },
            { href: '/', label: 'View Public Site', icon: '🌐' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                item.active
                  ? 'bg-white/15 text-white font-medium border-l-2 border-nfsu-gold pl-[10px]'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              }`}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-white/10 w-full transition-all">
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-60">
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-heading font-semibold text-nfsu-navy">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">NFSU Projects Database Management</p>
            </div>
            <Link href="/admin/projects/new" className="btn-gold text-sm">
              ➕ Add Project
            </Link>
          </div>
        </div>

        <div className="p-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Projects', value: stats?.totalProjects || 0, icon: '📁', sub: 'All statuses' },
              { label: 'Major Projects', value: majorCount, icon: '⭐' },
              { label: 'Minor Projects', value: minorCount, icon: '📌' },
              { label: 'Total Users', value: stats?.users.total || 0, icon: '👥', sub: `${adminCount} admin · ${facultyCount} faculty` },
            ].map(s => (
              <div key={s.label} className="stat-card bg-white rounded-xl shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-heading font-bold text-nfsu-navy">{s.value}</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">{s.label}</p>
                    <p className="text-xs text-gray-400">{s.sub}</p>
                  </div>
                  <span className="text-2xl">{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Projects by campus */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Projects by Campus</h2>
              </div>
              <div className="p-4">
                {stats?.byCampus.filter(c => parseInt(c.count) > 0).map(campus => (
                  <div key={campus.code} className="flex items-center gap-3 py-2">
                    <div className="text-xs text-gray-500 w-32 truncate">{campus.name}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (parseInt(campus.count) / (stats?.totalProjects || 1)) * 100)}%`,
                          background: 'linear-gradient(90deg, #003366, #0057A8)'
                        }}
                      />
                    </div>
                    <div className="text-xs font-medium text-nfsu-navy w-6 text-right">{campus.count}</div>
                  </div>
                ))}
                {!stats?.byCampus.filter(c => parseInt(c.count) > 0).length && (
                  <p className="text-gray-400 text-sm text-center py-4">No data yet</p>
                )}
              </div>
            </div>

            {/* Recent additions */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent Projects</h2>
                <Link href="/admin/projects" className="text-xs text-nfsu-blue">All →</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {stats?.recentProjects.map(p => (
                  <div key={p.id} className="px-4 py-3">
                    <Link href={`/project/${p.id}`} className="text-xs font-medium text-nfsu-navy hover:text-nfsu-blue line-clamp-1">
                      {p.title}
                    </Link>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">{p.student_name}</span>
                      <span className={`badge text-xs ${p.project_type === 'major' ? 'badge-major' : 'badge-minor'}`}>
                        {p.project_type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
                {!stats?.recentProjects.length && (
                  <p className="text-gray-400 text-sm text-center py-8">No projects yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-6 bg-nfsu-navy rounded-xl p-5 text-white">
            <h3 className="font-heading font-semibold mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/projects/new" className="btn-gold text-sm">➕ Add Project</Link>
              <Link href="/admin/users" className="bg-white/15 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition-colors">👥 Manage Users</Link>
              <Link href="/admin/projects" className="bg-white/15 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition-colors">📁 All Projects</Link>
              <Link href="/" className="bg-white/10 text-white/70 px-4 py-2 rounded-lg text-sm hover:bg-white/15 transition-colors">🌐 Public Site</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
