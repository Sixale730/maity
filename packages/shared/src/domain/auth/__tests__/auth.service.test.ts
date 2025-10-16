/**
 * AuthService Tests
 *
 * Tests the authentication service that handles user authentication,
 * roles, phases, and session management.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService, buildRedirectTo } from '../auth.service';
import { supabase } from '../../../api/client/supabase';

// Mock the supabase client
vi.mock('../../../api/client/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
    }
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ensureUser', () => {
    it('should call ensure_user RPC function successfully', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: null
      });

      await expect(AuthService.ensureUser()).resolves.not.toThrow();
      expect(supabase.rpc).toHaveBeenCalledWith('ensure_user');
    });

    it('should throw error when RPC fails', async () => {
      const error = new Error('Database error');
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      await expect(AuthService.ensureUser()).rejects.toThrow('Database error');
    });

    it('should log error to console when RPC fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      await expect(AuthService.ensureUser()).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error ensuring user exists:', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getMyRoles', () => {
    it('should return user roles successfully', async () => {
      const mockRoles = ['user', 'manager'];

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockRoles,
        error: null
      });

      const roles = await AuthService.getMyRoles();

      expect(roles).toEqual(mockRoles);
      expect(supabase.rpc).toHaveBeenCalledWith('my_roles');
    });

    it('should return empty array when no roles found', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: null
      });

      const roles = await AuthService.getMyRoles();

      expect(roles).toEqual([]);
    });

    it('should handle admin role', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: ['admin'],
        error: null
      });

      const roles = await AuthService.getMyRoles();

      expect(roles).toContain('admin');
    });

    it('should handle manager role', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: ['manager'],
        error: null
      });

      const roles = await AuthService.getMyRoles();

      expect(roles).toContain('manager');
    });

    it('should handle multiple roles', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: ['admin', 'manager', 'user'],
        error: null
      });

      const roles = await AuthService.getMyRoles();

      expect(roles).toHaveLength(3);
      expect(roles).toContain('admin');
      expect(roles).toContain('manager');
      expect(roles).toContain('user');
    });

    it('should throw error when RPC fails', async () => {
      const error = new Error('Database error');
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      await expect(AuthService.getMyRoles()).rejects.toThrow('Database error');
    });
  });

  describe('getMyPhase', () => {
    it('should return ACTIVE phase', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: 'ACTIVE',
        error: null
      });

      const phase = await AuthService.getMyPhase();

      expect(phase).toBe('ACTIVE');
      expect(supabase.rpc).toHaveBeenCalledWith('my_phase');
    });

    it('should return REGISTRATION phase', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: 'REGISTRATION',
        error: null
      });

      const phase = await AuthService.getMyPhase();

      expect(phase).toBe('REGISTRATION');
    });

    it('should return NO_COMPANY phase', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: 'NO_COMPANY',
        error: null
      });

      const phase = await AuthService.getMyPhase();

      expect(phase).toBe('NO_COMPANY');
    });

    it('should return PENDING phase', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: 'PENDING',
        error: null
      });

      const phase = await AuthService.getMyPhase();

      expect(phase).toBe('PENDING');
    });

    it('should return UNAUTHORIZED phase', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: 'UNAUTHORIZED',
        error: null
      });

      const phase = await AuthService.getMyPhase();

      expect(phase).toBe('UNAUTHORIZED');
    });

    it('should handle lowercase phase and convert to uppercase', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: 'active',
        error: null
      });

      const phase = await AuthService.getMyPhase();

      expect(phase).toBe('ACTIVE');
    });

    it('should handle legacy object format with phase property', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { phase: 'ACTIVE' },
        error: null
      });

      const phase = await AuthService.getMyPhase();

      expect(phase).toBe('ACTIVE');
    });

    it('should handle legacy array format with phase property', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{ phase: 'ACTIVE' }],
        error: null
      });

      const phase = await AuthService.getMyPhase();

      expect(phase).toBe('ACTIVE');
    });

    it('should throw error when RPC fails', async () => {
      const error = new Error('Database error');
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      await expect(AuthService.getMyPhase()).rejects.toThrow('Database error');
    });
  });

  describe('getMyStatus', () => {
    it('should return user status successfully', async () => {
      const mockStatus = [{
        phase: 'ACTIVE',
        registration_form_completed: true,
        company_id: 'company-123',
        user_id: 'user-456'
      }];

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockStatus,
        error: null
      });

      const status = await AuthService.getMyStatus();

      expect(status).toEqual(mockStatus);
      expect(supabase.rpc).toHaveBeenCalledWith('my_status');
    });

    it('should return empty array when no status found', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: null
      });

      const status = await AuthService.getMyStatus();

      expect(status).toEqual([]);
    });

    it('should handle REGISTRATION phase status', async () => {
      const mockStatus = [{
        phase: 'REGISTRATION',
        registration_form_completed: false,
        company_id: 'company-123',
        user_id: 'user-456'
      }];

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockStatus,
        error: null
      });

      const status = await AuthService.getMyStatus();

      expect(status[0].phase).toBe('REGISTRATION');
      expect(status[0].registration_form_completed).toBe(false);
    });

    it('should handle NO_COMPANY phase status', async () => {
      const mockStatus = [{
        phase: 'NO_COMPANY',
        registration_form_completed: false,
        company_id: null,
        user_id: 'user-456'
      }];

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockStatus,
        error: null
      });

      const status = await AuthService.getMyStatus();

      expect(status[0].phase).toBe('NO_COMPANY');
      expect(status[0].company_id).toBeNull();
    });

    it('should throw error when RPC fails', async () => {
      const error = new Error('Database error');
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      await expect(AuthService.getMyStatus()).rejects.toThrow('Database error');
    });
  });

  describe('completeOnboarding', () => {
    it('should complete onboarding successfully', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: null
      });

      await expect(AuthService.completeOnboarding()).resolves.not.toThrow();
      expect(supabase.rpc).toHaveBeenCalledWith('complete_onboarding');
    });

    it('should throw error when RPC fails', async () => {
      const error = new Error('Failed to complete onboarding');
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      await expect(AuthService.completeOnboarding()).rejects.toThrow('Failed to complete onboarding');
    });
  });

  describe('getSession', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'refresh-token',
        user: {
          id: 'user-123',
          email: 'test@maity.com'
        }
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null
      });

      const session = await AuthService.getSession();

      expect(session).toEqual(mockSession);
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    it('should return null when no session exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null
      });

      const session = await AuthService.getSession();

      expect(session).toBeNull();
    });

    it('should return null on auth error', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: new Error('Auth error')
      });

      const session = await AuthService.getSession();

      expect(session).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return user when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@maity.com',
        app_metadata: {},
        user_metadata: {}
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      });

      const user = await AuthService.getUser();

      expect(user).toEqual(mockUser);
      expect(supabase.auth.getUser).toHaveBeenCalled();
    });

    it('should return null when no user found', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null
      });

      const user = await AuthService.getUser();

      expect(user).toBeNull();
    });
  });

  describe('getUserRole', () => {
    it('should return user role', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: 'user',
        error: null
      });

      const role = await AuthService.getUserRole();

      expect(role).toBe('user');
      expect(supabase.rpc).toHaveBeenCalledWith('get_user_role');
    });

    it('should return admin role', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: 'admin',
        error: null
      });

      const role = await AuthService.getUserRole();

      expect(role).toBe('admin');
    });

    it('should return manager role', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: 'manager',
        error: null
      });

      const role = await AuthService.getUserRole();

      expect(role).toBe('manager');
    });

    it('should default to user when no role found', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: null
      });

      const role = await AuthService.getUserRole();

      expect(role).toBe('user');
    });

    it('should throw error when RPC fails', async () => {
      const error = new Error('Database error');
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      await expect(AuthService.getUserRole()).rejects.toThrow('Database error');
    });
  });

  describe('markTourCompleted', () => {
    it('should mark tour as completed successfully', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: null
      });

      await expect(AuthService.markTourCompleted()).resolves.not.toThrow();
      expect(supabase.rpc).toHaveBeenCalledWith('mark_tour_completed');
    });

    it('should throw error when RPC fails', async () => {
      const error = new Error('Failed to mark tour completed');
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      await expect(AuthService.markTourCompleted()).rejects.toThrow('Failed to mark tour completed');
    });
  });
});

describe('buildRedirectTo', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Reset window.location before each test
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      origin: 'http://localhost:8080'
    };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('should build basic redirect URL', () => {
    const url = buildRedirectTo();

    expect(url).toBe('http://localhost:8080/auth/callback');
  });

  it('should include returnTo parameter', () => {
    const url = buildRedirectTo('/dashboard');

    expect(url).toContain('returnTo=%2Fdashboard');
  });

  it('should include companyId parameter', () => {
    const url = buildRedirectTo(null, 'company-123');

    expect(url).toContain('company=company-123');
  });

  it('should include both returnTo and companyId', () => {
    const url = buildRedirectTo('/dashboard', 'company-123');

    expect(url).toContain('returnTo=%2Fdashboard');
    expect(url).toContain('company=company-123');
  });

  it('should sanitize returnTo to same origin only', () => {
    const url = buildRedirectTo('http://localhost:8080/dashboard');

    expect(url).toContain('returnTo=%2Fdashboard');
    expect(url).not.toContain('http://localhost:8080/dashboard');
  });

  it('should reject external URLs in returnTo', () => {
    const url = buildRedirectTo('https://evil.com/steal-data');

    expect(url).not.toContain('evil.com');
    expect(url).not.toContain('returnTo');
  });

  it('should preserve query parameters in returnTo', () => {
    const url = buildRedirectTo('/dashboard?tab=settings&view=profile');

    expect(url).toContain('returnTo=%2Fdashboard%3Ftab%3Dsettings%26view%3Dprofile');
  });

  it('should preserve hash in returnTo', () => {
    const url = buildRedirectTo('/dashboard#section-1');

    expect(url).toContain('%23section-1');
  });

  it('should handle invalid returnTo gracefully', () => {
    const url = buildRedirectTo('not a valid url!!!');

    // Invalid URLs are caught and the function still works
    // but may include the parameter if it can be parsed as a relative path
    expect(url).toContain('http://localhost:8080/auth/callback');
  });

  it('should handle null returnTo', () => {
    const url = buildRedirectTo(null);

    expect(url).toBe('http://localhost:8080/auth/callback');
  });

  it('should handle empty string returnTo', () => {
    const url = buildRedirectTo('');

    expect(url).toBe('http://localhost:8080/auth/callback');
  });

  it('should use current origin in production', () => {
    window.location = {
      ...originalLocation,
      origin: 'https://www.maity.com.mx'
    };

    const url = buildRedirectTo('/dashboard');

    expect(url).toContain('https://www.maity.com.mx/auth/callback');
  });

  it('should not include trailing slash', () => {
    const url = buildRedirectTo();

    expect(url).not.toMatch(/\/$/);
  });
});
