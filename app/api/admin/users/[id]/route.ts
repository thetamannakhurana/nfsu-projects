// Save as: app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(request)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const userId = parseInt(params.id)

    // Don't allow deleting yourself
    if (userId === session.userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Check user exists
    const check = await query('SELECT id, role FROM users WHERE id = $1', [userId])
    if (check.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Soft delete — just deactivate
    await query('UPDATE users SET is_active = false WHERE id = $1', [userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 })
  }
}