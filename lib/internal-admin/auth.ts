import { validateSessionCookie, InternalRole } from './session'

export type InternalAuth = { username: string, role: InternalRole }

export function ensureInternalAuth(requiredRole?: InternalRole): InternalAuth {
  const sess = validateSessionCookie()
  if (!sess.valid || !sess.username) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 })
  }
  const role = (sess.role || 'owner') as InternalRole
  if (requiredRole && role !== requiredRole) {
    throw Object.assign(new Error('Forbidden'), { status: 403 })
  }
  return { username: sess.username, role }
}

