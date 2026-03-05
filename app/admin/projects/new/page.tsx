'use client'

import Link from 'next/link'
import ProjectForm from '@/components/ProjectForm'

export default function AdminNewProjectPage() {
  return (
    <div className="min-h-screen bg-nfsu-offwhite">
      <header className="nfsu-header-bg text-white">
        <div className="border-b border-white/10 px-6 py-2">
          <div className="max-w-4xl mx-auto flex justify-between text-xs text-white/60">
            <Link href="/admin/dashboard" className="hover:text-white">← Admin Dashboard</Link>
            <span>NFSU Admin Portal</span>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
            <Link href="/admin/dashboard" className="hover:text-white">Dashboard</Link>
            <span className="text-nfsu-amber">›</span>
            <span className="text-white">Add New Project</span>
          </div>
          <h1 className="text-xl font-heading font-bold">Add New Project</h1>
          <p className="text-white/65 text-sm mt-1">Document a new student project in the database</p>
        </div>
        <div className="gold-line" />
      </header>
      <main className="max-w-4xl mx-auto px-6 py-6">
        <ProjectForm redirectTo="/admin/projects" />
      </main>
    </div>
  )
}
