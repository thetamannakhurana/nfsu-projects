// Save as: app/api/auth/login/route.ts  (REPLACE existing file)
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const result = await query(
      `SELECT u.*,
              c.name as campus_name,
              co.name as course_name,
              s.name as spec_name
       FROM users u
       LEFT JOIN campuses c ON u.campus_id = c.id
       LEFT JOIN courses co ON u.course_id = co.id
       LEFT JOIN specializations s ON u.specialization_id = s.id
       WHERE u.email = $1 AND u.is_active = true`,
      [email.toLowerCase()]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = result.rows[0]
    const validPassword = await bcrypt.compare(password, user.password_hash)

    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      campusId: user.campus_id,
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        campus_id: user.campus_id,
        campus_name: user.campus_name,
        course_id: user.course_id,
        course_name: user.course_name,
        specialization_id: user.specialization_id,
        spec_name: user.spec_name,
        batch_start_year: user.batch_start_year,
        batch_end_year: user.batch_end_year,
        enrollment_number: user.enrollment_number,
        designation: user.designation,
        department: user.department,
      }
    })

    setAuthCookie(response, token)
    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 })
  }
}