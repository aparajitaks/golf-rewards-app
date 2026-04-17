import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight proxy to replace deprecated middleware.ts in Next.js 16.
// Purpose: protect /dashboard only and avoid redirect loops.

const PUBLIC_ROUTES = new Set([
  '/',
  '/about',
  '/pricing',
  '/courses',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
]);

function hasAuthCookie(req: NextRequest) {
  // Check common Supabase cookie names. This is intentionally fast (no network call).
  const names = [process.env.NEXT_PUBLIC_SUPABASE_COOKIE_NAME || 'sb-access-token', 'supabase-auth-token', 'sb:token'];
  for (const n of names) {
    const c = req.cookies.get(n);
    if (c && c.value) return true;
  }
  return false;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore internal assets and _next
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const loggedIn = hasAuthCookie(req);

  // If logged in and trying to access auth pages, send to dashboard to avoid loops
  if (loggedIn && (pathname === '/login' || pathname === '/signup' || pathname === '/auth/callback')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If accessing dashboard and not logged in, redirect to login once (preserve next)
  if (isDashboard && !loggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Otherwise allow
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/login', '/signup', '/auth/callback'],
};
