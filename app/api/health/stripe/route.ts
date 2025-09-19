import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stripe = await getStripe()
    // Minimal call to ensure key is valid: retrieve account
    const acct = await stripe.accounts.retrieve()
    return NextResponse.json({ ok: true, account: { id: acct.id } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Stripe health failed' }, { status: 500 })
  }
}

