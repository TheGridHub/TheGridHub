import crypto from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'tgh_admin'

export type InternalRole = 'owner' | 'operator'

function getSecret() {
  return process.env.ENCRYPTION_MASTER_KEY || process.env.NEXTAUTH_SECRET || 'fallback-secret-do-not-use'
}

export function createSessionCookie(username: string, ttlSeconds = 60 * 60, role: InternalRole = 'owner') {
  const secret = getSecret()
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  // payload now includes role for RBAC; maintain backward compatibility in validator
  const payload = `${username}|${role}|${exp}`
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  const value = `${payload}|${hmac}`
  const cookieStore = cookies() as any
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ttlSeconds,
  })
}

export function clearSessionCookie() {
  const cookieStore = cookies() as any
  cookieStore.set(COOKIE_NAME, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
}

export function validateSessionCookie(): { valid: boolean, username?: string, role?: InternalRole } {
  try {
    const cookieStore = cookies() as any
    const raw = cookieStore.get(COOKIE_NAME)?.value || ''
    if (!raw) return { valid: false }
    const parts = raw.split('|')
    if (parts.length !== 4 && parts.length !== 3) return { valid: false }
    let username = parts[0]
    let role: InternalRole = 'owner'
    let expStr: string
    let sig: string
    if (parts.length === 4) {
      role = (parts[1] as InternalRole) || 'owner'
      expStr = parts[2]
      sig = parts[3]
    } else {
      // backward compat: no role
      expStr = parts[1]
      sig = parts[2]
    }
    const exp = parseInt(expStr, 10)
    if (!username || !exp || !sig) return { valid: false }
    if (Date.now() / 1000 > exp) return { valid: false }
    const secret = getSecret()
    const signedPayload = parts.length === 4 ? `${username}|${role}|${exp}` : `${username}|${exp}`
    const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex')
    if (expected !== sig) return { valid: false }
    return { valid: true, username, role }
  } catch {
    return { valid: false }
  }
}
