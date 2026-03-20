// Save as: app/student/dashboard/page.tsx
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
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const [form, setForm] = useState({
    faculty_id: '', project_title: '', project_domain: '',
    description: '', project_type: 'major'
  })

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.user.role !== 'student') { router.push('/login'); return }
        setUser(data.user)
        return Promise.all([
          fetch('/api/faculty').then(r => r.json()),
          fetch('/api/guidance-requests').then(r => r.json()),
        ])
      })
      .then(results => {
        if (results) {
          setFaculty(results[0].faculty || [])
          setRequests(results[1].requests || [])
        }
        setLoading(false)
      })
      .catch(() => router.push('/student/login'))
  }, [router])

  // Current semester calculation
  const currentSem = (() => {
    if (!user?.batch_start_year) return null
    const now = new Date()
    const monthsElapsed = (now.getFullYear() - user.batch_start_year) * 12 + now.getMonth()
    return Math.min(Math.max(1, Math.ceil((monthsElapsed + 1) / 6)), 10)
  })()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/student/login')
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
      if (!res.ok) { setFormError(data.error); setSubmitting(false); return }
      setFormSuccess('Request sent successfully!')
      setRequests(prev => [...prev, { ...data.request, faculty_name: faculty.find(f => f.id === parseInt(form.faculty_id))?.name || '' }])
      setForm({ faculty_id: '', project_title: '', project_domain: '', description: '', project_type: 'major' })
      setTimeout(() => { setShowForm(false); setFormSuccess('') }, 2000)
    } catch {
      setFormError('Failed to send request')
    }
    setSubmitting(false)
  }

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const statusColor = (s: string) => s === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : s === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
  const statusIcon = (s: string) => s === 'accepted' ? '✅' : s === 'rejected' ? '❌' : '⏳'

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-nfsu-blue border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-nfsu-offwhite">
      {/* Header */}
      <header className="nfsu-header-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
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
            <div className="flex-1">
              <h1 className="text-xl font-heading font-bold text-nfsu-navy">Welcome, {user?.name?.split(' ')[0]}!</h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {user?.course_name && <span className="badge bg-blue-50 text-blue-700 border-blue-200">{user.course_name}</span>}
                {user?.spec_name && <span className="badge bg-purple-50 text-purple-700 border-purple-200">{user.spec_name}</span>}
                {user?.campus_name && <span className="badge bg-gray-50 text-gray-600 border-gray-200">📍 {user.campus_name}</span>}
                {currentSem && <span className="badge bg-amber-50 text-amber-700 border-amber-200">📚 Semester {currentSem}</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div><p className="text-xs text-gray-400">Enrollment</p><p className="text-sm font-medium text-gray-800 mt-0.5">{user?.enrollment_number || '—'}</p></div>
            <div><p className="text-xs text-gray-400">Batch</p><p className="text-sm font-medium text-gray-800 mt-0.5">{user?.batch_start_year}–{user?.batch_end_year}</p></div>
            <div><p className="text-xs text-gray-400">Current Semester</p><p className="text-sm font-medium text-gray-800 mt-0.5">{currentSem ? `Sem ${currentSem}` : '—'}</p></div>
            <div><p className="text-xs text-gray-400">Requests Sent</p><p className="text-sm font-medium text-gray-800 mt-0.5">{requests.length}</p></div>
          </div>
        </div>

        {/* Send new guidance request */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-heading font-semibold text-nfsu-navy">Project Guidance Requests</h2>
              <p className="text-xs text-gray-400 mt-0.5">Select a faculty member and send a guidance request for your project</p>
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
                    rows={3} placeholder="Briefly describe what you want to work on and why you chose this faculty..."
                    className="form-input resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
                  {submitting ? 'Sending...' : '📨 Send Guidance Request'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          )}

          {/* Requests list */}
          <div className="divide-y divide-gray-100">
            {requests.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p className="text-3xl mb-2">📬</p>
                <p className="font-medium">No requests yet</p>
                <p className="text-sm mt-1">Send your first project guidance request to a faculty member</p>
              </div>
            ) : (
              requests.map(req => (
                <div key={req.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge ${statusColor(req.status)}`}>{statusIcon(req.status)} {req.status}</span>
                        <span className="badge bg-gray-50 text-gray-500 border-gray-200 text-xs">{req.project_type}</span>
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
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          © {new Date().getFullYear()} NFSU · Created &amp; Managed by <span className="text-nfsu-amber font-medium">Tamanna Khurana</span>
        </p>
      </main>
    </div>
  )
}