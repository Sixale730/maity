import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromToken } from '@/lib/auth-edge';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('maity_token')?.value;
  const user = await getUserFromToken(token);
  const isProtected =
  req.nextUrl.pathname.startsWith('/dashboard') ||
  req.nextUrl.pathname.startsWith('/usuarios');

 
  if (isProtected && !user) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/usuarios',
    '/usuarios/:path*',
  ],
};



