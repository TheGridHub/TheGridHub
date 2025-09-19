import { NextResponse, type NextRequest } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature') || ''
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })

  const body = await request.text()

  try {
    const stripe = await getStripe()
    const event = stripe.webhooks.constructEvent(body, sig, secret)
    const supa = createServiceClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        await supa.from('stripe_webhook_events').insert({
          event_id: event.id,
          type: event.type,
          status: 'received'
        })
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as any
        const customerId = sub.customer as string
        const { data: userRow } = await supa
          .from('users')
          .select('id, supabaseId')
          .eq('stripeCustomerId', customerId)
          .maybeSingle()
        if (userRow?.id) {
          await supa.from('subscriptions').upsert({
            userId: userRow.id,
            stripeSubscriptionId: sub.id,
            status: sub.status,
            plan: 'PRO',
            currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: !!sub.cancel_at_period_end
          }, { onConflict: 'userId' })
          if (userRow.supabaseId) {
            await supa.from('profiles').upsert({
              user_id: userRow.supabaseId,
              plan: 'pro',
              subscription_status: sub.status === 'active' ? 'active' : 'pending'
            }, { onConflict: 'user_id' })
          }
        }
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any
        const customerId = sub.customer as string
        const { data: userRow } = await supa
          .from('users')
          .select('id, supabaseId')
          .eq('stripeCustomerId', customerId)
          .maybeSingle()
        if (userRow?.id && userRow.supabaseId) {
          await supa.from('subscriptions').update({ status: 'canceled' }).eq('userId', userRow.id)
          await supa.from('profiles').update({ subscription_status: 'canceled', plan: 'free' }).eq('user_id', userRow.supabaseId)
        }
        break
      }
      default:
        break
    }

    return new NextResponse(null, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Webhook error' }, { status: 400 })
  }
}

