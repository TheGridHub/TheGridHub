import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const stripe = await getStripe()

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')
    if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] })

    return NextResponse.json({
      id: session.id,
      status: session.status,
      customerEmail: session.customer_details?.email,
      subscription: session.subscription,
      amountTotal: session.amount_total,
      currency: session.currency,
      metadata: session.metadata || {}
    })
  } catch (error) {
    console.error('Error retrieving session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

