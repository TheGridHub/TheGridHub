import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supa = createServiceClient()
    // Try a very lightweight query; if table missing, still indicates DB reachable
    const { error } = await supa
      .from('users')
      .select('id', { head: true, count: 'exact' })
      .limit(1)

    if (error) {
      return NextResponse.json({ ok: true, db: { reachable: true, note: 'Query error (table may differ)', error: error.message } })
    }

    return NextResponse.json({ ok: true, db: { reachable: true } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, db: { reachable: false, error: e?.message || String(e) } }, { status: 200 })
  }
}

