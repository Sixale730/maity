/**
 * CORS Utility for API Endpoints
 *
 * Handles Cross-Origin Resource Sharing (CORS) headers for Vercel API functions
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Sets CORS headers on the response and handles OPTIONS preflight requests
 *
 * @param req - Vercel API request object
 * @param res - Vercel API response object
 * @returns true if request is OPTIONS (preflight), false otherwise
 */
export function setCors(req: VercelRequest, res: VercelResponse): boolean {
  const allowed = (
    process.env.CORS_ORIGINS ||
    'https://maity.com.mx,https://www.maity.com.mx,http://localhost:8080'
  )
    .split(',')
    .map((s) => s.trim());

  const origin = req.headers.origin || '';
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Vary', 'Origin');

  const reqHeaders = req.headers['access-control-request-headers'];
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', reqHeaders || 'authorization, content-type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
