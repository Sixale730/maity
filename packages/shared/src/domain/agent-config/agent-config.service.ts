/**
 * Agent Configuration Service
 *
 * Business logic for managing voice agent profiles and scenarios.
 * Admin-only CRUD operations.
 */

import { supabase } from '../../api/client/supabase';
import type {
  VoiceAgentProfile,
  VoiceScenario,
  CreateVoiceAgentProfileRequest,
  UpdateVoiceAgentProfileRequest,
  CreateVoiceScenarioRequest,
  UpdateVoiceScenarioRequest,
} from './agent-config.types';

// =====================================================================
// VOICE AGENT PROFILES
// =====================================================================

export class AgentConfigService {
  /**
   * Get all voice agent profiles (including inactive) for admin
   * @throws Error if user is not an admin
   */
  static async getAllProfiles(): Promise<VoiceAgentProfile[]> {
    const { data, error } = await supabase.rpc('get_all_voice_agent_profiles_admin');

    if (error) {
      console.error('Error fetching all profiles:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Create a new voice agent profile
   * @param profile Profile data
   * @returns UUID of the created profile
   * @throws Error if user is not an admin or creation fails
   */
  static async createProfile(profile: CreateVoiceAgentProfileRequest): Promise<string> {
    const { data, error } = await supabase.rpc('create_voice_agent_profile', {
      p_name: profile.name,
      p_description: profile.description,
      p_key_focus: profile.key_focus,
      p_communication_style: profile.communication_style,
      p_personality_traits: profile.personality_traits,
      p_area: profile.area,
      p_impact: profile.impact,
    });

    if (error) {
      console.error('Error creating profile:', error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Update an existing voice agent profile
   * @param profile Profile data with ID
   * @returns UUID of the updated profile
   * @throws Error if user is not an admin or update fails
   */
  static async updateProfile(profile: UpdateVoiceAgentProfileRequest): Promise<string> {
    const { data, error } = await supabase.rpc('update_voice_agent_profile', {
      p_id: profile.id,
      p_name: profile.name,
      p_description: profile.description,
      p_key_focus: profile.key_focus,
      p_communication_style: profile.communication_style,
      p_personality_traits: profile.personality_traits,
      p_area: profile.area,
      p_impact: profile.impact,
      p_is_active: profile.is_active,
    });

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Toggle the active status of a voice agent profile (soft delete)
   * @param profileId Profile UUID
   * @returns New active status
   * @throws Error if user is not an admin or toggle fails
   */
  static async toggleProfileActive(profileId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('toggle_voice_agent_profile_active', {
      p_id: profileId,
    });

    if (error) {
      console.error('Error toggling profile active status:', error);
      throw new Error(error.message);
    }

    return data;
  }

  // =====================================================================
  // VOICE SCENARIOS
  // =====================================================================

  /**
   * Get all voice scenarios (including inactive) for admin
   * @throws Error if user is not an admin
   */
  static async getAllScenarios(): Promise<VoiceScenario[]> {
    const { data, error } = await supabase.rpc('get_all_voice_scenarios_admin');

    if (error) {
      console.error('Error fetching all scenarios:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Create a new voice scenario
   * @param scenario Scenario data
   * @returns UUID of the created scenario
   * @throws Error if user is not an admin or creation fails
   */
  static async createScenario(scenario: CreateVoiceScenarioRequest): Promise<string> {
    const { data, error } = await supabase.rpc('create_voice_scenario', {
      p_name: scenario.name,
      p_code: scenario.code,
      p_order_index: scenario.order_index,
      p_context: scenario.context,
      p_objectives: scenario.objectives,
      p_skill: scenario.skill,
      p_instructions: scenario.instructions,
      p_rules: scenario.rules,
      p_closing: scenario.closing,
      p_estimated_duration: scenario.estimated_duration,
      p_category: scenario.category,
      p_agent_id: scenario.agent_id || null,
    });

    if (error) {
      console.error('Error creating scenario:', error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Update an existing voice scenario
   * @param scenario Scenario data with ID
   * @returns UUID of the updated scenario
   * @throws Error if user is not an admin or update fails
   */
  static async updateScenario(scenario: UpdateVoiceScenarioRequest): Promise<string> {
    const { data, error } = await supabase.rpc('update_voice_scenario', {
      p_id: scenario.id,
      p_name: scenario.name,
      p_code: scenario.code,
      p_order_index: scenario.order_index,
      p_context: scenario.context,
      p_objectives: scenario.objectives,
      p_skill: scenario.skill,
      p_instructions: scenario.instructions,
      p_rules: scenario.rules,
      p_closing: scenario.closing,
      p_estimated_duration: scenario.estimated_duration,
      p_category: scenario.category,
      p_agent_id: scenario.agent_id,
      p_is_active: scenario.is_active,
    });

    if (error) {
      console.error('Error updating scenario:', error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Toggle the active status of a voice scenario (soft delete)
   * @param scenarioId Scenario UUID
   * @returns New active status
   * @throws Error if user is not an admin or toggle fails
   */
  static async toggleScenarioActive(scenarioId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('toggle_voice_scenario_active', {
      p_id: scenarioId,
    });

    if (error) {
      console.error('Error toggling scenario active status:', error);
      throw new Error(error.message);
    }

    return data;
  }
}
