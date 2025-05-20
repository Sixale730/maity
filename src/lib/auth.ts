// src/lib/auth.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function verifyUser(email: string, password: string) {
  // Ejemplo simple: consulta Airtable o tu DB
  // Devuelve { id, email, role } si la contraseña coincide
}

export async function setAuthCookie(res: any, user: { id: string; role: string }) {
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  res.cookies.set('maity_token', token, { httpOnly: true, sameSite: 'lax', path: '/' });
}

export function getUser() {
  const token = cookies().get('maity_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
  } catch {
    return null;
  }
}
