'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Campus { id: number; name: string; location: string; state: string; code: string; description: string; }
interface Course { id: number; name: string; short_name: string; degree_type: string; duration_years: number; project_count: string; specialization_count: string; }

const DEGREE_STYLES: Record<string, {bg:string;text:string;border:string;icon:string}> = {
  'B.Tech':    {bg:'bg-blue-50',  text:'text-blue-800',  border:'border-blue-200',  icon:''},
  'M.Tech':    {bg:'bg-purple-50',text:'text-purple-800',border:'border-purple-200',icon:''},
  'M.Sc':      {bg:'bg-green-50', text:'text-green-800', border:'border-green-200', icon:''},
  'B.Sc-M.Sc': {bg:'bg-teal-50',  text:'text-teal-800',  border:'border-teal-200',  icon:''},
  'BBA-MBA':   {bg:'bg-orange-50',text:'text-orange-800',border:'border-orange-200',icon:''},
  'M.A':       {bg:'bg-red-50',   text:'text-red-800',   border:'border-red-200',   icon:''},
  'Ph.D':      {bg:'bg-yellow-50',text:'text-yellow-800',border:'border-yellow-200',icon:''},
}

export default function CampusPage() {
  const params = useParams()
  const [campus, setCampus] = useState<Campus | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDegree, setSelectedDegree] = useState('all')

  useEffect(() => {
    const id = params.id
    if (!id || id === 'undefined') return
    const numId = Number(id)
    if (isNaN(numId)) return
    setLoading(true)
    fetch('/api/campuses')
      .then(r => r.json())
      .then(data => {
        const found = data.campuses.find((c: Campus) => Number(c.id) === numId)
        if (!found) { setError('Campus not found'); setLoading(false); return }
        setCampus(found)
        return fetch('/api/courses?campus_id=' + numId).then(r => r.json())
      })
      .then(data => { if (data) setCourses(data.courses || []); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [params.id])

  const degreeTypes = ['all', ...Array.from(new Set(courses.map(c => c.degree_type)))]
  const filtered = selectedDegree === 'all' ? courses : courses.filter(c => c.degree_type === selectedDegree)

  if (loading) return <div className='min-h-screen flex items-center justify-center'><p>Loading...</p></div>
  if (error || !campus) return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <p className='text-3xl mb-3'></p>
        <p className='text-gray-700 font-medium'>{error || 'Campus not found'}</p>
        <Link href='/' className='text-blue-600 text-sm mt-4 inline-block'>Back to home</Link>
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='nfsu-header-bg text-white'>
        <div className='border-b border-white/10 px-6 py-2'>
          <div className='max-w-7xl mx-auto flex justify-between text-xs text-white/60'>
            <Link href='/' className='hover:text-white'>NFSU Projects Database</Link>
            <div className='flex gap-4'>
              <Link href='/login' className='hover:text-white'>Faculty Login</Link>
              <Link href='/admin/login' className='hover:text-white'>Admin Login</Link>
            </div>
          </div>
        </div>
        <div className='max-w-7xl mx-auto px-6 py-6'>
          <div className='flex items-center gap-2 text-sm text-white/60 mb-4'>
            <Link href='/' className='hover:text-white'>Home</Link>
            <span className='text-yellow-400'></span>
            <span className='text-white'>{campus.name}</span>
          </div>
          <h1 className='text-2xl font-bold'>{campus.name}</h1>
          <p className='text-white/70 mt-1'>{campus.location}{campus.state ? ', ' + campus.state : ''}</p>
        </div>
        <div className='gold-line' />
      </header>
      <main className='max-w-7xl mx-auto px-6 py-8'>
        <h2 className='text-xl font-semibold text-blue-900 mb-2'>Programs and Courses</h2>
        <p className='text-gray-500 text-sm mb-6'>Select a program to browse projects</p>
        <div className='flex flex-wrap gap-2 mb-6'>
          {degreeTypes.map(type => (
            <button key={type} onClick={() => setSelectedDegree(type)}
              className={'px-4 py-1.5 rounded-full text-sm font-medium border ' + (selectedDegree === type ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-600 border-gray-200')}>
              {type === 'all' ? 'All Programs' : type}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className='text-center text-gray-400 py-16'>No courses found</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filtered.map(course => {
              const style = DEGREE_STYLES[course.degree_type] || DEGREE_STYLES['B.Tech']
              return (
                <Link key={course.id} href={'/campus/' + params.id + '/course/' + course.id}>
                  <div className={'bg-white rounded-xl border ' + style.border + ' p-5 hover:shadow-md cursor-pointer transition-all'}>
                    <div className='flex items-start justify-between mb-3'>
                      <span className='text-2xl'>{style.icon}</span>
                      <span className={'text-xs px-2 py-1 rounded-full border ' + style.bg + ' ' + style.text + ' ' + style.border}>{course.degree_type}</span>
                    </div>
                    <h3 className='font-semibold text-gray-900 text-sm'>{course.name}</h3>
                    <p className='text-gray-400 text-xs mt-1'>{course.duration_years}-year program</p>
                    <div className='mt-4 pt-3 border-t border-gray-100 flex justify-between'>
                      <span className='text-xs text-gray-500'>{course.project_count || 0} projects</span>
                      <span className='text-blue-600 text-xs'>Select </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
