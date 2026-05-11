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
  status: string; created_at: string; course_name: string; academic_year: string
}
interface GuidanceRequest {
  id: number; student_name: string; project_title: string
  project_type: string; status: string; created_at: string
  course_name: string; batch_start_year: number; batch_end_year: number
  report_url: string; report_uploaded_at: string
  plagiarism_score: number; plagiarism_checked_at: string
}
interface RepoSubmission {
  id: number; title: string; project_type: string; status: string
  student_name: string; student_email: string; course_name: string
  description: string; technologies: string[]; keywords: string[]
  achievements: string; github_url: string; report_url: string; project_url: string
  created_at: string; guide_remarks: string
}
interface SharedProject {
  id: number; project_id: number; project_title: string
  shared_by_name: string; shared_by_designation: string
  note: string; project_url: string; is_read: boolean; created_at: string
}

export default function FacultyDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [allRequests, setAllRequests] = useState<GuidanceRequest[]>([])
  const [repoSubmissions, setRepoSubmissions] = useState<RepoSubmission[]>([])
  const [sharedProjects, setSharedProjects] = useState<SharedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'projects' | 'students' | 'repo' | 'shared'>('projects')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [reviewingId, setReviewingId] = useState<number | null>(null)
  const [reviewForm, setReviewForm] = useState({ status: 'approved', remarks: '' })
  const [reviewLoading, setReviewLoading] = useState(false)

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
          fetch('/api/repo-submissions').then(r => r.json()),
          fetch('/api/projects/share').then(r => r.json()),
        ])
      })
      .then(results => {
        if (results) {
          setMyProjects(results[0].projects || [])
          setAllRequests(results[1].requests || [])
          setRepoSubmissions(results[2].submissions || [])
          setSharedProjects(results[3].shares || [])
        }
        setLoading(false)
      })
      .catch(() => router.push('/login'))
  }, [router])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  async function reviewSubmission(id: number) {
    setReviewLoading(true)
    const res = await fetch(`/api/repo-submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: reviewForm.status, guide_remarks: reviewForm.remarks })
    })
    if (res.ok) {
      setRepoSubmissions(prev => prev.map(s => s.id === id
        ? { ...s, status: reviewForm.status, guide_remarks: reviewForm.remarks } : s
      ))
      setReviewingId(null)
      setReviewForm({ status: 'approved', remarks: '' })
    }
    setReviewLoading(false)
  }

  const pendingRequests = allRequests.filter(r => r.status === 'pending')
  const acceptedRequests = allRequests.filter(r => r.status === 'accepted')
  const pendingRepoSubmissions = repoSubmissions.filter(s => s.status === 'pending')
  const unreadShares = sharedProjects.filter(s => !s.is_read).length

  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  const pendingPlagiarismChecks = acceptedRequests.filter(r =>
    r.report_url &&
    (r.plagiarism_score === null || r.plagiarism_score === undefined) &&
    r.report_uploaded_at &&
    new Date(r.report_uploaded_at) < twoDaysAgo
  )

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
          <Link href="/faculty/dashboard" className="sidebar-link active"><span>📊</span> Dashboard</Link>
          <Link href="/faculty/guidance" className="sidebar-link relative">
            <span>📬</span> Guidance Requests
            {pendingRequests.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </Link>
          <Link href="/faculty/projects/new" className="sidebar-link"><span>➕</span> Add Project</Link>
          <Link href="/" className="sidebar-link"><span>🏛️</span> Browse Projects</Link>
          <Link href="/search" className="sidebar-link"><span>🔍</span> Search</Link>
        </nav>
        <div className="p-3 border-t border-gray-100">
          <div className="px-3 py-2.5 bg-nfsu-navy/5 rounded-xl mb-2">
            <p className="text-sm font-semibold text-nfsu-navy leading-snug">{user?.name}</p>
            {user?.designation && <p className="text-xs text-gray-500 mt-0.5">{user.designation}</p>}
            {user?.department && <p className="text-xs text-gray-400 mt-0.5 truncate">{user.department}</p>}
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
              className="hover:underline" style={{ color: '#C8972A' }}>Tamanna Khurana</a>
          </p>
        </div>
      </aside>

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
                className="text-xs text-nfsu-blue border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 hidden sm:block">
                🔐 Change Password
              </button>
              {pendingRequests.length > 0 && (
                <Link href="/faculty/guidance"
                  className="flex items-center gap-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100">
                  📬 {pendingRequests.length} pending
                </Link>
              )}
              <Link href="/faculty/projects/new" className="btn-primary text-sm hidden sm:flex">➕ Add Project</Link>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">

          {/* 2-day plagiarism reminder */}
          {pendingPlagiarismChecks.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">⏰</span>
              <div className="flex-1">
                <p className="font-semibold text-orange-800 text-sm">Plagiarism Check Overdue</p>
                <p className="text-xs text-orange-600 mt-0.5 mb-2">
                  {pendingPlagiarismChecks.length} student{pendingPlagiarismChecks.length > 1 ? 's have' : ' has'} uploaded reports more than 2 days ago and awaiting plagiarism check:
                </p>
                {pendingPlagiarismChecks.map(r => (
                  <div key={r.id} className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-orange-700 font-medium">• {r.student_name}</span>
                    <span className="text-xs text-orange-500">— {r.project_title}</span>
                    <Link href="/faculty/guidance" className="text-xs text-orange-700 underline ml-auto">Check now →</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Repo + Share notifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingRepoSubmissions.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">📁</span>
                <div>
                  <p className="font-semibold text-green-800 text-sm">
                    {pendingRepoSubmissions.length} Repo Submission{pendingRepoSubmissions.length > 1 ? 's' : ''} Pending
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">Students awaiting your review.</p>
                  <button onClick={() => setActiveTab('repo')} className="text-xs text-green-700 underline mt-1">Review now →</button>
                </div>
              </div>
            )}
            {unreadShares > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">📤</span>
                <div>
                  <p className="font-semibold text-indigo-800 text-sm">
                    {unreadShares} Project{unreadShares > 1 ? 's' : ''} Shared with You
                  </p>
                  <p className="text-xs text-indigo-600 mt-0.5">Colleagues shared projects for your reference.</p>
                  <button onClick={() => setActiveTab('shared')} className="text-xs text-indigo-700 underline mt-1">View now →</button>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
            {[
              { key: 'projects', label: `📁 My Projects (${myProjects.length})` },
              { key: 'students', label: `📬 My Students (${acceptedRequests.length})` },
              { key: 'repo', label: `📁 Repo Submissions (${repoSubmissions.length})`, badge: pendingRepoSubmissions.length },
              { key: 'shared', label: `📤 Shared (${sharedProjects.length})`, badge: unreadShares },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${activeTab === tab.key ? 'bg-white text-nfsu-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
                {tab.badge ? (
                  <span className="ml-1 bg-indigo-500 text-white text-xs rounded-full w-4 h-4 inline-flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            ))}
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
                  <Link href="/faculty/projects/new" className="btn-primary mt-4 inline-flex text-sm">Add First Project</Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Project Title</th><th>Student</th><th>Course</th>
                        <th>Type</th><th>Batch</th><th>Status</th><th></th>
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
                          <td>
                            <span className={`badge text-xs ${p.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td><Link href={`/project/${p.id}`} className="text-xs text-nfsu-blue hover:underline">View</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* My students tab */}
          {activeTab === 'students' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Students Under My Guidance</h2>
              </div>
              {acceptedRequests.length === 0 ? (
                <div className="p-10 text-center text-gray-400">
                  <p className="text-3xl mb-2">👥</p>
                  <p>No accepted students yet</p>
                  <Link href="/faculty/guidance" className="text-nfsu-blue text-sm hover:underline mt-2 block">View pending requests →</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {acceptedRequests.map(req => {
                    const overdue = req.report_url &&
                      (req.plagiarism_score === null || req.plagiarism_score === undefined) &&
                      req.report_uploaded_at &&
                      new Date(req.report_uploaded_at) < twoDaysAgo
                    return (
                      <div key={req.id} className="px-5 py-4 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-nfsu-navy/10 rounded-full flex items-center justify-center text-sm flex-shrink-0">🎓</div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{req.student_name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{req.project_title}</p>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              <span className={`badge text-xs ${req.project_type === 'major' ? 'badge-major' : 'badge-minor'}`}>{req.project_type}</span>
                              {req.course_name && <span className="tag-pill">{req.course_name}</span>}
                              {req.batch_start_year && <span className="tag-pill">Batch {req.batch_start_year}–{req.batch_end_year}</span>}
                              {req.report_url && !req.plagiarism_checked_at && (
                                <span className={`badge text-xs ${overdue ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                  {overdue ? '⏰ Plagiarism overdue' : '📄 Report uploaded'}
                                </span>
                              )}
                              {req.plagiarism_score !== null && req.plagiarism_score !== undefined && (
                                <span className={`badge text-xs ${req.plagiarism_score <= 20 ? 'bg-green-50 text-green-700 border-green-200' : req.plagiarism_score <= 40 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                  📊 {req.plagiarism_score}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {overdue && (
                          <Link href="/faculty/guidance" className="text-xs text-orange-600 hover:underline flex-shrink-0">⚠️ Check now</Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Repo submissions tab */}
          {activeTab === 'repo' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Repository Submissions</h2>
                <p className="text-xs text-gray-400 mt-0.5">Review and approve student project submissions</p>
              </div>
              {repoSubmissions.length === 0 ? (
                <div className="p-10 text-center text-gray-400"><p className="text-3xl mb-2">📁</p><p>No submissions yet</p></div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {repoSubmissions.map(sub => (
                    <div key={sub.id} className="px-5 py-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`badge text-xs ${sub.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : sub.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : sub.status === 'revision' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                              {sub.status === 'approved' ? '✅' : sub.status === 'rejected' ? '❌' : sub.status === 'revision' ? '🔄' : '⏳'} {sub.status}
                            </span>
                            <span className={`badge text-xs ${sub.project_type === 'major' ? 'badge-major' : 'badge-minor'}`}>{sub.project_type}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm">{sub.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">From: <strong>{sub.student_name}</strong>{sub.course_name && ` · ${sub.course_name}`}</p>
                          {sub.description && <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-lg px-3 py-2">{sub.description}</p>}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {sub.github_url && <a href={sub.github_url} target="_blank" rel="noopener noreferrer" className="text-xs text-nfsu-blue hover:underline">🔗 GitHub</a>}
                            {sub.project_url && <a href={sub.project_url} target="_blank" rel="noopener noreferrer" className="text-xs text-nfsu-blue hover:underline">🌐 Demo</a>}
                            {sub.report_url && <a href={sub.report_url} target="_blank" rel="noopener noreferrer" className="text-xs text-nfsu-blue hover:underline">📄 Report</a>}
                          </div>
                          {sub.guide_remarks && <p className="text-xs text-gray-400 mt-1 italic">Your remarks: {sub.guide_remarks}</p>}
                          <p className="text-xs text-gray-400 mt-1">{new Date(sub.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                        {sub.status === 'pending' && (
                          <div className="flex-shrink-0">
                            {reviewingId === sub.id ? (
                              <div className="w-56 space-y-2">
                                <select value={reviewForm.status} onChange={e => setReviewForm(f => ({ ...f, status: e.target.value }))} className="form-input text-sm">
                                  <option value="approved">✅ Approve</option>
                                  <option value="revision">🔄 Request Revision</option>
                                  <option value="rejected">❌ Reject</option>
                                </select>
                                <textarea value={reviewForm.remarks} onChange={e => setReviewForm(f => ({ ...f, remarks: e.target.value }))}
                                  rows={2} placeholder="Remarks for student..." className="form-input resize-none text-sm" />
                                <div className="flex gap-2">
                                  <button onClick={() => reviewSubmission(sub.id)} disabled={reviewLoading}
                                    className="btn-primary text-xs px-3 py-2 flex-1 disabled:opacity-60">
                                    {reviewLoading ? '...' : 'Submit'}
                                  </button>
                                  <button onClick={() => setReviewingId(null)} className="btn-outline text-xs px-3 py-2">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setReviewingId(sub.id)} className="btn-primary text-sm px-4 py-2">Review</button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shared projects tab */}
          {activeTab === 'shared' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Projects Shared with Me</h2>
                <p className="text-xs text-gray-400 mt-0.5">Projects your colleagues shared for reference</p>
              </div>
              {sharedProjects.length === 0 ? (
                <div className="p-10 text-center text-gray-400">
                  <p className="text-3xl mb-2">📤</p>
                  <p>No shared projects yet</p>
                  <p className="text-xs mt-1">When a colleague shares a project with you, it will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {sharedProjects.map(share => (
                    <div key={share.id} className={`px-5 py-4 ${!share.is_read ? 'bg-indigo-50/30' : ''}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {!share.is_read && <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />}
                            <p className="text-xs text-gray-400">
                              Shared by <strong className="text-gray-600">{share.shared_by_name}</strong>
                              {share.shared_by_designation && ` (${share.shared_by_designation})`}
                              {' · '}{new Date(share.created_at).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm">{share.project_title}</h3>
                          {share.note && (
                            <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded-lg px-3 py-2 italic">
                              &quot;{share.note}&quot;
                            </p>
                          )}
                        </div>
                        <Link href={`/project/${share.project_id}`}
                          className="flex-shrink-0 text-sm text-nfsu-blue hover:underline">
                          View Project →
                        </Link>
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