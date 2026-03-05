'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Project {
  id: number; title: string; description: string; project_type: string;
  semester: number; academic_year: string;
  student_name: string; student_email: string; roll_number: string;
  guide_name: string; guide_email: string; guide_designation: string; co_guide_name: string;
  batch_start_year: number; batch_end_year: number;
  technologies: string[]; keywords: string[]; achievements: string;
  github_url: string; report_url: string; created_at: string;
  campus_name: string; campus_location: string; campus_code: string;
  course_name: string; course_short_name: string; degree_type: string;
  specialization_name: string; added_by_name: string;
}

export default function ProjectDetailPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/projects/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.project) setProject(data.project)
        else setNotFound(true)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [params.id])

  if (loading) return (
    <div className="min-h-screen bg-nfsu-offwhite flex items-center justify-center">
      <div className="w-10 h-10 border-nfsu-blue border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }} />
    </div>
  )

  if (notFound || !project) return (
    <div className="min-h-screen bg-nfsu-offwhite flex items-center justify-center">
      <div className="text-center">
        <p className="text-3xl mb-3">🔍</p>
        <p className="text-gray-600">Project not found</p>
        <Link href="/" className="text-nfsu-blue text-sm mt-2 inline-block">← Back to home</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-nfsu-offwhite">
      {/* Header */}
      <header className="nfsu-header-bg text-white">
        <div className="border-b border-white/10 px-6 py-2">
          <div className="max-w-5xl mx-auto flex justify-between text-xs text-white/60">
            <Link href="/" className="hover:text-white">NFSU Projects Database</Link>
            <Link href="/login" className="hover:text-white">Faculty Login</Link>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-3 flex-wrap">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="text-nfsu-amber">›</span>
            <span className="text-white/70">{project.campus_name}</span>
            <span className="text-nfsu-amber">›</span>
            <span className="text-white/70">{project.course_short_name}</span>
            <span className="text-nfsu-amber">›</span>
            <span className="text-white capitalize">{project.project_type} Project</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`badge text-xs ${project.project_type === 'major' ? 'badge-major' : 'badge-minor'}`}>
              {project.project_type === 'major' ? '⭐ Major Project' : '📌 Minor Project'}
            </span>
            {project.specialization_name && (
              <span className="badge bg-white/15 text-white border-white/20 text-xs">
                {project.specialization_name}
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-heading font-bold leading-tight">{project.title}</h1>
        </div>
        <div className="gold-line" />
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Description */}
            {project.description && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-heading font-semibold text-nfsu-navy mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-nfsu-navy/10 rounded-md flex items-center justify-center text-sm">📋</span>
                  Project Description
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed">{project.description}</p>
              </div>
            )}

            {/* Achievements */}
            {project.achievements && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-heading font-semibold text-nfsu-navy mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center text-sm">🏆</span>
                  Achievements & Outcomes
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
                    <span key={tech} className="bg-nfsu-offwhite border border-gray-200 text-gray-700 text-sm px-3 py-1 rounded-lg">
                      {tech}
                    </span>
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
            {(project.github_url || project.report_url) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-heading font-semibold text-nfsu-navy mb-3">Project Links</h2>
                <div className="flex gap-3">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                      className="btn-outline text-sm">
                      🔗 GitHub Repository
                    </a>
                  )}
                  {project.report_url && (
                    <a href={project.report_url} target="_blank" rel="noopener noreferrer"
                      className="btn-primary text-sm">
                      📄 Project Report
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            {/* Student info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-nfsu-navy mb-4 text-sm uppercase tracking-wide">Student Details</h3>
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
                {project.roll_number && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Roll Number</p>
                    <p className="text-sm text-gray-700">{project.roll_number}</p>
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
              <h3 className="font-semibold text-nfsu-navy mb-4 text-sm uppercase tracking-wide">Project Guide</h3>
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
                    <p className="text-sm text-gray-700">{project.co_guide_name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Academic info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-nfsu-navy mb-4 text-sm uppercase tracking-wide">Academic Info</h3>
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

            {/* Added by */}
            <div className="text-xs text-gray-400 text-center">
              Added by {project.added_by_name || 'NFSU Admin'} •{' '}
              {new Date(project.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
