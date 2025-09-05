import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to find stripeCustomerId on our users table
    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('id, email, name, stripeCustomerId')
      .eq('email', supabaseUser.email)
      .maybeSingle()

    if (userErr || !userRow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let customerId = userRow.stripeCustomerId as string | null
    const stripe = await getStripe()

    if (!customerId) {
      // Attempt to find existing customer by email
      const list = await stripe.customers.list({ email: userRow.email || undefined, limit: 1 })
      if (list.data[0]) {
        customerId = list.data[0].id
        await supabase.from('users').update({ stripeCustomerId: customerId }).eq('id', userRow.id)
      } else {
        // Create a new customer
        const customer = await stripe.customers.create({
          email: userRow.email || undefined,
          name: userRow.name || undefined,
          metadata: { userId: userRow.id }
        })
        customerId = customer.id
        await supabase.from('users').update({ stripeCustomerId: customerId }).eq('id', userRow.id)
      }
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId!,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating Stripe billing portal session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

