import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const started = Date.now()
  try {
    const supa = createServiceClient()
    await supa.from('users').select('id', { head: true, count: 'exact' }).limit(1)
    const ms = Date.now() - started
    return NextResponse.json({ ok: true, latencyMs: ms })
  } catch (e: any) {
    const ms = Date.now() - started
    return NextResponse.json({ ok: false, latencyMs: ms, error: e?.message || String(e) })
  }
}

