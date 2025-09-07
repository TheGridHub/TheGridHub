import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'

// Minimal set of public routes now that marketing/site pages are removed.
// - Admin internal (has its own credential guard)
// - Auth callback routes
const publicRoutes = [
  '/admin-internal',
  '/internal-admin',
  '/auth',
]

// Routes that should bypass onboarding checks (but still require auth)
// Keep payment/API paths here if reintroduced in the future.
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

  // If not authenticated, block access by returning 401 instead of redirecting to a removed login page
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Skip onboarding guard for admin paths and onboarding-bypass prefixes
  const isAdminPath = adminPrefixes.some(p => pathname === p || pathname.startsWith(`${p}/`))
  const isBypassPath = onboardingBypassPrefixes.some(p => pathname === p || pathname.startsWith(`${p}/`))
  if (isAdminPath || isBypassPath) {
    return response
  }

  // Onboarding guard: if user authenticated but hasn't completed onboarding,
  // Previously redirected to /onboarding (now removed). For non-admin pages, simply allow.
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
