// Save as: app/api/faculty/route.ts  (REPLACE)
import { NextResponse, NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// Which departments are relevant per course type
// Students from Cyber Security courses should only see Cyber Security & Digital Forensics faculty
const COURSE_TO_DEPARTMENTS: Record<string, string[]> = {
  'cyber': ['School of Cyber Security & Digital Forensics'],
  'forensic': ['School of Forensic Science', 'School of Cyber Security & Digital Forensics'],
  'behaviour': ['School of Behavioural Sciences'],
  'law': ['School of Law, Justice & Governance'],
  'management': ['School of Management Studies'],
  'criminology': ['School of Law, Justice & Governance', 'School of Behavioural Sciences'],
  'psychology': ['School of Behavioural Sciences'],
}

function getDepartmentsForCourse(courseName: string): string[] | null {
  if (!courseName) return null
  const lower = courseName.toLowerCase()
  if (lower.includes('cyber') || lower.includes('digital forensic') || lower.includes('information security') || lower.includes('network security')) {
    return COURSE_TO_DEPARTMENTS['cyber']
  }
  if (lower.includes('forensic science') || lower.includes('bsc-msc') || lower.includes('b.sc')) {
    return COURSE_TO_DEPARTMENTS['forensic']
  }
  if (lower.includes('psychology') || lower.includes('clinical')) {
    return COURSE_TO_DEPARTMENTS['psychology']
  }
  if (lower.includes('criminology')) {
    return COURSE_TO_DEPARTMENTS['criminology']
  }
  if (lower.includes('management') || lower.includes('bba') || lower.includes('mba') || lower.includes('accounting')) {
    return COURSE_TO_DEPARTMENTS['management']
  }
  if (lower.includes('law') || lower.includes('justice')) {
    return COURSE_TO_DEPARTMENTS['law']
  }
  return null // null = show all faculty
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const campusId = searchParams.get('campus_id')

    // Get student's course name to filter faculty by department
    let studentCourseName = ''
    if (session.role === 'student') {
      const studentRes = await query(
        `SELECT co.name as course_name 
         FROM users u 
         LEFT JOIN courses co ON u.course_id = co.id 
         WHERE u.id = $1`,
        [session.userId]
      )
      studentCourseName = studentRes.rows[0]?.course_name || ''
    }

    const relevantDepts = getDepartmentsForCourse(studentCourseName)

    let sql = `
      SELECT u.id, u.name, u.designation, u.department, u.campus_id,
             c.name as campus_name
      FROM users u
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.role = 'faculty'
      AND u.is_active IS NOT FALSE
    `
    const params: unknown[] = []
    let idx = 1

    // Filter by campus if provided
    if (campusId) {
      sql += ` AND u.campus_id = $${idx++}`
      params.push(parseInt(campusId))
    } else if (session.role === 'student') {
      // Auto-filter to student's own campus
      const studentCampusRes = await query('SELECT campus_id FROM users WHERE id = $1', [session.userId])
      const studentCampusId = studentCampusRes.rows[0]?.campus_id
      if (studentCampusId) {
        sql += ` AND u.campus_id = $${idx++}`
        params.push(studentCampusId)
      }
    }

    // Filter by relevant departments for student's course
    if (relevantDepts && relevantDepts.length > 0 && session.role === 'student') {
      const placeholders = relevantDepts.map((_, i) => `$${idx + i}`).join(', ')
      sql += ` AND u.department IN (${placeholders})`
      params.push(...relevantDepts)
      idx += relevantDepts.length
    }

    sql += ` ORDER BY u.designation, u.name`

    const result = await query(sql, params)

    return NextResponse.json({ 
      faculty: result.rows,
      filtered_by: relevantDepts || 'all departments',
      course: studentCourseName || 'unknown'
    })
  } catch (error) {
    console.error('Faculty API error:', error)
    return NextResponse.json({ faculty: [] }, { status: 500 })
  }
}