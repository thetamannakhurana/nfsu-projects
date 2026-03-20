// Save as: app/student/register/page.tsx  (create this folder + file)
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Course { id: number; name: string; short_name: string; duration_years: number }
interface Specialization { id: number; name: string }
interface Campus { id: number; name: string; code: string }

export default function StudentRegisterPage() {
  const router = useRouter()
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [specs, setSpecs] = useState<Specialization[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    enrollment_number: '',
    campus_id: '', course_id: '', specialization_id: '', batch_start_year: '',
  })

  useEffect(() => {
    fetch('/api/campuses').then(r => r.json()).then(d => setCampuses(d.campuses || []))
  }, [])

  useEffect(() => {
    if (form.campus_id) {
      fetch(`/api/courses?campus_id=${form.campus_id}`).then(r => r.json()).then(d => setCourses(d.courses || []))
      set('course_id', ''); set('specialization_id', '')
    }
  }, [form.campus_id])

  useEffect(() => {
    if (form.course_id) {
      fetch(`/api/specializations?course_id=${form.course_id}`).then(r => r.json()).then(d => setSpecs(d.specializations || []))
      set('specialization_id', '')
    }
  }, [form.course_id])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  // Auto-calc batch end and current semester
  const selectedCourse = courses.find(c => c.id === parseInt(form.course_id))
  const batchEnd = form.batch_start_year && selectedCourse
    ? parseInt(form.batch_start_year) + selectedCourse.duration_years
    : null

  const currentSemester = (() => {
    if (!form.batch_start_year || !selectedCourse) return null
    const now = new Date()
    const batchStart = parseInt(form.batch_start_year)
    const monthsElapsed = (now.getFullYear() - batchStart) * 12 + now.getMonth()
    // Each semester is ~6 months. Odd sems start July, even sems start Jan
    const sem = Math.min(Math.ceil((monthsElapsed + 1) / 6), selectedCourse.duration_years * 2)
    return Math.max(1, sem)
  })()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.email.endsWith('@nfsu.ac.in')) {
      setError('Only NFSU email addresses (@nfsu.ac.in) are allowed')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          enrollment_number: form.enrollment_number,
          campus_id: form.campus_id ? parseInt(form.campus_id) : null,
          course_id: form.course_id ? parseInt(form.course_id) : null,
          specialization_id: form.specialization_id ? parseInt(form.specialization_id) : null,
          batch_start_year: form.batch_start_year ? parseInt(form.batch_start_year) : null,
          batch_end_year: batchEnd,
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      router.push('/student/login?registered=1')
    } catch {
      setError('Registration failed. Try again.')
      setLoading(false)
    }
  }

  const years = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i)

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
          <Link href="/student/login" className="text-white/60 text-sm hover:text-white transition-colors">
            Already registered? Login →
          </Link>
        </div>
      </div>
      <div className="gold-line" />

      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 pt-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-nfsu-navy rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">🎓</div>
            <h1 className="text-2xl font-heading font-bold text-nfsu-navy">Student Registration</h1>
            <p className="text-gray-500 text-sm mt-1">Register with your NFSU email to submit project guidance requests</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">⚠️ {error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Info */}
              <div>
                <label className="form-label">Full Name *</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  required placeholder="As per university records" className="form-input" />
              </div>
              <div>
                <label className="form-label">NFSU Email Address *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  required placeholder="yourname@nfsu.ac.in" className="form-input" />
                <p className="text-xs text-gray-400 mt-1">Only @nfsu.ac.in emails are accepted</p>
              </div>
              <div>
                <label className="form-label">Enrollment Number</label>
                <input type="text" value={form.enrollment_number} onChange={e => set('enrollment_number', e.target.value)}
                  placeholder="University enrollment number" className="form-input" />
              </div>

              {/* Academic Info */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Academic Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="form-label">Campus *</label>
                    <select value={form.campus_id} onChange={e => set('campus_id', e.target.value)} required className="form-input">
                      <option value="">Select Campus</option>
                      {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Course / Program *</label>
                    <select value={form.course_id} onChange={e => set('course_id', e.target.value)} required disabled={!form.campus_id} className="form-input">
                      <option value="">Select Course</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.short_name})</option>)}
                    </select>
                  </div>
                  {specs.length > 0 && (
                    <div className="sm:col-span-2">
                      <label className="form-label">Specialization</label>
                      <select value={form.specialization_id} onChange={e => set('specialization_id', e.target.value)} className="form-input">
                        <option value="">None / Not Applicable</option>
                        {specs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
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
                      placeholder="Auto-calculated" className="form-input bg-gray-50 text-gray-500" />
                  </div>
                </div>

                {/* Auto-calculated semester */}
                {currentSemester && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
                    📚 Based on your batch year, you are currently in <strong>Semester {currentSemester}</strong>
                  </div>
                )}
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
                {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Registering...</> : '🎓 Create Student Account'}
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