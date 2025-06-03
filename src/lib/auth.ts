import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { findUserByEmail } from './airtable';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

type UserFields = {
  passwordHash: string;
  role: string;
};

type TokenPayload = {
  id: string;
  role: string;
};

// Verificar credenciales
export async function verifyUser(email: string, password: string) {
  const rec = await findUserByEmail(email);
  if (!rec) return null;

  const { passwordHash, role } = rec.fields as UserFields;
  const ok = await bcrypt.compare(password, passwordHash);

  return ok ? { id: rec.id, email, role } : null;
}

// Settear cookie JWT y devolver respuesta
export function setAuthCookie(payload: TokenPayload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  const response = NextResponse.json({ ok: true });

  response.cookies.set('maity_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

// Leer usuario desde la cookie
export async function getUser() {
  const token = (await cookies()).get('maity_token')?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
