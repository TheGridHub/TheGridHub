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
  '/auth'
]

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient(request, response)
  const pathname = request.nextUrl.pathname

  // Allow public routes
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isPublicRoute) {
    return response
  }

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()

  // Redirect to login if not authenticated
  if (!session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
