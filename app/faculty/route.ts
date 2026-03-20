import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.designation, u.department,
              u.campus_id,
              c.name as campus_name
       FROM users u
       LEFT JOIN campuses c ON u.campus_id = c.id
       WHERE u.role = 'faculty' 
       AND (u.is_active = true OR u.is_active IS NULL)
       ORDER BY u.name`
    )
    console.log('Faculty query rows:', result.rows.length)
    return NextResponse.json({ faculty: result.rows })
  } catch (error) {
    console.error('Faculty API error:', error)
    return NextResponse.json({ faculty: [], error: String(error) }, { status: 200 })
  }
}