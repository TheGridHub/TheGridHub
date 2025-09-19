import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supa = createServiceClient()
    // Lightweight SELECT to verify DB connectivity
    const { error } = await supa.from('users').select('id', { head: true, count: 'exact' }).limit(1)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'DB health failed' }, { status: 500 })
  }
}

