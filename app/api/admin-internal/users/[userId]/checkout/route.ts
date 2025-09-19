import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { StripeCheckoutManager, StripeCustomerManager } from '@/lib/stripe'

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const auth = ensureInternalAuth('operator')
    const supa = createServiceClient()
    const userId = params.userId
    const body = await req.json().catch(()=>({}))
    const planKey = String(body?.plan || 'PRO').toUpperCase()

    // Load user
    const { data: user } = await supa
      .from('users')
      .select('id, email, name, stripeCustomerId')
      .eq('id', userId)
      .maybeSingle()
    if (!user?.email) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Ensure customer
    let customerId = (user as any).stripeCustomerId as string | null
    if (!customerId) {
      const customer = await StripeCustomerManager.getOrCreateCustomer(user.email, (user as any).name || user.email, userId)
      customerId = customer.id
      await supa.from('users').update({ stripeCustomerId: customerId }).eq('id', userId)
    }

    // Determine price id from plan
    const priceId = process.env[`NEXT_PUBLIC_STRIPE_PRICE_${planKey}_MONTHLY`] || null
    if (!priceId) return NextResponse.json({ error: `Missing price id for plan ${planKey}` }, { status: 400 })

    const session = await StripeCheckoutManager.createCheckoutSession(customerId!, priceId, {
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?from=admin&user=${userId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      allowPromotionCodes: true,
    })

    return NextResponse.json({ ok: true, url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create checkout session' }, { status: 500 })
  }
}

