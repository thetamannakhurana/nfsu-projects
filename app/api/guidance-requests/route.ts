// app/api/guidance-requests/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role !== 'student') return NextResponse.json({ error: 'Only students can send guidance requests' }, { status: 403 })

    const { faculty_id, project_title, project_domain, description, project_type } = await request.json()

    if (!faculty_id || !project_title) {
      return NextResponse.json({ error: 'Faculty and project title are required' }, { status: 400 })
    }

    const facultyCheck = await query('SELECT id, name FROM users WHERE id=$1 AND role=$2', [faculty_id, 'faculty'])
    if (facultyCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Selected faculty not found' }, { status: 404 })
    }

    const existing = await query(
      `SELECT id FROM guidance_requests WHERE student_id=$1 AND faculty_id=$2 AND status='pending'`,
      [session.userId, faculty_id]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'You already have a pending request with this faculty' }, { status: 409 })
    }

    const result = await query(
      `INSERT INTO guidance_requests (student_id, faculty_id, project_title, project_domain, description, project_type)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [session.userId, faculty_id, project_title, project_domain, description, project_type || 'minor']
    )

    return NextResponse.json({ request: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Guidance request error:', error)
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let result
    if (session.role === 'student') {
      result = await query(
        `SELECT gr.*, u.name as faculty_name, u.designation as faculty_designation, u.department as faculty_department
         FROM guidance_requests gr
         JOIN users u ON gr.faculty_id = u.id
         WHERE gr.student_id = $1
         ORDER BY gr.created_at DESC`,
        [session.userId]
      )
    } else if (session.role === 'faculty') {
      result = await query(
        `SELECT gr.*,
                u.name as student_name, u.email as student_email,
                u.enrollment_number, u.batch_start_year, u.batch_end_year,
                c.name as course_name, c.short_name as course_short,
                s.name as spec_name
         FROM guidance_requests gr
         JOIN users u ON gr.student_id = u.id
         LEFT JOIN courses c ON u.course_id = c.id
         LEFT JOIN specializations s ON u.specialization_id = s.id
         WHERE gr.faculty_id = $1
         ORDER BY gr.created_at DESC`,
        [session.userId]
      )
    } else {
      result = await query(
        `SELECT gr.*,
                st.name as student_name, st.email as student_email,
                f.name as faculty_name
         FROM guidance_requests gr
         JOIN users st ON gr.student_id = st.id
         JOIN users f ON gr.faculty_id = f.id
         ORDER BY gr.created_at DESC`
      )
    }

    return NextResponse.json({ requests: result.rows })
  } catch (error) {
    console.error('Get guidance requests error:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}