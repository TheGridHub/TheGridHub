import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest) {
  try {
    const supa = createServiceClient()
    const { data, error } = await supa
      .from('stripe_webhook_events')
      .select('event_id,type,status,created_at,processed_at,error')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      return NextResponse.json({ ok: true, stripe: { reachable: true, note: 'Table query error', error: error.message } })
    }

    const last = Array.isArray(data) ? data[0] : null
    return NextResponse.json({ ok: true, stripe: { reachable: true, lastEvent: last || null } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, stripe: { reachable: false, error: e?.message || String(e) } }, { status: 200 })
  }
}

