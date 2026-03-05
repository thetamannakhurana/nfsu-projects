'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Campus { id: number; name: string; code: string }
interface Course { id: number; name: string; short_name: string; degree_type: string; duration_years: number; campus_id: number }
interface Specialization { id: number; name: string }

interface ProjectFormProps {
  initialData?: Record<string, unknown>
  projectId?: number
  redirectTo?: string
}

export default function ProjectForm({ initialData, projectId, redirectTo }: ProjectFormProps) {
  const router = useRouter()
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [specializations, setSpecializations] = useState<Specialization[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    project_type: 'major',
    semester: '',
    academic_year: '',
    student_name: '',
    student_email: '',
    enrollment_number: '',
    campus_id: '',
    course_id: '',
    specialization_id: '',
    batch_start_year: '',
    batch_end_year: '',
    guide_name: '',
    guide_email: '',
    guide_designation: '',
    co_guide_name: '',
    technologies: '',
    keywords: '',
    achievements: '',
    github_url: '',
    report_url: '',
    project_url: '',
    status: 'published',
    ...initialData,
  })

  useEffect(() => {
    fetch('/api/campuses').then(r => r.json()).then(d => setCampuses(d.campuses || []))
  }, [])

  useEffect(() => {
    if (form.campus_id) {
      fetch(`/api/courses?campus_id=${form.campus_id}`)
        .then(r => r.json()).then(d => setCourses(d.courses || []))
    }
  }, [form.campus_id])

  useEffect(() => {
    if (form.course_id) {
      fetch(`/api/specializations?course_id=${form.course_id}`)
        .then(r => r.json()).then(d => setSpecializations(d.specializations || []))
    }
  }, [form.course_id])

  useEffect(() => {
    if (form.batch_start_year && form.course_id) {
      const course = courses.find(c => c.id === parseInt(form.course_id))
      if (course) setForm(f => ({ ...f, batch_end_year: String(parseInt(f.batch_start_year) + course.duration_years) }))
    }
  }, [form.batch_start_year, form.course_id, courses])

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const payload = {
      ...form,
      campus_id: parseInt(form.campus_id),
      course_id: parseInt(form.course_id),
      specialization_id: form.specialization_id ? parseInt(form.specialization_id) : null,
      batch_start_year: parseInt(form.batch_start_year),
      batch_end_year: parseInt(form.batch_end_year),
      semester: form.semester ? parseInt(form.semester) : null,
      technologies: form.technologies ? form.technologies.split(',').map(t => t.trim()).filter(Boolean) : [],
      keywords: form.keywords ? form.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
    }
    try {
      const url = projectId ? `/api/projects/${projectId}` : '/api/projects'
      const method = projectId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save project'); setLoading(false); return }
      setSuccess(true)
      setTimeout(() => router.push(redirectTo || `/project/${data.project.id}`), 1000)
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const batchYears = Array.from({ length: currentYear - 2016 }, (_, i) => currentYear - i)

  const SectionHeader = ({ icon, title, color }: { icon: string; title: string; color: string }) => (
    <div className={`flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100`}>
      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center text-sm`}>{icon}</div>
      <h3 className="font-heading font-semibold text-nfsu-navy text-base">{title}</h3>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">⚠️ {error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">✅ Project saved! Redirecting...</div>}

      {/* Project Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SectionHeader icon="📋" title="Project Information" color="bg-blue-50" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">Project Title <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              required placeholder="e.g., AI-Based Network Intrusion Detection System" className="form-input" />
          </div>

          <div>
            <label className="form-label">Project Type <span className="text-red-500">*</span></label>
            <select value={form.project_type} onChange={e => set('project_type', e.target.value)} required className="form-input">
              <option value="major">⭐ Major Project</option>
              <option value="minor">📌 Minor Project</option>
            </select>
          </div>

          <div>
            <label className="form-label">Semester</label>
            <select value={form.semester} onChange={e => set('semester', e.target.value)} className="form-input">
              <option value="">Select Semester</option>
              {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Academic Year</label>
            <input type="text" value={form.academic_year} onChange={e => set('academic_year', e.target.value)}
              placeholder="e.g., 2024-25" className="form-input" />
          </div>

          <div>
            <label className="form-label">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="form-input">
              <option value="published">✅ Published (Visible to all)</option>
              <option value="draft">📝 Draft (Hidden)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Project Description <span className="text-red-500">*</span></label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={4} placeholder="Describe the project, its objectives, methodology, and key features..."
              className="form-input resize-none" />
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Achievements & Outcomes</label>
            <textarea value={form.achievements} onChange={e => set('achievements', e.target.value)}
              rows={2} placeholder="Publications, awards, practical deployments, accuracy metrics..."
              className="form-input resize-none" />
          </div>
        </div>
      </div>

      {/* Student Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SectionHeader icon="👤" title="Student Information" color="bg-indigo-50" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Student Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.student_name} onChange={e => set('student_name', e.target.value)}
              required placeholder="Full name as per records" className="form-input" />
          </div>
          <div>
            <label className="form-label">Student Email</label>
            <input type="email" value={form.student_email} onChange={e => set('student_email', e.target.value)}
              placeholder="student@nfsu.ac.in" className="form-input" />
          </div>
          <div>
            <label className="form-label">Enrollment Number</label>
            <input type="text" value={form.enrollment_number} onChange={e => set('enrollment_number', e.target.value)}
              placeholder="University enrollment number" className="form-input" />
          </div>
        </div>
      </div>

      {/* Academic Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SectionHeader icon="🎓" title="Academic Details" color="bg-amber-50" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Campus <span className="text-red-500">*</span></label>
            <select value={form.campus_id} onChange={e => { set('campus_id', e.target.value); set('course_id', ''); set('specialization_id', '') }}
              required className="form-input">
              <option value="">Select Campus</option>
              {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Course / Program <span className="text-red-500">*</span></label>
            <select value={form.course_id} onChange={e => { set('course_id', e.target.value); set('specialization_id', '') }}
              required disabled={!form.campus_id} className="form-input">
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Specialization</label>
            <select value={form.specialization_id} onChange={e => set('specialization_id', e.target.value)}
              disabled={!form.course_id} className="form-input">
              <option value="">None / Not Applicable</option>
              {specializations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Batch Start Year <span className="text-red-500">*</span></label>
            <select value={form.batch_start_year} onChange={e => set('batch_start_year', e.target.value)} required className="form-input">
              <option value="">Select Year</option>
              {batchYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Batch End Year <span className="text-red-500">*</span></label>
            <input type="number" value={form.batch_end_year} onChange={e => set('batch_end_year', e.target.value)}
              required min={2018} max={2035} placeholder="Auto-calculated" className="form-input" />
          </div>
        </div>
      </div>

      {/* Guide */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SectionHeader icon="🧑‍🏫" title="Guide / Supervisor" color="bg-green-50" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Guide Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.guide_name} onChange={e => set('guide_name', e.target.value)}
              required placeholder="Dr. / Prof. Full Name" className="form-input" />
          </div>
          <div>
            <label className="form-label">Guide Email</label>
            <input type="email" value={form.guide_email} onChange={e => set('guide_email', e.target.value)}
              placeholder="guide@nfsu.ac.in" className="form-input" />
          </div>
          <div>
            <label className="form-label">Guide Designation</label>
            <input type="text" value={form.guide_designation} onChange={e => set('guide_designation', e.target.value)}
              placeholder="e.g., Associate Professor" className="form-input" />
          </div>
          <div>
            <label className="form-label">Co-Guide Name (optional)</label>
            <input type="text" value={form.co_guide_name} onChange={e => set('co_guide_name', e.target.value)}
              placeholder="Co-supervisor name" className="form-input" />
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SectionHeader icon="⚙️" title="Technical Details & Links" color="bg-purple-50" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">Technologies Used</label>
            <input type="text" value={form.technologies} onChange={e => set('technologies', e.target.value)}
              placeholder="Python, TensorFlow, React, Node.js  (comma-separated)" className="form-input" />
            <p className="text-xs text-gray-400 mt-1">Separate with commas</p>
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Keywords / Tags</label>
            <input type="text" value={form.keywords} onChange={e => set('keywords', e.target.value)}
              placeholder="Machine Learning, Network Security, IoT  (comma-separated)" className="form-input" />
          </div>
          <div>
            <label className="form-label">GitHub Repository URL</label>
            <input type="url" value={form.github_url} onChange={e => set('github_url', e.target.value)}
              placeholder="https://github.com/..." className="form-input" />
          </div>
          <div>
            <label className="form-label">Project Report URL</label>
            <input type="url" value={form.report_url} onChange={e => set('report_url', e.target.value)}
              placeholder="https://drive.google.com/..." className="form-input" />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Live Project / Deployed URL <span className="text-gray-400 font-normal normal-case text-xs">(optional)</span></label>
            <input type="url" value={form.project_url} onChange={e => set('project_url', e.target.value)}
              placeholder="https://yourproject.vercel.app  (if deployed)" className="form-input" />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 justify-end pb-6">
        <button type="button" onClick={() => router.back()} className="btn-outline">Cancel</button>
        <button type="submit" disabled={loading || success} className="btn-primary px-8 disabled:opacity-60">
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : projectId ? '💾 Update Project' : '✅ Add Project'}
        </button>
      </div>
    </form>
  )
}