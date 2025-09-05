import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: supaUser } } = await supabase.auth.getUser()
    if (!supaUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const current = await getOrCreateUser(supaUser)
    if (!current) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Basic role check: must be owner/admin to purge
    const { data: roleCheck } = await supabase
      .from('team_memberships')
      .select('role')
      .eq('userId', current.id)
      .order('createdAt', { ascending: true })
      .limit(1)
      .maybeSingle()

    const role = roleCheck?.role || 'member'
    if (role !== 'owner' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(()=> ({}))
    const days = Math.max(1, Math.min(365, Number(body?.days ?? 30)))

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const service = createServiceClient()
    const { error } = await service
      .from('stripe_webhook_events')
      .delete()
      .lte('created_at', cutoff)

    if (error) throw error

    return NextResponse.json({ success: true, purgedBefore: cutoff })
  } catch (e: any) {
    console.error('Stripe purge error:', e)
    return NextResponse.json({ error: 'Failed to purge events' }, { status: 500 })
  }
}

