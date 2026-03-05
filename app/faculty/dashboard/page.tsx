'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface User { name: string; email: string; role: string; campusId: number }
interface Project { id: number; title: string; student_name: string; project_type: string; batch_start_year: number; batch_end_year: number; status: string; created_at: string; campus_name: string }

export default function FacultyDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check session
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setUser(data.user)
        if (data.user.role === 'admin') router.push('/admin/dashboard')
        // Load projects added by this user (we'll just fetch all for now filtered server-side)
        return fetch('/api/projects?limit=50')
      })
      .then(r => r.json())
      .then(data => { setProjects(data.projects || []); setLoading(false) })
      .catch(() => { router.push('/login') })
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-nfsu-offwhite flex items-center justify-center">
      <div className="w-8 h-8 border-nfsu-blue border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
    </div>
  )

  return (
    <div className="min-h-screen bg-nfsu-offwhite flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20 hidden md:flex">
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-nfsu-navy rounded-lg flex items-center justify-center text-sm text-white">⚖️</div>
            <div>
              <div className="text-xs text-gray-400 leading-none">NFSU</div>
              <div className="text-sm font-semibold text-nfsu-navy leading-snug">Projects DB</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <a href="/faculty/dashboard" className="sidebar-link active">
            <span>📊</span> Dashboard
          </a>
          <Link href="/faculty/projects/new" className="sidebar-link">
            <span>➕</span> Add Project
          </Link>
          <Link href="/" className="sidebar-link">
            <span>🏛️</span> Browse Projects
          </Link>
          <Link href="/search" className="sidebar-link">
            <span>🔍</span> Search
          </Link>
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-gray-100">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="sidebar-link text-red-500 hover:bg-red-50 w-full mt-1">
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-60">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-heading font-semibold text-nfsu-navy">Faculty Dashboard</h1>
              <p className="text-xs text-gray-500">Welcome back, {user?.name?.split(' ')[0]}</p>
            </div>
            <Link href="/faculty/projects/new" className="btn-primary text-sm">
              ➕ Add New Project
            </Link>
          </div>
        </div>

        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Projects', value: projects.length, icon: '📁', color: 'border-blue-400' },
              { label: 'Major Projects', value: projects.filter(p => p.project_type === 'major').length, icon: '⭐', color: 'border-amber-400' },
              { label: 'Minor Projects', value: projects.filter(p => p.project_type === 'minor').length, icon: '📌', color: 'border-nfsu-blue' },
              { label: 'Published', value: projects.filter(p => p.status === 'published').length, icon: '✅', color: 'border-green-400' },
            ].map(s => (
              <div key={s.label} className={`stat-card bg-white rounded-xl p-4 border-l-4 ${s.color} shadow-sm`} style={{ borderLeftColor: undefined }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-heading font-bold text-nfsu-navy">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                  <span className="text-xl">{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Projects table */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Projects</h2>
              <Link href="/search" className="text-sm text-nfsu-blue hover:underline">View all →</Link>
            </div>
            {projects.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">📂</div>
                <p className="text-gray-600">No projects yet</p>
                <Link href="/faculty/projects/new" className="btn-primary mt-4 inline-flex">
                  Add Your First Project
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Project Title</th>
                      <th>Student</th>
                      <th>Type</th>
                      <th>Batch</th>
                      <th>Status</th>
                      <th>Date Added</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.slice(0, 20).map(p => (
                      <tr key={p.id}>
                        <td>
                          <Link href={`/project/${p.id}`} className="text-nfsu-blue hover:underline font-medium text-xs">
                            {p.title.length > 50 ? p.title.slice(0, 50) + '…' : p.title}
                          </Link>
                        </td>
                        <td className="text-xs">{p.student_name}</td>
                        <td>
                          <span className={`badge text-xs ${p.project_type === 'major' ? 'badge-major' : 'badge-minor'}`}>
                            {p.project_type}
                          </span>
                        </td>
                        <td className="text-xs">{p.batch_start_year}–{p.batch_end_year}</td>
                        <td>
                          <span className={`badge text-xs ${p.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="text-xs text-gray-400">
                          {new Date(p.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td>
                          <Link href={`/project/${p.id}`} className="text-xs text-nfsu-blue hover:underline">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
