import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/'],
  ignoredRoutes: ['/api/webhook'],
  afterAuth(auth, req) {
    // Redirect authenticated users from landing page to dashboard
    if (auth.userId && req.nextUrl.pathname === '/') {
      return Response.redirect(new URL('/dashboard', req.url))
    }
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}