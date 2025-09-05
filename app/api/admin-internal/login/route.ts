import { NextRequest, NextResponse } from 'next/server'
import { createSessionCookieOnResponse, clearSessionCookie } from '@/lib/internal-admin/session'
import { adminAuditLog } from '@/lib/internal-admin/audit'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { username, password } = body
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }
    const admin = process.env.THEGRIDHUB_ADMIN
    const adminPw = process.env.THEGRIDHUB_ADMIN_PW
    const operator = process.env.THEGRIDHUB_OPERATOR
    const operatorPw = process.env.THEGRIDHUB_OPERATOR_PW
    if (!admin || !adminPw) {
      return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 500 })
    }

    let role: 'owner' | 'operator' | null = null
    if (username === admin && password === adminPw) {
      role = 'owner'
    } else if (operator && operatorPw && username === operator && password === operatorPw) {
      role = 'operator'
    }

    if (!role) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Prepare response and set signed session cookie explicitly on it
    const res = NextResponse.json({ ok: true })
    createSessionCookieOnResponse(res, username, 60 * 60, role)
    // Audit
    await adminAuditLog({ username, role }, 'login', { username })
    return res
  } catch (e:any) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const auth = ensureInternalAuth()
    await adminAuditLog(auth, 'logout', { username: auth.username })
  } catch {}
  clearSessionCookie()
  return NextResponse.json({ ok: true })
}

