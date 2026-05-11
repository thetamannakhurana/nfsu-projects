// Save as: app/api/repo-submissions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role !== 'student') return NextResponse.json({ error: 'Only students can submit' }, { status: 403 })

    const { guide_id, guidance_request_id, title, description, project_type,
            technologies, keywords, achievements, github_url, report_url, project_url } = await request.json()

    if (!guide_id || !title) {
      return NextResponse.json({ error: 'Guide and title are required' }, { status: 400 })
    }

    // Check no duplicate pending submission
    const existing = await query(
      `SELECT id FROM repo_submissions WHERE student_id=$1 AND guide_id=$2 AND status='pending'`,
      [session.userId, guide_id]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'You already have a pending submission with this guide' }, { status: 409 })
    }

    const result = await query(
      `INSERT INTO repo_submissions
         (student_id, guide_id, guidance_request_id, title, description, project_type,
          technologies, keywords, achievements, github_url, report_url, project_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [session.userId, guide_id, guidance_request_id || null, title, description,
       project_type || 'minor',
       technologies ? technologies.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
       keywords ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [],
       achievements, github_url, report_url, project_url]
    )

    return NextResponse.json({ submission: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Repo submission error:', error)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let result
    if (session.role === 'student') {
      result = await query(
        `SELECT rs.*, u.name as guide_name, u.designation as guide_designation
         FROM repo_submissions rs
         JOIN users u ON rs.guide_id = u.id
         WHERE rs.student_id = $1
         ORDER BY rs.created_at DESC`,
        [session.userId]
      )
    } else if (session.role === 'faculty') {
      result = await query(
        `SELECT rs.*, u.name as student_name, u.email as student_email,
                c.name as course_name
         FROM repo_submissions rs
         JOIN users u ON rs.student_id = u.id
         LEFT JOIN courses c ON u.course_id = c.id
         WHERE rs.guide_id = $1
         ORDER BY rs.created_at DESC`,
        [session.userId]
      )
    } else {
      result = await query(
        `SELECT rs.*, s.name as student_name, f.name as guide_name
         FROM repo_submissions rs
         JOIN users s ON rs.student_id = s.id
         JOIN users f ON rs.guide_id = f.id
         ORDER BY rs.created_at DESC`
      )
    }

    return NextResponse.json({ submissions: result.rows })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}