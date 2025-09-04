import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { SUBSCRIPTION_PLANS } from '@/lib/pricing'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const stripe = await getStripe()

    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { planKey, priceId } = await req.json()

    // Get or create internal user
    let user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) user = await prisma.user.create({ data: { clerkId: userId, email: `${userId}@placeholder.local`, name: 'New User' } })

    // Get or create Stripe customer
    const customer = await (await getStripe()).customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId: user.id }
    })

    // Save customer id to user
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } })

    // Determine priceId
    const plan = (SUBSCRIPTION_PLANS as any)[planKey]
    const finalPriceId = priceId || plan?.stripePriceId
    if (!finalPriceId) return NextResponse.json({ error: 'Missing Stripe priceId' }, { status: 400 })

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      line_items: [{ price: finalPriceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'required'
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

