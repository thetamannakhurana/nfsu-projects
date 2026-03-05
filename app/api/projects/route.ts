import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campusId = searchParams.get('campus_id')
    const courseId = searchParams.get('course_id')
    const batchStart = searchParams.get('batch_start')
    const batchEnd = searchParams.get('batch_end')
    const projectType = searchParams.get('project_type')
    const specializationId = searchParams.get('specialization_id')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let whereConditions = ["p.status = 'published'"]
    const params: unknown[] = []
    let paramIdx = 1

    if (campusId && !isNaN(parseInt(campusId))) {
      whereConditions.push(`p.campus_id = $${paramIdx++}`)
      params.push(parseInt(campusId))
    }
    if (courseId && !isNaN(parseInt(courseId))) {
      whereConditions.push(`p.course_id = $${paramIdx++}`)
      params.push(parseInt(courseId))
    }
    if (batchStart && !isNaN(parseInt(batchStart))) {
      whereConditions.push(`p.batch_start_year = $${paramIdx++}`)
      params.push(parseInt(batchStart))
    }
    if (batchEnd && !isNaN(parseInt(batchEnd))) {
      whereConditions.push(`p.batch_end_year = $${paramIdx++}`)
      params.push(parseInt(batchEnd))
    }
    if (projectType) {
      whereConditions.push(`p.project_type = $${paramIdx++}`)
      params.push(projectType)
    }
    if (specializationId && !isNaN(parseInt(specializationId))) {
      whereConditions.push(`p.specialization_id = $${paramIdx++}`)
      params.push(parseInt(specializationId))
    }
    if (search) {
      whereConditions.push(`(p.title ILIKE $${paramIdx} OR p.student_name ILIKE $${paramIdx} OR p.guide_name ILIKE $${paramIdx})`)
      params.push(`%${search}%`)
      paramIdx++
    }

    const where = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    const countResult = await query(
      `SELECT COUNT(*) FROM projects p ${where}`,
      params
    )
    const total = parseInt(countResult.rows[0].count)

    const projectsResult = await query(
      `SELECT 
        p.id, p.title, p.description, p.project_type, p.semester, p.academic_year,
        p.student_name, p.student_email, p.roll_number,
        p.guide_name, p.guide_email, p.guide_designation, p.co_guide_name,
        p.batch_start_year, p.batch_end_year,
        p.technologies, p.keywords, p.achievements,
        p.github_url, p.report_url, p.created_at,
        c.name AS campus_name, c.code AS campus_code,
        co.name AS course_name, co.short_name AS course_short_name, co.degree_type,
        s.name AS specialization_name
       FROM projects p
       JOIN campuses c ON p.campus_id = c.id
       JOIN courses co ON p.course_id = co.id
       LEFT JOIN specializations s ON p.specialization_id = s.id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    )

    return NextResponse.json({
      projects: projectsResult.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const {
      title, description, project_type, semester, academic_year,
      student_name, student_email, roll_number, enrollment_number,
      campus_id, course_id, specialization_id,
      batch_start_year, batch_end_year,
      guide_name, guide_email, guide_designation, co_guide_name,
      technologies, keywords, achievements,
      github_url, report_url, status
    } = data

    if (!title || !student_name || !campus_id || !course_id || !batch_start_year || !batch_end_year || !guide_name || !project_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO projects (
        title, description, project_type, semester, academic_year,
        student_name, student_email, roll_number, enrollment_number,
        campus_id, course_id, specialization_id,
        batch_start_year, batch_end_year,
        guide_name, guide_email, guide_designation, co_guide_name,
        technologies, keywords, achievements,
        github_url, report_url, status, added_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
      RETURNING *`,
      [
        title, description, project_type, semester, academic_year,
        student_name, student_email, roll_number, enrollment_number,
        campus_id, course_id, specialization_id || null,
        batch_start_year, batch_end_year,
        guide_name, guide_email, guide_designation, co_guide_name,
        technologies || [], keywords || [],
        achievements, github_url, report_url,
        status || 'published', session.userId
      ]
    )

    return NextResponse.json({ project: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}