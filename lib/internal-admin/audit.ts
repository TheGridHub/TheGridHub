import { serverLog } from '@/lib/observability'
import type { InternalAuth } from './auth'

export async function adminAuditLog(auth: InternalAuth, action: string, target?: any, details?: any) {
  try {
    await serverLog('INFO', `[admin] ${action}`, {
      actor: auth.username,
      role: auth.role,
      target,
      ...details,
    })
  } catch {}
}

