import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    ensureInternalAuth()
    const supa = createServiceClient()
    const userId = params.userId

    const { data: user } = await supa
      .from('users')
      .select('id, email, name, avatar, createdAt, supabaseId, stripeCustomerId')
      .eq('id', userId)
      .maybeSingle()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    let profile: any = null
    if ((user as any).supabaseId) {
      const p = await supa
        .from('profiles')
        .select('plan, onboarding_complete, subscription_status, updated_at, created_at')
        .eq('user_id', (user as any).supabaseId)
        .maybeSingle()
      profile = p.data || null
    }

    const [{ data: sub }, { data: pay }, proj, tasks, team, integ] = await Promise.all([
      supa.from('subscriptions').select('*').eq('userId', userId).maybeSingle(),
      supa.from('payments').select('*').eq('userId', userId).order('createdAt', { ascending: false }).limit(20),
      supa.from('projects').select('id', { count: 'exact', head: true }).eq('userId', userId),
      supa.from('tasks').select('id', { count: 'exact', head: true }).eq('userId', userId),
      supa.from('team_memberships').select('id', { count: 'exact', head: true }).eq('userId', userId),
      supa.from('integrations').select('id, type, status, userEmail, connectedAt, lastSync').eq('userId', userId)
    ])

    const usage = {
      projects: (proj as any).count || 0,
      tasks: (tasks as any).count || 0,
      team: (team as any).count || 0
    }

    return NextResponse.json({ user, profile, subscription: sub || null, payments: pay || [], usage, integrations: (integ.data || []) })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load user details' }, { status: 500 })
  }
}

