'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ChangePasswordModal from '@/components/ChangePasswordModal'

interface User {
  id: number; name: string; email: string; role: string
  campus_name: string; course_name: string; spec_name: string
  batch_start_year: number; batch_end_year: number; enrollment_number: string
}
interface Faculty { id: number; name: string; designation: string; department: string }
interface GuidanceRequest {
  id: number; project_title: string; project_domain: string; project_type: string
  status: string; faculty_name: string; faculty_designation: string
  faculty_note: string; created_at: string
  report_url: string; report_filename: string; report_uploaded_at: string
  plagiarism_score: number; plagiarism_remarks: string; plagiarism_checked_at: string
  request_doc_url: string; request_doc_filename: string
  co_guide_name: string
}
interface RepoSubmission {
  id: number; title: string; project_type: string; status: string
  guide_name: string; guide_remarks: string; created_at: string
}

const STATUS_STYLE: Record<string, string> = {
  accepted:  'bg-green-50 text-green-700 border-green-200',
  rejected:  'bg-red-50 text-red-700 border-red-200',
  held:      'bg-purple-50 text-purple-700 border-purple-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved:  'bg-green-50 text-green-700 border-green-200',
  revision:  'bg-orange-50 text-orange-700 border-orange-200',
}
const STATUS_ICON: Record<string, string> = {
  accepted: '✅', rejected: '❌', held: '⏸️', cancelled: '🚫', pending: '⏳',
  approved: '✅', revision: '🔄',
}

function PlagiarismBadge({ score }: { score: number }) {
  const color = score <= 20 ? 'bg-green-50 text-green-700 border-green-200'
    : score <= 40 ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
    : 'bg-red-50 text-red-700 border-red-200'
  const label = score <= 20 ? 'Low' : score <= 40 ? 'Moderate' : 'High'
  return <span className={`badge ${color}`}>📊 {score}% — {label}</span>
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [requests, setRequests] = useState<GuidanceRequest[]>([])
  const [repoSubmissions, setRepoSubmissions] = useState<RepoSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showRepoForm, setShowRepoForm] = useState<number | null>(null) // guidance_request_id
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [repoSubmitting, setRepoSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [repoError, setRepoError] = useState('')
  const [repoSuccess, setRepoSuccess] = useState('')
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<Record<number, string>>({})
  const reportInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const [form, setForm] = useState({
    faculty_id: '', project_title: '', project_domain: '',
    description: '', project_type: 'minor', document: null as File | null,
  })
  const [repoForm, setRepoForm] = useState({
    title: '', description: '', technologies: '', keywords: '',
    achievements: '', github_url: '', report_url: '', project_url: '',
  })

  useEffect(() => {
    let mounted = true
    async function loadData() {
      try {
        const meRes = await fetch('/api/auth/me')
        if (!meRes.ok) { if (mounted) setAuthError('Please login to continue'); return }
        const meData = await meRes.json()
        if (!meData.user || meData.user.role !== 'student') {
          if (mounted) setAuthError('Access denied.'); return
        }
        if (mounted) setUser(meData.user)
        const [fRes, rRes, rsRes] = await Promise.all([
          fetch('/api/faculty'),
          fetch('/api/guidance-requests'),
          fetch('/api/repo-submissions'),
        ])
        if (fRes.ok) { const d = await fRes.json(); if (mounted) setFaculty(d.faculty || []) }
        if (rRes.ok) { const d = await rRes.json(); if (mounted) setRequests(d.requests || []) }
        if (rsRes.ok) { const d = await rsRes.json(); if (mounted) setRepoSubmissions(d.submissions || []) }
      } catch { if (mounted) setAuthError('Something went wrong. Please refresh.') }
      finally { if (mounted) setLoading(false) }
    }
    loadData()
    return () => { mounted = false }
  }, [])

  const currentSem = (() => {
    if (!user?.batch_start_year) return null
    const now = new Date()
    const yearsCompleted = now.getFullYear() - user.batch_start_year
    const sem = (now.getMonth() + 1) >= 7 ? yearsCompleted * 2 + 1 : yearsCompleted * 2
    const totalSem = user.batch_end_year && user.batch_start_year
      ? (user.batch_end_year - user.batch_start_year) * 2 : 10
    return Math.min(Math.max(1, sem), totalSem)
  })()

  const totalSem = user?.batch_end_year && user?.batch_start_year
    ? (user.batch_end_year - user.batch_start_year) * 2 : 10

  const allowedProjectType: 'major' | 'minor' | 'both' = (() => {
    if (!currentSem) return 'both'
    if (totalSem === 10) { if (currentSem >= 9) return 'major'; if (currentSem >= 7) return 'minor'; return 'both' }
    if (totalSem === 4) { if (currentSem >= 3) return 'major'; return 'minor' }
    return 'both'
  })()

  useEffect(() => {
    if (allowedProjectType === 'minor') setForm(f => ({ ...f, project_type: 'minor' }))
    if (allowedProjectType === 'major') setForm(f => ({ ...f, project_type: 'major' }))
  }, [allowedProjectType])

  // Midsem reminder: accepted requests with no report
  const pendingReportRequests = requests.filter(r =>
    r.status === 'accepted' && !r.report_url
  )
  const isMidsem = currentSem && currentSem % 2 === 0 // even sem = Jan-May (midsem period)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault()
    setFormError(''); setFormSuccess(''); setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('faculty_id', form.faculty_id)
      fd.append('project_title', form.project_title)
      fd.append('project_domain', form.project_domain)
      fd.append('description', form.description)
      fd.append('project_type', form.project_type)
      if (form.document) fd.append('document', form.document)
      const res = await fetch('/api/guidance-requests', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error || 'Failed to send'); setSubmitting(false); return }
      setFormSuccess('Request sent!')
      const sel = faculty.find(f => f.id === parseInt(form.faculty_id))
      setRequests(prev => [...prev, { ...data.request, faculty_name: sel?.name || '', faculty_designation: sel?.designation || '' }])
      setForm(f => ({ ...f, faculty_id: '', project_title: '', project_domain: '', description: '', document: null }))
      setTimeout(() => { setShowForm(false); setFormSuccess('') }, 2000)
    } catch { setFormError('Failed to send. Try again.') }
    setSubmitting(false)
  }

  async function submitToRepo(e: React.FormEvent, reqId: number, guideId: number) {
    e.preventDefault()
    setRepoError(''); setRepoSuccess(''); setRepoSubmitting(true)
    try {
      const res = await fetch('/api/repo-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guide_id: guideId,
          guidance_request_id: reqId,
          ...repoForm,
          project_type: allowedProjectType === 'both' ? 'minor' : allowedProjectType,
        })
      })
      const data = await res.json()
      if (!res.ok) { setRepoError(data.error || 'Failed to submit'); setRepoSubmitting(false); return }
      setRepoSuccess('Submission sent to your guide for approval!')
      setRepoSubmissions(prev => [...prev, data.submission])
      setShowRepoForm(null)
      setRepoForm({ title: '', description: '', technologies: '', keywords: '', achievements: '', github_url: '', report_url: '', project_url: '' })
      setTimeout(() => setRepoSuccess(''), 3000)
    } catch { setRepoError('Failed to submit. Try again.') }
    setRepoSubmitting(false)
  }

  async function uploadReport(reqId: number, file: File) {
    setUploadingId(reqId)
    setUploadError(prev => ({ ...prev, [reqId]: '' }))
    try {
      const fd = new FormData()
      fd.append('report', file)
      const res = await fetch(`/api/guidance-requests/${reqId}/report`, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(prev => ({ ...prev, [reqId]: data.error || 'Upload failed' }))
      } else {
        setRequests(prev => prev.map(r => r.id === reqId
          ? { ...r, report_url: data.url, report_filename: file.name, report_uploaded_at: new Date().toISOString() }
          : r
        ))
      }
    } catch { setUploadError(prev => ({ ...prev, [reqId]: 'Upload failed. Try again.' })) }
    setUploadingId(null)
  }

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const setRF = (k: string, v: string) => setRepoForm(f => ({ ...f, [k]: v }))

  if (loading) return (
    <div className="min-h-screen bg-nfsu-offwhite flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-nfsu-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  )

  if (authError || !user) return (
    <div className="min-h-screen bg-nfsu-offwhite flex items-center justify-center p-6">
      <div className="text-center bg-white rounded-2xl border border-gray-200 p-8 max-w-sm w-full">
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="font-heading font-bold text-nfsu-navy text-lg mb-2">Session Expired</h2>
        <p className="text-gray-500 text-sm mb-5">{authError || 'Please login.'}</p>
        <a href="/login" className="btn-primary w-full justify-center">Go to Login</a>
      </div>
    </div>
  )

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <Link href="/student/dashboard" onClick={onNav} className="sidebar-link active"><span>📊</span> My Dashboard</Link>
        <Link href="/" onClick={onNav} className="sidebar-link"><span>🏛️</span> Browse Campuses</Link>
        <Link href="/search" onClick={onNav} className="sidebar-link"><span>🔍</span> Search Projects</Link>
        <Link href="/search?type=major" onClick={onNav} className="sidebar-link"><span>⭐</span> Major Projects</Link>
        <Link href="/search?type=minor" onClick={onNav} className="sidebar-link"><span>📌</span> Minor Projects</Link>
      </nav>
      <div className="p-3 border-t border-gray-100">
        <div className="px-3 py-2 bg-nfsu-navy/5 rounded-xl mb-2">
          <p className="text-sm font-semibold text-nfsu-navy truncate">{user.name}</p>
          <p className="text-xs text-gray-400">Student</p>
          {user.course_name && <p className="text-xs text-gray-400 truncate">{user.course_name}</p>}
          {currentSem && <p className="text-xs text-nfsu-blue font-medium">Semester {currentSem}</p>}
        </div>
        <button onClick={() => { setShowChangePassword(true); onNav?.() }}
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
    </>
  )

  return (
    <div className="min-h-screen bg-nfsu-offwhite flex">
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}

      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 fixed h-full z-20">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-nfsu-navy rounded-lg flex items-center justify-center text-sm">⚖️</div>
            <div>
              <div className="text-xs text-gray-400">NFSU</div>
              <div className="text-sm font-semibold text-nfsu-navy">Projects DB</div>
            </div>
          </div>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-60 bg-white z-40 md:hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-nfsu-navy">NFSU Projects</span>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400">✕</button>
            </div>
            <SidebarContent onNav={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      <div className="flex-1 md:ml-60 flex flex-col">
        <header className="nfsu-header-bg text-white">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)}
                className="md:hidden w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">☰</button>
              <div>
                <div className="text-xs text-white/60">NFSU Projects Database</div>
                <div className="text-sm font-semibold">Student Portal</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowChangePassword(true)}
                className="text-white/60 text-sm hover:text-white hidden sm:block">🔐 Change Password</button>
              <button onClick={handleLogout} className="text-white/60 text-sm hover:text-white">🚪 Logout</button>
            </div>
          </div>
          <div className="gold-line" />
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Midsem reminder banner */}
          {pendingReportRequests.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">📢</span>
              <div>
                <p className="font-semibold text-orange-800 text-sm">Report Submission Reminder</p>
                <p className="text-xs text-orange-600 mt-0.5">
                  You have {pendingReportRequests.length} accepted guidance request{pendingReportRequests.length > 1 ? 's' : ''} with no report uploaded yet.
                  {isMidsem && ' Midsem evaluations are approaching — please upload your report soon!'}
                </p>
              </div>
            </div>
          )}

          {/* Repo submission success */}
          {repoSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-2xl px-5 py-4">
              ✅ {repoSuccess}
            </div>
          )}

          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-nfsu-navy rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🎓</div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-heading font-bold text-nfsu-navy">Welcome, {user.name.split(' ')[0]}!</h1>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {user.course_name && <span className="badge bg-blue-50 text-blue-700 border-blue-200">{user.course_name}</span>}
                  {user.campus_name && <span className="badge bg-gray-50 text-gray-600 border-gray-200">📍 {user.campus_name}</span>}
                  {currentSem && (
                    <span className="badge bg-amber-50 text-amber-700 border-amber-200">
                      📚 Sem {currentSem} · {currentSem % 2 === 1 ? 'Jul–Dec' : 'Jan–May'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
              <div><p className="text-xs text-gray-400">Enrollment</p><p className="text-sm font-medium text-gray-800 mt-0.5">{user.enrollment_number || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Batch</p><p className="text-sm font-medium text-gray-800 mt-0.5">{user.batch_start_year ? `${user.batch_start_year}–${user.batch_end_year}` : '—'}</p></div>
              <div><p className="text-xs text-gray-400">Semester</p><p className="text-sm font-medium text-gray-800 mt-0.5">{currentSem ? `Sem ${currentSem}` : '—'}</p></div>
              <div><p className="text-xs text-gray-400">Requests</p><p className="text-sm font-medium text-gray-800 mt-0.5">{requests.length}</p></div>
            </div>

            {currentSem && allowedProjectType !== 'both' && (
              <div className={`mt-4 rounded-xl px-4 py-3 text-sm border flex items-start gap-2 ${allowedProjectType === 'minor' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                <span>{allowedProjectType === 'minor' ? '📌' : '⭐'}</span>
                <div>
                  <strong>{allowedProjectType === 'minor' ? 'Minor Project semester' : 'Major Project semester'}</strong>
                  {allowedProjectType === 'minor' && totalSem === 10 && <p className="text-xs mt-0.5 opacity-80">Sem 7–8: Minor projects only. Major from Sem 9.</p>}
                  {allowedProjectType === 'major' && totalSem === 10 && <p className="text-xs mt-0.5 opacity-80">Sem 9–10: Major projects (M.Tech part).</p>}
                </div>
              </div>
            )}

            {/* Quick browse */}
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
              <Link href="/" className="flex flex-col items-center gap-1 py-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-nfsu-gold/40 transition-all text-center">
                <span className="text-xl">🏛️</span><span className="text-xs font-medium text-nfsu-navy">Campuses</span>
              </Link>
              <Link href="/search" className="flex flex-col items-center gap-1 py-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-nfsu-blue/40 transition-all text-center">
                <span className="text-xl">🔍</span><span className="text-xs font-medium text-nfsu-navy">All Projects</span>
              </Link>
              <Link href={`/search?type=${allowedProjectType === 'both' ? 'minor' : allowedProjectType}`}
                className="flex flex-col items-center gap-1 py-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-nfsu-blue/40 transition-all text-center">
                <span className="text-xl">{allowedProjectType === 'major' ? '⭐' : '📌'}</span>
                <span className="text-xs font-medium text-nfsu-navy">{allowedProjectType === 'major' ? 'Major' : 'Minor'} Projects</span>
              </Link>
            </div>
          </div>

          {/* Guidance requests */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-heading font-semibold text-nfsu-navy">Project Guidance Requests</h2>
                <p className="text-xs text-gray-400 mt-0.5">Send requests, attach documents, upload reports</p>
              </div>
              <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm px-4 py-2">
                {showForm ? '✕ Cancel' : '+ New Request'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={submitRequest} className="p-6 border-b border-gray-100 bg-gray-50/50">
                {formError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">⚠️ {formError}</div>}
                {formSuccess && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">✅ {formSuccess}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="form-label">Select Faculty Guide *</label>
                    <select value={form.faculty_id} onChange={e => setF('faculty_id', e.target.value)} required className="form-input">
                      <option value="">— Choose a faculty member —</option>
                      {faculty.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name}{f.designation ? ` (${f.designation})` : ''}{f.department ? ` — ${f.department}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Project Title *</label>
                    <input type="text" value={form.project_title} onChange={e => setF('project_title', e.target.value)}
                      required placeholder="e.g., AI-based Network Intrusion Detection" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Domain / Area</label>
                    <input type="text" value={form.project_domain} onChange={e => setF('project_domain', e.target.value)}
                      placeholder="e.g., Cyber Security, ML" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Project Type</label>
                    {allowedProjectType === 'minor' ? (
                      <div className="form-input bg-blue-50 border-blue-200 text-blue-700 cursor-not-allowed">📌 Minor Project (Sem {currentSem})</div>
                    ) : allowedProjectType === 'major' ? (
                      <div className="form-input bg-amber-50 border-amber-200 text-amber-700 cursor-not-allowed">⭐ Major Project (Sem {currentSem})</div>
                    ) : (
                      <select value={form.project_type} onChange={e => setF('project_type', e.target.value)} className="form-input">
                        <option value="minor">📌 Minor Project</option>
                        <option value="major">⭐ Major Project</option>
                      </select>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Brief Description</label>
                    <textarea value={form.description} onChange={e => setF('description', e.target.value)}
                      rows={3} placeholder="Briefly describe your project idea..." className="form-input resize-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Supporting Document <span className="text-gray-400 font-normal normal-case text-xs">(optional)</span></label>
                    <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={e => setForm(f => ({ ...f, document: e.target.files?.[0] || null }))}
                      className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-nfsu-navy file:text-white hover:file:bg-nfsu-blue cursor-pointer" />
                    {form.document && (
                      <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                        📎 {form.document.name}
                        <button type="button" onClick={() => setForm(f => ({ ...f, document: null }))} className="text-red-400 hover:text-red-600 ml-1">✕</button>
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Max 10MB. Attach synopsis, proposal, or any supporting document.</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
                    {submitting ? 'Sending...' : '📨 Send Guidance Request'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setFormError('') }} className="btn-outline">Cancel</button>
                </div>
              </form>
            )}

            <div className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <p className="text-3xl mb-2">📬</p>
                  <p className="font-medium">No requests yet</p>
                  <p className="text-sm mt-1">Click &quot;+ New Request&quot; to get started</p>
                </div>
              ) : requests.map(req => (
                <div key={req.id} className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`badge ${STATUS_STYLE[req.status] || ''}`}>{STATUS_ICON[req.status]} {req.status}</span>
                    <span className="badge bg-gray-50 text-gray-500 border-gray-200">{req.project_type}</span>
                    {req.plagiarism_score !== null && req.plagiarism_score !== undefined && (
                      <PlagiarismBadge score={req.plagiarism_score} />
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 text-sm">{req.project_title}</h3>
                  {req.project_domain && <p className="text-xs text-gray-500 mt-0.5">Domain: {req.project_domain}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    Sent to <span className="font-medium text-gray-600">{req.faculty_name}</span>
                    {req.faculty_designation && ` (${req.faculty_designation})`}
                    {req.co_guide_name && <span className="text-gray-400"> · Co-guide: {req.co_guide_name}</span>}
                    {' · '}{new Date(req.created_at).toLocaleDateString('en-IN')}
                  </p>

                  {req.request_doc_url && (
                    <a href={req.request_doc_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-nfsu-blue hover:underline mt-1.5">
                      📎 {req.request_doc_filename || 'View attached document'}
                    </a>
                  )}

                  {req.faculty_note && (
                    <div className={`mt-2 text-xs px-3 py-2 rounded-lg border ${
                      req.status === 'accepted' ? 'bg-green-50 border-green-200 text-green-700' :
                      req.status === 'held' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                      req.status === 'cancelled' ? 'bg-gray-50 border-gray-200 text-gray-500' :
                      'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      <strong>Faculty Note:</strong> {req.faculty_note}
                    </div>
                  )}

                  {/* Report upload — accepted only */}
                  {req.status === 'accepted' && (
                    <div className="mt-3 bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                      <p className="text-sm font-medium text-nfsu-navy mb-2">📄 Project Report</p>
                      {req.report_url ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <a href={req.report_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-sm text-nfsu-blue hover:underline">
                              📥 {req.report_filename || 'Download Report'}
                            </a>
                            <span className="text-xs text-gray-400">
                              Uploaded {new Date(req.report_uploaded_at).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          {req.plagiarism_score !== null && req.plagiarism_score !== undefined ? (
                            <div className={`rounded-lg px-3 py-2 text-xs border ${
                              req.plagiarism_score <= 20 ? 'bg-green-50 border-green-200 text-green-700' :
                              req.plagiarism_score <= 40 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                              'bg-red-50 border-red-200 text-red-700'
                            }`}>
                              <strong>Plagiarism Check:</strong> {req.plagiarism_score}%
                              {req.plagiarism_remarks && <p className="mt-0.5">{req.plagiarism_remarks}</p>}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">⏳ Awaiting plagiarism check from faculty...</p>
                          )}
                          <button onClick={() => reportInputRefs.current[req.id]?.click()}
                            className="text-xs text-gray-400 hover:text-nfsu-blue">🔄 Re-upload</button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Upload your project report PDF for plagiarism check.</p>
                          <button onClick={() => reportInputRefs.current[req.id]?.click()}
                            disabled={uploadingId === req.id}
                            className="btn-primary text-xs px-4 py-2 disabled:opacity-60">
                            {uploadingId === req.id ? '⏳ Uploading...' : '📤 Upload Report PDF'}
                          </button>
                          {uploadError[req.id] && <p className="text-xs text-red-600 mt-1">⚠️ {uploadError[req.id]}</p>}
                        </div>
                      )}
                      <input ref={el => { reportInputRefs.current[req.id] = el }}
                        type="file" accept=".pdf" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadReport(req.id, f); e.target.value = '' }} />
                    </div>
                  )}

                  {/* Add to repository button — show if plagiarism done and no pending submission */}
                  {req.status === 'accepted' &&
                   req.plagiarism_score !== null && req.plagiarism_score !== undefined &&
                   req.plagiarism_score <= 40 && (
                    <div className="mt-3">
                      {repoSubmissions.some(rs => rs.title === req.project_title) ? (
                        <div className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                          📁 Repository submission sent — awaiting guide approval
                        </div>
                      ) : showRepoForm === req.id ? (
                        <form onSubmit={e => submitToRepo(e, req.id, 0)} className="bg-green-50/50 border border-green-100 rounded-xl p-4 space-y-3">
                          <p className="text-sm font-medium text-green-800">📁 Submit Project to Repository</p>
                          {repoError && <p className="text-xs text-red-600">⚠️ {repoError}</p>}
                          <div>
                            <label className="form-label">Project Title *</label>
                            <input type="text" value={repoForm.title || req.project_title}
                              onChange={e => setRF('title', e.target.value)} required className="form-input text-sm"
                              placeholder="Final project title" />
                          </div>
                          <div>
                            <label className="form-label">Description *</label>
                            <textarea value={repoForm.description} onChange={e => setRF('description', e.target.value)}
                              rows={3} required placeholder="Describe your project methodology, tools, and outcomes..."
                              className="form-input resize-none text-sm" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="form-label">Technologies Used</label>
                              <input type="text" value={repoForm.technologies} onChange={e => setRF('technologies', e.target.value)}
                                placeholder="Python, TensorFlow, React..." className="form-input text-sm" />
                            </div>
                            <div>
                              <label className="form-label">Keywords</label>
                              <input type="text" value={repoForm.keywords} onChange={e => setRF('keywords', e.target.value)}
                                placeholder="Machine Learning, Security..." className="form-input text-sm" />
                            </div>
                            <div>
                              <label className="form-label">GitHub URL</label>
                              <input type="url" value={repoForm.github_url} onChange={e => setRF('github_url', e.target.value)}
                                placeholder="https://github.com/..." className="form-input text-sm" />
                            </div>
                            <div>
                              <label className="form-label">Live Project URL</label>
                              <input type="url" value={repoForm.project_url} onChange={e => setRF('project_url', e.target.value)}
                                placeholder="https://yourproject.vercel.app" className="form-input text-sm" />
                            </div>
                          </div>
                          <div>
                            <label className="form-label">Achievements</label>
                            <input type="text" value={repoForm.achievements} onChange={e => setRF('achievements', e.target.value)}
                              placeholder="Published paper, won award, deployed in production..." className="form-input text-sm" />
                          </div>
                          <div className="flex gap-3">
                            <button type="submit" disabled={repoSubmitting} className="btn-primary text-sm disabled:opacity-60">
                              {repoSubmitting ? 'Submitting...' : '📁 Send to Guide for Approval'}
                            </button>
                            <button type="button" onClick={() => setShowRepoForm(null)} className="btn-outline text-sm">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <button onClick={() => { setShowRepoForm(req.id); setRepoForm(f => ({ ...f, title: req.project_title })) }}
                          className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 rounded-xl px-4 py-2 transition-colors">
                          📁 Add to Repository
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Repository submissions status */}
          {repoSubmissions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-heading font-semibold text-nfsu-navy">📁 Repository Submissions</h2>
                <p className="text-xs text-gray-400 mt-0.5">Status of your project repository submissions</p>
              </div>
              <div className="divide-y divide-gray-100">
                {repoSubmissions.map(rs => (
                  <div key={rs.id} className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`badge ${STATUS_STYLE[rs.status] || ''}`}>{STATUS_ICON[rs.status]} {rs.status}</span>
                      <span className={`badge ${rs.project_type === 'major' ? 'badge-major' : 'badge-minor'}`}>{rs.project_type}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm">{rs.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Guide: {rs.guide_name} · {new Date(rs.created_at).toLocaleDateString('en-IN')}
                    </p>
                    {rs.guide_remarks && (
                      <div className={`mt-2 text-xs px-3 py-2 rounded-lg border ${
                        rs.status === 'approved' ? 'bg-green-50 border-green-200 text-green-700' :
                        rs.status === 'revision' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                        'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        <strong>Guide Remarks:</strong> {rs.guide_remarks}
                      </div>
                    )}
                    {rs.status === 'approved' && (
                      <p className="text-xs text-green-600 mt-1 font-medium">🎉 Your project has been added to the NFSU repository!</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 pb-4">
            © {new Date().getFullYear()} NFSU · Created &amp; Managed by{' '}
            <a href="https://tamannakhurana.vercel.app/" target="_blank" rel="noopener noreferrer"
              className="font-medium hover:underline" style={{ color: '#E8A820' }}>Tamanna Khurana</a>
          </p>
        </main>
      </div>
    </div>
  )
}