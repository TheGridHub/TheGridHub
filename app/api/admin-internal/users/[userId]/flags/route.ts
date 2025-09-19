import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    ensureInternalAuth()
    const supa = createServiceClient()
    const userId = params.userId

    const [flagsRes, overridesRes] = await Promise.all([
      supa.from('feature_flags').select('key, enabled, description, is_public').order('key'),
      supa.from('feature_flag_overrides').select('flag_key, enabled').eq('user_id', userId)
    ])

    const base = (flagsRes.data || []).map((f: any) => ({ key: f.key, enabled: f.enabled, description: f.description, is_public: f.is_public }))
    const overrides = new Map((overridesRes.data || []).map((o: any) => [o.flag_key, o.enabled]))
    const merged = base.map((f: any) => ({ ...f, override: overrides.has(f.key) ? overrides.get(f.key) : null }))

    return NextResponse.json({ flags: merged })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load flags' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    ensureInternalAuth('operator')
    const supa = createServiceClient()
    const userId = params.userId
    const body = await req.json().catch(()=>({}))
    const key = String(body?.key || '')
    const enabled = body?.enabled
    if (!key || typeof enabled !== 'boolean') return NextResponse.json({ error: 'key and enabled required' }, { status: 400 })

    const { error } = await supa
      .from('feature_flag_overrides')
      .upsert({ user_id: userId as any, flag_key: key, enabled })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update override' }, { status: 500 })
  }
}

