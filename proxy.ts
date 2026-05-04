import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public routes — no auth required
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/rider-signup(.*)',
]);

// Admin-only routes
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

// Rider-only routes
const isRiderRoute = createRouteMatcher(['/rider(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Extra gate for /admin — must have role: 'admin' in publicMetadata
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/?error=admin_access_denied', req.url));
    }
  }

  // Extra gate for /rider — must have role: 'rider' in publicMetadata
  if (isRiderRoute(req)) {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (role !== 'rider') {
      return NextResponse.redirect(new URL('/rider-signup', req.url));
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
