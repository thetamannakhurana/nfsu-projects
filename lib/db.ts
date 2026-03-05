import { Pool } from 'pg'

declare global {
  var _pgPool: Pool | undefined
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })
}

// In development, use a global variable to prevent multiple pool instances
const pool = global._pgPool ?? createPool()

if (process.env.NODE_ENV !== 'production') {
  global._pgPool = pool
}

export default pool

export async function query(text: string, params?: unknown[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text: text.slice(0, 80), duration, rows: res.rowCount })
    }
    return res
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}
