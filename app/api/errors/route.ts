import { NextRequest, NextResponse } from 'next/server'
import { serverLog, generateTraceId } from '@/lib/observability'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'

export async function POST(req: NextRequest) {
  try {
    const supa = createClient()
    const { data: { user } } = await supa.auth.getUser()
    const dbUser = user ? await getOrCreateUser(user) : null

    const body = await req.json().catch(()=>({}))
    const level = (body?.level || 'ERROR').toUpperCase()
    const message = body?.message || 'Client error'
    const details = body?.details || {}
    const traceId = body?.traceId || generateTraceId()

    await serverLog((['DEBUG','INFO','WARN','ERROR'].includes(level) ? level : 'ERROR') as any, message, { ...details, userAgent: req.headers.get('user-agent') }, traceId, dbUser?.id)

    return NextResponse.json({ ok: true, traceId })
  } catch (e: any) {
    console.error('Error reporting failed', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

