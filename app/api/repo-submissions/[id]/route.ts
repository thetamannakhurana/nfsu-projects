// Save as: app/api/repo-submissions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role !== 'faculty' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Only faculty can review submissions' }, { status: 403 })
    }

    const { status, guide_remarks } = await request.json()
    if (!['approved', 'rejected', 'revision'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const result = await query(
      `UPDATE repo_submissions
       SET status=$1, guide_remarks=$2, reviewed_at=NOW(), updated_at=NOW()
       WHERE id=$3 AND guide_id=$4
       RETURNING *`,
      [status, guide_remarks || null, params.id, session.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // If approved — automatically create the project in repository
    if (status === 'approved') {
      const sub = result.rows[0]
      const studentRes = await query(
        `SELECT u.*, c.name as course_name, s.name as spec_name
         FROM users u
         LEFT JOIN courses c ON u.course_id = c.id
         LEFT JOIN specializations s ON u.specialization_id = s.id
         WHERE u.id = $1`, [sub.student_id]
      )
      const student = studentRes.rows[0]
      const guideRes = await query('SELECT name, email, designation FROM users WHERE id=$1', [session.userId])
      const guide = guideRes.rows[0]

      if (student) {
        await query(
          `INSERT INTO projects
             (title, description, project_type, student_name, student_email,
              enrollment_number, campus_id, course_id, specialization_id,
              batch_start_year, batch_end_year, guide_name, guide_email,
              guide_designation, technologies, keywords, achievements,
              github_url, report_url, project_url, status, added_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,'published',$21)
           ON CONFLICT DO NOTHING`,
          [sub.title, sub.description, sub.project_type,
           student.name, student.email, student.enrollment_number,
           student.campus_id, student.course_id, student.specialization_id,
           student.batch_start_year, student.batch_end_year,
           guide.name, guide.email, guide.designation,
           sub.technologies, sub.keywords, sub.achievements,
           sub.github_url, sub.report_url, sub.project_url,
           session.userId]
        )
      }
    }

    return NextResponse.json({ submission: result.rows[0] })
  } catch (error) {
    console.error('Review error:', error)
    return NextResponse.json({ error: 'Failed to review' }, { status: 500 })
  }
}