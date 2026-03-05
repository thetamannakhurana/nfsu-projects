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
      'SELECT id, name, email, password_hash, role, campus_id, designation, is_active FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = result.rows[0]

    if (!user.is_active) {
      return NextResponse.json({ error: 'Account is deactivated. Contact administrator.' }, { status: 403 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      campusId: user.campus_id,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        campusId: user.campus_id,
        designation: user.designation,
      }
    })

    setAuthCookie(response, token)
    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
