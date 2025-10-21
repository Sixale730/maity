import { supabase } from '../../api/client/supabase';

/**
 * Type for organization/company update data
 */
export interface CompanyUpdate {
  name?: string;
  slug?: string;
  domain?: string;
  auto_join_enabled?: boolean;
}

/**
 * Service for managing organizations/companies in the Maity platform
 * Encapsulates business logic for CRUD operations and company-user relationships
 */
export class OrganizationService {
  /**
   * Get all organizations/companies
   * @returns Promise with array of organizations
   */
  static async getAll(): Promise<unknown[] | null> {
    const { data, error } = await supabase
      .schema('maity')
      .from('companies')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get organization by ID
   * @param id - Organization UUID
   * @returns Promise with organization data
   */
  static async getById(id: string): Promise<unknown> {
    const { data, error } = await supabase
      .schema('maity')
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get company ID for a given user auth ID
   * Uses the get_user_company_id RPC function
   * @param userAuthId - User's auth UUID
   * @returns Promise with company UUID
   */
  static async getUserCompanyId(userAuthId: string): Promise<string | null> {
    const { data, error } = await supabase.rpc('get_user_company_id', {
      user_auth_id: userAuthId
    });

    if (error) {
      console.error('Error getting user company ID:', error);
      return null;
    }

    return data;
  }

  /**
   * Provision a user (create user record in maity.users if doesn't exist)
   * Uses the provision_user RPC function
   * @returns Promise with provision result
   */
  static async provisionUser(): Promise<unknown> {
    const { data, error } = await supabase.rpc('provision_user');

    if (error) {
      console.error('Error provisioning user:', error);
      throw error;
    }

    return data;
  }

  /**
   * Handle company invitation for a user
   * Associates user with a company based on invitation
   * Uses the handle_company_invitation RPC function
   * @param userAuthId - User's auth UUID
   * @param companySlug - Company identifier/slug
   * @param action - Action to take ('accept' or 'reject')
   * @returns Promise with invitation handling result
   */
  static async handleInvitation(
    userAuthId: string,
    companySlug: string,
    action: 'accept' | 'reject'
  ): Promise<unknown> {
    const { data, error } = await supabase.rpc('handle_company_invitation', {
      user_auth_id: userAuthId,
      company_slug: companySlug,
      invitation_action: action
    });

    if (error) {
      console.error('Error handling company invitation:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get all users belonging to an organization
   * @param companyId - Company UUID
   * @returns Promise with array of company users
   */
  static async getUsers(companyId: string): Promise<unknown[] | null> {
    const { data, error } = await supabase
      .schema('maity')
      .from('users')
      .select('id, auth_id, email, name, role, created_at')
      .eq('company_id', companyId);

    if (error) {
      console.error('Error fetching company users:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create a new organization
   * @param name - Organization name
   * @param slug - Organization slug/identifier
   * @returns Promise with created organization
   */
  static async create(name: string, slug: string): Promise<unknown> {
    const { data, error } = await supabase
      .schema('maity')
      .from('companies')
      .insert({ name, slug })
      .select()
      .single();

    if (error) {
      console.error('Error creating organization:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update an organization
   * @param id - Organization UUID
   * @param updates - Fields to update
   * @returns Promise with updated organization
   */
  static async update(id: string, updates: CompanyUpdate): Promise<unknown> {
    const { data, error } = await supabase
      .schema('maity')
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating organization:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete an organization
   * @param id - Organization UUID
   * @returns Promise with delete result
   */
  static async delete(id: string): Promise<{ success: boolean }> {
    const { error } = await supabase
      .schema('maity')
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }

    return { success: true };
  }

  /**
   * Remove a user from an organization
   * @param userId - User UUID (from maity.users table)
   * @returns Promise with removal result
   */
  static async removeUser(userId: string): Promise<{ success: boolean }> {
    const { error } = await supabase
      .schema('maity')
      .from('users')
      .update({ company_id: null })
      .eq('id', userId);

    if (error) {
      console.error('Error removing user from organization:', error);
      throw error;
    }

    return { success: true };
  }

  /**
   * Get all companies with their invite tokens
   * Uses the get_companies_with_invite_tokens RPC function
   * @returns Promise with array of companies including invite tokens
   */
  static async getWithInviteTokens(): Promise<unknown[]> {
    const { data, error } = await supabase.rpc('get_companies_with_invite_tokens');

    if (error) {
      console.error('Error fetching companies with invite tokens:', error);
      throw error;
    }

    return data ?? [];
  }

  /**
   * Create a new company with invite tokens
   * Uses the create_company RPC function
   * @param companyName - Name of the company to create
   * @param domain - Optional domain for autojoin (e.g., "acme.com")
   * @param autoJoinEnabled - Whether autojoin is enabled for the domain
   * @returns Promise with created company data
   */
  static async createCompany(
    companyName: string,
    domain?: string | null,
    autoJoinEnabled?: boolean
  ): Promise<unknown> {
    const { data, error } = await supabase.rpc('create_company', {
      p_company_name: companyName,
      p_domain: domain || null,
      p_auto_join_enabled: autoJoinEnabled || false
    });

    if (error) {
      console.error('Error creating company:', error);
      throw error;
    }

    if (!data || !data[0]) {
      throw new Error('No se pudo crear la empresa');
    }

    return data[0];
  }

  /**
   * Delete a company
   * Uses the delete_company RPC function
   * @param companyId - UUID of the company to delete
   * @returns Promise with deletion result
   */
  static async deleteCompany(companyId: string): Promise<{ success: boolean }> {
    const { error } = await supabase.rpc('delete_company', {
      company_id: companyId
    });

    if (error) {
      console.error('Error deleting company:', error);
      throw error;
    }

    return { success: true };
  }
}
