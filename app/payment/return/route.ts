import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient, createServiceClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  // This route is hit by Stripe redirect after success
  const response = new NextResponse(null, { status: 204 })
  const supabase = createMiddlewareClient(request, response)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  const url = new URL(request.url)
  const sessionId = url.searchParams.get('session_id')

  try {
    if (sessionId) {
      const stripe = await getStripe()
      const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] })

      // If payment is successful or subscription exists, mark onboarding as complete for Pro
      const isPaid = session.payment_status === 'paid' || session.status === 'complete'
      const sub: any = (session as any).subscription || null
      const isActive = sub && ['active', 'trialing'].includes(sub.status)

      if (isPaid || isActive) {
        const service = createServiceClient()
        // Update the user's profile to Pro/active and mark onboarding done
        await service
          .from('profiles')
          .update({ plan: 'pro', subscription_status: 'active', onboarding_complete: true })
          .eq('user_id', user.id)

        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  } catch (e) {
    // Ignore errors and fall back to onboarding
  }

  // Fallback: go back to onboarding page; it will show Continue if active
  return NextResponse.redirect(new URL('/onboarding', request.url))
}

