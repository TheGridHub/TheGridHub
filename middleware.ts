import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'

const publicRoutes = [
  '/',
  '/login',
  '/sign-in',
  '/sign-up',
  '/welcome',
  '/onboarding',
  '/api/webhook',
  '/api/currency',
  '/contact',
  '/pricing',
  '/privacy-policy',
  '/terms-of-service',
  '/why-thegridhub',
  '/careers',
  '/about',
  '/api/auth',
  '/auth',
  // Internal admin (has its own credential guard)
  '/admin-internal',
  '/internal-admin',
  // Internal admin API endpoints must be reachable without app auth
  '/api/admin-internal'
]

// Routes that should bypass onboarding checks (but still require auth)
// We keep payment flows accessible so a user can subscribe/restore even before onboarding.
// Dashboard billing/settings pages SHOULD NOT bypass onboarding in a single-page dashboard system.
const onboardingBypassPrefixes = [
  '/stripe',
  '/checkout',
  '/api/stripe',
]

// Admin path prefixes for clarity
const adminPrefixes = ['/admin-internal', '/internal-admin']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient(request, response)
  const pathname = request.nextUrl.pathname

  // Skip middleware for API routes (let API handlers enforce auth & return JSON)
  if (pathname.startsWith('/api/')) {
    return response
  }

  // Allow public routes
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isPublicRoute) {
    return response
  }

  // Check if user is authenticated (use getUser for verified auth)
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Skip onboarding guard for admin paths and onboarding-bypass prefixes
  const isAdminPath = adminPrefixes.some(p => pathname === p || pathname.startsWith(`${p}/`))
  const isBypassPath = onboardingBypassPrefixes.some(p => pathname === p || pathname.startsWith(`${p}/`))
  if (isAdminPath || isBypassPath) {
    return response
  }

  // Onboarding guard: if user authenticated but hasn't completed onboarding,
  // redirect to /onboarding (except when already on /onboarding or allowed paths above)
  if (!pathname.startsWith('/onboarding')) {
    // Find users row by supabaseId
    const { data: userRow } = await supabase
      .from('users')
      .select('id')
      .eq('supabaseId', user.id)
      .maybeSingle()

    const userId = userRow?.id

    if (!userId) {
      // No users row yet -> treat as not onboarded
      const url = new URL('/onboarding', request.url)
      return NextResponse.redirect(url)
    }

    const { data: onboard } = await supabase
      .from('user_onboarding')
      .select('id')
      .eq('userId', userId)
      .maybeSingle()

    if (!onboard) {
      const url = new URL('/onboarding', request.url)
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
