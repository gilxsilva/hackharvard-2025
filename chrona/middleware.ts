import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // If user is authenticated and trying to access launch, redirect to dashboard
    if (req.nextauth.token) {
      const pathname = req.nextUrl.pathname;
      if (pathname === '/launch') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only require auth for dashboard routes
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;

        // Allow access to launch page without auth
        if (pathname === '/launch') {
          return true;
        }

        // Allow access to calendar page without auth (has its own sign-in)
        if (pathname.startsWith('/calendar')) {
          return true;
        }

        // Allow access to API routes
        if (pathname.startsWith('/api')) {
          return true;
        }

        // Require auth for dashboard
        if (pathname.startsWith('/dashboard')) {
          return !!token;
        }

        // Allow everything else
        return true;
      },
    },
    pages: {
      signIn: '/launch',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
