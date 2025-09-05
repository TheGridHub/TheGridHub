"use server"

import { createServiceClient } from '@/lib/supabase/server'

export function generateTraceId() {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('')
}

export async function serverLog(level: 'DEBUG'|'INFO'|'WARN'|'ERROR', message: string, details?: any, traceId?: string, userId?: string) {
  try {
    const supa = createServiceClient()
    await supa.from('app_logs').insert({
      level,
      message,
      details: details ? JSON.stringify(details) : null,
      trace_id: traceId || null,
      user_id: userId || null,
    })
  } catch (e) {
    console.error('[OBSERVABILITY]', level, message, details, traceId, userId, e)
  }
}

