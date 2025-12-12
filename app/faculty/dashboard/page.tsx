'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function FacultyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    campus: '',
    program: '',
    specialization: '',
    batch: '',
    projectType: '',
    projectName: '',
    studentName: '',
    studentEmail: '',
    guideName: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/faculty/login');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Project added successfully!');
        setFormData({
          campus: '',
          program: '',
          specialization: '',
          batch: '',
          projectType: '',
          projectName: '',
          studentName: '',
          studentEmail: '',
          guideName: '',
        });
      } else {
        setError('Failed to add project');
      }
    } catch (err) {
      setError('Error adding project');
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const campuses = ['Gandhinagar', 'Delhi', 'Goa', 'Tripura', 'Bhopal', 'Pune', 'Guwahati', 'Manipur', 'Dharwad', 'Bhubaneswar', 'Chennai', 'Nagpur', 'Jaipur', 'Raipur'];
  const programs = ['B.Tech', 'M.Tech', 'M.Sc', 'Ph.D'];
  const specializations = ['CSC', 'Cybersecurity', 'Forensics', 'Digital Forensics'];
  const batches = ['2021-2026', '2022-2027', '2023-2028', '2024-2029', '2025-2030', '2026-2031'];
  const projectTypes = ['Minor Project', 'Major Project'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Faculty Dashboard</h1>
              <p className="text-gray-600">Welcome, {session?.user?.name}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Campus</label>
                <select
                  value={formData.campus}
                  onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-black"
                  required
                >
                  <option value="">Select Campus</option>
                  {campuses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Program</label>
                <select
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-black"
                  required
                >
                  <option value="">Select Program</option>
                  {programs.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-black"
                  required
                >
                  <option value="">Select Specialization</option>
                  {specializations.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Year</label>
                <select
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-black"
                  required
                >
                  <option value="">Select Batch</option>
                  {batches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Type</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-black"
                  required
                >
                  <option value="">Select Type</option>
                  {projectTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-black"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-black"
                  placeholder="Enter student name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Student Email</label>
                <input
                  type="email"
                  value={formData.studentEmail}
                  onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-black"
                  placeholder="student@nfsu.ac.in"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Guide Name</label>
                <input
                  type="text"
                  value={formData.guideName}
                  onChange={(e) => setFormData({ ...formData, guideName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-black"
                  placeholder="Enter guide name"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
            >
              Add Project
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
