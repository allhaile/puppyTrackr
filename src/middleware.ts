import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register'];
  const apiPublicRoutes = ['/api/auth/login', '/api/auth/register'];

  // Skip middleware for static files, API auth routes, and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname.includes('.') ||
    publicRoutes.includes(pathname) ||
    apiPublicRoutes.some(route => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // Get auth token from cookies
  const token = request.cookies.get('auth-token')?.value;

  // Simple check: if no token exists, redirect to login
  if (!token) {
    // Redirect to login for protected pages
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/milestones')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Return 401 for protected API routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // For API routes, we'll verify the token in the actual API handlers
  // For pages, we'll let them load and handle verification there
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}; 