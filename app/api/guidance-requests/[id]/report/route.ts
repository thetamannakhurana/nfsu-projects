// Save as: app/api/guidance-requests/[id]/report/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// Student uploads report
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role !== 'student') return NextResponse.json({ error: 'Only students can upload reports' }, { status: 403 })

    // Verify this request belongs to this student and is accepted
    const reqCheck = await query(
      `SELECT id, student_id, status FROM guidance_requests WHERE id = $1`,
      [params.id]
    )
    if (reqCheck.rows.length === 0) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    if (reqCheck.rows[0].student_id !== session.userId) return NextResponse.json({ error: 'Not your request' }, { status: 403 })
    if (reqCheck.rows[0].status !== 'accepted') return NextResponse.json({ error: 'You can only upload a report after faculty has accepted your request' }, { status: 400 })

    const formData = await request.formData()
    const file = formData.get('report') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File size must be under 10MB' }, { status: 400 })

    // Upload to Vercel Blob
    const filename = `reports/request-${params.id}-${Date.now()}.pdf`
    const blob = await put(filename, file, { access: 'public' })

    // Save URL to DB
    await query(
      `UPDATE guidance_requests 
       SET report_url = $1, report_filename = $2, report_uploaded_at = NOW()
       WHERE id = $3`,
      [blob.url, file.name, params.id]
    )

    return NextResponse.json({ url: blob.url, filename: file.name })
  } catch (error) {
    console.error('Report upload error:', error)
    return NextResponse.json({ error: 'Failed to upload report' }, { status: 500 })
  }
}

// Faculty submits plagiarism check result
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role !== 'faculty' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Only faculty can submit plagiarism results' }, { status: 403 })
    }

    const { plagiarism_score, plagiarism_remarks } = await request.json()

    if (plagiarism_score === undefined || plagiarism_score === null) {
      return NextResponse.json({ error: 'Plagiarism score is required' }, { status: 400 })
    }
    if (plagiarism_score < 0 || plagiarism_score > 100) {
      return NextResponse.json({ error: 'Plagiarism score must be between 0 and 100' }, { status: 400 })
    }

    const result = await query(
      `UPDATE guidance_requests 
       SET plagiarism_score = $1, plagiarism_remarks = $2, plagiarism_checked_at = NOW()
       WHERE id = $3 AND faculty_id = $4
       RETURNING *`,
      [plagiarism_score, plagiarism_remarks || null, params.id, session.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    return NextResponse.json({ request: result.rows[0] })
  } catch (error) {
    console.error('Plagiarism check error:', error)
    return NextResponse.json({ error: 'Failed to submit plagiarism result' }, { status: 500 })
  }
}