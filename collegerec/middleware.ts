import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isLoggedIn');
  console.log('Middleware - isLoggedIn cookie:', isLoggedIn); // Add this line

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isLandingPage = request.nextUrl.pathname === '/';

  if (!isLoggedIn && !isAuthPage && !isLandingPage) {
    console.log('Redirecting to landing page'); // Add this line
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isLoggedIn && (isAuthPage || isLandingPage)) {
    console.log('Redirecting to dashboard'); // Add this line
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
