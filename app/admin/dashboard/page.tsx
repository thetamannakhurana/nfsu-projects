'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ChangePasswordModal from '@/components/ChangePasswordModal'

interface User {
  id: number; name: string; email: string; role: string
  designation: string; department: string; campus_name: string
}
interface Project {
  id: number; title: string; student_name: string; student_email: string
  project_type: string; batch_start_year: number; batch_end_year: number
  status: string; created_at: string; campus_name: string
  course_name: string; spec_name: string; academic_year: string
}
interface GuidanceRequest {
  id: number; student_name: string; project_title: string
  project_type: string; status: string; created_at: string
  course_name: string; batch_start_year: number; batch_end_year: number
}

export default function FacultyDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [allRequests, setAllRequests] = useState<GuidanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'projects' | 'requests'>('projects')
  const [showChangePassword, setShowChangePassword] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (!data.user || (data.user.role !== 'faculty' && data.user.role !== 'admin')) {
          router.push('/login'); return
        }
        setUser(data.user)
        return Promise.all([
          fetch(`/api/projects?guide_email=${encodeURIComponent(data.user.email)}&limit=100`).then(r => r.json()),
          fetch('/api/guidance-requests').then(r => r.json()),
        ])
      })
      .then(results => {
        if (results) {
          setMyProjects(results[0].projects || [])
          setAllRequests(results[1].requests || [])
        }
        setLoading(false)
      })
      .catch(() => router.push('/login'))
  }, [router])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const pendingRequests = allRequests.filter(r => r.status === 'pending')
  const acceptedRequests = allRequests.filter(r => r.status === 'accepted')

  if (loading) return (
    <div className="min-h-screen bg-nfsu-offwhite flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-nfsu-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-nfsu-offwhite flex">
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col fixed h-full z-20 hidden md:flex">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-nfsu-navy rounded-lg flex items-center justify-center text-sm">⚖️</div>
            <div>
              <div className="text-xs text-gray-400 leading-none">NFSU</div>
              <div className="text-sm font-semibold text-nfsu-navy">Projects DB</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <Link href="/faculty/dashboard" className="sidebar-link active">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/faculty/guidance" className="sidebar-link relative">
            <span>📬</span> Guidance Requests
            {pendingRequests.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </Link>
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

        {/* Bottom — full name + change password + logout */}
        <div className="p-3 border-t border-gray-100">
          <div className="px-3 py-2.5 bg-nfsu-navy/5 rounded-xl mb-2">
            <p className="text-sm font-semibold text-nfsu-navy leading-snug">{user?.name}</p>
            {user?.designation && <p className="text-xs text-gray-500 mt-0.5">{user.designation}</p>}
            {user?.department && <p className="text-xs text-gray-400 mt-0.5 truncate" title={user.department}>{user.department}</p>}
            {user?.campus_name && <p className="text-xs text-gray-400 mt-0.5">📍 {user.campus_name}</p>}
          </div>
          <button onClick={() => setShowChangePassword(true)}
            className="sidebar-link text-nfsu-blue hover:bg-blue-50 w-full mb-0.5">
            <span>🔐</span> Change Password
          </button>
          <button onClick={handleLogout} className="sidebar-link text-red-500 hover:bg-red-50 w-full">
            <span>🚪</span> Sign Out
          </button>
          <p className="text-xs text-center text-gray-300 mt-3">
            <a href="https://tamannakhurana.vercel.app/" target="_blank" rel="noopener noreferrer"
              className="hover:underline" style={{ color: '#C8972A' }}>
              Tamanna Khurana
            </a>
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-heading font-semibold text-nfsu-navy">
                {user?.designation ? `${user.designation} ${user?.name}` : user?.name}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">{user?.department}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={() => setShowChangePassword(true)}
                className="text-xs text-nfsu-blue border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors hidden sm:block">
                🔐 Change Password
              </button>
              {pendingRequests.length > 0 && (
                <Link href="/faculty/guidance"
                  className="flex items-center gap-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors">
                  📬 {pendingRequests.length} pending
                </Link>
              )}
              <Link href="/faculty/projects/new" className="btn-primary text-sm hidden sm:flex">
                ➕ Add Project
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'My Projects', value: myProjects.length, icon: '📁', color: 'border-l-4 border-nfsu-blue' },
              { label: 'Major Projects', value: myProjects.filter(p => p.project_type === 'major').length, icon: '⭐', color: 'border-l-4 border-amber-400' },
              { label: 'Minor Projects', value: myProjects.filter(p => p.project_type === 'minor').length, icon: '📌', color: 'border-l-4 border-blue-400' },
              { label: 'Pending Requests', value: pendingRequests.length, icon: '📬', color: 'border-l-4 border-red-400' },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
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

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
            <button onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'projects' ? 'bg-white text-nfsu-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              📁 My Students&apos; Projects ({myProjects.length})
            </button>
            <button onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'requests' ? 'bg-white text-nfsu-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              📬 Accepted Students ({acceptedRequests.length})
            </button>
          </div>

          {/* Projects tab */}
          {activeTab === 'projects' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Projects Under My Guidance</h2>
                <Link href="/search" className="text-sm text-nfsu-blue hover:underline">View all →</Link>
              </div>
              {myProjects.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-3">📂</div>
                  <p className="text-gray-600 font-medium">No projects yet</p>
                  <p className="text-gray-400 text-sm mt-1">Projects you guide will appear here</p>
                  <Link href="/faculty/projects/new" className="btn-primary mt-4 inline-flex text-sm">
                    Add First Project
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Project Title</th>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Type</th>
                        <th>Batch</th>
                        <th>Year</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {myProjects.map(p => (
                        <tr key={p.id}>
                          <td>
                            <Link href={`/project/${p.id}`} className="text-nfsu-blue hover:underline font-medium text-xs">
                              {p.title.length > 50 ? p.title.slice(0, 50) + '…' : p.title}
                            </Link>
                          </td>
                          <td className="text-xs">
                            <p className="font-medium text-gray-800">{p.student_name}</p>
                            <p className="text-gray-400">{p.student_email}</p>
                          </td>
                          <td className="text-xs text-gray-500">{p.course_name || '—'}</td>
                          <td>
                            <span className={`badge text-xs ${p.project_type === 'major' ? 'badge-major' : 'badge-minor'}`}>
                              {p.project_type === 'major' ? '⭐' : '📌'} {p.project_type}
                            </span>
                          </td>
                          <td className="text-xs text-gray-500">{p.batch_start_year}–{p.batch_end_year}</td>
                          <td className="text-xs text-gray-500">{p.academic_year || '—'}</td>
                          <td>
                            <span className={`badge text-xs ${p.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td>
                            <Link href={`/project/${p.id}`} className="text-xs text-nfsu-blue hover:underline">View</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Accepted students tab */}
          {activeTab === 'requests' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Students Whose Requests I&apos;ve Accepted</h2>
                <p className="text-xs text-gray-400 mt-0.5">These students are under your guidance</p>
              </div>
              {acceptedRequests.length === 0 ? (
                <div className="p-10 text-center text-gray-400">
                  <p className="text-3xl mb-2">👥</p>
                  <p>No accepted students yet</p>
                  <Link href="/faculty/guidance" className="text-nfsu-blue text-sm hover:underline mt-2 block">
                    View pending requests →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {acceptedRequests.map(req => (
                    <div key={req.id} className="px-5 py-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-nfsu-navy/10 rounded-full flex items-center justify-center text-sm flex-shrink-0">🎓</div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{req.student_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{req.project_title}</p>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            <span className={`badge text-xs ${req.project_type === 'major' ? 'badge-major' : 'badge-minor'}`}>
                              {req.project_type}
                            </span>
                            {req.course_name && <span className="tag-pill">{req.course_name}</span>}
                            {req.batch_start_year && (
                              <span className="tag-pill">Batch {req.batch_start_year}–{req.batch_end_year}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(req.created_at).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}