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
  report_url: string; report_filename: string; report_uploaded_at: string
  plagiarism_score: number; plagiarism_remarks: string; plagiarism_checked_at: string
  request_doc_url: string; request_doc_filename: string
  co_guide_id: number; co_guide_name: string
}

interface FacultyMember { id: number; name: string; designation: string; department: string }

function getCurrentSem(batchStartYear: number, batchEndYear: number): number {
  const now = new Date()
  const yearsCompleted = now.getFullYear() - batchStartYear
  const sem = (now.getMonth() + 1) >= 7 ? yearsCompleted * 2 + 1 : yearsCompleted * 2
  const totalSem = (batchEndYear - batchStartYear) * 2
  return Math.min(Math.max(1, sem), totalSem)
}

const STATUS_STYLE: Record<string, string> = {
  accepted:  'bg-green-50 text-green-700 border-green-200',
  rejected:  'bg-red-50 text-red-700 border-red-200',
  held:      'bg-purple-50 text-purple-700 border-purple-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
}
const STATUS_ICON: Record<string, string> = {
  accepted: '✅', rejected: '❌', held: '⏸️', cancelled: '🚫', pending: '⏳'
}

export default function FacultyGuidancePage() {
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [allFaculty, setAllFaculty] = useState<FacultyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [plagiarismForm, setPlagiarismForm] = useState<Record<number, { score: string; remarks: string }>>({})
  const [plagiarismLoading, setPlagiarismLoading] = useState<number | null>(null)
  const [plagiarismSuccess, setPlagiarismSuccess] = useState<number | null>(null)
  const [coGuideOpen, setCoGuideOpen] = useState<number | null>(null)
  const [coGuideId, setCoGuideId] = useState('')
  const [coGuideLoading, setCoGuideLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.user.role !== 'faculty' && data.user.role !== 'admin') { router.push('/login'); return }
        setCurrentUserId(data.user.id)
        return Promise.all([
          fetch('/api/guidance-requests'),
          fetch('/api/faculty'),
        ])
      })
      .then(results => {
        if (results) {
          results[0].json().then(d => setRequests(d?.requests || []))
          results[1].json().then(d => setAllFaculty(d?.faculty || []))
        }
        setLoading(false)
      })
      .catch(() => router.push('/login'))
  }, [router])

  async function respond(id: number, status: 'accepted' | 'rejected' | 'held') {
    setActionLoading(true)
    const res = await fetch(`/api/guidance-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, faculty_note: note })
    })
    if (res.ok) {
      if (status === 'accepted') {
        const fresh = await fetch('/api/guidance-requests').then(r => r.json())
        setRequests(fresh.requests || [])
      } else {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status, faculty_note: note } : r))
      }
      setResponding(null); setNote('')
    }
    setActionLoading(false)
  }

  async function submitPlagiarism(id: number) {
    const pf = plagiarismForm[id]
    if (!pf?.score) return
    setPlagiarismLoading(id)
    const res = await fetch(`/api/guidance-requests/${id}/report`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plagiarism_score: parseInt(pf.score), plagiarism_remarks: pf.remarks })
    })
    if (res.ok) {
      setRequests(prev => prev.map(r => r.id === id
        ? { ...r, plagiarism_score: parseInt(pf.score), plagiarism_remarks: pf.remarks, plagiarism_checked_at: new Date().toISOString() }
        : r
      ))
      setPlagiarismSuccess(id)
      setTimeout(() => setPlagiarismSuccess(null), 3000)
    }
    setPlagiarismLoading(null)
  }

  async function assignCoGuide(id: number) {
    setCoGuideLoading(true)
    const res = await fetch(`/api/guidance-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ co_guide_id: coGuideId ? parseInt(coGuideId) : null })
    })
    if (res.ok) {
      const selected = allFaculty.find(f => f.id === parseInt(coGuideId))
      setRequests(prev => prev.map(r => r.id === id
        ? { ...r, co_guide_id: parseInt(coGuideId), co_guide_name: selected?.name || '' }
        : r
      ))
      setCoGuideOpen(null)
      setCoGuideId('')
    }
    setCoGuideLoading(false)
  }

  const setPF = (id: number, key: string, val: string) =>
    setPlagiarismForm(prev => ({ ...prev, [id]: { ...prev[id], [key]: val } }))

  const pending = requests.filter(r => r.status === 'pending')
  const held = requests.filter(r => r.status === 'held')
  const accepted = requests.filter(r => r.status === 'accepted')
  const responded = requests.filter(r => ['rejected', 'cancelled'].includes(r.status))

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-nfsu-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const RequestCard = ({ req }: { req: Request }) => {
    const sem = req.batch_start_year && req.batch_end_year
      ? getCurrentSem(req.batch_start_year, req.batch_end_year) : null
    const isResponding = responding === req.id
    const pf = plagiarismForm[req.id] || { score: '', remarks: '' }
    const isCoGuideOpen = coGuideOpen === req.id

    return (
      <div className="px-6 py-5 border-b border-gray-100 last:border-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`badge ${STATUS_STYLE[req.status]}`}>{STATUS_ICON[req.status]} {req.status}</span>
              <span className={`badge ${req.project_type === 'major' ? 'badge-major' : 'badge-minor'}`}>
                {req.project_type === 'major' ? '⭐' : '📌'} {req.project_type}
              </span>
              {req.co_guide_name && (
                <span className="badge bg-indigo-50 text-indigo-700 border-indigo-200">
                  👥 Co-guide: {req.co_guide_name}
                </span>
              )}
            </div>

            <h3 className="font-semibold text-gray-900">{req.project_title}</h3>
            {req.project_domain && <span className="tag-pill mt-1 inline-block">{req.project_domain}</span>}

            {/* Student info */}
            <div className="mt-3 bg-gray-50 rounded-xl px-4 py-3 space-y-1.5">
              <p className="text-sm font-medium text-gray-900">
                {req.student_name}
                {req.enrollment_number && <span className="text-gray-400 font-normal text-xs ml-2">({req.enrollment_number})</span>}
              </p>
              <p className="text-xs text-gray-500">{req.student_email}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {req.course_name && <span className="tag-pill bg-blue-50 text-blue-700 border-blue-200">🎓 {req.course_short || req.course_name}</span>}
                {req.spec_name && <span className="tag-pill bg-purple-50 text-purple-700 border-purple-200">{req.spec_name}</span>}
                {req.batch_start_year && <span className="tag-pill">Batch {req.batch_start_year}–{req.batch_end_year}</span>}
                {sem && <span className="tag-pill bg-amber-50 text-amber-700 border-amber-200">📚 Sem {sem}</span>}
              </div>
              {req.request_doc_url && (
                <a href={req.request_doc_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-nfsu-blue hover:underline pt-1">
                  📎 View student&apos;s document — {req.request_doc_filename}
                </a>
              )}
            </div>

            {req.description && (
              <p className="text-sm text-gray-500 mt-2 bg-white border border-gray-100 rounded-lg px-3 py-2">{req.description}</p>
            )}

            {/* Co-guide assignment — accepted requests */}
            {req.status === 'accepted' && (
              <div className="mt-3">
                {isCoGuideOpen ? (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-medium text-indigo-800">👥 Share with Co-guide</p>
                    <p className="text-xs text-indigo-600">Select a faculty member to co-guide this project with you. They will be listed as co-guide on the student&apos;s dashboard.</p>
                    <select value={coGuideId} onChange={e => setCoGuideId(e.target.value)} className="form-input text-sm">
                      <option value="">— Select co-guide —</option>
                      <option value="">Remove co-guide</option>
                      {allFaculty.filter(f => f.id !== currentUserId).map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name}{f.designation ? ` (${f.designation})` : ''}{f.department ? ` — ${f.department}` : ''}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => assignCoGuide(req.id)} disabled={coGuideLoading}
                        className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
                        {coGuideLoading ? 'Saving...' : '👥 Assign Co-guide'}
                      </button>
                      <button onClick={() => { setCoGuideOpen(null); setCoGuideId('') }} className="btn-outline text-sm px-4 py-2">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setCoGuideOpen(req.id); setCoGuideId(req.co_guide_id?.toString() || '') }}
                    className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg px-3 py-1.5 transition-colors">
                    👥 {req.co_guide_name ? `Co-guide: ${req.co_guide_name} (change)` : 'Add Co-guide / Share with Faculty'}
                  </button>
                )}
              </div>
            )}

            {/* Report + Plagiarism — accepted only */}
            {req.status === 'accepted' && (
              <div className="mt-3 bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-nfsu-navy">📄 Project Report</p>
                {req.report_url ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <a href={req.report_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-nfsu-blue hover:underline font-medium">
                        📥 Download — {req.report_filename}
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
                        ✅ Result submitted: <strong>{req.plagiarism_score}%</strong>
                        {req.plagiarism_remarks && <p className="mt-0.5">{req.plagiarism_remarks}</p>}
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                        <p className="text-sm font-medium text-gray-800">Submit Plagiarism Check Result</p>
                        {plagiarismSuccess === req.id && (
                          <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-3 py-2">✅ Result submitted!</div>
                        )}
                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <label className="form-label">Plagiarism % (0–100)</label>
                            <input type="number" min="0" max="100" value={pf.score}
                              onChange={e => setPF(req.id, 'score', e.target.value)}
                              placeholder="e.g., 12" className="form-input" />
                          </div>
                          <button onClick={() => submitPlagiarism(req.id)}
                            disabled={!pf.score || plagiarismLoading === req.id}
                            className="btn-primary text-sm px-4 py-2.5 disabled:opacity-60 flex-shrink-0">
                            {plagiarismLoading === req.id ? 'Submitting...' : '📊 Submit'}
                          </button>
                        </div>
                        <div>
                          <label className="form-label">Remarks (optional)</label>
                          <textarea value={pf.remarks} onChange={e => setPF(req.id, 'remarks', e.target.value)}
                            rows={2} placeholder="Add notes about the plagiarism check..."
                            className="form-input resize-none text-sm" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">⏳ Student hasn&apos;t uploaded their report yet.</p>
                )}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-2">
              Received: {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          {/* Respond buttons — pending/held only */}
          {(req.status === 'pending' || req.status === 'held') && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              {isResponding ? (
                <div className="w-64">
                  <textarea value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Add a note for the student (optional)..." rows={2}
                    className="form-input resize-none text-sm mb-2" />
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => respond(req.id, 'accepted')} disabled={actionLoading}
                      className="flex-1 text-xs px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg font-medium">✅ Accept</button>
                    <button onClick={() => respond(req.id, 'held')} disabled={actionLoading}
                      className="flex-1 text-xs px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white rounded-lg font-medium">⏸️ Hold</button>
                    <button onClick={() => respond(req.id, 'rejected')} disabled={actionLoading}
                      className="flex-1 text-xs px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg font-medium">❌ Reject</button>
                    <button onClick={() => { setResponding(null); setNote('') }}
                      className="w-full btn-outline text-xs py-2">Cancel</button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">⚠️ Accepting auto-cancels student&apos;s other pending requests.</p>
                </div>
              ) : (
                <button onClick={() => setResponding(req.id)} className="btn-primary text-sm px-4 py-2">Respond</button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nfsu-offwhite">
      <header className="nfsu-header-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/faculty/dashboard" className="text-white/70 hover:text-white text-sm">← Dashboard</Link>
          <h1 className="font-heading font-bold text-white">Guidance Requests</h1>
          <div className="text-xs text-white/50">{pending.length} pending</div>
        </div>
        <div className="gold-line" />
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Pending */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-amber-50/50">
            <h2 className="font-heading font-semibold text-nfsu-navy">⏳ Pending ({pending.length})</h2>
            <p className="text-xs text-gray-400 mt-0.5">Accept, Hold, or Reject each request</p>
          </div>
          {pending.length === 0
            ? <div className="p-10 text-center text-gray-400">No pending requests</div>
            : pending.map(req => <RequestCard key={req.id} req={req} />)
          }
        </div>

        {/* On Hold */}
        {held.length > 0 && (
          <div className="bg-white rounded-2xl border border-purple-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-purple-100 bg-purple-50/50">
              <h2 className="font-heading font-semibold text-purple-800">⏸️ On Hold ({held.length})</h2>
              <p className="text-xs text-purple-400 mt-0.5">You can still accept or reject these</p>
            </div>
            {held.map(req => <RequestCard key={req.id} req={req} />)}
          </div>
        )}

        {/* Accepted — with co-guide, report, plagiarism */}
        {accepted.length > 0 && (
          <div className="bg-white rounded-2xl border border-green-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-green-100 bg-green-50/50">
              <h2 className="font-heading font-semibold text-green-800">✅ My Students ({accepted.length})</h2>
              <p className="text-xs text-green-500 mt-0.5">Manage co-guides, download reports, submit plagiarism results</p>
            </div>
            {accepted.map(req => <RequestCard key={req.id} req={req} />)}
          </div>
        )}

        {/* Rejected / Cancelled */}
        {responded.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading font-semibold text-nfsu-navy">Past Responses ({responded.length})</h2>
            </div>
            {responded.map(req => (
              <div key={req.id} className="px-6 py-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`badge ${STATUS_STYLE[req.status]}`}>{STATUS_ICON[req.status]} {req.status}</span>
                  <span className={`badge ${req.project_type === 'major' ? 'badge-major' : 'badge-minor'}`}>{req.project_type}</span>
                </div>
                <h3 className="font-medium text-gray-800 text-sm">{req.project_title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  From: <strong>{req.student_name}</strong>
                  {req.course_short && ` · ${req.course_short}`}
                  {req.batch_start_year && ` · Batch ${req.batch_start_year}–${req.batch_end_year}`}
                  {' · '}{new Date(req.created_at).toLocaleDateString('en-IN')}
                </p>
                {req.faculty_note && <p className="text-xs text-gray-400 mt-1 italic">Note: {req.faculty_note}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}