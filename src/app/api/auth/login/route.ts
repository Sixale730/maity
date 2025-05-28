import { NextRequest, NextResponse } from 'next/server';
import { verifyUser, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await verifyUser(email, password);
  if (!user) 
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });

  // crea cookie de sesión (JWT o sesión firmada)
  return setAuthCookie({ id: user.id, role: user.role });

}
