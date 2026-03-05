import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campusId = searchParams.get('campus_id')

    let sql = `
      SELECT co.*, 
        COUNT(DISTINCT p.id) AS project_count,
        COUNT(DISTINCT s.id) AS specialization_count
       FROM courses co
       LEFT JOIN projects p ON p.course_id = co.id AND p.status = 'published'
       LEFT JOIN specializations s ON s.course_id = co.id AND s.is_active = true
       WHERE co.is_active = true
    `
    const params: unknown[] = []

    const campusIdInt = campusId ? parseInt(campusId) : NaN
    if (campusId && campusId !== 'undefined' && !isNaN(campusIdInt)) {
      sql += ` AND co.campus_id = $1`
      params.push(campusIdInt)
    }

    sql += ` GROUP BY co.id ORDER BY co.degree_type, co.name`

    const courses = await query(sql, params)
    return NextResponse.json({ courses: courses.rows })
  } catch (error) {
    console.error('Get courses error:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}