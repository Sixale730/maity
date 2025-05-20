// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUser } from '@/lib/auth';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const user = getUser();

  const isProtected = url.pathname.startsWith('/dashboard');

  if (isProtected && !user) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
