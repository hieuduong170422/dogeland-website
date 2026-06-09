import { NextResponse, type NextRequest } from 'next/server';

// Routes chỉ dành cho unauthenticated users
const AUTH_ONLY_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

// Routes yêu cầu đăng nhập
const PROTECTED_PREFIXES = ['/dashboard', '/settings', '/admin'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasRefreshCookie = req.cookies.has('refresh_token');

  // Redirect authenticated users away from auth-only pages
  if (hasRefreshCookie && AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Protect account/admin routes
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !hasRefreshCookie) {
    const url = new URL('/login', req.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
