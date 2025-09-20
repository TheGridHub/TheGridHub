import { NextResponse, type NextRequest } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature') || ''
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })

  const raw = await request.text()

  try {
    const stripe = await getStripe()
    const event = stripe.webhooks.constructEvent(raw, sig, secret)
    const supa = createServiceClient()

    // Record the event idempotently
    try {
      await supa.from('stripe_webhook_events').insert({
        id: event.id,
        type: event.type,
        payload: event as any,
        status: 'processed'
      })
    } catch (_) {}

    // Helper to update profile/subscription by supabaseId carried in metadata
    const upsertBySupabaseId = async (supabaseId: string, fields: { status: string; price_id?: string | null; current_period_end?: string | null; cancel_at_period_end?: boolean | null }) => {
      await supa.from('subscriptions').upsert({
        user_id: supabaseId,
        status: fields.status,
        price_id: fields.price_id || null,
        current_period_end: fields.current_period_end ? new Date(fields.current_period_end).toISOString() : null,
        cancel_at_period_end: !!fields.cancel_at_period_end
      }, { onConflict: 'user_id' })

      await supa.from('profiles').upsert({
        user_id: supabaseId,
        plan: fields.status === 'active' ? 'pro' : 'free',
        subscription_status: fields.status
      }, { onConflict: 'user_id' })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const supabaseId = session?.metadata?.supabaseId as string | undefined
        const sub = session.subscription ? await stripe.subscriptions.retrieve(String(session.subscription)) : null
        if (supabaseId && sub) {
          await upsertBySupabaseId(supabaseId, {
            status: sub.status,
            price_id: (sub.items.data[0]?.price?.id as string) || null,
            current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
            cancel_at_period_end: sub.cancel_at_period_end
          })
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as any
        const supabaseId = (sub.metadata?.supabaseId as string) || (sub as any).metadata?.supabaseId
        if (supabaseId) {
          await upsertBySupabaseId(supabaseId, {
            status: sub.status,
            price_id: (sub.items?.data?.[0]?.price?.id as string) || null,
            current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
            cancel_at_period_end: sub.cancel_at_period_end
          })
        }
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any
        const supabaseId = (sub.metadata?.supabaseId as string) || (sub as any).metadata?.supabaseId
        if (supabaseId) {
          await upsertBySupabaseId(supabaseId, { status: 'canceled', price_id: null, current_period_end: null, cancel_at_period_end: null })
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

