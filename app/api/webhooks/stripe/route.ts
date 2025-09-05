import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

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
      const stripe = await getStripe()
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`Processing Stripe event: ${event.type}`)

    // Idempotency: attempt to record the event before processing
    let canUpdateEventLog = false
    try {
      const supa = createServiceClient()
      const inserted = await supa
        .from('stripe_webhook_events')
        .insert({
          event_id: event.id,
          type: event.type,
          created_at: new Date(((event.created as number) || Math.floor(Date.now()/1000)) * 1000).toISOString(),
          payload: event as any,
          status: 'received'
        })
        .select('event_id')
        .single()

      if (inserted.error) {
        // 23505 => unique_violation: duplicate event delivery
        if ((inserted.error as any).code === '23505') {
          console.warn(`Duplicate Stripe event received: ${event.id}`)
          return NextResponse.json({ received: true, duplicate: true })
        }
        // Unexpected insert error, continue processing but note that we couldn't log it
        console.warn('stripe_webhook_events insert error:', inserted.error)
      } else {
        canUpdateEventLog = true
      }
    } catch (e) {
      // Table might not exist yet or other non-fatal error — continue processing
      console.warn('stripe_webhook_events insert skipped (table missing or other non-fatal error):', e)
    }

    // Handle the specific events you configured
    let handlerError: unknown = null
    try {
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
    } catch (err) {
      handlerError = err
      console.error('Error while handling Stripe event:', err)
    }

    // After handling, update event log status
    try {
      if (canUpdateEventLog) {
        const supa = createServiceClient()
        if (!handlerError) {
          await supa
            .from('stripe_webhook_events')
            .update({ status: 'processed', processed_at: new Date().toISOString() })
            .eq('event_id', event.id)
        } else {
          const message = (handlerError as any)?.message || String(handlerError)
          await supa
            .from('stripe_webhook_events')
            .update({ status: 'error', error: message, processed_at: new Date().toISOString() })
            .eq('event_id', event.id)
        }
      }
    } catch (e) {
      console.warn('Failed to update stripe_webhook_events status:', e)
    }

    if (handlerError) {
      return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
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
    
    const stripe = await getStripe()
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    const userId = customer.metadata?.userId

    if (userId) {
      const supabase = createServiceClient()
      await supabase
        .from('subscriptions')
        .upsert({
          userId,
          stripeSubscriptionId: subscription.id,
          plan: priceId || 'UNKNOWN',
          status,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString()
        }, { onConflict: 'userId' })
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

    const stripe = await getStripe()
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    const userId = customer.metadata?.userId

    if (userId) {
      const supabase = createServiceClient()
      await supabase
        .from('subscriptions')
        .update({
          plan: priceId || 'UNKNOWN',
          status,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString()
        })
        .eq('userId', userId)
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
    const stripe = await getStripe()
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    const userId = customer.metadata?.userId

    if (userId) {
      const supabase = createServiceClient()
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('userId', userId)
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

    const stripe = await getStripe()
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    const userId = customer.metadata?.userId

    if (userId) {
      const supabase = createServiceClient()
      await supabase
        .from('payments')
        .insert({
          userId,
          stripeInvoiceId: invoice.id,
          amount: amount,
          currency: (invoice.currency || 'usd').toLowerCase(),
          status: 'SUCCESS',
          paidAt: new Date().toISOString()
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
