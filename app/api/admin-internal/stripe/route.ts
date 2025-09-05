import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'

export async function GET(_req: NextRequest) {
  try {
    ensureInternalAuth()
    const supa = createServiceClient()

    let events: any[] = []
    try {
      const ev = await supa
        .from('stripe_webhook_events')
        .select('event_id,type,status,created_at,processed_at,error')
        .order('created_at', { ascending: false })
        .limit(50)
      events = ev.data || []
    } catch {}

    let subs: any[] = []
    try {
      const s = await supa
        .from('subscriptions')
        .select('userId, plan, status, currentPeriodStart, currentPeriodEnd')
        .order('currentPeriodEnd', { ascending: false })
        .limit(50)
      subs = s.data || []
    } catch {}

    return NextResponse.json({ events, subscriptions: subs })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to load stripe data' }, { status: 500 })
  }
}
