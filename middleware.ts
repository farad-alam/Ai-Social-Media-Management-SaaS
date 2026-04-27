import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/create(.*)', '/settings(.*)', '/templates(.*)'])

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

const clerk = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // If user is logged in and trying to access the landing page, redirect to dashboard
  if (userId && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (isProtectedRoute(req)) await auth.protect()
})

export default function middleware(req: any, event: any) {
  // Bypass Clerk entirely for cron endpoints to avoid immutable header errors
  if (req.nextUrl.pathname.startsWith('/api/cron')) {
    return;
  }
  
  return clerk(req, event);
}
