'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

interface Project {
  id: number; title: string; student_name: string; guide_name: string;
  project_type: string; batch_start_year: number; batch_end_year: number;
  technologies: string[]; specialization_name: string;
  campus_name: string; campus_code: string; course_short_name: string; degree_type: string;
}
interface Campus { id: number; name: string; code: string }
interface Course { id: number; name: string; short_name: string; campus_id: number }

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [campus, setCampus] = useState(searchParams.get('campus') || '')
  const [type, setType] = useState(searchParams.get('type') || '')

  useEffect(() => {
    fetch('/api/campuses').then(r => r.json()).then(d => setCampuses(d.campuses || []))
  }, [])

  useEffect(() => {
    search()
  }, [campus, type])

  function search() {
    setLoading(true)
    const p = new URLSearchParams({
      ...(query && { search: query }),
      ...(campus && { campus_id: campus }),
      ...(type && { project_type: type }),
      limit: '50'
    })
    fetch(`/api/projects?${p}`)
      .then(r => r.json())
      .then(data => {
        setProjects(data.projects || [])
        setTotal(data.pagination?.total || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  return (
    <div className="min-h-screen bg-nfsu-offwhite">
      <header className="nfsu-header-bg text-white">
        <div className="border-b border-white/10 px-6 py-2">
          <div className="max-w-7xl mx-auto flex justify-between text-xs text-white/60">
            <Link href="/" className="hover:text-white">NFSU Projects Database</Link>
            <Link href="/login" className="hover:text-white">Faculty Login</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="text-nfsu-amber">›</span>
            <span className="text-white">Browse Projects</span>
          </div>
          <h1 className="text-2xl font-heading font-bold mb-4">Browse All Projects</h1>
          {/* Search bar */}
          <div className="flex gap-2 max-w-2xl">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Search by title, student name, or guide..."
              className="form-input flex-1 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/15"
            />
            <button onClick={search} className="btn-gold px-6">
              Search
            </button>
          </div>
        </div>
        <div className="gold-line" />
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
              <h3 className="font-semibold text-nfsu-navy mb-4">Filters</h3>
              
              <div className="mb-4">
                <label className="form-label">Campus</label>
                <select value={campus} onChange={e => setCampus(e.target.value)} className="form-input text-sm">
                  <option value="">All Campuses</option>
                  {campuses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">Project Type</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[{ v: '', l: 'All' }, { v: 'major', l: 'Major' }, { v: 'minor', l: 'Minor' }].map(t => (
                    <button
                      key={t.v}
                      onClick={() => setType(t.v)}
                      className={`py-1.5 text-xs rounded-md border transition-all ${
                        type === t.v
                          ? 'bg-nfsu-navy text-white border-nfsu-navy'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>

              {(campus || type) && (
                <button onClick={() => { setCampus(''); setType('') }} className="text-xs text-red-500 w-full text-center">
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-24 animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : (
              <>
                {projects.length > 0 && (
                  <p className="text-sm text-gray-500 mb-4">
                    Showing <span className="font-semibold text-nfsu-navy">{projects.length}</span>
                    {total > projects.length ? ` of ${total}` : ''} projects
                  </p>
                )}
                {projects.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-gray-600">No projects found</p>
                    <p className="text-gray-400 text-sm mt-1">Try different search terms or filters</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.map(p => (
                      <Link key={p.id} href={`/project/${p.id}`}>
                        <div className="project-card bg-white rounded-xl p-5 animate-in">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`badge text-xs ${p.project_type === 'major' ? 'badge-major' : 'badge-minor'}`}>
                                  {p.project_type === 'major' ? '⭐ Major' : '📌 Minor'}
                                </span>
                                <span className="badge bg-gray-100 text-gray-600 border-gray-200 text-xs">
                                  {p.campus_code}
                                </span>
                                <span className="badge bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                  {p.course_short_name}
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-900 text-sm">{p.title}</h3>
                              <div className="flex flex-wrap gap-x-4 text-xs text-gray-500 mt-1.5">
                                <span>👤 {p.student_name}</span>
                                <span>🎓 {p.guide_name}</span>
                                <span>📅 {p.batch_start_year}–{p.batch_end_year}</span>
                              </div>
                              {p.technologies?.slice(0, 3).map(t => (
                                <span key={t} className="inline-block text-xs bg-gray-50 border border-gray-200 text-gray-600 rounded px-1.5 py-0.5 mr-1 mt-1.5">
                                  {t}
                                </span>
                              ))}
                            </div>
                            <div className="text-nfsu-blue text-sm flex-shrink-0">→</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  )
}
