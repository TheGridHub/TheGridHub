import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    ensureInternalAuth('owner')
    const body = await req.json().catch(()=>({}))
    const invoiceId = String(body?.invoice_id || '')
    const amount = body?.amount_cents as number | undefined
    if (!invoiceId) return NextResponse.json({ error: 'invoice_id required' }, { status: 400 })

    const stripe = await getStripe()
    const inv = await stripe.invoices.retrieve(invoiceId, { expand: ['payment_intent'] })
    const pi = (inv.payment_intent as any)?.id
    if (!pi) return NextResponse.json({ error: 'Invoice has no payment_intent' }, { status: 400 })

    const refund = await stripe.refunds.create({ payment_intent: pi, amount: amount })
    return NextResponse.json({ ok: true, refund })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Refund failed' }, { status: 500 })
  }
}

