import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await request.json()
    const features = payload?.features || {}

    const { data: appUser } = await supabase
      .from('users')
      .select('id')
      .eq('supabaseId', user.id)
      .maybeSingle()
    if (!appUser?.id) return NextResponse.json({ error: 'User not found' }, { status: 400 })

    // merge features
    const { data: integ } = await supabase
      .from('integrations')
      .select('id, features')
      .eq('userId', appUser.id)
      .eq('type', 'google')
      .maybeSingle()

    if (!integ?.id) return NextResponse.json({ error: 'Integration not found' }, { status: 404 })

    const merged = { ...(integ.features || {}), ...features }
    const { error } = await supabase
      .from('integrations')
      .update({ features: merged })
      .eq('id', integ.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, features: merged })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update' }, { status: 500 })
  }
}

