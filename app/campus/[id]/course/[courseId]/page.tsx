'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

interface Course { id: number; name: string; short_name: string; degree_type: string; duration_years: number }
interface Specialization { id: number; name: string; code: string }
interface Project {
  id: number; title: string; student_name: string; guide_name: string;
  project_type: string; batch_start_year: number; batch_end_year: number;
  technologies: string[]; specialization_name: string; academic_year: string;
  degree_type: string; course_short_name: string;
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const campusId = params.id as string
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [specializations, setSpecializations] = useState<Specialization[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [campusName, setCampusName] = useState('')

  // Filters
  const [selectedBatchStart, setSelectedBatchStart] = useState('')
  const [selectedBatchEnd, setSelectedBatchEnd] = useState('')
  const [selectedType, setSelectedType] = useState<'major' | 'minor' | ''>('')
  const [selectedSpec, setSelectedSpec] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Available batches from projects
  const [availableBatches, setAvailableBatches] = useState<{ start: number; end: number }[]>([])

  useEffect(() => {
    if (!campusId || campusId === 'undefined' || !courseId || courseId === 'undefined') return
    const idNum = parseInt(campusId as string)
    const courseIdNum = parseInt(courseId as string)
    if (isNaN(idNum) || isNaN(courseIdNum)) return
    Promise.all([
      fetch(`/api/courses?campus_id=${idNum}`).then(r => r.json()),
      fetch(`/api/specializations?course_id=${courseIdNum}`).then(r => r.json()),
      fetch(`/api/campuses`).then(r => r.json()),
    ]).then(([courseData, specData, campusData]) => {
      const found = courseData.courses?.find((c: Course) => c.id === parseInt(courseId))
      setCourse(found || null)
      setSpecializations(specData.specializations || [])
      const campus = campusData.campuses?.find((c: { id: number; name: string }) => c.id === parseInt(campusId))
      setCampusName(campus?.name || '')
    })
  }, [campusId, courseId])

  useEffect(() => {
    // Load all projects for this campus/course to get available batches
    fetch(`/api/projects?campus_id=${campusId}&course_id=${courseId}&limit=200`)
      .then(r => r.json())
      .then(data => {
        const batches = Array.from(
          new Set((data.projects || []).map((p: Project) => `${p.batch_start_year}-${p.batch_end_year}`))
        ).map(b => {
          const [start, end] = (b as string).split('-')
          return { start: parseInt(start), end: parseInt(end) }
        }).sort((a, b) => b.start - a.start)
        setAvailableBatches(batches)
      })
  }, [campusId, courseId])

  useEffect(() => {
    if (!selectedType) { setProjects([]); return }
    loadProjects()
  }, [selectedBatchStart, selectedBatchEnd, selectedType, selectedSpec, searchQuery])

  function loadProjects() {
    setLoading(true)
    const p = new URLSearchParams({
      campus_id: campusId,
      course_id: courseId,
      ...(selectedBatchStart && { batch_start: selectedBatchStart }),
      ...(selectedBatchEnd && { batch_end: selectedBatchEnd }),
      ...(selectedType && { project_type: selectedType }),
      ...(selectedSpec && { specialization_id: selectedSpec }),
      ...(searchQuery && { search: searchQuery }),
      limit: '100'
    })
    fetch(`/api/projects?${p}`)
      .then(r => r.json())
      .then(data => { setProjects(data.projects || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  // Generate batch options for the selected course
  const generateBatches = () => {
    if (!course) return []
    const batches = []
    const currentYear = new Date().getFullYear()
    for (let start = 2018; start <= currentYear; start++) {
      batches.push({ start, end: start + course.duration_years, label: `${start} – ${start + course.duration_years}` })
    }
    return batches.reverse()
  }

  const batches = generateBatches()

  return (
    <div className="min-h-screen bg-nfsu-offwhite">
      {/* Header */}
      <header className="nfsu-header-bg text-white">
        <div className="border-b border-white/10 px-6 py-2">
          <div className="max-w-7xl mx-auto flex justify-between text-xs text-white/60">
            <Link href="/" className="hover:text-white">NFSU Projects Database</Link>
            <Link href="/login" className="hover:text-white">Faculty Login</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="text-nfsu-amber">›</span>
            <Link href={`/campus/${campusId}`} className="hover:text-white">{campusName}</Link>
            <span className="text-nfsu-amber">›</span>
            <span className="text-white">{course?.short_name}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-heading font-bold">{course?.name}</h1>
          <p className="text-white/65 text-sm mt-1">
            {course?.degree_type} • {course?.duration_years}-year program
          </p>
        </div>
        <div className="gold-line" />
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
              <h3 className="font-semibold text-nfsu-navy mb-4 flex items-center gap-2">
                <span>🔧</span> Filters
              </h3>

              {/* Batch */}
              <div className="mb-4">
                <label className="form-label">Batch</label>
                <select
                  value={`${selectedBatchStart}-${selectedBatchEnd}`}
                  onChange={e => {
                    const [s, en] = e.target.value.split('-')
                    setSelectedBatchStart(s || '')
                    setSelectedBatchEnd(en || '')
                  }}
                  className="form-input text-sm"
                >
                  <option value="-">All Batches</option>
                  {batches.map(b => (
                    <option key={b.label} value={`${b.start}-${b.end}`}>{b.label}</option>
                  ))}
                </select>
              </div>

              {/* Project Type */}
              <div className="mb-4">
                <label className="form-label">Project Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['major', 'minor'].map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(selectedType === type ? '' : type as 'major' | 'minor')}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all capitalize ${
                        selectedType === type
                          ? type === 'major' ? 'bg-amber-600 text-white border-amber-600' : 'bg-nfsu-blue text-white border-nfsu-blue'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specialization */}
              {specializations.length > 0 && (
                <div className="mb-4">
                  <label className="form-label">Specialization</label>
                  <select
                    value={selectedSpec}
                    onChange={e => setSelectedSpec(e.target.value)}
                    className="form-input text-sm"
                  >
                    <option value="">All Specializations</option>
                    {specializations.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search */}
              <div className="mb-4">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Title, student, guide..."
                  className="form-input text-sm"
                />
              </div>

              {(selectedBatchStart || selectedType || selectedSpec || searchQuery) && (
                <button
                  onClick={() => { setSelectedBatchStart(''); setSelectedBatchEnd(''); setSelectedType(''); setSelectedSpec(''); setSearchQuery('') }}
                  className="text-xs text-red-500 hover:text-red-700 w-full text-center"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Projects list */}
          <div className="lg:col-span-3">
            {!selectedType ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="text-5xl mb-4">📂</div>
                <h3 className="text-lg font-heading font-semibold text-nfsu-navy mb-2">Select a Project Type</h3>
                <p className="text-gray-500 text-sm mb-6">Choose Major or Minor projects from the filter panel to see results</p>
                <div className="flex gap-3 justify-center">
                  {['major', 'minor'].map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type as 'major' | 'minor')}
                      className={`px-6 py-2.5 rounded-lg font-medium capitalize text-sm ${
                        type === 'major'
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'bg-nfsu-blue text-white hover:bg-nfsu-lightblue'
                      } transition-colors`}
                    >
                      {type} Projects
                    </button>
                  ))}
                </div>
              </div>
            ) : loading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-28 animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-600 font-medium">No projects found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-nfsu-navy">{projects.length}</span> {selectedType} projects found
                  </p>
                </div>
                <div className="space-y-3">
                  {projects.map(project => (
                    <Link key={project.id} href={`/project/${project.id}`}>
                      <div className="project-card bg-white rounded-xl p-5 cursor-pointer animate-in">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className={`badge text-xs ${project.project_type === 'major' ? 'badge-major' : 'badge-minor'}`}>
                                {project.project_type === 'major' ? '⭐ Major' : '📌 Minor'}
                              </span>
                              {project.specialization_name && (
                                <span className="badge bg-gray-100 text-gray-600 border-gray-200 text-xs">
                                  {project.specialization_name}
                                </span>
                              )}
                              {project.academic_year && (
                                <span className="text-xs text-gray-400">{project.academic_year}</span>
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm leading-snug hover:text-nfsu-blue transition-colors">
                              {project.title}
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-gray-500">
                              <span>👤 {project.student_name}</span>
                              <span>🎓 Guide: {project.guide_name}</span>
                              <span>📅 Batch: {project.batch_start_year}–{project.batch_end_year}</span>
                            </div>
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {project.technologies.slice(0, 4).map(tech => (
                                  <span key={tech} className="text-xs bg-nfsu-offwhite border border-gray-200 text-gray-600 rounded px-1.5 py-0.5">
                                    {tech}
                                  </span>
                                ))}
                                {project.technologies.length > 4 && (
                                  <span className="text-xs text-gray-400">+{project.technologies.length - 4} more</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-nfsu-blue text-sm flex-shrink-0 self-center">→</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}