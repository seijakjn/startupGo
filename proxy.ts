import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public routes — no auth required
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/rider-signup(.*)',
]);

// Admin-only routes
const isAdminRoute = createRouteMatcher(['/admin', '/admin/(.*)']);

// Rider-only routes
const isRiderRoute = createRouteMatcher(['/rider', '/rider/(.*)']);

// User-only service routes
const isUserOnlyRoute = createRouteMatcher([
  '/fetch-me(.*)',
  '/food(.*)',
  '/parcel(.*)',
  '/rental(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 1. Protect all non-public routes
  if (!isPublicRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  // 2. Role-based routing logic (Fetch fresh metadata)
  if (userId) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = (user.publicMetadata?.role as string)?.toLowerCase();

    // Prevent Riders/Admins from accessing User Service routes
    if (isUserOnlyRoute(req)) {
      if (role === 'rider') {
        return NextResponse.redirect(new URL('/rider', req.url));
      }
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }

    // Protect Admin Dashboard
    if (isAdminRoute(req) && role !== 'admin') {
      return NextResponse.redirect(new URL('/?error=admin_access_denied', req.url));
    }

    // Protect Rider Dashboard
    if (isRiderRoute(req) && role !== 'rider') {
      return NextResponse.redirect(new URL('/rider-signup', req.url));
    }
    
    // Auto-redirect from Home page based on role
    if (req.nextUrl.pathname === '/') {
      if (role === 'admin') return NextResponse.redirect(new URL('/admin', req.url));
      if (role === 'rider') return NextResponse.redirect(new URL('/rider', req.url));
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
