import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get('authToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const language = request.cookies.get('lang')?.value || 'vi';
  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users trying to access dashboard routes
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname.startsWith('/auth');
  const isPublicAsset = pathname.startsWith('/_next') || pathname === '/favicon.ico';
  const isApiRoute = pathname.startsWith('/api');

  if (!token && isDashboardRoute && !isAuthRoute && !isPublicAsset && !isApiRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.search = '';
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }
  
  // Debug logging
  if (request.nextUrl.pathname.includes('/api/auth/admin/change-password')) {
    console.log('Middleware - Change password request');
    console.log('Request URL:', request.nextUrl.pathname);
    console.log('Token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    console.log('All cookies:', request.cookies.getAll().map(c => c.name));
  }
  
  // Clone the request to modify headers
  const requestHeaders = new Headers(request.headers);
  
  // If token exists, add it to Authorization header
  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }
  
  // Add refresh token to headers for API routes that need it
  if (refreshToken) {
    requestHeaders.set('X-Refresh-Token', refreshToken);
  }
  // Attach Accept-Language from cookie
  if (language) {
    requestHeaders.set('Accept-Language', language);
  }
  
  // Create response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all requests - gắn token vào mọi request
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
