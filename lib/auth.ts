import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
const secret = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  userId: number
  email: string
  name: string
  role: 'admin' | 'faculty'
  campusId?: number
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('nfsu_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set('nfsu_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.delete('nfsu_token')
}

export async function requireAuth(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get('nfsu_token')?.value
  if (!token) return null
  return verifyToken(token)
}
