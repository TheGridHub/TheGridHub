import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })

    const { customerId } = await req.json()
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

