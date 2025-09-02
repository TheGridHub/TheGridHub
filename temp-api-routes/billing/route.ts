import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { StripeManager } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's Stripe customer ID
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: true,
        projects: true,
        tasks: true,
        teamMemberships: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let billingData = {
      subscription: null,
      usage: {
        projects: user.projects.length,
        tasks: user.tasks.length, 
        teamMembers: user.teamMemberships.length,
        aiSuggestions: user.aiSuggestionsUsed || 0,
        storage: user.storageUsed || 0
      },
      invoices: [],
      paymentMethod: null
    }

    // If user has a Stripe customer ID, fetch billing data from Stripe
    if (user.stripeCustomerId) {
      try {
        // Get active subscription
        const subscriptions = await StripeManager.stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: 'all',
          limit: 1
        })

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0]
          const priceId = subscription.items.data[0]?.price.id

          // Map price ID to plan name
          let planName = 'FREE'
          if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
            planName = 'PRO'
          } else if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) {
            planName = 'BUSINESS'
          } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
            planName = 'ENTERPRISE'
          }

          billingData.subscription = {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            plan: planName,
            amount: subscription.items.data[0]?.price.unit_amount || 0,
            currency: subscription.items.data[0]?.price.currency || 'usd',
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : undefined
          }
        }

        // Get payment methods
        const paymentMethods = await StripeManager.stripe.paymentMethods.list({
          customer: user.stripeCustomerId,
          type: 'card'
        })

        if (paymentMethods.data.length > 0) {
          const pm = paymentMethods.data[0]
          billingData.paymentMethod = {
            brand: pm.card?.brand || '',
            last4: pm.card?.last4 || '',
            expiryMonth: pm.card?.exp_month || 0,
            expiryYear: pm.card?.exp_year || 0
          }
        }

        // Get invoices
        const invoices = await StripeManager.stripe.invoices.list({
          customer: user.stripeCustomerId,
          limit: 12
        })

        billingData.invoices = invoices.data.map(invoice => ({
          id: invoice.id,
          date: new Date(invoice.created * 1000).toISOString(),
          amount: invoice.amount_paid,
          status: invoice.status || 'draft',
          downloadUrl: invoice.invoice_pdf || ''
        }))

      } catch (stripeError) {
        console.error('Error fetching Stripe data:', stripeError)
        // Continue with local data only
      }
    }

    return NextResponse.json(billingData)

  } catch (error) {
    console.error('Billing API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { action, ...data } = body

    switch (action) {
      case 'update_usage':
        // Update usage statistics
        await db.user.update({
          where: { clerkId: userId },
          data: {
            aiSuggestionsUsed: data.aiSuggestions,
            storageUsed: data.storage
          }
        })
        return NextResponse.json({ success: true })

      case 'sync_subscription':
        // Sync subscription data from Stripe webhook or manual sync
        const user = await db.user.findUnique({
          where: { clerkId: userId }
        })

        if (!user?.stripeCustomerId) {
          return NextResponse.json(
            { error: 'No Stripe customer found' },
            { status: 400 }
          )
        }

        // Update subscription in database
        await db.subscription.upsert({
          where: { userId: user.id },
          update: {
            stripeSubscriptionId: data.subscriptionId,
            plan: data.plan,
            status: data.status,
            currentPeriodStart: new Date(data.currentPeriodStart),
            currentPeriodEnd: new Date(data.currentPeriodEnd),
            cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
            trialEnd: data.trialEnd ? new Date(data.trialEnd) : null
          },
          create: {
            userId: user.id,
            stripeSubscriptionId: data.subscriptionId,
            plan: data.plan,
            status: data.status,
            currentPeriodStart: new Date(data.currentPeriodStart),
            currentPeriodEnd: new Date(data.currentPeriodEnd),
            cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
            trialEnd: data.trialEnd ? new Date(data.trialEnd) : null
          }
        })

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Billing API POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
