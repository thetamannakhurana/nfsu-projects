// Save as: app/api/auth/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { current_password, new_password } = await request.json()

    if (!current_password || !new_password) {
      return NextResponse.json({ error: 'Both current and new password are required' }, { status: 400 })
    }
    if (new_password.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }
    if (current_password === new_password) {
      return NextResponse.json({ error: 'New password must be different from current password' }, { status: 400 })
    }

    // Get current hash
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [session.userId])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const valid = await bcrypt.compare(current_password, result.rows[0].password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    const newHash = await bcrypt.hash(new_password, 12)
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, session.userId])

    return NextResponse.json({ success: true, message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}