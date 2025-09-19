import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  try {
    ensureInternalAuth()
    const supa = createServiceClient()
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId') || ''

    let customerId: string | null = null
    if (userId) {
      const { data: user } = await supa
        .from('users')
        .select('stripeCustomerId')
        .eq('id', userId)
        .maybeSingle()
      customerId = (user as any)?.stripeCustomerId || null
    }

    if (!customerId) return NextResponse.json({ invoices: [] })

    const stripe = await getStripe()
    const res = await stripe.invoices.list({ customer: customerId, limit: 20 })

    const invoices = res.data.map(inv => ({
      id: inv.id,
      status: inv.status,
      amount_due: inv.amount_due,
      amount_paid: inv.amount_paid,
      created: inv.created ? new Date(inv.created * 1000).toISOString() : null,
      hosted_invoice_url: inv.hosted_invoice_url,
      payment_intent: (inv.payment_intent as any) || null
    }))

    return NextResponse.json({ invoices })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to list invoices' }, { status: 500 })
  }
}

