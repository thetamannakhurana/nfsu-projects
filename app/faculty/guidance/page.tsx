// Save as: app/faculty/guidance/page.tsx  (new page for faculty to see/respond to requests)
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Request {
  id: number; student_name: string; student_email: string; enrollment_number: string
  project_title: string; project_domain: string; project_type: string; description: string
  status: string; faculty_note: string; created_at: string
  course_name: string; spec_name: string
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-nfsu-blue border-t-transparent rounded-full animate-spin" /></div>

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
          ) : pending.map(req => (
            <div key={req.id} className="px-6 py-5 border-b border-gray-100 last:border-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{req.project_title}</h3>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {req.project_domain && <span className="tag-pill">{req.project_domain}</span>}
                    <span className="badge badge-major">{req.project_type}</span>
                    {req.course_name && <span className="tag-pill">{req.course_name}</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    From: <strong>{req.student_name}</strong> · {req.student_email}
                    {req.enrollment_number && ` · ${req.enrollment_number}`}
                  </p>
                  {req.description && <p className="text-sm text-gray-500 mt-1.5 bg-gray-50 rounded-lg px-3 py-2">{req.description}</p>}
                  <p className="text-xs text-gray-400 mt-2">{new Date(req.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {responding === req.id ? (
                    <div className="w-64">
                      <textarea value={note} onChange={e => setNote(e.target.value)}
                        placeholder="Add a note (optional)..." rows={2}
                        className="form-input resize-none text-sm mb-2" />
                      <div className="flex gap-2">
                        <button onClick={() => respond(req.id, 'accepted')} className="btn-primary text-xs px-3 py-2 bg-green-600 hover:bg-green-700 flex-1">✅ Accept</button>
                        <button onClick={() => respond(req.id, 'rejected')} className="btn-primary text-xs px-3 py-2 bg-red-600 hover:bg-red-700 flex-1">❌ Reject</button>
                        <button onClick={() => { setResponding(null); setNote('') }} className="btn-outline text-xs px-3 py-2">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setResponding(req.id)} className="btn-primary text-sm px-4 py-2">Respond</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Responded */}
        {responded.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading font-semibold text-nfsu-navy">Past Responses ({responded.length})</h2>
            </div>
            {responded.map(req => (
              <div key={req.id} className="px-6 py-4 border-b border-gray-100 last:border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${req.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {req.status === 'accepted' ? '✅' : '❌'} {req.status}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-800 text-sm">{req.project_title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">From: {req.student_name} · {new Date(req.created_at).toLocaleDateString('en-IN')}</p>
                    {req.faculty_note && <p className="text-xs text-gray-500 mt-1">Your note: {req.faculty_note}</p>}
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