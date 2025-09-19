import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'

// Public routes (no auth required)
const publicRoutes = [
  '/',
  '/pricing',
  '/sign-in',
  '/sign-up',
  '/auth',
  // Internal admin login page should be reachable without Supabase auth
  '/admin-internal/login',
]

// Routes that should bypass onboarding checks (but still require auth)
// e.g., payment return endpoints
const onboardingBypassPrefixes = [
  '/stripe',
  '/checkout',
  '/api/stripe',
  '/payment/return',
]

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient(request, response)
  const pathname = request.nextUrl.pathname

  // Skip middleware for API routes (let API handlers enforce auth & return JSON)
  if (pathname.startsWith('/api/')) {
    return response
  }

  // Bypass Supabase auth for internal admin console (it has its own auth)
  if (pathname === '/admin-internal' || pathname.startsWith('/admin-internal/')) {
    return response
  }

  // Allow public routes
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isPublicRoute) {
    return response
  }

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // redirect to sign-in for protected pages
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Skip onboarding guard for bypass prefixes
  const isBypassPath = onboardingBypassPrefixes.some(p => pathname === p || pathname.startsWith(`${p}/`))
  if (isBypassPath) {
    return response
  }

  // Fetch profile to decide routing
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('user_id', user.id)
    .maybeSingle()

  const onboardingComplete = !!profile?.onboarding_complete

  // If not on onboarding and onboarding is incomplete, redirect
  if (!onboardingComplete && pathname !== '/onboarding' && !pathname.startsWith('/onboarding/')) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  // If onboarding is complete and user hits /onboarding, send to dashboard
  if (onboardingComplete && (pathname === '/onboarding' || pathname.startsWith('/onboarding/'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
