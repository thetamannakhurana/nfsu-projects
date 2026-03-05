import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid campus ID' }, { status: 400 })
    }
    const result = await query(
      `SELECT c.*, COUNT(DISTINCT p.id) AS project_count
       FROM campuses c
       LEFT JOIN projects p ON p.campus_id = c.id AND p.status = 'published'
       WHERE c.id = $1 AND c.is_active = true
       GROUP BY c.id`,
      [id]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Campus not found' }, { status: 404 })
    }
    return NextResponse.json({ campus: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch campus' }, { status: 500 })
  }
}