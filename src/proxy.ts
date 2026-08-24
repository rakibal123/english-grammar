import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Set guest cookie if not present
  if (!request.cookies.get('guest_id')) {
    const guestId = crypto.randomUUID();
    response.cookies.set('guest_id', guestId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const authToken =
      request.cookies.get('authjs.session-token') ||
      request.cookies.get('__Secure-authjs.session-token');
    if (!authToken) {
      return NextResponse.redirect(new URL('/login?from=admin', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
