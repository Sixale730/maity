import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './user.service';
import { supabase } from '../../api/client/supabase';
import type { UserManagement, UserOperationResponse } from './user.types';

// Mock Supabase client
vi.mock('../../api/client/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should fetch and return users successfully', async () => {
      const mockUsers: UserManagement[] = [
        {
          id: '123',
          auth_id: 'auth-123',
          name: 'John Doe',
          email: 'john@test.com',
          company_id: 'company-1',
          company_name: 'Test Company',
          role: 'user',
          status: 'ACTIVE',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          registration_form_completed: true,
        },
        {
          id: '456',
          auth_id: 'auth-456',
          name: 'Jane Smith',
          email: 'jane@test.com',
          company_id: 'company-1',
          company_name: 'Test Company',
          role: 'manager',
          status: 'ACTIVE',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          registration_form_completed: true,
        },
      ];

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockUsers,
        error: null,
      } as any);

      const result = await UserService.getUsers();

      expect(supabase.rpc).toHaveBeenCalledWith('get_users_for_management');
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: null,
      } as any);

      const result = await UserService.getUsers();

      expect(result).toEqual([]);
    });

    it('should throw error when RPC fails', async () => {
      const mockError = { message: 'Database error' };
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: mockError,
      } as any);

      await expect(UserService.getUsers()).rejects.toEqual(mockError);
    });
  });

  describe('updateRole', () => {
    it('should update user role successfully', async () => {
      const mockResponse: UserOperationResponse = {
        success: true,
        user_id: '123',
        new_role: 'manager',
      };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      } as any);

      const result = await UserService.updateRole('123', 'manager');

      expect(supabase.rpc).toHaveBeenCalledWith('update_user_role', {
        p_user_id: '123',
        p_new_role: 'manager',
      });
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.new_role).toBe('manager');
    });

    it('should handle unauthorized error when updating role', async () => {
      const mockResponse: UserOperationResponse = {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Only admins and managers can update user roles',
      };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      } as any);

      const result = await UserService.updateRole('123', 'admin');

      expect(result.success).toBe(false);
      expect(result.error).toBe('UNAUTHORIZED');
    });

    it('should throw error when RPC fails', async () => {
      const mockError = { message: 'Database error' };
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: mockError,
      } as any);

      await expect(UserService.updateRole('123', 'manager')).rejects.toEqual(mockError);
    });
  });

  describe('updateCompany', () => {
    it('should update user company successfully', async () => {
      const mockResponse: UserOperationResponse = {
        success: true,
        user_id: '123',
        company_id: 'company-2',
      };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      } as any);

      const result = await UserService.updateCompany('123', 'company-2');

      expect(supabase.rpc).toHaveBeenCalledWith('update_user_company', {
        p_user_id: '123',
        p_company_id: 'company-2',
      });
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.company_id).toBe('company-2');
    });

    it('should unassign user from company when null', async () => {
      const mockResponse: UserOperationResponse = {
        success: true,
        user_id: '123',
        company_id: null,
      };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      } as any);

      const result = await UserService.updateCompany('123', null);

      expect(supabase.rpc).toHaveBeenCalledWith('update_user_company', {
        p_user_id: '123',
        p_company_id: null,
      });
      expect(result.success).toBe(true);
      expect(result.company_id).toBeNull();
    });

    it('should handle unauthorized error (non-admin)', async () => {
      const mockResponse: UserOperationResponse = {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Only admins can change user company assignments',
      };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      } as any);

      const result = await UserService.updateCompany('123', 'company-2');

      expect(result.success).toBe(false);
      expect(result.error).toBe('UNAUTHORIZED');
    });
  });

  describe('updateStatus', () => {
    it('should activate user successfully', async () => {
      const mockResponse: UserOperationResponse = {
        success: true,
        user_id: '123',
        status: 'ACTIVE',
      };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      } as any);

      const result = await UserService.updateStatus('123', 'ACTIVE');

      expect(supabase.rpc).toHaveBeenCalledWith('update_user_status', {
        p_user_id: '123',
        p_status: 'ACTIVE',
      });
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.status).toBe('ACTIVE');
    });

    it('should deactivate user successfully', async () => {
      const mockResponse: UserOperationResponse = {
        success: true,
        user_id: '123',
        status: 'INACTIVE',
      };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      } as any);

      const result = await UserService.updateStatus('123', 'INACTIVE');

      expect(result.success).toBe(true);
      expect(result.status).toBe('INACTIVE');
    });

    it('should handle invalid status error', async () => {
      const mockResponse: UserOperationResponse = {
        success: false,
        error: 'INVALID_STATUS',
        message: 'Status must be ACTIVE, INACTIVE, or PENDING',
      };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      } as any);

      const result = await UserService.updateStatus('123', 'INVALID' as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_STATUS');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockResponse: UserOperationResponse = {
        success: true,
        user_id: '123',
        deleted: true,
      };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      } as any);

      const result = await UserService.deleteUser('123');

      expect(supabase.rpc).toHaveBeenCalledWith('delete_user', {
        p_user_id: '123',
      });
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.deleted).toBe(true);
    });

    it('should handle user not found error', async () => {
      const mockResponse: UserOperationResponse = {
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      } as any);

      const result = await UserService.deleteUser('999');

      expect(result.success).toBe(false);
      expect(result.error).toBe('USER_NOT_FOUND');
    });

    it('should handle unauthorized error (non-admin)', async () => {
      const mockResponse: UserOperationResponse = {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Only admins can delete users',
      };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      } as any);

      const result = await UserService.deleteUser('123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('UNAUTHORIZED');
    });

    it('should throw error when RPC fails', async () => {
      const mockError = { message: 'Database error' };
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: mockError,
      } as any);

      await expect(UserService.deleteUser('123')).rejects.toEqual(mockError);
    });
  });
});
