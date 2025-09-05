import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { StripeWebhookManager } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const auth = ensureInternalAuth('owner')
    const body = await req.json().catch(()=> ({} as any))
    const eventId = String(body.event_id || '')
    if (!eventId) return NextResponse.json({ error: 'event_id required' }, { status: 400 })

    const supa = createServiceClient()
    const { data, error } = await supa
      .from('stripe_webhook_events')
      .select('event_id, type, payload')
      .eq('event_id', eventId)
      .maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    // Determine handler based on type
    const payload = data.payload as any
    const type = String(data.type || '')
    const obj = payload?.data?.object

    switch (type) {
      case 'customer.subscription.created':
        await StripeWebhookManager.handleSubscriptionCreated(obj)
        break
      case 'customer.subscription.updated':
        await StripeWebhookManager.handleSubscriptionUpdated(obj)
        break
      case 'customer.subscription.deleted':
        await StripeWebhookManager.handleSubscriptionDeleted(obj)
        break
      default:
        return NextResponse.json({ ok: false, message: 'Unsupported event type for retry' })
    }

    // Mark processed
    await supa
      .from('stripe_webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString(), error: null })
      .eq('event_id', eventId)

    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Retry failed' }, { status: 500 })
  }
}

