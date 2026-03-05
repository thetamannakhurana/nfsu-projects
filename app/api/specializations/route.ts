import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('course_id')

    let sql = `SELECT * FROM specializations WHERE is_active = true`
    const params: unknown[] = []

    if (courseId) {
      sql += ` AND course_id = $1`
      params.push(parseInt(courseId))
    }

    sql += ` ORDER BY name`
    const result = await query(sql, params)
    return NextResponse.json({ specializations: result.rows })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch specializations' }, { status: 500 })
  }
}
