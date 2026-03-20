// Save as: app/api/auth/register/route.ts  (REPLACE)
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const {
      name, email, password,
      enrollment_number, campus_id,
      course_name, batch_start_year, batch_end_year, current_semester
    } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }
    if (!email.toLowerCase().endsWith('@nfsu.ac.in')) {
      return NextResponse.json({ error: 'Only NFSU email addresses (@nfsu.ac.in) are allowed' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Try to find matching course_id from DB if course_name provided
    let course_id = null
    if (course_name && campus_id) {
      const courseRes = await query(
        `SELECT id FROM courses WHERE campus_id = $1 AND (name ILIKE $2 OR short_name ILIKE $2) LIMIT 1`,
        [campus_id, `%${course_name.split('(')[0].trim()}%`]
      )
      if (courseRes.rows.length > 0) course_id = courseRes.rows[0].id
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const result = await query(
      `INSERT INTO users (
        name, email, password_hash, role,
        enrollment_number, campus_id, course_id,
        batch_start_year, batch_end_year
      ) VALUES ($1,$2,$3,'student',$4,$5,$6,$7,$8)
      RETURNING id, name, email, role`,
      [
        name, email.toLowerCase(), passwordHash,
        enrollment_number || null,
        campus_id || null,
        course_id,
        batch_start_year || null,
        batch_end_year || null,
      ]
    )

    return NextResponse.json({ user: result.rows[0] }, { status: 201 })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}