import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { findUserByEmail } from './airtable';


const JWT_SECRET = process.env.JWT_SECRET!;


// 1.- verificar credenciales
export async function verifyUser(email: string, password: string) {
  const rec = await findUserByEmail(email);
  if (!rec) return null;

  const { passwordHash, role } = rec.fields as any;
  const ok = await bcrypt.compare(password, passwordHash);
  return ok ? { id: rec.id, email, role } : null;
}

// 2.- settear cookie JWT
export function setAuthCookie(res: any, payload: { id: string; role: string }) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  res.cookies.set('maity_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

// 3.- leer usuario desde la cookie
export async function getUser() {
  const token = (await cookies()).get('maity_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
  } catch {
    return null;
  }
}
