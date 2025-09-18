import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'
import { getProfileServer } from '@/lib/profile'

export async function GET(request: NextRequest) {
  // This route can be hit by Stripe webhook redirect after success or by the user
  const response = new NextResponse(null, { status: 204 })
  const supabase = createMiddlewareClient(request, response)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  // Just bounce them to onboarding; the page will check subscription_status and show Continue
  return NextResponse.redirect(new URL('/onboarding', request.url))
}

