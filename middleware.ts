import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/welcome',
  '/onboarding',
  '/api/webhook(.*)',
  '/api/currency',
  '/contact',
  '/pricing',
  '/privacy-policy',
  '/terms-of-service',
  '/why-thegridhub',
  '/careers',
  '/about'
])

export default clerkMiddleware(async (auth, req) => {
  // Check if it's a public route
  if (isPublicRoute(req)) {
    return
  }

  // For protected routes, ensure user is authenticated
  await auth.protect()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
