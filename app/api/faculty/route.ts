import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.designation, u.department, c.name as campus_name
       FROM users u
       LEFT JOIN campuses c ON u.campus_id = c.id
       WHERE u.role = 'faculty'
       ORDER BY u.name`
    )
    return NextResponse.json({ faculty: result.rows })
  } catch (error) {
    console.error('Faculty API error:', error)
    return NextResponse.json({ faculty: [] }, { status: 500 })
  }
}