'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Project {
  id: number; title: string; description: string; project_type: string
  semester: number; academic_year: string
  student_name: string; student_email: string; roll_number: string; enrollment_number: string
  guide_name: string; guide_email: string; guide_designation: string; co_guide_name: string
  batch_start_year: number; batch_end_year: number
  technologies: string[]; keywords: string[]; achievements: string
  github_url: string; report_url: string; project_url: string; created_at: string
  campus_name: string; campus_location: string; campus_code: string
  course_name: string; course_short_name: string; degree_type: string
  specialization_name: string; added_by_name: string
}
interface Faculty { id: number; name: string; designation: string; department: string }

export default function ProjectDetailPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Share state
  const [showShare, setShowShare] = useState(false)
  const [allFaculty, setAllFaculty] = useState<Faculty[]>([])
  const [shareToId, setShareToId] = useState('')
  const [shareNote, setShareNote] = useState('')
  const [sharing, setSharing] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [shareError, setShareError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/projects/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.project) setProject(data.project)
        else setNotFound(true)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })

    // Check if logged in user is faculty/admin
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.user?.role === 'faculty' || data?.user?.role === 'admin') {
        setUserRole(data.user.role)
        fetch('/api/faculty').then(r => r.json()).then(d => setAllFaculty(d.faculty || []))
      }
    }).catch(() => {})
  }, [params.id])

  async function handleShare(e: React.FormEvent) {
    e.preventDefault()
    if (!shareToId) { setShareError('Please select a faculty member'); return }
    setSharing(true); setShareError('')
    try {
      const res = await fetch('/api/projects/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project?.id,
          project_title: project?.title,
          share_to_id: parseInt(shareToId),
          note: shareNote,
          project_url: `${window.location.origin}/project/${project?.id}`,
        })
      })
      const data = await res.json()
      if (!res.ok) { setShareError(data.error || 'Failed to share'); setSharing(false); return }
      setShareSuccess(true)
      setTimeout(() => { setShowShare(false); setShareSuccess(false); setShareToId(''); setShareNote('') }, 2000)
    } catch { setShareError('Failed to share. Try again.') }
    setSharing(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/project/${project?.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-nfsu-offwhite flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-nfsu-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (notFound || !project) return (
    <div className="min-h-screen bg-nfsu-offwhite flex items-center justify-center">
      <div className="text-center">
        <p className="text-3xl mb-3">🔍</p>
        <p className="text-gray-600">Project not found</p>
        <Link href="/" className="text-nfsu-blue text-sm mt-2 inline-block">← Back to Home</Link>
      </div>
    </div>
  )

  const typeColor = project.project_type === 'major'
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-blue-50 text-blue-700 border-blue-200'

  return (
    <div className="min-h-screen bg-nfsu-offwhite">
      {/* Header */}
      <div className="nfsu-header-bg text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/15 rounded-lg border border-nfsu-gold/40 flex items-center justify-center">⚖️</div>
            <span className="text-sm font-semibold hidden sm:block">NFSU Projects Database</span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Copy link button — always visible */}
            <button onClick={copyLink}
              className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white border border-white/20 rounded-lg px-3 py-1.5 transition-colors">
              {copied ? '✅ Copied!' : '🔗 Copy Link'}
            </button>
            {/* Share with faculty — only for faculty/admin */}
            {(userRole === 'faculty' || userRole === 'admin') && (
              <button onClick={() => setShowShare(!showShare)}
                className="flex items-center gap-1.5 text-xs bg-nfsu-gold/20 hover:bg-nfsu-gold/30 text-nfsu-amber border border-nfsu-gold/30 rounded-lg px-3 py-1.5 transition-colors">
                📤 Share with Colleague
              </button>
            )}
          </div>
        </div>
        <div className="gold-line" />
      </div>

      {/* Share panel */}
      {showShare && (
        <div className="bg-indigo-50 border-b border-indigo-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
            <form onSubmit={handleShare} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1">
                <label className="form-label text-indigo-700">Share with Faculty Colleague</label>
                <select value={shareToId} onChange={e => setShareToId(e.target.value)} required className="form-input">
                  <option value="">— Select a faculty member —</option>
                  {allFaculty.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name}{f.designation ? ` (${f.designation})` : ''}{f.department ? ` — ${f.department}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="form-label text-indigo-700">Add a note (optional)</label>
                <input type="text" value={shareNote} onChange={e => setShareNote(e.target.value)}
                  placeholder="e.g., This might interest you for your research..." className="form-input" />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button type="submit" disabled={sharing}
                  className="btn-primary text-sm disabled:opacity-60">
                  {sharing ? 'Sharing...' : '📤 Share'}
                </button>
                <button type="button" onClick={() => setShowShare(false)} className="btn-outline text-sm">Cancel</button>
              </div>
            </form>
            {shareError && <p className="text-xs text-red-600 mt-2">⚠️ {shareError}</p>}
            {shareSuccess && <p className="text-xs text-green-600 mt-2">✅ Shared successfully!</p>}
            <p className="text-xs text-indigo-400 mt-2">
              The selected faculty will see this project shared in their dashboard notifications.
            </p>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-nfsu-navy mb-6 transition-colors">
          ← Back to Projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`badge ${typeColor}`}>
                  {project.project_type === 'major' ? '⭐ Major' : '📌 Minor'} Project
                </span>
                {project.degree_type && (
                  <span className="badge bg-gray-50 text-gray-600 border-gray-200">{project.degree_type}</span>
                )}
                {project.academic_year && (
                  <span className="badge bg-gray-50 text-gray-500 border-gray-200">{project.academic_year}</span>
                )}
              </div>
              <h1 className="text-2xl font-heading font-bold text-nfsu-navy leading-tight">{project.title}</h1>
              <p className="text-gray-500 text-sm mt-2">
                {project.campus_name} · {project.course_name}
                {project.specialization_name && ` · ${project.specialization_name}`}
              </p>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-heading font-semibold text-nfsu-navy mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center text-sm">📋</span>
                Project Description
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>

            {/* Achievements */}
            {project.achievements && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-heading font-semibold text-nfsu-navy mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center text-sm">🏆</span>
                  Achievements &amp; Outcomes
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed">{project.achievements}</p>
              </div>
            )}

            {/* Technologies */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-heading font-semibold text-nfsu-navy mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center text-sm">⚙️</span>
                  Technologies Used
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                    <span key={tech} className="tag-tech tag-pill">{tech}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {project.keywords && project.keywords.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-heading font-semibold text-nfsu-navy mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center text-sm">🏷️</span>
                  Keywords
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.keywords.map(kw => (
                    <span key={kw} className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-1 rounded-full">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {(project.github_url || project.report_url || project.project_url) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-heading font-semibold text-nfsu-navy mb-3">Project Links</h2>
                <div className="flex flex-wrap gap-3">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">
                      🔗 GitHub Repository
                    </a>
                  )}
                  {project.report_url && (
                    <a href={project.report_url} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                      📄 Project Report
                    </a>
                  )}
                  {project.project_url && (
                    <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">
                      🌐 Live Demo
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Student info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-nfsu-navy mb-4 text-xs uppercase tracking-wider text-gray-400">Student</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{project.student_name}</p>
                </div>
                {project.student_email && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                    <a href={`mailto:${project.student_email}`} className="text-sm text-nfsu-blue hover:underline">
                      {project.student_email}
                    </a>
                  </div>
                )}
                {(project.enrollment_number || project.roll_number) && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Enrollment</p>
                    <p className="text-sm text-gray-700">{project.enrollment_number || project.roll_number}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Batch</p>
                  <p className="text-sm text-gray-700">{project.batch_start_year} – {project.batch_end_year}</p>
                </div>
              </div>
            </div>

            {/* Guide info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-nfsu-navy mb-4 text-xs uppercase tracking-wider text-gray-400">Project Guide</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Guide Name</p>
                  <p className="text-sm font-medium text-gray-900">{project.guide_name}</p>
                </div>
                {project.guide_designation && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Designation</p>
                    <p className="text-sm text-gray-700">{project.guide_designation}</p>
                  </div>
                )}
                {project.guide_email && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                    <a href={`mailto:${project.guide_email}`} className="text-sm text-nfsu-blue hover:underline">
                      {project.guide_email}
                    </a>
                  </div>
                )}
                {project.co_guide_name && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Co-Guide</p>
                    <p className="text-sm text-gray-700">👥 {project.co_guide_name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Academic info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-nfsu-navy mb-4 text-xs uppercase tracking-wider text-gray-400">Academic Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Campus</p>
                  <p className="text-sm text-gray-700">{project.campus_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Program</p>
                  <p className="text-sm text-gray-700">{project.course_name}</p>
                </div>
                {project.specialization_name && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Specialization</p>
                    <p className="text-sm text-gray-700">{project.specialization_name}</p>
                  </div>
                )}
                {project.semester && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Semester</p>
                    <p className="text-sm text-gray-700">Semester {project.semester}</p>
                  </div>
                )}
                {project.academic_year && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Academic Year</p>
                    <p className="text-sm text-gray-700">{project.academic_year}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Share card for faculty */}
            {(userRole === 'faculty' || userRole === 'admin') && (
              <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-5">
                <h3 className="font-semibold text-indigo-800 mb-2 text-sm">Share This Project</h3>
                <p className="text-xs text-indigo-500 mb-3">Share this project with a colleague or co-guide.</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setShowShare(!showShare)}
                    className="w-full text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 font-medium transition-colors">
                    📤 Share with Faculty
                  </button>
                  <button onClick={copyLink}
                    className="w-full text-sm border border-indigo-300 text-indigo-600 hover:bg-indigo-100 rounded-lg px-4 py-2 transition-colors">
                    {copied ? '✅ Link Copied!' : '🔗 Copy Project Link'}
                  </button>
                </div>
              </div>
            )}

            {/* Added by */}
            <div className="text-xs text-gray-400 text-center px-2">
              Added by {project.added_by_name || 'NFSU Admin'} ·{' '}
              {new Date(project.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 bg-nfsu-navy text-white">
        <div className="gold-line" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h3 className="font-heading font-bold text-base">NFSU Projects Database</h3>
            <p className="text-white/50 text-xs mt-1">Official student project repository · National Forensic Sciences University</p>
            <p className="text-white/30 text-xs mt-2">
              © {new Date().getFullYear()} NFSU · Created &amp; Managed by{' '}
              <a href="https://tamannakhurana.vercel.app/" target="_blank" rel="noopener noreferrer"
                className="hover:underline font-medium" style={{ color: '#E8A820' }}>Tamanna Khurana</a>
            </p>
          </div>
          <div className="flex gap-4 text-white/40 text-xs">
            <Link href="/" className="hover:text-white">All Campuses</Link>
            <Link href="/search" className="hover:text-white">Browse Projects</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}