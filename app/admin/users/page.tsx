'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NFSU_DEPARTMENTS, NFSU_DESIGNATIONS } from '@/lib/nfsu-constants'

interface User {
  id: number; name: string; email: string; role: string
  campus_name: string; department: string; designation: string
  is_active: boolean; created_at: string; last_login: string
  enrollment_number: string; course_name: string; spec_name: string
  batch_start_year: number; batch_end_year: number
}
interface Campus { id: number; name: string }

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState('all')
  const [removing, setRemoving] = useState<number | null>(null)

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'faculty',
    campus_id: '', department: '', designation: '',
  })

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.user.role !== 'admin') { router.push('/admin/login'); return }
        return Promise.all([
          fetch('/api/admin/users').then(r => r.json()),
          fetch('/api/campuses').then(r => r.json()),
        ])
      })
      .then(results => {
        if (results) {
          setUsers(results[0].users || [])
          setCampuses(results[1].campuses || [])
        }
        setLoading(false)
      })
      .catch(() => router.push('/admin/login'))
  }, [router])

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSubmitting(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, campus_id: form.campus_id ? parseInt(form.campus_id) : null })
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSubmitting(false); return }
    setUsers(prev => [...prev, data.user])
    setSuccess(`${form.role === 'faculty' ? 'Faculty' : form.role === 'student' ? 'Student' : 'Admin'} added successfully!`)
    setForm({ name: '', email: '', password: '', role: 'faculty', campus_id: '', department: '', designation: '' })
    setShowForm(false)
    setTimeout(() => setSuccess(''), 3000)
    setSubmitting(false)
  }

  async function handleRemove(userId: number, userName: string) {
    if (!confirm(`Remove ${userName}? This cannot be undone.`)) return
    setRemoving(userId)
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== userId))
      setSuccess(`${userName} removed successfully.`)
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError('Failed to remove user.')
    }
    setRemoving(null)
  }

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter)
  const counts = {
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    faculty: users.filter(u => u.role === 'faculty').length,
    student: users.filter(u => u.role === 'student').length,
  }

  const roleColor = (r: string) =>
    r === 'admin' ? 'bg-red-50 text-red-700 border-red-200' :
    r === 'faculty' ? 'bg-blue-50 text-blue-700 border-blue-200' :
    'bg-green-50 text-green-700 border-green-200'

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-nfsu-blue border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-nfsu-offwhite">
      {/* Header */}
      <div className="nfsu-header-bg text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-white/60 hover:text-white text-sm">← Dashboard</Link>
            <span className="text-white/30">/</span>
            <span className="text-sm font-medium">Manage Users</span>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-gold text-sm px-4 py-2">
            {showForm ? '✕ Cancel' : '+ Add User'}
          </button>
        </div>
        <div className="gold-line mt-4" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">✅ {success}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">⚠️ {error}</div>}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', count: counts.all, icon: '👥', color: 'border-gray-300' },
            { label: 'Admins', count: counts.admin, icon: '🛡️', color: 'border-red-300' },
            { label: 'Faculty', count: counts.faculty, icon: '👨‍🏫', color: 'border-blue-300' },
            { label: 'Students', count: counts.student, icon: '🎓', color: 'border-green-300' },
          ].map(s => (
            <div key={s.label} className={`stat-card border-l-4 ${s.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-heading font-bold text-nfsu-navy">{s.count}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
                <span className="text-2xl">{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add user form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-heading font-semibold text-nfsu-navy mb-5">Add New User</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name *</label>
                <input type="text" value={form.name} onChange={e => setF('name', e.target.value)}
                  required placeholder="Dr. / Prof. Full Name" className="form-input" />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input type="email" value={form.email} onChange={e => setF('email', e.target.value)}
                  required placeholder="name@nfsu.ac.in" className="form-input" />
              </div>
              <div>
                <label className="form-label">Password *</label>
                <input type="password" value={form.password} onChange={e => setF('password', e.target.value)}
                  required minLength={6} placeholder="Min. 6 characters" className="form-input" />
              </div>
              <div>
                <label className="form-label">Role *</label>
                <select value={form.role} onChange={e => setF('role', e.target.value)} className="form-input">
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <label className="form-label">Campus</label>
                <select value={form.campus_id} onChange={e => setF('campus_id', e.target.value)} className="form-input">
                  <option value="">Select Campus</option>
                  {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {form.role === 'faculty' || form.role === 'admin' ? (
                <>
                  <div>
                    <label className="form-label">Department</label>
                    <select value={form.department} onChange={e => setF('department', e.target.value)} className="form-input">
                      <option value="">Select Department</option>
                      {NFSU_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Designation</label>
                    <select value={form.designation} onChange={e => setF('designation', e.target.value)} className="form-input">
                      <option value="">Select Designation</option>
                      {NFSU_DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </>
              ) : null}
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
                  {submitting ? 'Adding...' : '✅ Add User'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Filter tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 flex-wrap">
            {(['all', 'admin', 'faculty', 'student'] as const).map(r => (
              <button key={r} onClick={() => setFilter(r)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${filter === r ? 'bg-nfsu-navy text-white border-nfsu-navy' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-nfsu-navy hover:text-nfsu-navy'}`}>
                {r === 'all' ? `All (${counts.all})` : r === 'admin' ? `Admins (${counts.admin})` : r === 'faculty' ? `Faculty (${counts.faculty})` : `Students (${counts.student})`}
              </button>
            ))}
          </div>

          <div className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <div className="p-10 text-center text-gray-400">No users found</div>
            ) : filtered.map(user => (
              <div key={user.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-nfsu-navy/10 flex items-center justify-center text-sm flex-shrink-0">
                    {user.role === 'admin' ? '🛡️' : user.role === 'faculty' ? '👨‍🏫' : '🎓'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                      <span className={`badge text-xs ${roleColor(user.role)}`}>{user.role}</span>
                      {!user.is_active && <span className="badge text-xs bg-gray-100 text-gray-500 border-gray-200">Inactive</span>}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {user.role === 'student' ? (
                        <>{user.course_name && `${user.course_name} · `}{user.batch_start_year && `${user.batch_start_year}–${user.batch_end_year}`}</>
                      ) : (
                        <>{user.designation && `${user.designation}`}{user.department && ` · ${user.department}`}</>
                      )}
                      {user.campus_name && ` · ${user.campus_name}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {new Date(user.created_at).toLocaleDateString('en-IN')}
                  </span>
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleRemove(user.id, user.name)}
                      disabled={removing === user.id}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {removing === user.id ? '...' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}