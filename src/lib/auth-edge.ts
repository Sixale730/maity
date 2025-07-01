// src/lib/auth-edge.ts  (usa WebCrypto, 100 % Edge-safe)
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function getUserFromToken(token?: string) {
  if (!token || token === '') return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { id: string; role: string };
  } catch {
    return null;
  }
}
