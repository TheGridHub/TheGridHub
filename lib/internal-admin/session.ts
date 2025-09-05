import crypto from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'tgh_admin'

function getSecret() {
  return process.env.ENCRYPTION_MASTER_KEY || process.env.NEXTAUTH_SECRET || 'fallback-secret-do-not-use'
}

export function createSessionCookie(username: string, ttlSeconds = 60 * 60) {
  const secret = getSecret()
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  const payload = `${username}|${exp}`
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

export function validateSessionCookie(): { valid: boolean, username?: string } {
  try {
    const cookieStore = cookies() as any
    const raw = cookieStore.get(COOKIE_NAME)?.value || ''
    if (!raw) return { valid: false }
    const [username, expStr, sig] = raw.split('|')
    const exp = parseInt(expStr, 10)
    if (!username || !exp || !sig) return { valid: false }
    if (Date.now() / 1000 > exp) return { valid: false }
    const secret = getSecret()
    const expected = crypto.createHmac('sha256', secret).update(`${username}|${exp}`).digest('hex')
    if (expected !== sig) return { valid: false }
    return { valid: true, username }
  } catch {
    return { valid: false }
  }
}
