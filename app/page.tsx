'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import ChangePasswordModal from '@/components/ChangePasswordModal'

interface Campus { id: number; name: string; location: string; state: string; code: string; description: string; project_count: string; }
interface User { name: string; email: string; role: string; designation?: string; department?: string }

const CAMPUS_ICONS: Record<string, string> = { GUJ:'🏛️', DEL:'🏙️', GOA:'🌊', TRP:'🌿', BPL:'🏰', PNE:'🎓', GHY:'🌄', MNP:'⛰️', DWD:'🌺', BBS:'🏯', CHN:'🌞', NGP:'🍊', JPR:'💎', RPR:'🌾', UGA:'🌍' }
const CAMPUS_ORDER = ['GUJ','DEL','DWD','CHN','BPL','PNE','GHY','MNP','GOA','TRP','BBS','NGP','JPR','RPR','UGA']

export default function HomePage() {
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.user) setUser(data.user)
    }).catch(() => {})
    fetch('/api/campuses').then(r => r.json()).then(data => {
      setCampuses(data.campuses || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const sorted = [...campuses].sort((a, b) => {
    const ai = CAMPUS_ORDER.indexOf(a.code), bi = CAMPUS_ORDER.indexOf(b.code)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
  const filtered = sorted.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.state||'').toLowerCase().includes(search.toLowerCase())
  )
  const total = campuses.reduce((s, c) => s + parseInt(c.project_count || '0'), 0)

  const sidebarLinks = user ? (
    user.role === 'admin' ? [
      { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
      { href: '/', icon: '🏛️', label: 'Browse Projects' },
      { href: '/search', icon: '🔍', label: 'Search' },
      { href: '/admin/projects', icon: '📁', label: 'All Projects' },
      { href: '/admin/users', icon: '👥', label: 'Manage Users' },
    ] : user.role === 'faculty' ? [
      { href: '/faculty/dashboard', icon: '📊', label: 'Dashboard' },
      { href: '/', icon: '🏛️', label: 'Browse Projects' },
      { href: '/search', icon: '🔍', label: 'Search' },
      { href: '/faculty/guidance', icon: '📬', label: 'Guidance Requests' },
      { href: '/faculty/projects/new', icon: '➕', label: 'Add Project' },
    ] : [
      { href: '/student/dashboard', icon: '📊', label: 'My Dashboard' },
      { href: '/', icon: '🏛️', label: 'Browse Projects' },
      { href: '/search', icon: '🔍', label: 'Search' },
    ]
  ) : []

  const SidebarBottom = () => (
    <div className="p-3 border-t border-gray-100">
      <div className="px-3 py-2 bg-nfsu-navy/5 rounded-xl mb-2">
        <p className="text-sm font-semibold text-nfsu-navy truncate">{user?.name}</p>
        <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        {user?.designation && <p className="text-xs text-gray-400 truncate">{user.designation}</p>}
      </div>
      <button onClick={() => setShowChangePassword(true)}
        className="sidebar-link text-nfsu-blue hover:bg-blue-50 w-full mb-0.5">
        <span>🔐</span> Change Password
      </button>
      <button onClick={handleLogout} className="sidebar-link text-red-500 hover:bg-red-50 w-full">
        <span>🚪</span> Sign Out
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-nfsu-offwhite flex">
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}

      {/* Sidebar — desktop */}
      {user && (
        <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 fixed h-full z-20">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-nfsu-navy rounded-lg flex items-center justify-center text-sm">⚖️</div>
              <div>
                <div className="text-xs text-gray-400 leading-none">NFSU</div>
                <div className="text-sm font-semibold text-nfsu-navy leading-snug">Projects DB</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {sidebarLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={`sidebar-link ${link.href === '/' ? 'active' : ''}`}>
                <span>{link.icon}</span> {link.label}
              </Link>
            ))}
          </nav>
          <SidebarBottom />
        </aside>
      )}

      {/* Mobile sidebar */}
      {user && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-60 bg-white z-40 md:hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-nfsu-navy rounded-lg flex items-center justify-center text-sm">⚖️</div>
                <span className="text-sm font-semibold text-nfsu-navy">NFSU Projects</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5">
              {sidebarLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)} className="sidebar-link">
                  <span>{link.icon}</span> {link.label}
                </Link>
              ))}
            </nav>
            <SidebarBottom />
          </aside>
        </>
      )}

      <div className={`flex-1 flex flex-col ${user ? 'md:ml-60' : ''}`}>
        {/* Header */}
        <header className="nfsu-header-bg text-white relative">
          <div className="border-b border-white/10 px-4 sm:px-6 py-2">
            <div className="max-w-7xl mx-auto flex justify-between text-xs text-white/60">
              <span className="hidden sm:block">National Forensic Sciences University · Est. 2020</span>
              <span className="sm:hidden">NFSU · Est. 2020</span>
              {user ? (
                <span>Signed in as <span className="text-white/80 font-medium">{user.name}</span></span>
              ) : (
                <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              )}
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
            <div className="flex items-center gap-3 sm:gap-5">
              {user && (
                <button onClick={() => setSidebarOpen(true)}
                  className="md:hidden w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                  ☰
                </button>
              )}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/10 border border-nfsu-gold/40 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl sm:text-3xl">⚖️</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-nfsu-amber text-xs font-semibold tracking-widest uppercase mb-0.5">Official Academic Repository</p>
                <h1 className="text-xl sm:text-3xl font-heading font-bold text-white leading-tight">NFSU Projects Database</h1>
                <p className="text-white/65 text-xs sm:text-sm mt-0.5">Student Major &amp; Minor Projects — All Campuses</p>
              </div>
              <div className="hidden md:flex gap-8 text-center flex-shrink-0">
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

        {/* Nav tabs */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <nav className="flex gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {[
                { href: '/', label: 'Campuses', active: true },
                { href: '/search', label: 'All Projects' },
                { href: '/search?type=major', label: 'Major' },
                { href: '/search?type=minor', label: 'Minor' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className={`px-3 sm:px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${item.active ? 'border-nfsu-amber text-nfsu-navy font-semibold' : 'border-transparent text-gray-500 hover:text-nfsu-navy'}`}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link href="/search" className="hidden md:flex items-center gap-2 text-sm text-gray-400 hover:text-nfsu-navy border border-gray-200 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0 ml-4">
              🔍 Search...
            </Link>
          </div>
        </div>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-nfsu-navy">Select a Campus</h2>
              <p className="text-gray-500 text-sm mt-0.5">Explore student projects from all NFSU campuses</p>
            </div>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Filter campuses…" className="form-input w-full sm:w-52 text-sm" />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {Array(15).fill(0).map((_,i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-3xl mb-2">🔍</p>
              <p>No campuses match your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {filtered.map(campus => (
                <Link key={campus.id} href={'/campus/' + campus.id}>
                  <div className="campus-card bg-white rounded-xl p-4 sm:p-5 h-full flex flex-col justify-between min-h-[148px]">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl sm:text-2xl">{CAMPUS_ICONS[campus.code] || '🏫'}</span>
                        <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full border border-gray-100">{campus.code}</span>
                      </div>
                      <h3 className="font-semibold text-nfsu-navy text-xs sm:text-sm leading-snug">{campus.name}</h3>
                      <p className="text-gray-400 text-xs mt-0.5 hidden sm:block">{campus.location}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
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
        </main>

        {/* Footer */}
        <footer className="mt-auto bg-nfsu-navy text-white">
          <div className="gold-line" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h3 className="font-heading font-bold text-base">NFSU Projects Database</h3>
                <p className="text-white/50 text-xs mt-1">Official student project repository · National Forensic Sciences University</p>
                <p className="text-white/30 text-xs mt-2">
                  © {new Date().getFullYear()} NFSU · Created &amp; Managed by{' '}
                  <a href="https://tamannakhurana.vercel.app/" target="_blank" rel="noopener noreferrer"
                    className="hover:underline font-medium" style={{ color: '#E8A820' }}>
                    Tamanna Khurana
                  </a>
                </p>
              </div>
              {user && (
                <div className="flex gap-4 text-white/40 text-xs flex-wrap">
                  {user.role === 'admin' && <Link href="/admin/dashboard" className="hover:text-white">Admin Dashboard</Link>}
                  {user.role === 'faculty' && <Link href="/faculty/dashboard" className="hover:text-white">Faculty Dashboard</Link>}
                  {user.role === 'student' && <Link href="/student/dashboard" className="hover:text-white">Student Dashboard</Link>}
                  <Link href="/search" className="hover:text-white">Browse Projects</Link>
                </div>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}