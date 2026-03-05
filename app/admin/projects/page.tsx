'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Project {
  id: number; title: string; student_name: string; project_type: string;
  batch_start_year: number; batch_end_year: number; status: string; created_at: string;
  campus_name: string; course_short_name: string; degree_type: string;
}

export default function AdminProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { if (data.user.role !== 'admin') router.push('/admin/login') })
      .catch(() => router.push('/admin/login'))
    loadProjects()
  }, [])

  function loadProjects() {
    const params = new URLSearchParams({ limit: '100', ...(typeFilter && { project_type: typeFilter }), ...(search && { search }) })
    fetch(`/api/projects?${params}`)
      .then(r => r.json())
      .then(data => { setProjects(data.projects || []); setLoading(false) })
  }

  useEffect(() => { loadProjects() }, [search, typeFilter])

  async function deleteProject(id: number) {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return
    setDeleting(id)
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjects(p => p.filter(pr => pr.id !== id))
    setDeleting(null)
  }

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
            { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
            { href: '/admin/projects', label: 'Manage Projects', icon: '📁', active: true },
            { href: '/admin/users', label: 'Manage Users', icon: '👥' },
            { href: '/admin/projects/new', label: 'Add Project', icon: '➕' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                item.active ? 'bg-white/15 text-white font-medium border-l-2 border-nfsu-gold pl-[10px]' : 'text-white/65 hover:bg-white/10 hover:text-white'
              }`}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 md:ml-60">
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-heading font-semibold text-nfsu-navy">Manage Projects</h1>
            <Link href="/admin/projects/new" className="btn-gold text-sm">➕ Add Project</Link>
          </div>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="flex gap-3 mb-5 flex-wrap">
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..." className="form-input w-64 text-sm"
            />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="form-input w-40 text-sm">
              <option value="">All Types</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
            </select>
            <div className="ml-auto text-sm text-gray-500 self-center">
              {projects.length} projects
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-nfsu-blue border-t-transparent rounded-full animate-spin mx-auto" style={{ borderWidth: '3px' }} />
              </div>
            ) : projects.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">📂</p>
                <p className="text-gray-500">No projects found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Student</th>
                      <th>Campus</th>
                      <th>Course</th>
                      <th>Type</th>
                      <th>Batch</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(p => (
                      <tr key={p.id}>
                        <td>
                          <Link href={`/project/${p.id}`} className="text-nfsu-blue hover:underline text-xs font-medium">
                            {p.title.length > 45 ? p.title.slice(0, 45) + '…' : p.title}
                          </Link>
                        </td>
                        <td className="text-xs">{p.student_name}</td>
                        <td className="text-xs text-gray-500">{p.campus_name?.split(' ')[0]}</td>
                        <td>
                          <span className="badge bg-gray-100 text-gray-600 border-gray-200 text-xs">
                            {p.course_short_name}
                          </span>
                        </td>
                        <td>
                          <span className={`badge text-xs ${p.project_type === 'major' ? 'badge-major' : 'badge-minor'}`}>
                            {p.project_type}
                          </span>
                        </td>
                        <td className="text-xs">{p.batch_start_year}–{p.batch_end_year}</td>
                        <td>
                          <span className={`badge text-xs ${p.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <Link href={`/project/${p.id}`} className="text-xs text-nfsu-blue hover:underline">View</Link>
                            <button
                              onClick={() => deleteProject(p.id)}
                              disabled={deleting === p.id}
                              className="text-xs text-red-500 hover:underline disabled:opacity-50"
                            >
                              {deleting === p.id ? '…' : 'Delete'}
                            </button>
                          </div>
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
