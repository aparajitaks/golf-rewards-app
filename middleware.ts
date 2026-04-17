import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protect only the /dashboard route and avoid redirect loops.
const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/',
  '/about',
  '/pricing',
  '/courses',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore Next.js internals and static files
  if (pathname.startsWith('/_next') || pathname.includes('.')) return NextResponse.next();

  // If user tries to access auth pages but already has an auth cookie -> redirect to dashboard
  const hasAuthCookie = Boolean(
    req.cookies.get(process.env.NEXT_PUBLIC_SUPABASE_COOKIE_NAME || 'sb-access-token')?.value ||
      req.cookies.get('supabase-auth-token')?.value ||
      req.cookies.get('sb:token')?.value,
  );

  // If a logged-in user requests login/signup/etc, send them to dashboard
  if (hasAuthCookie && (pathname === '/login' || pathname === '/signup' || pathname === '/auth/callback')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If a non-logged-in user requests dashboard, send to login but preserve return path
  if (!hasAuthCookie && pathname === '/dashboard') {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/login', '/signup', '/auth/callback'],
};
