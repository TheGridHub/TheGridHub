import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST(_request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: appUser } = await supabase
      .from('users')
      .select('id, stripeCustomerId, email, name')
      .eq('supabaseId', user.id)
      .maybeSingle()

    const stripe = await getStripe()

    let customerId = appUser?.stripeCustomerId || null
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: appUser?.email || user.email || undefined,
        name: (appUser as any)?.name || user.user_metadata?.full_name || undefined,
        metadata: { userId: appUser?.id || '' }
      })
      customerId = customer.id
      if (appUser?.id) {
        await supabase.from('users').update({ stripeCustomerId: customerId }).eq('id', appUser.id)
      }
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId!,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard/billing`
    })

    return NextResponse.json({ url: portal.url })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create billing portal session' }, { status: 500 })
  }
}

