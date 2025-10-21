/**
 * AutojoinService Tests
 *
 * Tests the autojoin service that handles domain-based automatic
 * organization assignment for users.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AutojoinService } from '../autojoin.service';
import { supabase } from '../../../api/client/supabase';

// Mock the supabase client
vi.mock('../../../api/client/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  }
}));

describe('AutojoinService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('tryAutojoinByDomain', () => {
    it('should successfully autojoin user to company when domain matches', async () => {
      const mockResult = {
        success: true,
        company_id: 'company-uuid-123',
        company_name: 'ACME Corp',
        company_slug: 'acme',
        role_assigned: 'user',
        method: 'autojoin',
        domain: 'acme.com'
      };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockResult,
        error: null
      });

      const result = await AutojoinService.tryAutojoinByDomain('john@acme.com');

      expect(result.success).toBe(true);
      expect(result.company_id).toBe('company-uuid-123');
      expect(result.company_name).toBe('ACME Corp');
      expect(result.role_assigned).toBe('user');
      expect(result.method).toBe('autojoin');
      expect(supabase.rpc).toHaveBeenCalledWith('try_autojoin_by_domain', {
        p_email: 'john@acme.com'
      });
    });

    it('should fail when user already has a company', async () => {
      const mockResult = {
        success: false,
        error: 'USER_ALREADY_HAS_COMPANY',
        message: 'User already belongs to a company',
        company_id: 'existing-company-uuid'
      };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockResult,
        error: null
      });

      const result = await AutojoinService.tryAutojoinByDomain('john@acme.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('USER_ALREADY_HAS_COMPANY');
    });

    it('should fail when no matching domain found', async () => {
      const mockResult = {
        success: false,
        error: 'NO_MATCHING_DOMAIN',
        message: 'No company found with autojoin enabled for domain: unknown.com'
      };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockResult,
        error: null
      });

      const result = await AutojoinService.tryAutojoinByDomain('user@unknown.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('NO_MATCHING_DOMAIN');
    });

    it('should handle RPC errors gracefully', async () => {
      const error = new Error('Database connection failed');

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      const result = await AutojoinService.tryAutojoinByDomain('john@acme.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('RPC_ERROR');
      expect(result.message).toBe('Database connection failed');
    });

    it('should log errors to console when RPC fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test RPC error');

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      await AutojoinService.tryAutojoinByDomain('john@acme.com');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[AutojoinService] RPC error:', error);

      consoleErrorSpy.mockRestore();
    });

    it('should handle unexpected exceptions', async () => {
      vi.mocked(supabase.rpc).mockRejectedValueOnce(new Error('Unexpected error'));

      const result = await AutojoinService.tryAutojoinByDomain('john@acme.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('UNEXPECTED_ERROR');
    });
  });

  describe('extractDomain', () => {
    it('should extract domain from valid email', () => {
      expect(AutojoinService.extractDomain('john@acme.com')).toBe('acme.com');
      expect(AutojoinService.extractDomain('jane.doe@example.org')).toBe('example.org');
      expect(AutojoinService.extractDomain('admin@subdomain.company.io')).toBe('subdomain.company.io');
    });

    it('should handle uppercase emails', () => {
      expect(AutojoinService.extractDomain('John@ACME.COM')).toBe('acme.com');
      expect(AutojoinService.extractDomain('ADMIN@Example.ORG')).toBe('example.org');
    });

    it('should return null for invalid emails', () => {
      expect(AutojoinService.extractDomain('')).toBe(null);
      expect(AutojoinService.extractDomain('notanemail')).toBe(null);
      expect(AutojoinService.extractDomain('user@')).toBe(null);
      expect(AutojoinService.extractDomain('@domain.com')).toBe('domain.com'); // Valid - no user part
    });

    it('should handle null and undefined inputs', () => {
      expect(AutojoinService.extractDomain(null as any)).toBe(null);
      expect(AutojoinService.extractDomain(undefined as any)).toBe(null);
    });

    it('should handle multiple @ symbols (take last one)', () => {
      expect(AutojoinService.extractDomain('user@old@new.com')).toBe('new.com');
    });
  });

  describe('isSuccessful', () => {
    it('should return true for successful autojoin', () => {
      const result = {
        success: true,
        company_id: 'company-123',
        company_name: 'ACME'
      };

      expect(AutojoinService.isSuccessful(result)).toBe(true);
    });

    it('should return false when success is false', () => {
      const result = {
        success: false,
        error: 'NO_MATCHING_DOMAIN'
      };

      expect(AutojoinService.isSuccessful(result)).toBe(false);
    });

    it('should return false when company_id is missing', () => {
      const result = {
        success: true,
        company_id: undefined
      };

      expect(AutojoinService.isSuccessful(result)).toBe(false);
    });
  });

  describe('userAlreadyHasCompany', () => {
    it('should return true when error is USER_ALREADY_HAS_COMPANY', () => {
      const result = {
        success: false,
        error: 'USER_ALREADY_HAS_COMPANY'
      };

      expect(AutojoinService.userAlreadyHasCompany(result)).toBe(true);
    });

    it('should return false for other errors', () => {
      const result1 = {
        success: false,
        error: 'NO_MATCHING_DOMAIN'
      };

      const result2 = {
        success: true,
        company_id: 'company-123'
      };

      expect(AutojoinService.userAlreadyHasCompany(result1)).toBe(false);
      expect(AutojoinService.userAlreadyHasCompany(result2)).toBe(false);
    });
  });

  describe('noMatchingDomain', () => {
    it('should return true when error is NO_MATCHING_DOMAIN', () => {
      const result = {
        success: false,
        error: 'NO_MATCHING_DOMAIN'
      };

      expect(AutojoinService.noMatchingDomain(result)).toBe(true);
    });

    it('should return false for other errors', () => {
      const result1 = {
        success: false,
        error: 'USER_ALREADY_HAS_COMPANY'
      };

      const result2 = {
        success: true,
        company_id: 'company-123'
      };

      expect(AutojoinService.noMatchingDomain(result1)).toBe(false);
      expect(AutojoinService.noMatchingDomain(result2)).toBe(false);
    });
  });
});
