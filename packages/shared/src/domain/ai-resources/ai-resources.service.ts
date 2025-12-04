import { supabase } from '../../api/client/supabase';

export interface AIResource {
  id: string;
  title: string;
  description: string | null;
  url: string;
  icon: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateResourceInput {
  title: string;
  description: string;
  url: string;
  icon?: string;
  color?: string;
}

export class AIResourcesService {
  /**
   * Get all AI resources
   * Admins see all resources (including inactive), others see only active
   */
  static async getAllResources(): Promise<AIResource[]> {
    const { data, error } = await supabase.rpc('get_all_ai_resources');
    if (error) {
      console.error('Error fetching AI resources:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Create a new AI resource (admin only)
   */
  static async createResource(resource: CreateResourceInput): Promise<AIResource> {
    const { data, error } = await supabase.rpc('create_ai_resource', {
      p_title: resource.title,
      p_description: resource.description,
      p_url: resource.url,
      p_icon: resource.icon || 'brain',
      p_color: resource.color || 'purple'
    });
    if (error) {
      console.error('Error creating AI resource:', error);
      throw error;
    }
    return data;
  }

  /**
   * Toggle resource active status (soft delete/restore) - admin only
   */
  static async toggleResourceActive(id: string): Promise<AIResource> {
    const { data, error } = await supabase.rpc('toggle_ai_resource_active', {
      p_id: id
    });
    if (error) {
      console.error('Error toggling AI resource:', error);
      throw error;
    }
    return data;
  }
}
