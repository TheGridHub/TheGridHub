import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = user.id

    const { feature, enabled } = await req.json()
    if (!feature || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Missing feature or enabled' }, { status: 400 })
    }

    const supa = createClient()
    const { data: integration } = await supa
      .from('integrations')
      .select('id, features')
      .eq('id', params.id)
      .eq('userId', userId)
      .single()

    if (!integration) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const current = (integration.features as any) || {}
    const updated = { ...current, [feature]: enabled }

    const { data: saved, error: updateError } = await supa
      .from('integrations')
      .update({ features: updated })
      .eq('id', integration.id)
      .select('*')
      .single()

    if (updateError) throw updateError
    return NextResponse.json(saved)
  } catch (error) {
    console.error('Features update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

