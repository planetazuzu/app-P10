
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_TOKEN_COOKIE_NAME = 'gmrAuthToken'; // This should match the key used in lib/auth.ts or httpOnly cookie name

export function middleware(request: NextRequest) {
  // Try to get token from cookie (if set by server as httpOnly) or from a custom header if using client-side storage for mock
  // For this mock, we'll assume client-side localStorage, so middleware mainly protects against direct URL access without JS.
  // A more robust solution would involve httpOnly cookies.
  
  const { pathname } = request.nextUrl;

  // Allow access to login page and public API routes
  if (pathname.startsWith('/login') || pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // For client-side stored tokens, middleware can't directly access localStorage.
  // This simplified middleware redirects to login if no indicative cookie is found.
  // The actual auth state check will happen client-side via AuthContext.
  // This middleware serves as a basic UX enhancement for non-JS/direct access scenarios.
  const authToken = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value; // This example assumes a cookie named gmrAuthToken

  if (!authToken && !pathname.startsWith('/login')) {
    const loginUrl = new URL('/login', request.url);
    // loginUrl.searchParams.set('redirectedFrom', pathname); // Optional: pass redirect info
    return NextResponse.redirect(loginUrl);
  }
  
  if (authToken && pathname.startsWith('/login')) {
     return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files, API routes needed for auth, and image optimization
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|images/).*)'],
};
