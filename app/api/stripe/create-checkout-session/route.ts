import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const interval: 'monthly' | 'yearly' = body.interval === 'yearly' ? 'yearly' : 'monthly'
    const preferredCurrency: string | undefined = (body.currency || '').toUpperCase() || undefined

    // Infer currency from headers if not provided
    let currency = preferredCurrency
    if (!currency) {
      const acceptLanguage = request.headers.get('accept-language') || ''
      if (/gb|en-GB/i.test(acceptLanguage)) currency = 'GBP'
      else if (/de|fr|es|it|nl|pt|eu/i.test(acceptLanguage)) currency = 'EUR'
      else if (/in|hi|en-IN/i.test(acceptLanguage)) currency = 'INR'
      else currency = 'USD'
    }

    const { pickPriceId } = await import('@/lib/pricing')
    const priceId = pickPriceId('PRO', interval, currency!)
    if (!priceId) return NextResponse.json({ error: 'Stripe price not configured for currency', currency }, { status: 500 })

    const stripe = await getStripe()

    // Create a session without relying on a local users table; use metadata for mapping
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/payment/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard/billing`,
      allow_promotion_codes: true,
      customer_email: user.email || undefined,
      metadata: { supabaseId: user.id },
      subscription_data: { metadata: { supabaseId: user.id } }
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create checkout session' }, { status: 500 })
  }
}
