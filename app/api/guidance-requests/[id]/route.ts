// app/api/guidance-requests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role !== 'faculty' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Only faculty can respond to requests' }, { status: 403 })
    }

    const { status, faculty_note } = await request.json()
    if (!['accepted', 'rejected', 'held'].includes(status)) {
      return NextResponse.json({ error: 'Status must be accepted, rejected or held' }, { status: 400 })
    }

    // Update this request
    const result = await query(
      `UPDATE guidance_requests SET status=$1, faculty_note=$2, updated_at=NOW()
       WHERE id=$3 AND faculty_id=$4 RETURNING *`,
      [status, faculty_note || null, params.id, session.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const updatedRequest = result.rows[0]

    // If ACCEPTED — auto-cancel all other PENDING requests from this student
    if (status === 'accepted') {
      const studentId = updatedRequest.student_id
      await query(
        `UPDATE guidance_requests
         SET status = 'cancelled',
             faculty_note = 'Auto-cancelled: another faculty accepted your request.',
             updated_at = NOW()
         WHERE student_id = $1
           AND id != $2
           AND status = 'pending'`,
        [studentId, params.id]
      )
    }

    return NextResponse.json({ request: updatedRequest })
  } catch (error) {
    console.error('Update guidance request error:', error)
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}