/**
 * Common Types for API Endpoints
 *
 * Shared type definitions used across multiple API endpoints
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Standard Vercel API handler type
 */
export type ApiHandler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

/**
 * Environment variables type-safe access
 */
export interface ApiEnvironment {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  corsOrigins: string;
  cookieDomain: string;
  tallyFormUrl: string;
  tallyWebhookSecret: string;
  n8nWebhookUrl: string;
  n8nBackendSecret: string;
  elevenlabsApiKey: string;
  elevenlabsAgentId: string;
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

/**
 * Standard success response format
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

/**
 * User role types (matches database enum)
 */
export type UserRole = 'admin' | 'manager' | 'user';

/**
 * Invitation audience types (matches database enum)
 */
export type InviteAudience = 'user' | 'manager';

/**
 * User phase types (matches RPC function return values)
 */
export type UserPhase = 'ACTIVE' | 'REGISTRATION' | 'NO_COMPANY' | 'PENDING' | 'UNAUTHORIZED';

/**
 * Evaluation status types (matches database enum)
 */
export type EvaluationStatus = 'pending' | 'processing' | 'complete' | 'failed';

/**
 * Cookie options for invite system
 */
export interface CookieOptions {
  maxAge?: number;
  domain?: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Helper to get environment variable with fallback
 */
export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] || process.env[`VITE_${key}`] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Helper to get optional environment variable
 */
export function getEnvOptional(key: string, fallback?: string): string | undefined {
  return process.env[key] || process.env[`VITE_${key}`] || fallback;
}
