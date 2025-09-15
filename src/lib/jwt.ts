/**
 * JWT utility functions for validation tokens
 * Uses HS256 algorithm with a shared secret
 */

export interface ValidationTokenPayload {
  user_id: string;
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
}

/**
 * Creates a JWT validation token with short expiration (10 minutes)
 */
export function createValidationToken(userId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const expiration = now + (10 * 60); // 10 minutes
  
  const payload: ValidationTokenPayload = {
    user_id: userId,
    exp: expiration,
    iat: now
  };

  // Simple JWT implementation for client-side token generation
  // The token will be validated server-side in the edge function
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  
  // For client-side, we just create the structure without signing
  // The actual validation will happen server-side with the secret
  return `${encodedHeader}.${encodedPayload}.unsigned`;
}

/**
 * Decodes a validation token (without verification)
 * Used for debugging or client-side inspection
 */
export function decodeValidationToken(token: string): ValidationTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload as ValidationTokenPayload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Checks if a token is expired (client-side check only)
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeValidationToken(token);
  if (!payload) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}