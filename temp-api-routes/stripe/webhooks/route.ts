import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { StripeManager } from '@/lib/stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret')
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer)
        break

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'setup_intent.succeeded':
        await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id)

  try {
    const customerId = subscription.customer as string
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    const priceId = subscription.items.data[0]?.price?.id
    const planName = getPlanNameFromPriceId(priceId)

    // Create or update subscription record
    await db.subscription.upsert({
      where: { userId: user.id },
      update: {
        stripeSubscriptionId: subscription.id,
        plan: planName,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      },
      create: {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        plan: planName,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      }
    })

    // Send welcome email or notification
    await sendSubscriptionNotification(user.id, 'subscription_created', {
      planName,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
    })

  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)

  try {
    const customerId = subscription.customer as string
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    const priceId = subscription.items.data[0]?.price?.id
    const planName = getPlanNameFromPriceId(priceId)

    // Update subscription record
    await db.subscription.upsert({
      where: { userId: user.id },
      update: {
        stripeSubscriptionId: subscription.id,
        plan: planName,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      },
      create: {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        plan: planName,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      }
    })

    // Check if plan changed
    const existingSubscription = await db.subscription.findUnique({
      where: { userId: user.id }
    })

    if (existingSubscription && existingSubscription.plan !== planName) {
      await sendSubscriptionNotification(user.id, 'plan_changed', {
        oldPlan: existingSubscription.plan,
        newPlan: planName
      })
    }

    // Check if subscription was canceled
    if (subscription.cancel_at_period_end && !existingSubscription?.cancelAtPeriodEnd) {
      await sendSubscriptionNotification(user.id, 'subscription_canceled', {
        endDate: new Date(subscription.current_period_end * 1000)
      })
    }

    // Check if cancellation was undone
    if (!subscription.cancel_at_period_end && existingSubscription?.cancelAtPeriodEnd) {
      await sendSubscriptionNotification(user.id, 'subscription_reactivated', {
        planName
      })
    }

  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)

  try {
    const customerId = subscription.customer as string
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    // Update subscription status
    await db.subscription.updateMany({
      where: { 
        userId: user.id,
        stripeSubscriptionId: subscription.id
      },
      data: { 
        status: 'canceled',
        cancelAtPeriodEnd: false
      }
    })

    await sendSubscriptionNotification(user.id, 'subscription_ended', {})

  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id)

  try {
    const customerId = invoice.customer as string
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    // If this is the first payment, activate the subscription
    if (invoice.billing_reason === 'subscription_create') {
      await sendSubscriptionNotification(user.id, 'payment_succeeded', {
        amount: invoice.amount_paid / 100,
        currency: invoice.currency
      })
    }

    // Record the payment in our system if needed
    await db.payment.create({
      data: {
        userId: user.id,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        paidAt: new Date(invoice.status_transitions.paid_at! * 1000)
      }
    })

  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id)

  try {
    const customerId = invoice.customer as string
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    await sendSubscriptionNotification(user.id, 'payment_failed', {
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      invoiceUrl: invoice.hosted_invoice_url
    })

    // Record the failed payment
    await db.payment.create({
      data: {
        userId: user.id,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: 'failed',
        paidAt: null
      }
    })

  } catch (error) {
    console.error('Error handling invoice payment failed:', error)
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('Trial will end:', subscription.id)

  try {
    const customerId = subscription.customer as string
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null

    await sendSubscriptionNotification(user.id, 'trial_ending', {
      trialEndDate: trialEnd
    })

  } catch (error) {
    console.error('Error handling trial will end:', error)
  }
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('Customer created:', customer.id)
  
  // Update user record with Stripe customer ID if not already set
  if (customer.metadata?.userId) {
    try {
      await db.user.update({
        where: { id: customer.metadata.userId },
        data: { stripeCustomerId: customer.id }
      })
    } catch (error) {
      console.error('Error updating user with customer ID:', error)
    }
  }
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log('Customer updated:', customer.id)
  
  // Sync customer data if needed
  try {
    await db.user.updateMany({
      where: { stripeCustomerId: customer.id },
      data: {
        email: customer.email || undefined,
        name: customer.name || undefined
      }
    })
  } catch (error) {
    console.error('Error syncing customer data:', error)
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id)

  try {
    if (session.mode === 'subscription' && session.subscription) {
      // The subscription webhook will handle the actual subscription creation
      const customerId = session.customer as string
      const user = await db.user.findFirst({
        where: { stripeCustomerId: customerId }
      })

      if (user) {
        await sendSubscriptionNotification(user.id, 'checkout_completed', {
          sessionId: session.id
        })
      }
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
  console.log('Setup intent succeeded:', setupIntent.id)
  
  // Payment method was successfully set up
  const customerId = setupIntent.customer as string
  
  try {
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (user) {
      await sendSubscriptionNotification(user.id, 'payment_method_added', {})
    }
  } catch (error) {
    console.error('Error handling setup intent succeeded:', error)
  }
}

// Helper function to map Stripe price IDs to plan names
function getPlanNameFromPriceId(priceId: string | undefined): string {
  if (!priceId) return 'FREE'
  
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'PRO'
  if (priceId === process.env.STRIPE_PRO_YEARLY_PRICE_ID) return 'PRO'
  if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) return 'BUSINESS'
  if (priceId === process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID) return 'BUSINESS'
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return 'ENTERPRISE'
  if (priceId === process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID) return 'ENTERPRISE'
  
  return 'FREE'
}

// Helper function to send notifications (implement based on your notification system)
async function sendSubscriptionNotification(
  userId: string, 
  type: string, 
  data: any
): Promise<void> {
  try {
    // Create notification record
    await db.notification.create({
      data: {
        userId,
        type,
        title: getNotificationTitle(type),
        message: getNotificationMessage(type, data),
        data: JSON.stringify(data),
        read: false
      }
    })

    // Here you could also send email notifications, push notifications, etc.
    console.log(`Notification sent to user ${userId}: ${type}`)

  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

function getNotificationTitle(type: string): string {
  const titles: Record<string, string> = {
    subscription_created: 'Welcome to TaskGrid!',
    subscription_canceled: 'Subscription Canceled',
    subscription_reactivated: 'Subscription Reactivated',
    subscription_ended: 'Subscription Ended',
    plan_changed: 'Plan Changed',
    payment_succeeded: 'Payment Successful',
    payment_failed: 'Payment Failed',
    trial_ending: 'Trial Ending Soon',
    checkout_completed: 'Purchase Complete',
    payment_method_added: 'Payment Method Added'
  }
  
  return titles[type] || 'Subscription Update'
}

function getNotificationMessage(type: string, data: any): string {
  switch (type) {
    case 'subscription_created':
      return `Your ${data.planName} subscription is now active!`
    case 'subscription_canceled':
      return `Your subscription will end on ${data.endDate?.toLocaleDateString()}`
    case 'subscription_reactivated':
      return `Your ${data.planName} subscription has been reactivated`
    case 'subscription_ended':
      return 'Your subscription has ended. You\'re now on the free plan.'
    case 'plan_changed':
      return `Your plan has been changed from ${data.oldPlan} to ${data.newPlan}`
    case 'payment_succeeded':
      return `Payment of ${data.currency.toUpperCase()} ${data.amount} was successful`
    case 'payment_failed':
      return `Payment of ${data.currency.toUpperCase()} ${data.amount} failed`
    case 'trial_ending':
      return `Your trial ends on ${data.trialEndDate?.toLocaleDateString()}`
    case 'checkout_completed':
      return 'Your purchase was completed successfully'
    case 'payment_method_added':
      return 'Payment method was added to your account'
    default:
      return 'Your subscription has been updated'
  }
}
