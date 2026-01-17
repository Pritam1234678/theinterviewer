import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Check for authentication token
  const token = request.cookies.get('token')?.value; 

  // 2. Define path categories
  // accessible to everyone
  const publicSharedPaths = [
    '/', 
    '/support', 
    '/contact', 
    '/about', 
    '/privacy', 
    '/terms', 
    '/features', 
    '/pricing', 
    '/interview-tips', 
    '/success-stories', 
    '/careers'
  ]; 
  // accessible only to unauthenticated users (redirects to dashboard if logged in)
  const guestOnlyPaths = ['/login', '/signup', '/register', '/forgot-password', '/reset-password'];

  const pathname = request.nextUrl.pathname;

  const isPublicShared = publicSharedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  const isGuestOnly = guestOnlyPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // 3. Unauthenticated User Logic
  if (!token) {
    if (!isPublicShared && !isGuestOnly) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 4. Authenticated User Logic
  if (token) {
    // If user is logged in, they shouldn't see login/signup pages
    if (isGuestOnly) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to everything else (including protected routes and public shared)
  }

  return NextResponse.next();
}

// Configure paths to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
