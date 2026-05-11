// app/api/guidance-requests/route.ts  (REPLACE)
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role !== 'student') return NextResponse.json({ error: 'Only students can send guidance requests' }, { status: 403 })

    // Handle both multipart (with file) and JSON (without file)
    let faculty_id: string, project_title: string, project_domain: string,
        description: string, project_type: string
    let docUrl: string | null = null
    let docFilename: string | null = null

    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      faculty_id = formData.get('faculty_id') as string
      project_title = formData.get('project_title') as string
      project_domain = formData.get('project_domain') as string || ''
      description = formData.get('description') as string || ''
      project_type = formData.get('project_type') as string || 'minor'

      // Handle optional document
      const doc = formData.get('document') as File | null
      if (doc && doc.size > 0) {
        if (doc.size > 10 * 1024 * 1024) {
          return NextResponse.json({ error: 'Document must be under 10MB' }, { status: 400 })
        }
        const allowedTypes = ['application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg', 'image/png']
        if (!allowedTypes.includes(doc.type)) {
          return NextResponse.json({ error: 'Only PDF, Word documents, and images are allowed' }, { status: 400 })
        }
        const filename = `request-docs/${session.userId}-${Date.now()}-${doc.name}`
        const blob = await put(filename, doc, { access: 'public' })
        docUrl = blob.url
        docFilename = doc.name
      }
    } else {
      // JSON body (no file)
      const body = await request.json()
      faculty_id = body.faculty_id
      project_title = body.project_title
      project_domain = body.project_domain || ''
      description = body.description || ''
      project_type = body.project_type || 'minor'
    }

    if (!faculty_id || !project_title) {
      return NextResponse.json({ error: 'Faculty and project title are required' }, { status: 400 })
    }

    const facultyCheck = await query('SELECT id FROM users WHERE id=$1 AND role=$2', [faculty_id, 'faculty'])
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
      `INSERT INTO guidance_requests
         (student_id, faculty_id, project_title, project_domain, description, project_type, request_doc_url, request_doc_filename)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [session.userId, faculty_id, project_title, project_domain, description,
       project_type, docUrl, docFilename]
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
        `SELECT gr.*,
                u.name as faculty_name, u.designation as faculty_designation, u.department as faculty_department
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