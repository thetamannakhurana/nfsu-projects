'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface User {
  id: number; name: string; email: string; role: string
  campus_name: string; course_name: string; spec_name: string
  batch_start_year: number; batch_end_year: number
  enrollment_number: string
}
interface Faculty { id: number; name: string; designation: string; department: string; campus_name: string }
interface GuidanceRequest {
  id: number; project_title: string; project_domain: string; project_type: string
  status: string; faculty_name: string; faculty_designation: string
  faculty_note: string; created_at: string
}

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [requests, setRequests] = useState<GuidanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const [form, setForm] = useState({
    faculty_id: '', project_title: '', project_domain: '',
    description: '', project_type: 'major'
  })

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        // Step 1: Check auth
        const meRes = await fetch('/api/auth/me')
        if (!meRes.ok) {
          if (mounted) setAuthError('Please login to continue')
          return
        }
        const meData = await meRes.json()
        if (!meData.user || meData.user.role !== 'student') {
          if (mounted) setAuthError('Access denied. Student accounts only.')
          return
        }
        if (mounted) setUser(meData.user)

        // Step 2: Load faculty list
        const facultyRes = await fetch('/api/faculty')
        if (facultyRes.ok) {
          const facultyData = await facultyRes.json()
          if (mounted) setFaculty(facultyData.faculty || [])
        }

        // Step 3: Load guidance requests
        const reqRes = await fetch('/api/guidance-requests')
        if (reqRes.ok) {
          const reqData = await reqRes.json()
          if (mounted) setRequests(reqData.requests || [])
        }

      } catch (err) {
        console.error('Dashboard load error:', err)
        if (mounted) setAuthError('Something went wrong. Please refresh.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => { mounted = false }
  }, [])

  // Current semester calculation
  const currentSem = (() => {
    if (!user?.batch_start_year) return null
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 1-12
    const yearsCompleted = currentYear - user.batch_start_year
    // Odd sem = July-Dec, Even sem = Jan-May
    const sem = currentMonth >= 7 ? (yearsCompleted * 2) + 1 : (yearsCompleted * 2)
    return Math.min(Math.max(1, sem), 10)
  })()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/student/login'
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault()
    setFormError(''); setFormSuccess(''); setSubmitting(true)
    try {
      const res = await fetch('/api/guidance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, faculty_id: parseInt(form.faculty_id) })
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error || 'Failed to send'); setSubmitting(false); return }
      setFormSuccess('Request sent successfully!')
      const selectedFaculty = faculty.find(f => f.id === parseInt(form.faculty_id))
      setRequests(prev => [...prev, {
        ...data.request,
        faculty_name: selectedFaculty?.name || '',
        faculty_designation: selectedFaculty?.designation || '',
      }])
      setForm({ faculty_id: '', project_title: '', project_domain: '', description: '', project_type: 'major' })
      setTimeout(() => { setShowForm(false); setFormSuccess('') }, 2000)
    } catch {
      setFormError('Failed to send request. Try again.')
    }
    setSubmitting(false)
  }

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const statusColor = (s: string) => s === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : s === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
  const statusIcon = (s: string) => s === 'accepted' ? '✅' : s === 'rejected' ? '❌' : '⏳'

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-nfsu-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-nfsu-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Auth error state — show message with login link, NO auto redirect
  if (authError || !user) {
    return (
      <div className="min-h-screen bg-nfsu-offwhite flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-2xl border border-gray-200 p-8 max-w-sm w-full">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="font-heading font-bold text-nfsu-navy text-lg mb-2">Session Expired</h2>
          <p className="text-gray-500 text-sm mb-5">{authError || 'Please login to access your dashboard.'}</p>
          <a href="/student/login" className="btn-primary w-full justify-center">
            Go to Student Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nfsu-offwhite">
      {/* Header */}
      <header className="nfsu-header-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/15 rounded-lg border border-nfsu-gold/40 flex items-center justify-center">⚖️</div>
            <div>
              <div className="text-xs text-white/60">NFSU Projects Database</div>
              <div className="text-sm font-semibold">Student Portal</div>
            </div>
          </Link>
          <button onClick={handleLogout} className="text-white/60 text-sm hover:text-white transition-colors flex items-center gap-1.5">
            🚪 Logout
          </button>
        </div>
        <div className="gold-line" />
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-nfsu-navy rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🎓</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-heading font-bold text-nfsu-navy">Welcome, {user.name.split(' ')[0]}!</h1>
              <p className="text-gray-500 text-sm truncate">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {user.course_name && <span className="badge bg-blue-50 text-blue-700 border-blue-200">{user.course_name}</span>}
                {user.spec_name && <span className="badge bg-purple-50 text-purple-700 border-purple-200">{user.spec_name}</span>}
                {user.campus_name && <span className="badge bg-gray-50 text-gray-600 border-gray-200">📍 {user.campus_name}</span>}
                {currentSem && <span className="badge bg-amber-50 text-amber-700 border-amber-200">📚 Semester {currentSem}</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div><p className="text-xs text-gray-400">Enrollment</p><p className="text-sm font-medium text-gray-800 mt-0.5">{user.enrollment_number || '—'}</p></div>
            <div><p className="text-xs text-gray-400">Batch</p><p className="text-sm font-medium text-gray-800 mt-0.5">{user.batch_start_year ? `${user.batch_start_year}–${user.batch_end_year}` : '—'}</p></div>
            <div><p className="text-xs text-gray-400">Current Semester</p><p className="text-sm font-medium text-gray-800 mt-0.5">{currentSem ? `Sem ${currentSem}` : '—'}</p></div>
            <div><p className="text-xs text-gray-400">Requests Sent</p><p className="text-sm font-medium text-gray-800 mt-0.5">{requests.length}</p></div>
          </div>
        </div>

        {/* Guidance requests section */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-heading font-semibold text-nfsu-navy">Project Guidance Requests</h2>
              <p className="text-xs text-gray-400 mt-0.5">Send a request to a faculty member for project guidance</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm px-4 py-2">
              {showForm ? '✕ Cancel' : '+ New Request'}
            </button>
          </div>

          {/* New request form */}
          {showForm && (
            <form onSubmit={submitRequest} className="p-6 border-b border-gray-100 bg-gray-50/50">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">⚠️ {formError}</div>}
              {formSuccess && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">✅ {formSuccess}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="form-label">Select Faculty Guide *</label>
                  <select value={form.faculty_id} onChange={e => setF('faculty_id', e.target.value)} required className="form-input">
                    <option value="">— Choose a faculty member —</option>
                    {faculty.length === 0 ? (
                      <option disabled>No faculty available yet</option>
                    ) : faculty.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name}{f.designation ? ` (${f.designation})` : ''}{f.department ? ` — ${f.department}` : ''}
                      </option>
                    ))}
                  </select>
                  {faculty.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">⚠️ No faculty added yet. Admin needs to add faculty members first.</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Project Title *</label>
                  <input type="text" value={form.project_title} onChange={e => setF('project_title', e.target.value)}
                    required placeholder="e.g., AI-based Network Intrusion Detection" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Domain / Area</label>
                  <input type="text" value={form.project_domain} onChange={e => setF('project_domain', e.target.value)}
                    placeholder="e.g., Cyber Security, ML, Forensics" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Project Type</label>
                  <select value={form.project_type} onChange={e => setF('project_type', e.target.value)} className="form-input">
                    <option value="major">⭐ Major Project</option>
                    <option value="minor">📌 Minor Project</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Brief Description</label>
                  <textarea value={form.description} onChange={e => setF('description', e.target.value)}
                    rows={3} placeholder="Briefly describe your project idea and why you chose this faculty..."
                    className="form-input resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
                  {submitting ? 'Sending...' : '📨 Send Guidance Request'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setFormError('') }} className="btn-outline">Cancel</button>
              </div>
            </form>
          )}

          {/* Requests list */}
          <div className="divide-y divide-gray-100">
            {requests.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p className="text-3xl mb-2">📬</p>
                <p className="font-medium">No requests yet</p>
                <p className="text-sm mt-1">Click &quot;+ New Request&quot; to send your first guidance request</p>
              </div>
            ) : requests.map(req => (
              <div key={req.id} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`badge ${statusColor(req.status)}`}>{statusIcon(req.status)} {req.status}</span>
                      <span className="badge bg-gray-50 text-gray-500 border-gray-200">{req.project_type}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{req.project_title}</h3>
                    {req.project_domain && <p className="text-xs text-gray-500 mt-0.5">Domain: {req.project_domain}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      Sent to <span className="font-medium text-gray-600">{req.faculty_name}</span>
                      {req.faculty_designation && ` (${req.faculty_designation})`}
                      {' · '}{new Date(req.created_at).toLocaleDateString('en-IN')}
                    </p>
                    {req.faculty_note && (
                      <div className={`mt-2 text-xs px-3 py-2 rounded-lg border ${req.status === 'accepted' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        <strong>Faculty Note:</strong> {req.faculty_note}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          © {new Date().getFullYear()} NFSU · Created &amp; Managed by <span className="font-medium" style={{color:'#E8A820'}}>Tamanna Khurana</span>
        </p>
      </main>
    </div>
  )
}