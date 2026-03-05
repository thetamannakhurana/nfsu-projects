import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const [totalProjects, byType, byCampus, recentProjects, totalUsers] = await Promise.all([
      query(`SELECT COUNT(*) FROM projects WHERE status = 'published'`),
      query(`SELECT project_type, COUNT(*) FROM projects WHERE status = 'published' GROUP BY project_type`),
      query(`
        SELECT c.name, c.code, COUNT(p.id) as count 
        FROM campuses c 
        LEFT JOIN projects p ON p.campus_id = c.id AND p.status = 'published' 
        GROUP BY c.id ORDER BY count DESC LIMIT 10
      `),
      query(`
        SELECT p.id, p.title, p.student_name, p.project_type, p.created_at,
               c.name AS campus_name
        FROM projects p JOIN campuses c ON p.campus_id = c.id
        WHERE p.status = 'published' ORDER BY p.created_at DESC LIMIT 5
      `),
      query(`SELECT role, COUNT(*) FROM users WHERE is_active = true GROUP BY role`),
    ])

    return NextResponse.json({
      totalProjects: parseInt(totalProjects.rows[0].count),
      byType: byType.rows,
      byCampus: byCampus.rows,
      recentProjects: recentProjects.rows,
      users: {
        total: totalUsers.rows.reduce((sum, r) => sum + parseInt(r.count), 0),
        byRole: totalUsers.rows,
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
