// Save as: middleware.ts (REPLACE existing file)
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin/dashboard') ||
      pathname.startsWith('/admin/projects') ||
      pathname.startsWith('/admin/users')) {
    const token = request.cookies.get('nfsu_token')?.value
    if (!token) return NextResponse.redirect(new URL('/admin/login', request.url))
    try {
      const payload = await verifyToken(token)
      if (!payload || payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Protect faculty routes
  if (pathname.startsWith('/faculty/dashboard') ||
      pathname.startsWith('/faculty/projects') ||
      pathname.startsWith('/faculty/guidance')) {
    const token = request.cookies.get('nfsu_token')?.value
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
    try {
      const payload = await verifyToken(token)
      if (!payload || (payload.role !== 'faculty' && payload.role !== 'admin')) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Protect student routes
  if (pathname.startsWith('/student/dashboard')) {
    const token = request.cookies.get('nfsu_token')?.value
    if (!token) return NextResponse.redirect(new URL('/student/login', request.url))
    try {
      const payload = await verifyToken(token)
      if (!payload || payload.role !== 'student') {
        return NextResponse.redirect(new URL('/student/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/student/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/faculty/:path*', '/student/dashboard/:path*'],
}