import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const campuses = await query(
      `SELECT c.*, 
        COUNT(DISTINCT p.id) AS project_count
       FROM campuses c
       LEFT JOIN projects p ON p.campus_id = c.id AND p.status = 'published'
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY 
         CASE WHEN c.code = 'GUJ' THEN 0 ELSE 1 END,
         c.name`
    )
    return NextResponse.json({ campuses: campuses.rows })
  } catch (error) {
    console.error('Get campuses error:', error)
    return NextResponse.json({ error: 'Failed to fetch campuses' }, { status: 500 })
  }
}
