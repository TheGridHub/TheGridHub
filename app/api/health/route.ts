import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function GET() {
  const result: any = { supabase: 'unknown', stripe: 'unknown', env: {} }
  try {
    const supa = createServiceClient()
    const { data, error } = await supa.from('users').select('id').limit(1)
    result.supabase = error ? `error: ${error.message}` : 'ok'
  } catch (e: any) {
    result.supabase = 'error: ' + (e?.message || 'unknown')
  }
  try {
    const stripe = await getStripe()
    const { url } = await stripe.accounts.createLoginLink((await stripe.accounts.retrieve()).id).catch(() => ({ url: null }))
    result.stripe = 'ok'
  } catch (e: any) {
    result.stripe = 'error: ' + (e?.message || 'unknown')
  }
  result.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || null
  result.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || null
  return NextResponse.json(result)
}
