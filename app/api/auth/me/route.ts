// Save as: app/api/auth/me/route.ts  (REPLACE existing file)
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch full user details from DB including student fields
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.campus_id, u.department,
              u.designation, u.is_active, u.enrollment_number,
              u.course_id, u.specialization_id,
              u.batch_start_year, u.batch_end_year,
              c.name as campus_name,
              co.name as course_name,
              s.name as spec_name
       FROM users u
       LEFT JOIN campuses c ON u.campus_id = c.id
       LEFT JOIN courses co ON u.course_id = co.id
       LEFT JOIN specializations s ON u.specialization_id = s.id
       WHERE u.id = $1 AND u.is_active = true`,
      [session.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = result.rows[0]
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
  }
}