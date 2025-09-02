import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { StripeManager } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get or create Stripe customer
    const user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let customerId = user.stripeCustomerId

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await StripeManager.createCustomer({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
          clerkId: userId
        }
      })

      customerId = customer.id

      // Update user with Stripe customer ID
      await db.user.update({
        where: { clerkId: userId },
        data: { stripeCustomerId: customerId }
      })
    }

    // Create billing portal session
    const session = await StripeManager.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
      configuration: {
        business_profile: {
          headline: 'Manage your TaskGrid subscription'
        },
        features: {
          payment_method_update: {
            enabled: true
          },
          subscription_cancel: {
            enabled: true,
            mode: 'at_period_end',
            proration_behavior: 'none'
          },
          subscription_pause: {
            enabled: false
          },
          subscription_update: {
            enabled: true,
            default_allowed_updates: ['price'],
            proration_behavior: 'always_invoice'
          },
          invoice_history: {
            enabled: true
          },
          customer_update: {
            enabled: true,
            allowed_updates: ['email', 'name', 'address', 'phone', 'tax_id']
          }
        }
      }
    })

    return NextResponse.json({ 
      url: session.url 
    })

  } catch (error) {
    console.error('Billing portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}
