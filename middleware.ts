// middleware.ts — REPLACE existing file
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Pages that are public (no login required)
const PUBLIC_PATHS = [
  '/login',
  '/student/login',
  '/student/register',
  '/admin/login',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
]

// API routes that are public
const PUBLIC_API_PREFIXES = [
  '/api/auth/',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Always allow public API prefixes
  if (PUBLIC_API_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow Next.js internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Get token
  const token = request.cookies.get('nfsu_token')?.value

  // No token — redirect to unified login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token
  let payload = null
  try {
    payload = await verifyToken(token)
  } catch {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (!payload) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based route protection
  // Admin routes — admin only
  if (pathname.startsWith('/admin/') && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Faculty routes — faculty or admin
  if (pathname.startsWith('/faculty/') &&
      payload.role !== 'faculty' && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Student routes — student only
  if (pathname.startsWith('/student/dashboard') && payload.role !== 'student') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}