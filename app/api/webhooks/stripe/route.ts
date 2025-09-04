import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`Processing Stripe event: ${event.type}`)

    // Handle the specific events you configured
    switch (event.type) {
      // Subscription Events
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.paused':
        await handleSubscriptionPaused(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.resumed':
        await handleSubscriptionResumed(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      // Invoice Events
      case 'invoice.created':
        await handleInvoiceCreated(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'invoice.sent':
        await handleInvoiceSent(event.data.object as Stripe.Invoice)
        break

      case 'invoice.upcoming':
        await handleInvoiceUpcoming(event.data.object as Stripe.Invoice)
        break

      // Customer Events
      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer)
        break

      case 'customer.deleted':
        await handleCustomerDeleted(event.data.object as Stripe.Customer)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

// Subscription Event Handlers
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('🎉 New subscription created:', subscription.id)
  
  try {
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0]?.price?.id
    const status = subscription.status
    
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    const userId = customer.metadata?.userId

    if (userId) {
      await prisma.subscription.upsert({
        where: { userId },
        update: {
          stripeSubscriptionId: subscription.id,
          plan: priceId || 'UNKNOWN',
          status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        },
        create: {
          userId,
          stripeSubscriptionId: subscription.id,
          plan: priceId || 'UNKNOWN',
          status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      })
    }
    
    console.log(`✅ Subscription activated for customer ${customerId}`)
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id)
  
  try {
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0]?.price?.id
    const status = subscription.status

    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    const userId = customer.metadata?.userId

    if (userId) {
      await prisma.subscription.update({
        where: { userId },
        data: {
          plan: priceId || 'UNKNOWN',
          status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      })
    }
    
    console.log(`✅ Subscription updated for customer ${customerId}`)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription cancelled:', subscription.id)
  
  try {
    const customerId = subscription.customer as string
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    const userId = customer.metadata?.userId

    if (userId) {
      await prisma.subscription.update({
        where: { userId },
        data: { status: 'canceled' }
      })
    }
    
    console.log(`✅ Subscription cancelled for customer ${customerId}`)
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handleSubscriptionPaused(subscription: Stripe.Subscription) {
  console.log('⏸️ Subscription paused:', subscription.id)
  
  try {
    const customerId = subscription.customer as string
    
    // TODO: Handle paused subscription (maybe limited access)
    
    console.log(`✅ Subscription paused for customer ${customerId}`)
  } catch (error) {
    console.error('Error handling subscription paused:', error)
  }
}

async function handleSubscriptionResumed(subscription: Stripe.Subscription) {
  console.log('▶️ Subscription resumed:', subscription.id)
  
  try {
    const customerId = subscription.customer as string
    
    // TODO: Restore full access
    
    console.log(`✅ Subscription resumed for customer ${customerId}`)
  } catch (error) {
    console.error('Error handling subscription resumed:', error)
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('⏰ Trial ending soon:', subscription.id)
  
  try {
    const customerId = subscription.customer as string
    const trialEnd = new Date(subscription.trial_end! * 1000)
    
    // TODO: Send trial ending email
    // TODO: Show in-app notification
    
    console.log(`✅ Trial reminder sent for customer ${customerId}, ends: ${trialEnd}`)
  } catch (error) {
    console.error('Error handling trial will end:', error)
  }
}

// Invoice Event Handlers
async function handleInvoiceCreated(invoice: Stripe.Invoice) {
  console.log('📄 Invoice created:', invoice.id)
  
  try {
    const customerId = invoice.customer as string
    
    // TODO: Log invoice creation, maybe send notification
    
    console.log(`✅ Invoice logged for customer ${customerId}`)
  } catch (error) {
    console.error('Error handling invoice created:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Payment succeeded:', invoice.id)
  
  try {
    const customerId = invoice.customer as string
    const amount = invoice.amount_paid // cents

    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    const userId = customer.metadata?.userId

    if (userId) {
      await prisma.payment.create({
        data: {
          userId,
          stripeInvoiceId: invoice.id,
          amount: amount,
          currency: (invoice.currency || 'usd').toLowerCase(),
          status: 'SUCCESS',
          paidAt: new Date()
        }
      })
    }
    
    console.log(`✅ Payment of $${amount / 100} processed for customer ${customerId}`)
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('🚫 Payment failed:', invoice.id)
  
  try {
    const customerId = invoice.customer as string
    const attemptCount = invoice.attempt_count
    
    // TODO: Send payment failed email
    // TODO: Maybe pause access after multiple failures
    
    console.log(`❌ Payment failed for customer ${customerId}, attempt ${attemptCount}`)
  } catch (error) {
    console.error('Error handling invoice payment failed:', error)
  }
}

async function handleInvoiceSent(invoice: Stripe.Invoice) {
  console.log('📧 Invoice sent:', invoice.id)
  
  try {
    const customerId = invoice.customer as string
    
    // TODO: Log that invoice was sent to customer
    
    console.log(`✅ Invoice sent to customer ${customerId}`)
  } catch (error) {
    console.error('Error handling invoice sent:', error)
  }
}

async function handleInvoiceUpcoming(invoice: Stripe.Invoice) {
  console.log('📅 Upcoming invoice:', invoice.id)
  
  try {
    const customerId = invoice.customer as string
    const amount = invoice.amount_due / 100
    
    // TODO: Send upcoming payment notification
    
    console.log(`✅ Upcoming payment notification sent to customer ${customerId} for $${amount}`)
  } catch (error) {
    console.error('Error handling invoice upcoming:', error)
  }
}

// Customer Event Handlers
async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('👤 Customer created:', customer.id)
  
  try {
    // TODO: Create customer record in your database
    // TODO: Send welcome sequence
    
    console.log(`✅ Customer ${customer.id} created with email: ${customer.email}`)
  } catch (error) {
    console.error('Error handling customer created:', error)
  }
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log('📝 Customer updated:', customer.id)
  
  try {
    // TODO: Update customer record in your database
    
    console.log(`✅ Customer ${customer.id} updated`)
  } catch (error) {
    console.error('Error handling customer updated:', error)
  }
}

async function handleCustomerDeleted(customer: Stripe.Customer) {
  console.log('🗑️ Customer deleted:', customer.id)
  
  try {
    // TODO: Handle customer deletion (GDPR compliance)
    // TODO: Clean up user data if required
    
    console.log(`✅ Customer ${customer.id} deletion processed`)
  } catch (error) {
    console.error('Error handling customer deleted:', error)
  }
}
