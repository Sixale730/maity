// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyUser, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await verifyUser(email, password); // consulta a DB/Airtable
  if (!user) return NextResponse.json({ error: 'Invalid' }, { status: 401 });

  // crea cookie de sesión (JWT o sesión firmada)
  const res = NextResponse.json({ ok: true });
  await setAuthCookie(res, user);
  return res;
}
