'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Request {
  id: number
  student_name: string; student_email: string; enrollment_number: string
  batch_start_year: number; batch_end_year: number
  project_title: string; project_domain: string; project_type: string; description: string
  status: string; faculty_note: string; created_at: string
  course_name: string; course_short: string; spec_name: string
}

function getCurrentSem(batchStartYear: number, batchEndYear: number): number {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const yearsCompleted = currentYear - batchStartYear
  const sem = currentMonth >= 7 ? yearsCompleted * 2 + 1 : yearsCompleted * 2
  const totalSem = (batchEndYear - batchStartYear) * 2
  return Math.min(Math.max(1, sem), totalSem)
}

export default function FacultyGuidancePage() {
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState<number | null>(null)
  const [note, setNote] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.user.role !== 'faculty' && data.user.role !== 'admin') { router.push('/login'); return }
        return fetch('/api/guidance-requests')
      })
      .then(r => r?.json())
      .then(data => { setRequests(data?.requests || []); setLoading(false) })
      .catch(() => router.push('/login'))
  }, [router])

  async function respond(id: number, status: 'accepted' | 'rejected') {
    const res = await fetch(`/api/guidance-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, faculty_note: note })
    })
    if (res.ok) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status, faculty_note: note } : r))
      setResponding(null); setNote('')
    }
  }

  const pending = requests.filter(r => r.status === 'pending')
  const responded = requests.filter(r => r.status !== 'pending')

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-nfsu-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-nfsu-offwhite">
      <header className="nfsu-header-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/faculty/dashboard" className="flex items-center gap-2 text-white/70 hover:text-white text-sm">← Dashboard</Link>
          <h1 className="font-heading font-bold text-white">Guidance Requests</h1>
          <div />
        </div>
        <div className="gold-line" />
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Pending */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-amber-50/50">
            <h2 className="font-heading font-semibold text-nfsu-navy">⏳ Pending Requests ({pending.length})</h2>
          </div>
          {pending.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No pending requests</div>
          ) : pending.map(req => {
            const sem = req.batch_start_year && req.batch_end_year
              ? getCurrentSem(req.batch_start_year, req.batch_end_year)
              : null
            return (
              <div key={req.id} className="px-6 py-5 border-b border-gray-100 last:border-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Project title */}
                    <h3 className="font-semibold text-gray-900">{req.project_title}</h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`badge ${req.project_type === 'major' ? 'badge-major' : 'badge-minor'}`}>
                        {req.project_type === 'major' ? '⭐' : '📌'} {req.project_type}
                      </span>
                      {req.project_domain && <span className="tag-pill">{req.project_domain}</span>}
                    </div>

                    {/* Student info */}
                    <div className="mt-3 bg-gray-50 rounded-xl px-4 py-3 space-y-1.5">
                      <p className="text-sm font-medium text-gray-900">
                        {req.student_name}
                        {req.enrollment_number && <span className="text-gray-400 font-normal text-xs ml-2">({req.enrollment_number})</span>}
                      </p>
                      <p className="text-xs text-gray-500">{req.student_email}</p>

                      {/* Course + batch + semester */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {req.course_name && (
                          <span className="tag-pill bg-blue-50 text-blue-700 border-blue-200">
                            🎓 {req.course_short || req.course_name}
                          </span>
                        )}
                        {req.spec_name && (
                          <span className="tag-pill bg-purple-50 text-purple-700 border-purple-200">
                            {req.spec_name}
                          </span>
                        )}
                        {req.batch_start_year && (
                          <span className="tag-pill bg-gray-100 text-gray-600 border-gray-200">
                            Batch {req.batch_start_year}–{req.batch_end_year}
                          </span>
                        )}
                        {sem && (
                          <span className="tag-pill bg-amber-50 text-amber-700 border-amber-200">
                            📚 Sem {sem}
                          </span>
                        )}
                      </div>
                    </div>

                    {req.description && (
                      <p className="text-sm text-gray-500 mt-2 bg-white border border-gray-100 rounded-lg px-3 py-2">
                        {req.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Received: {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Respond buttons */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {responding === req.id ? (
                      <div className="w-64">
                        <textarea value={note} onChange={e => setNote(e.target.value)}
                          placeholder="Add a note for the student (optional)..." rows={2}
                          className="form-input resize-none text-sm mb-2" />
                        <div className="flex gap-2">
                          <button onClick={() => respond(req.id, 'accepted')}
                            className="flex-1 text-xs px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                            ✅ Accept
                          </button>
                          <button onClick={() => respond(req.id, 'rejected')}
                            className="flex-1 text-xs px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                            ❌ Reject
                          </button>
                          <button onClick={() => { setResponding(null); setNote('') }}
                            className="btn-outline text-xs px-3 py-2">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setResponding(req.id)} className="btn-primary text-sm px-4 py-2">
                        Respond
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Past responses */}
        {responded.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading font-semibold text-nfsu-navy">Past Responses ({responded.length})</h2>
            </div>
            {responded.map(req => (
              <div key={req.id} className="px-6 py-4 border-b border-gray-100 last:border-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`badge ${req.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {req.status === 'accepted' ? '✅' : '❌'} {req.status}
                      </span>
                      <span className={`badge ${req.project_type === 'major' ? 'badge-major' : 'badge-minor'}`}>
                        {req.project_type}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-800 text-sm">{req.project_title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      From: <strong>{req.student_name}</strong>
                      {req.course_short && ` · ${req.course_short}`}
                      {req.batch_start_year && ` · Batch ${req.batch_start_year}–${req.batch_end_year}`}
                      {' · '}{new Date(req.created_at).toLocaleDateString('en-IN')}
                    </p>
                    {req.faculty_note && (
                      <p className="text-xs text-gray-400 mt-1 italic">Your note: {req.faculty_note}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}