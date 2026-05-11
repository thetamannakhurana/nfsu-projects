// Save as: app/api/projects/share/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role !== 'faculty' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Only faculty can share projects' }, { status: 403 })
    }

    const { project_id, project_title, share_to_id, note, project_url } = await request.json()

    if (!share_to_id || !project_id) {
      return NextResponse.json({ error: 'Recipient and project are required' }, { status: 400 })
    }

    // Get sender name
    const senderRes = await query('SELECT name, designation FROM users WHERE id=$1', [session.userId])
    const sender = senderRes.rows[0]

    // Check recipient exists and is faculty
    const recipientRes = await query('SELECT id, name FROM users WHERE id=$1 AND role IN (\'faculty\',\'admin\')', [share_to_id])
    if (recipientRes.rows.length === 0) {
      return NextResponse.json({ error: 'Recipient faculty not found' }, { status: 404 })
    }

    // Save share notification in project_shares table
    await query(`
      CREATE TABLE IF NOT EXISTS project_shares (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        project_title VARCHAR(500),
        shared_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        shared_to_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        note TEXT,
        project_url TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await query(
      `INSERT INTO project_shares (project_id, project_title, shared_by_id, shared_to_id, note, project_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [project_id, project_title, session.userId, share_to_id, note || null, project_url]
    )

    return NextResponse.json({
      success: true,
      message: `Project shared with ${recipientRes.rows[0].name}`
    })
  } catch (error) {
    console.error('Share project error:', error)
    return NextResponse.json({ error: 'Failed to share project' }, { status: 500 })
  }
}

// GET — faculty sees projects shared with them
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Create table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS project_shares (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        project_title VARCHAR(500),
        shared_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        shared_to_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        note TEXT,
        project_url TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    const result = await query(
      `SELECT ps.*, u.name as shared_by_name, u.designation as shared_by_designation
       FROM project_shares ps
       JOIN users u ON ps.shared_by_id = u.id
       WHERE ps.shared_to_id = $1
       ORDER BY ps.created_at DESC`,
      [session.userId]
    )

    // Mark all as read
    await query('UPDATE project_shares SET is_read=true WHERE shared_to_id=$1', [session.userId])

    return NextResponse.json({ shares: result.rows })
  } catch (error) {
    console.error('Get shares error:', error)
    return NextResponse.json({ shares: [] }, { status: 500 })
  }
}