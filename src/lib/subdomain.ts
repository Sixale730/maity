/**
 * Subdomain Detection Utility
 *
 * Detects whether the app is running on the recorder subdomain (app.*)
 * and provides URL helpers for cross-subdomain navigation.
 */

import { env } from './env';

/**
 * Checks if the current hostname indicates the recorder subdomain.
 * Works for both production (app.maity.com.mx) and development (app.localhost).
 */
export function isRecorderSubdomain(): boolean {
  const hostname = window.location.hostname;

  // Production subdomain
  if (hostname === 'app.maity.com.mx') {
    return true;
  }

  // Development subdomain (requires hosts file entry: 127.0.0.1 app.localhost)
  if (hostname === 'app.localhost') {
    return true;
  }

  // Generic check for any app.* subdomain
  if (hostname.startsWith('app.')) {
    return true;
  }

  return false;
}

/**
 * Returns the URL for the recorder app.
 * Uses the appropriate domain based on environment.
 */
export function getRecorderUrl(): string {
  if (env.isDevelopment) {
    // Development: use app.localhost with same port
    const port = window.location.port ? `:${window.location.port}` : '';
    return `http://app.localhost${port}`;
  }

  // Production
  return 'https://app.maity.com.mx';
}

/**
 * Returns the URL for the main platform.
 * Uses the appropriate domain based on environment.
 */
export function getMainPlatformUrl(): string {
  if (env.isDevelopment) {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `http://localhost${port}`;
  }

  // Production
  return 'https://maity.com.mx';
}
