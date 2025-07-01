import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const response = NextResponse.redirect(new URL('/logout-client', req.url));

  // Si usas cookies personalizadas:
  response.cookies.set('maity_token', '', { path: '/', maxAge: 0 });

  // Si usas next-auth también:
  response.cookies.set('next-auth.session-token', '', { path: '/', expires: new Date(0) });

  return response;
}
