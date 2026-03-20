'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NFSU_COURSES, getCurrentSemester, getProjectTypeForSem } from '@/lib/nfsu-constants'

interface Campus { id: number; name: string; code: string }

export default function StudentRegisterPage() {
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    enrollment_number: '', campus_id: '', course_name: '', batch_start_year: '',
  })

  useEffect(() => {
    fetch('/api/campuses').then(r => r.json()).then(d => setCampuses(d.campuses || []))
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const selectedCourse = NFSU_COURSES.find(c => c.name === form.course_name)
  const batchEnd = form.batch_start_year && selectedCourse
    ? parseInt(form.batch_start_year) + selectedCourse.duration : null
  const currentSem = form.batch_start_year && selectedCourse
    ? getCurrentSemester(parseInt(form.batch_start_year), selectedCourse.totalSem) : null
  const projectType = currentSem && selectedCourse
    ? getProjectTypeForSem(currentSem, selectedCourse.totalSem) : null

  const projectMessage = () => {
    if (!currentSem || !selectedCourse) return null
    const type = getProjectTypeForSem(currentSem, selectedCourse.totalSem)
    if (type === 'major') return { text: `You are in Semester ${currentSem} — eligible for Major Project only`, color: 'bg-amber-50 border-amber-200 text-amber-800' }
    if (type === 'minor') return { text: `You are in Semester ${currentSem} — eligible for Minor Project only`, color: 'bg-blue-50 border-blue-200 text-blue-800' }
    return { text: `You are in Semester ${currentSem}`, color: 'bg-green-50 border-green-200 text-green-800' }
  }

  const msg = projectMessage()
  const years = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.email.endsWith('@nfsu.ac.in')) { setError('Only NFSU email addresses (@nfsu.ac.in) are allowed'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, password: form.password,
          enrollment_number: form.enrollment_number,
          campus_id: form.campus_id ? parseInt(form.campus_id) : null,
          course_name: form.course_name,
          batch_start_year: form.batch_start_year ? parseInt(form.batch_start_year) : null,
          batch_end_year: batchEnd,
          current_semester: currentSem,
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      setSuccess(true)
    } catch {
      setError('Registration failed. Try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-nfsu-offwhite flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="font-heading font-bold text-nfsu-navy text-xl mb-2">Registration Successful!</h2>
          <p className="text-gray-500 text-sm mb-5">Your account has been created. You can now login.</p>
          <a href="/student/login" className="btn-primary w-full justify-center">Go to Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nfsu-offwhite flex flex-col">
      <div className="nfsu-header-bg text-white px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/15 rounded-lg border border-nfsu-gold/40 flex items-center justify-center">⚖️</div>
            <div>
              <div className="text-xs text-white/60">NFSU</div>
              <div className="text-sm font-semibold">Projects Database</div>
            </div>
          </Link>
          <Link href="/student/login" className="text-white/60 text-sm hover:text-white">Already registered? Login →</Link>
        </div>
      </div>
      <div className="gold-line" />

      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 pt-8 pb-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-nfsu-navy rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">🎓</div>
            <h1 className="text-2xl font-heading font-bold text-nfsu-navy">Student Registration</h1>
            <p className="text-gray-500 text-sm mt-1">Register with your NFSU email to send project guidance requests</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">⚠️ {error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Personal */}
              <div>
                <label className="form-label">Full Name *</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  required placeholder="As per university records" className="form-input" />
              </div>
              <div>
                <label className="form-label">NFSU Email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  required placeholder="yourname@nfsu.ac.in" className="form-input" />
                <p className="text-xs text-gray-400 mt-1">Only @nfsu.ac.in emails are accepted</p>
              </div>
              <div>
                <label className="form-label">Enrollment Number</label>
                <input type="text" value={form.enrollment_number} onChange={e => set('enrollment_number', e.target.value)}
                  placeholder="University enrollment number" className="form-input" />
              </div>

              {/* Academic */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Academic Details</p>

                <div className="space-y-4">
                  <div>
                    <label className="form-label">Campus *</label>
                    <select value={form.campus_id} onChange={e => set('campus_id', e.target.value)} required className="form-input">
                      <option value="">Select Campus</option>
                      {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Course / Program *</label>
                    <select value={form.course_name} onChange={e => set('course_name', e.target.value)} required className="form-input">
                      <option value="">Select your course</option>
                      <optgroup label="B.Tech (4 Years)">
                        {NFSU_COURSES.filter(c => c.duration === 4).map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="B.Tech-M.Tech Integrated (5 Years)">
                        {NFSU_COURSES.filter(c => c.duration === 5 && c.name.includes('B.Tech-M.Tech')).map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="M.Tech (2 Years)">
                        {NFSU_COURSES.filter(c => c.duration === 2 && c.name.startsWith('M.Tech')).map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="M.Sc (2 Years)">
                        {NFSU_COURSES.filter(c => c.duration === 2 && c.name.startsWith('M.Sc')).map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="B.Sc-M.Sc Integrated (5 Years)">
                        {NFSU_COURSES.filter(c => c.duration === 5 && c.name.startsWith('B.Sc')).map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="BBA-MBA (5 Years)">
                        {NFSU_COURSES.filter(c => c.name.startsWith('BBA')).map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="M.A (2 Years)">
                        {NFSU_COURSES.filter(c => c.name.startsWith('M.A')).map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Ph.D (3 Years)">
                        {NFSU_COURSES.filter(c => c.name.startsWith('Ph.D')).map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                    </select>
                    {selectedCourse && (
                      <p className="text-xs text-gray-400 mt-1">
                        Duration: {selectedCourse.duration} years · {selectedCourse.totalSem} semesters
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Batch Start Year *</label>
                      <select value={form.batch_start_year} onChange={e => set('batch_start_year', e.target.value)} required className="form-input">
                        <option value="">Select Year</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Batch End Year</label>
                      <input type="text" value={batchEnd || ''} readOnly
                        placeholder="Auto-calculated" className="form-input bg-gray-50 text-gray-500 cursor-not-allowed" />
                    </div>
                  </div>

                  {/* Smart semester + project type info */}
                  {msg && (
                    <div className={`rounded-xl px-4 py-3 text-sm border ${msg.color}`}>
                      📚 <strong>{msg.text}</strong>
                      {projectType === 'minor' && (
                        <p className="text-xs mt-1 opacity-80">Semesters 7–8 (B.Tech part): Minor projects only. Major projects will be available in Sem 9–10.</p>
                      )}
                      {projectType === 'major' && (
                        <p className="text-xs mt-1 opacity-80">Semesters 9–10 (M.Tech part): Major projects only.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Set Password</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Password *</label>
                    <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                      required minLength={6} placeholder="Min. 6 characters" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Confirm Password *</label>
                    <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                      required placeholder="Repeat password" className="form-input" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Registering...</>
                  : '🎓 Create Student Account'
                }
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-400 mt-4">
            <Link href="/" className="hover:text-nfsu-blue transition-colors">← Back to NFSU Projects Database</Link>
          </p>
        </div>
      </div>
    </div>
  )
}