import { NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'

export const runtime = 'nodejs'

export async function GET() {
  ensureInternalAuth()
  try {
    const raw = process.env.ADMIN_ENVIRONMENTS_JSON || '[]'
    const list = JSON.parse(raw)
    const envs = Array.isArray(list) ? list.map((e:any) => ({
      key: String(e.key || ''),
      label: String(e.label || e.key || ''),
      origin: String(e.origin || ''),
      tokens: {
        slack: e.slackBotToken ? true : false,
        microsoft: e.microsoft && e.microsoft.clientId && e.microsoft.clientSecret && e.microsoft.tenantId ? true : false,
        google: e.google && e.google.serviceAccountJson ? true : false,
      }
    })) : []
    return NextResponse.json({ envs })
  } catch {
    return NextResponse.json({ envs: [] })
  }
}

