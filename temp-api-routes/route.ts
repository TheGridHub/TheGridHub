import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { StripeCheckoutManager, StripeCustomerManager } from '@/lib/stripe'
import { SUBSCRIPTION_PLANS, ANNUAL_PRICING, PlanUtils } from '@/lib/pricing'

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, billingPeriod, trialDays = 14 } = body

    // Validate plan
    if (!planId || planId === 'free') {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    // Get plan configuration
    const plan = billingPeriod === 'yearly' && ANNUAL_PRICING[planId as keyof typeof ANNUAL_PRICING]
      ? ANNUAL_PRICING[planId as keyof typeof ANNUAL_PRICING]
      : SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]

    if (!plan || !plan.stripePriceId) {
      return NextResponse.json({ error: 'Plan not found or not available for subscription' }, { status: 400 })
    }

    // Get or create Stripe customer
    const customer = await StripeCustomerManager.getOrCreateCustomer(
      user.emailAddresses[0]?.emailAddress || '',
      user.fullName || user.firstName || 'User',
      user.id
    )

    // Create checkout session
    const session = await StripeCheckoutManager.createCheckoutSession(
      customer.id,
      plan.stripePriceId,
      {
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        trialDays,
        allowPromotionCodes: true,
        billingAddressCollection: 'required',
        metadata: {
          userId: user.id,
          planId,
          billingPeriod: billingPeriod || 'monthly'
        }
      }
    )

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Checkout creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create checkout session' 
    }, { status: 500 })
  }
}

// GET - Retrieve checkout session details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const session = await StripeCheckoutManager.retrieveCheckoutSession(sessionId)
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Return session details (sanitized for client)
    return NextResponse.json({
      id: session.id,
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      subscription: session.subscription,
      amountTotal: session.amount_total,
      currency: session.currency,
      metadata: session.metadata
    })

  } catch (error) {
    console.error('Session retrieval error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve session' 
    }, { status: 500 })
  }
}
