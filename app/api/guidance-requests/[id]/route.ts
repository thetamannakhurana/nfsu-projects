// Save as: app/api/guidance-requests/[id]/route.ts  (REPLACE)
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

    const { status, faculty_note, co_guide_id } = await request.json()

    // Handle co-guide assignment (separate from status change)
    if (co_guide_id !== undefined) {
      let coGuideName = null
      if (co_guide_id) {
        const cgRes = await query('SELECT name FROM users WHERE id=$1 AND role=$2', [co_guide_id, 'faculty'])
        if (cgRes.rows.length === 0) return NextResponse.json({ error: 'Co-guide not found' }, { status: 404 })
        coGuideName = cgRes.rows[0].name
      }
      const result = await query(
        `UPDATE guidance_requests SET co_guide_id=$1, co_guide_name=$2, updated_at=NOW()
         WHERE id=$3 AND faculty_id=$4 RETURNING *`,
        [co_guide_id || null, coGuideName, params.id, session.userId]
      )
      if (result.rows.length === 0) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
      return NextResponse.json({ request: result.rows[0] })
    }

    // Handle status change
    if (!['accepted', 'rejected', 'held'].includes(status)) {
      return NextResponse.json({ error: 'Status must be accepted, rejected or held' }, { status: 400 })
    }

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
      await query(
        `UPDATE guidance_requests
         SET status='cancelled',
             faculty_note='Auto-cancelled: another faculty accepted your request.',
             updated_at=NOW()
         WHERE student_id=$1 AND id!=$2 AND status='pending'`,
        [updatedRequest.student_id, params.id]
      )
    }

    return NextResponse.json({ request: updatedRequest })
  } catch (error) {
    console.error('Update guidance request error:', error)
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}