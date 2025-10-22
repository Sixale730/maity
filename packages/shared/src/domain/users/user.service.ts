import { supabase } from '../../api/client/supabase';
import type { UserManagement, UserStatusType, UserOperationResponse } from './user.types';
import type { UserRole } from '../auth/auth.types';

/**
 * Service for managing users in the Maity platform
 * Provides CRUD operations for user administration
 * Access controlled by role: admins see all users, managers see their company's users
 */
export class UserService {
  /**
   * Get all users for management
   * Admins see all users, managers see only users from their company
   * @returns Promise with array of users
   */
  static async getUsers(): Promise<UserManagement[]> {
    const { data, error } = await supabase.rpc('get_users_for_management');

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return (data || []) as UserManagement[];
  }

  /**
   * Update user role
   * Admins can assign any role, managers can only assign user/manager within their company
   * @param userId - User UUID
   * @param newRole - New role to assign (admin, manager, user)
   * @returns Promise with operation result
   */
  static async updateRole(userId: string, newRole: UserRole): Promise<UserOperationResponse> {
    const { data, error } = await supabase.rpc('update_user_role', {
      p_user_id: userId,
      p_new_role: newRole
    });

    if (error) {
      console.error('Error updating user role:', error);
      throw error;
    }

    return data as UserOperationResponse;
  }

  /**
   * Update user company assignment
   * Only admins can use this function
   * @param userId - User UUID
   * @param companyId - Company UUID (null to unassign)
   * @returns Promise with operation result
   */
  static async updateCompany(
    userId: string,
    companyId: string | null
  ): Promise<UserOperationResponse> {
    const { data, error } = await supabase.rpc('update_user_company', {
      p_user_id: userId,
      p_company_id: companyId
    });

    if (error) {
      console.error('Error updating user company:', error);
      throw error;
    }

    return data as UserOperationResponse;
  }

  /**
   * Update user status (activate/deactivate)
   * Admins and managers can update status
   * Managers can only update users in their company
   * @param userId - User UUID
   * @param status - New status (ACTIVE, INACTIVE, PENDING)
   * @returns Promise with operation result
   */
  static async updateStatus(userId: string, status: UserStatusType): Promise<UserOperationResponse> {
    const { data, error } = await supabase.rpc('update_user_status', {
      p_user_id: userId,
      p_status: status
    });

    if (error) {
      console.error('Error updating user status:', error);
      throw error;
    }

    return data as UserOperationResponse;
  }

  /**
   * Get deletion impact for a user
   * Shows count of all related records that will be deleted
   * @param userId - User UUID
   * @returns Promise with deletion impact analysis
   */
  static async getDeletionImpact(userId: string): Promise<UserDeletionImpact> {
    const { data, error } = await supabase.rpc('get_user_deletion_impact', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error getting deletion impact:', error);
      throw error;
    }

    return data as UserDeletionImpact;
  }

  /**
   * Delete user
   * Only admins can delete users
   * Cascades to all related records (sessions, evaluations, etc.)
   * Prevents self-deletion and last admin deletion
   * @param userId - User UUID
   * @returns Promise with operation result
   */
  static async deleteUser(userId: string): Promise<UserOperationResponse> {
    const { data, error } = await supabase.rpc('delete_user', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }

    return data as UserOperationResponse;
  }
}
