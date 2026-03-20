// Save as: app/api/admin/users/route.ts  (REPLACE existing file)
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.campus_id, u.department,
              u.designation, u.is_active, u.created_at, u.last_login,
              u.enrollment_number, u.batch_start_year, u.batch_end_year,
              c.name AS campus_name,
              co.name AS course_name,
              s.name AS spec_name
       FROM users u
       LEFT JOIN campuses c ON u.campus_id = c.id
       LEFT JOIN courses co ON u.course_id = co.id
       LEFT JOIN specializations s ON u.specialization_id = s.id
       ORDER BY u.role, u.name`
    )

    return NextResponse.json({ users: result.rows })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { name, email, password, role, campus_id, department, designation, enrollment_number, course_id, specialization_id, batch_start_year, batch_end_year } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Name, email, password, and role are required' }, { status: 400 })
    }

    if (!['admin', 'faculty', 'student'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, campus_id, department, designation, enrollment_number, course_id, specialization_id, batch_start_year, batch_end_year)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, name, email, role, campus_id, designation, is_active, created_at`,
      [name, email.toLowerCase(), passwordHash, role, campus_id || null, department || null, designation || null, enrollment_number || null, course_id || null, specialization_id || null, batch_start_year || null, batch_end_year || null]
    )

    return NextResponse.json({ user: result.rows[0] }, { status: 201 })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}