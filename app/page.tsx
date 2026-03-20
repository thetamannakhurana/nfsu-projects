'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Campus { id: number; name: string; location: string; state: string; code: string; description: string; project_count: string; }

const CAMPUS_ICONS: Record<string, string> = { GUJ:'🏛️', DEL:'🏙️', GOA:'🌊', TRP:'🌿', BPL:'🏰', PNE:'🎓', GHY:'🌄', MNP:'⛰️', DWD:'🌺', BBS:'🏯', CHN:'🌞', NGP:'🍊', JPR:'💎', RPR:'🌾', UGA:'🌍' }

const CAMPUS_ORDER = ['GUJ','DEL','DWD','CHN','BPL','PNE','GHY','MNP','GOA','TRP','BBS','NGP','JPR','RPR','UGA']

export default function HomePage() {
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/campuses').then(r => r.json()).then(data => { setCampuses(data.campuses || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const sorted = [...campuses].sort((a, b) => {
    const ai = CAMPUS_ORDER.indexOf(a.code)
    const bi = CAMPUS_ORDER.indexOf(b.code)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
  const filtered = sorted.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.state||'').toLowerCase().includes(search.toLowerCase()))
  const total = campuses.reduce((s, c) => s + parseInt(c.project_count || '0'), 0)

  return (
    <div className="min-h-screen bg-nfsu-offwhite">

      {/* ── Header ── */}
      <header className="nfsu-header-bg text-white relative">

        {/* Top bar */}
        <div className="border-b border-white/10 px-4 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex justify-between text-xs text-white/60">
            <span className="hidden sm:block">National Forensic Sciences University · Est. 2020</span>
            <span className="sm:hidden">NFSU · Est. 2020</span>
            <div className="flex gap-3 sm:gap-5">
              <Link href="/login" className="hover:text-white transition-colors">Faculty Login</Link>
              <Link href="/admin/login" className="hover:text-white transition-colors">Admin Login</Link>
              <Link href="/student/login" className="hover:text-white transition-colors">Student Login</Link>
            </div>
          </div>
        </div>

        {/* Hero row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/10 border border-nfsu-gold/40 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-2xl sm:text-3xl">⚖️</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-nfsu-amber text-xs font-semibold tracking-widest uppercase mb-0.5 sm:mb-1">Official Academic Repository</p>
              <h1 className="text-xl sm:text-3xl font-heading font-bold text-white leading-tight">NFSU Projects Database</h1>
              <p className="text-white/65 text-xs sm:text-sm mt-0.5 sm:mt-1">Student Major &amp; Minor Projects — All Campuses</p>
            </div>
            {/* Stats — desktop only in header */}
            <div className="ml-auto hidden md:flex gap-8 text-center flex-shrink-0">
              <div>
                <div className="text-2xl font-heading font-bold text-nfsu-amber">{campuses.length}</div>
                <div className="text-white/55 text-xs">Campuses</div>
              </div>
              <div className="w-px bg-white/15" />
              <div>
                <div className="text-2xl font-heading font-bold text-nfsu-amber">{total}</div>
                <div className="text-white/55 text-xs">Projects</div>
              </div>
            </div>
          </div>

          {/* Stats — mobile only, below hero row */}
          <div className="flex gap-6 mt-4 md:hidden">
            <div>
              <span className="text-nfsu-amber font-bold font-heading text-lg">{campuses.length}</span>
              <span className="text-white/55 text-xs ml-1.5">Campuses</span>
            </div>
            <div className="w-px bg-white/15" />
            <div>
              <span className="text-nfsu-amber font-bold font-heading text-lg">{total}</span>
              <span className="text-white/55 text-xs ml-1.5">Projects</span>
            </div>
          </div>
        </div>

        <div className="gold-line" />
      </header>

      {/* ── Nav tabs ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Scrollable on mobile */}
          <nav className="flex gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {[
              { href: '/', label: 'Campuses', active: true },
              { href: '/search', label: 'All Projects' },
              { href: '/search?type=major', label: 'Major' },
              { href: '/search?type=minor', label: 'Minor' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className={`px-3 sm:px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${item.active ? 'border-nfsu-amber text-nfsu-navy font-semibold' : 'border-transparent text-gray-500 hover:text-nfsu-navy hover:border-gray-200'}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/search" className="hidden md:flex items-center gap-2 text-sm text-gray-400 hover:text-nfsu-navy border border-gray-200 rounded-lg px-3 py-1.5 hover:border-nfsu-blue transition-colors flex-shrink-0 ml-4">
            <span>🔍</span> Search projects...
          </Link>
        </div>
      </div>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Section heading + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-heading font-semibold text-nfsu-navy">Select a Campus</h2>
            <p className="text-gray-500 text-sm mt-0.5">Explore student projects from all NFSU campuses</p>
          </div>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filter by name or state…"
            className="form-input w-full sm:w-52 text-sm" />
        </div>

        {/* Campus grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {Array(15).fill(0).map((_,i) => <div key={i} className="skeleton h-40 sm:h-44 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filtered.map(campus => (
              <Link key={campus.id} href={'/campus/' + campus.id}>
                <div className="campus-card bg-white rounded-xl p-4 sm:p-5 h-full flex flex-col justify-between min-h-[148px] sm:min-h-[160px]">
                  <div>
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <span className="text-xl sm:text-2xl">{CAMPUS_ICONS[campus.code] || '🏫'}</span>
                      <span className="text-xs text-gray-400 bg-gray-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-gray-100">{campus.code}</span>
                    </div>
                    <h3 className="font-semibold text-nfsu-navy text-xs sm:text-sm leading-snug">{campus.name}</h3>
                    <p className="text-gray-400 text-xs mt-0.5 hidden sm:block">{campus.location}{campus.state ? `, ${campus.state}` : ''}</p>
                  </div>
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      <span className="text-nfsu-navy font-semibold">{campus.project_count || 0}</span>
                      <span className="hidden sm:inline"> projects</span>
                    </span>
                    <span className="text-nfsu-blue text-xs font-medium">Browse →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-2">🔍</p>
            <p>No campuses match your search</p>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-16 bg-nfsu-navy text-white">
        <div className="gold-line" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div>
              <h3 className="font-heading font-bold text-lg">NFSU Projects Database</h3>
              <p className="text-white/50 text-sm mt-1 max-w-sm">Official student project repository of National Forensic Sciences University.</p>
              <p className="text-white/35 text-xs mt-3">
                © {new Date().getFullYear()} National Forensic Sciences University. All rights reserved.
              </p>
              <p className="text-xs mt-1" style={{ color: '#E8A820' }}>
                Created &amp; Managed by <span className="font-semibold">Tamanna Khurana</span>
              </p>
            </div>
            <div className="flex gap-5 sm:gap-6 text-white/50 text-sm flex-wrap">
              <Link href="/login" className="hover:text-white transition-colors">Faculty Login</Link>
              <Link href="/admin/login" className="hover:text-white transition-colors">Admin Login</Link>
              <Link href="/search" className="hover:text-white transition-colors">Browse Projects</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}