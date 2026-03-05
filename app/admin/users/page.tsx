'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface User {
  id: number; name: string; email: string; role: string; campus_name: string;
  department: string; designation: string; is_active: boolean; last_login: string; created_at: string;
}
interface Campus { id: number; name: string }

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'faculty',
    campus_id: '', department: '', designation: ''
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/campuses').then(r => r.json()),
    ])
    .then(([userData, campusData]) => {
      setUsers(userData.users || [])
      setCampuses(campusData.campuses || [])
      setLoading(false)
    })
    .catch(() => router.push('/admin/login'))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, campus_id: form.campus_id ? parseInt(form.campus_id) : null }),
    })
    const data = await res.json()

    if (!res.ok) { setError(data.error); setSaving(false); return }
    
    // Reload users
    const updated = await fetch('/api/admin/users').then(r => r.json())
    setUsers(updated.users || [])
    setShowForm(false)
    setForm({ name: '', email: '', password: '', role: 'faculty', campus_id: '', department: '', designation: '' })
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-nfsu-offwhite flex">
      <aside className="w-60 bg-nfsu-navy flex flex-col fixed h-full z-20 hidden md:flex">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/10 rounded-xl border border-nfsu-gold/40 flex items-center justify-center text-base">⚖️</div>
            <div>
              <div className="text-xs text-white/50">NFSU Admin</div>
              <div className="text-sm font-semibold text-white">Projects Database</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {[
            { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
            { href: '/admin/projects', label: 'Manage Projects', icon: '📁' },
            { href: '/admin/users', label: 'Manage Users', icon: '👥', active: true },
            { href: '/admin/projects/new', label: 'Add Project', icon: '➕' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                item.active ? 'bg-white/15 text-white font-medium border-l-2 border-nfsu-gold pl-[10px]' : 'text-white/65 hover:bg-white/10 hover:text-white'
              }`}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 md:ml-60">
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-heading font-semibold text-nfsu-navy">Manage Users</h1>
            <button onClick={() => setShowForm(!showForm)} className="btn-gold text-sm">
              {showForm ? '✕ Cancel' : '➕ Add User'}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Add user form */}
          {showForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 animate-in">
              <h2 className="font-heading font-semibold text-nfsu-navy mb-4">Create New User Account</h2>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-4">⚠️ {error}</div>}
              <form onSubmit={handleCreate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Dr. Jane Smith" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Email Address *</label>
                    <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="faculty@nfsu.ac.in" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Password *</label>
                    <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Minimum 8 characters" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Role *</label>
                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="form-input">
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Campus</label>
                    <select value={form.campus_id} onChange={e => setForm(f => ({ ...f, campus_id: e.target.value }))} className="form-input">
                      <option value="">Select Campus</option>
                      {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Designation</label>
                    <input type="text" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                      placeholder="e.g., Assistant Professor" className="form-input" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Department</label>
                    <input type="text" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                      placeholder="e.g., Department of Cyber Security" className="form-input" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                    {saving ? 'Creating...' : '✅ Create Account'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Users table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-nfsu-blue border-t-transparent rounded-full animate-spin mx-auto" style={{ borderWidth: '3px' }} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Campus</th>
                      <th>Designation</th>
                      <th>Last Login</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="font-medium text-xs">{u.name}</td>
                        <td className="text-xs text-gray-500">{u.email}</td>
                        <td>
                          <span className={`badge text-xs ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="text-xs text-gray-500">{u.campus_name || '—'}</td>
                        <td className="text-xs text-gray-500">{u.designation || '—'}</td>
                        <td className="text-xs text-gray-400">
                          {u.last_login ? new Date(u.last_login).toLocaleDateString('en-IN') : 'Never'}
                        </td>
                        <td>
                          <span className={`badge text-xs ${u.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
