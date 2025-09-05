import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supa = createServiceClient()
    const { data } = await supa
      .from('feature_flags')
      .select('key, enabled, is_public')
      .eq('is_public', true)

    const flags: Record<string, boolean> = {}
    ;(data || []).forEach((f: any) => { flags[f.key] = !!f.enabled })
    return NextResponse.json({ flags })
  } catch (e) {
    return NextResponse.json({ flags: {} })
  }
}

