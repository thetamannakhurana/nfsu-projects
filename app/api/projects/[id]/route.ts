import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      `SELECT 
        p.*,
        c.name AS campus_name, c.code AS campus_code, c.location AS campus_location,
        co.name AS course_name, co.short_name AS course_short_name, co.degree_type,
        s.name AS specialization_name,
        u.name AS added_by_name
       FROM projects p
       JOIN campuses c ON p.campus_id = c.id
       JOIN courses co ON p.course_id = co.id
       LEFT JOIN specializations s ON p.specialization_id = s.id
       LEFT JOIN users u ON p.added_by = u.id
       WHERE p.id = $1 AND p.status = 'published'`,
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project: result.rows[0] })
  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Check ownership (faculty can only edit their own projects, admin can edit all)
    if (session.role === 'faculty') {
      const existing = await query(
        'SELECT added_by FROM projects WHERE id = $1', [params.id]
      )
      if (existing.rows[0]?.added_by !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const {
      title, description, project_type, semester, academic_year,
      student_name, student_email, roll_number, enrollment_number,
      campus_id, course_id, specialization_id,
      batch_start_year, batch_end_year,
      guide_name, guide_email, guide_designation, co_guide_name,
      technologies, keywords, achievements,
      github_url, report_url, status
    } = data

    const result = await query(
      `UPDATE projects SET
        title=$1, description=$2, project_type=$3, semester=$4, academic_year=$5,
        student_name=$6, student_email=$7, roll_number=$8, enrollment_number=$9,
        campus_id=$10, course_id=$11, specialization_id=$12,
        batch_start_year=$13, batch_end_year=$14,
        guide_name=$15, guide_email=$16, guide_designation=$17, co_guide_name=$18,
        technologies=$19, keywords=$20, achievements=$21,
        github_url=$22, report_url=$23, status=$24
       WHERE id=$25
       RETURNING *`,
      [
        title, description, project_type, semester, academic_year,
        student_name, student_email, roll_number, enrollment_number,
        campus_id, course_id, specialization_id || null,
        batch_start_year, batch_end_year,
        guide_name, guide_email, guide_designation, co_guide_name,
        technologies || [], keywords || [],
        achievements, github_url, report_url, status || 'published',
        params.id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project: result.rows[0] })
  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await query('DELETE FROM projects WHERE id = $1', [params.id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
