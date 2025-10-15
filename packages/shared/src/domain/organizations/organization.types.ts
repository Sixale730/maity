/**
 * Represents a company/organization in the Maity platform
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Represents a user who belongs to an organization
 */
export interface OrganizationMember {
  id: string;
  auth_id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'manager' | 'user';
  company_id: string;
  created_at: string;
}

/**
 * Data required to create or handle an invitation
 */
export interface InviteData {
  company_slug: string;
  user_email?: string;
  invitation_action?: 'accept' | 'reject';
}

/**
 * Result of handling a company invitation
 */
export interface InvitationResult {
  success: boolean;
  message?: string;
  company_id?: string;
  company_name?: string;
}

/**
 * Result of provisioning a user
 */
export interface ProvisionResult {
  success: boolean;
  user_id?: string;
  message?: string;
}

/**
 * Data for creating a new organization
 */
export interface CreateOrganizationData {
  name: string;
  slug: string;
}

/**
 * Data for updating an organization
 */
export interface UpdateOrganizationData {
  name?: string;
  slug?: string;
}
