import { NextRequest, NextResponse } from 'next/server'
import { createSessionCookie, clearSessionCookie } from '@/lib/internal-admin/session'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { username, password } = body
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }
    const admin = process.env.THEGRIDHUB_ADMIN
    const adminPw = process.env.THEGRIDHUB_ADMIN_PW
    if (!admin || !adminPw) {
      return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 500 })
    }
    if (username !== admin || password !== adminPw) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Set signed session cookie
    createSessionCookie(username, 60 * 60)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

export async function DELETE() {
  clearSessionCookie()
  return NextResponse.json({ ok: true })
}

