/**
 * Test Setup
 *
 * This file runs before all tests and sets up:
 * - Testing Library matchers
 * - Supabase client mocks
 * - Global test utilities
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Mock data for testing
 */
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@maity.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockSession: Session = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockUser,
};

/**
 * Mock Supabase client
 * Creates a full mock of the Supabase client with all methods
 */
export const createMockSupabaseClient = () => ({
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { session: mockSession },
      error: null
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { session: mockSession, user: mockUser },
      error: null
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn((callback) => {
      // Call the callback immediately with a session
      callback('SIGNED_IN', mockSession);
      // Return subscription object
      return {
        data: {
          subscription: {
            id: 'test-subscription',
            callback,
            unsubscribe: vi.fn(),
          },
        },
      };
    }),
  },
  rpc: vi.fn((functionName: string, params?: any) => {
    // Default RPC responses based on function name
    const rpcMocks: Record<string, any> = {
      'my_roles': { data: ['user'], error: null },
      'my_phase': { data: 'ACTIVE', error: null },
      'my_status': {
        data: [{
          phase: 'ACTIVE',
          registration_form_completed: true,
          company_id: 'test-company-id',
          user_id: 'test-user-id'
        }],
        error: null
      },
      'ensure_user': { data: null, error: null },
      'get_user_role': { data: 'user', error: null },
      'complete_onboarding': { data: null, error: null },
      'mark_tour_completed': { data: null, error: null },
    };

    return Promise.resolve(rpcMocks[functionName] || { data: null, error: null });
  }),
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn((resolve) => resolve({ data: [], error: null })),
  })),
});

/**
 * Global Supabase mock
 * This is used by vi.mock('@maity/shared') to provide consistent mocks
 */
export const mockSupabase = createMockSupabaseClient();

/**
 * Mock @maity/shared module
 * This ensures all imports from @maity/shared use our mocks
 */
vi.mock('@maity/shared', async () => {
  const actual = await vi.importActual('@maity/shared');
  return {
    ...actual,
    supabase: mockSupabase,
    AuthService: {
      ensureUser: vi.fn().mockResolvedValue(undefined),
      getMyRoles: vi.fn().mockResolvedValue(['user']),
      getMyPhase: vi.fn().mockResolvedValue('ACTIVE'),
      getMyStatus: vi.fn().mockResolvedValue([{
        phase: 'ACTIVE',
        registration_form_completed: true,
        company_id: 'test-company-id',
        user_id: 'test-user-id'
      }]),
      completeOnboarding: vi.fn().mockResolvedValue(undefined),
      getSession: vi.fn().mockResolvedValue(mockSession),
      getUser: vi.fn().mockResolvedValue(mockUser),
      getUserRole: vi.fn().mockResolvedValue('user'),
      markTourCompleted: vi.fn().mockResolvedValue(undefined),
    },
  };
});

/**
 * Mock window.location
 * Allows testing of navigation and URL-related functionality
 */
delete (window as any).location;
window.location = {
  ...window.location,
  href: 'http://localhost:8080',
  origin: 'http://localhost:8080',
  pathname: '/',
  search: '',
  hash: '',
  assign: vi.fn(),
  reload: vi.fn(),
  replace: vi.fn(),
};

/**
 * Mock fetch for API calls
 * Provides default responses for common API endpoints
 */
global.fetch = vi.fn((url: string, options?: any) => {
  const urlString = typeof url === 'string' ? url : url.toString();

  // Default mock responses for common endpoints
  const mockResponses: Record<string, any> = {
    '/api/finalize-invite': {
      success: true,
      note: 'NO_INVITE_COOKIE',
    },
    '/api/tally-link': {
      url: 'https://tally.so/test-form?otk=test-token',
    },
  };

  // Find matching endpoint
  const endpoint = Object.keys(mockResponses).find(key => urlString.includes(key));
  const responseData = endpoint ? mockResponses[endpoint] : {};

  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(responseData),
    text: () => Promise.resolve(JSON.stringify(responseData)),
    headers: new Headers(),
  } as Response);
});

/**
 * Mock console methods to reduce noise in tests
 * You can re-enable specific logs by calling console.log.mockRestore()
 */
if (!import.meta.env.VITEST_DEBUG) {
  global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    // Keep error visible for debugging
  };
}

/**
 * Clean up after each test
 */
afterEach(() => {
  vi.clearAllMocks();
});
