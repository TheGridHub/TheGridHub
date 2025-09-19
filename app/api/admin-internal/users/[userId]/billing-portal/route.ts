import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { StripeCheckoutManager } from '@/lib/stripe'

export async function POST(_req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    ensureInternalAuth('operator')
    const supa = createServiceClient()
    const userId = params.userId

    const { data: user } = await supa
      .from('users')
      .select('stripeCustomerId')
      .eq('id', userId)
      .maybeSingle()
    const customerId = (user as any)?.stripeCustomerId as string | undefined
    if (!customerId) return NextResponse.json({ error: 'Missing stripeCustomerId for user' }, { status: 400 })

    const portal = await StripeCheckoutManager.createBillingPortalSession(customerId, `${process.env.NEXT_PUBLIC_APP_URL}/billing`)
    return NextResponse.json({ ok: true, url: portal.url })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create billing portal session' }, { status: 500 })
  }
}

