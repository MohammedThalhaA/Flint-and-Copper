import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Only apply to /admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow unauthenticated access to the login page and its API route
  if (request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  const cookie = request.cookies.get('admin_session')?.value;

  if (!cookie) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    const session = await decrypt(cookie);
    if (!session || !session.adminId) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  } catch (error) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
