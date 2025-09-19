import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { StripeSubscriptionManager } from '@/lib/stripe'

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const auth = ensureInternalAuth('owner')
    const supa = createServiceClient()
    const userId = params.userId
    const body = await req.json().catch(()=>({}))
    const action = String(body?.action || '')

    const { data: user } = await supa
      .from('users')
      .select('id, stripeCustomerId')
      .eq('id', userId)
      .maybeSingle()
    if (!user?.id) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data: sub } = await supa
      .from('subscriptions')
      .select('id, stripeSubscriptionId, status')
      .eq('userId', userId)
      .maybeSingle()

    if (!sub?.stripeSubscriptionId) return NextResponse.json({ error: 'No stripe subscription found for user' }, { status: 400 })

    if (action === 'cancel') {
      const updated = await StripeSubscriptionManager.cancelSubscription(sub.stripeSubscriptionId, false)
      await supa.from('subscriptions').update({ cancelAtPeriodEnd: true, status: updated.status }).eq('id', sub.id)
      return NextResponse.json({ ok: true, status: updated.status })
    }

    if (action === 'resume') {
      const updated = await StripeSubscriptionManager.resumeSubscription(sub.stripeSubscriptionId)
      await supa.from('subscriptions').update({ cancelAtPeriodEnd: false, status: updated.status }).eq('id', sub.id)
      return NextResponse.json({ ok: true, status: updated.status })
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update subscription' }, { status: 500 })
  }
}

