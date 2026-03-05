import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PROTECTED_ROUTES = ['/faculty', '/admin/dashboard', '/admin/projects', '/admin/users']
const ADMIN_ROUTES = ['/admin/dashboard', '/admin/projects', '/admin/users']
const AUTH_ROUTES = ['/login', '/admin/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('nfsu_token')?.value

  // Redirect logged-in users away from login pages
  if (AUTH_ROUTES.includes(pathname) && token) {
    const session = await verifyToken(token)
    if (session) {
      const redirect = session.role === 'admin' ? '/admin/dashboard' : '/faculty/dashboard'
      return NextResponse.redirect(new URL(redirect, request.url))
    }
  }

  // Protect routes
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  if (isProtected) {
    if (!token) {
      const loginUrl = ADMIN_ROUTES.some(r => pathname.startsWith(r)) ? '/admin/login' : '/login'
      return NextResponse.redirect(new URL(loginUrl, request.url))
    }
    const session = await verifyToken(token)
    if (!session) {
      const loginUrl = ADMIN_ROUTES.some(r => pathname.startsWith(r)) ? '/admin/login' : '/login'
      return NextResponse.redirect(new URL(loginUrl, request.url))
    }
    if (ADMIN_ROUTES.some(r => pathname.startsWith(r)) && session.role !== 'admin') {
      return NextResponse.redirect(new URL('/faculty/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/faculty/:path*', '/admin/dashboard', '/admin/projects/:path*', '/admin/users/:path*', '/login', '/admin/login']
}
