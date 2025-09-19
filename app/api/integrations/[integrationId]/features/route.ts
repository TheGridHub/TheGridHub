import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: { integrationId: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const integrationId = params.integrationId
    const body = await request.json().catch(()=>({}))
    const feature = String(body?.feature || '')
    const hasEnabled = Object.prototype.hasOwnProperty.call(body || {}, 'enabled')
    const hasValue = Object.prototype.hasOwnProperty.call(body || {}, 'value')
    if (!integrationId || !feature || (!hasEnabled && !hasValue)) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const { data: appUser } = await supabase
      .from('users')
      .select('id')
      .eq('supabaseId', user.id)
      .maybeSingle()
    if (!appUser?.id) return NextResponse.json({ error: 'User not found' }, { status: 400 })

    const { data: integ } = await supabase
      .from('integrations')
      .select('id, features')
      .eq('id', integrationId)
      .eq('userId', appUser.id)
      .maybeSingle()
    if (!integ?.id) return NextResponse.json({ error: 'Integration not found' }, { status: 404 })

    const current = (integ as any).features || {}
    const merged = { ...current, [feature]: hasValue ? body.value : !!body.enabled }

    const { error } = await supabase
      .from('integrations')
      .update({ features: merged })
      .eq('id', integ.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, features: merged })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update features' }, { status: 500 })
  }
}

