/**
 * Analytics Service
 * Service for fetching admin analytics and statistics
 */

import { supabase } from '@maity/shared';
import type {
  AnalyticsDashboardData,
  AnalyticsFilters,
  SessionListItem,
  SessionsByCompanyUserData,
} from './analytics.types';

export class AnalyticsService {
  /**
   * Get complete analytics dashboard data
   * Only accessible by admins
   */
  static async getDashboardData(
    filters?: AnalyticsFilters
  ): Promise<AnalyticsDashboardData> {
    const { data, error } = await supabase.rpc('get_analytics_dashboard', {
      p_company_id: filters?.companyId || null,
      p_type: filters?.type || 'all',
      p_start_date: filters?.startDate || null,
      p_end_date: filters?.endDate || null,
      p_profile_id: filters?.profileId || null,
      p_scenario_id: filters?.scenarioId || null,
    });

    if (error) {
      console.error('Error fetching analytics dashboard:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get paginated list of sessions with filters
   * Only accessible by admins
   */
  static async getSessionsList(
    filters?: AnalyticsFilters,
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ sessions: SessionListItem[]; total: number }> {
    const { data, error } = await supabase.rpc('get_analytics_sessions_list', {
      p_company_id: filters?.companyId || null,
      p_type: filters?.type || 'all',
      p_start_date: filters?.startDate || null,
      p_end_date: filters?.endDate || null,
      p_profile_id: filters?.profileId || null,
      p_scenario_id: filters?.scenarioId || null,
      p_page: page,
      p_page_size: pageSize,
    });

    if (error) {
      console.error('Error fetching sessions list:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get all companies for filter dropdown
   */
  static async getCompaniesForFilter(): Promise<
    Array<{ id: string; name: string }>
  > {
    const { data, error } = await supabase
      .schema('maity')
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get all profiles for filter dropdown
   */
  static async getProfilesForFilter(): Promise<
    Array<{ id: string; name: string }>
  > {
    const { data, error } = await supabase
      .schema('maity')
      .from('voice_agent_profiles')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get all scenarios for filter dropdown
   */
  static async getScenariosForFilter(): Promise<
    Array<{ id: string; name: string }>
  > {
    const { data, error } = await supabase
      .schema('maity')
      .from('voice_scenarios')
      .select('id, name')
      .eq('is_active', true)
      .order('order_index');

    if (error) {
      console.error('Error fetching scenarios:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get detailed sessions organized by company and user
   * Only accessible by admins
   */
  static async getSessionsByCompanyUser(
    companyId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<SessionsByCompanyUserData> {
    const { data, error } = await supabase.rpc('get_sessions_by_company_user', {
      p_company_id: companyId || null,
      p_start_date: startDate || null,
      p_end_date: endDate || null,
    });

    if (error) {
      console.error('Error fetching sessions by company user:', error);
      throw error;
    }

    return data;
  }
}
