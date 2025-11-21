/**
 * Agent Configuration Hooks
 *
 * React Query hooks for managing voice agent profiles and scenarios.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AgentConfigService } from '../agent-config.service';
import type {
  VoiceAgentProfile,
  VoiceScenario,
  CreateVoiceAgentProfileRequest,
  UpdateVoiceAgentProfileRequest,
  CreateVoiceScenarioRequest,
  UpdateVoiceScenarioRequest,
} from '../agent-config.types';

// =====================================================================
// QUERY KEYS
// =====================================================================

export const agentConfigKeys = {
  all: ['agent-config'] as const,
  profiles: () => [...agentConfigKeys.all, 'profiles'] as const,
  profile: (id: string) => [...agentConfigKeys.profiles(), id] as const,
  scenarios: () => [...agentConfigKeys.all, 'scenarios'] as const,
  scenario: (id: string) => [...agentConfigKeys.scenarios(), id] as const,
};

// =====================================================================
// VOICE AGENT PROFILES HOOKS
// =====================================================================

/**
 * Fetch all voice agent profiles (including inactive) for admin
 */
export function useAllProfiles() {
  return useQuery({
    queryKey: agentConfigKeys.profiles(),
    queryFn: () => AgentConfigService.getAllProfiles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get a specific profile by ID from cached data
 */
export function useProfile(profileId: string | null) {
  const { data: profiles } = useAllProfiles();

  if (!profileId || !profiles) return null;

  return profiles.find((p) => p.id === profileId) || null;
}

/**
 * Create a new voice agent profile
 */
export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: CreateVoiceAgentProfileRequest) =>
      AgentConfigService.createProfile(profile),
    onSuccess: () => {
      // Invalidate profiles query to refetch
      queryClient.invalidateQueries({ queryKey: agentConfigKeys.profiles() });
    },
  });
}

/**
 * Update an existing voice agent profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: UpdateVoiceAgentProfileRequest) =>
      AgentConfigService.updateProfile(profile),
    onSuccess: () => {
      // Invalidate profiles query to refetch
      queryClient.invalidateQueries({ queryKey: agentConfigKeys.profiles() });
    },
  });
}

/**
 * Toggle the active status of a voice agent profile
 */
export function useToggleProfileActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: string) => AgentConfigService.toggleProfileActive(profileId),
    onSuccess: () => {
      // Invalidate profiles query to refetch
      queryClient.invalidateQueries({ queryKey: agentConfigKeys.profiles() });
    },
  });
}

// =====================================================================
// VOICE SCENARIOS HOOKS
// =====================================================================

/**
 * Fetch all voice scenarios (including inactive) for admin
 */
export function useAllScenarios() {
  return useQuery({
    queryKey: agentConfigKeys.scenarios(),
    queryFn: () => AgentConfigService.getAllScenarios(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get a specific scenario by ID from cached data
 */
export function useScenario(scenarioId: string | null) {
  const { data: scenarios } = useAllScenarios();

  if (!scenarioId || !scenarios) return null;

  return scenarios.find((s) => s.id === scenarioId) || null;
}

/**
 * Create a new voice scenario
 */
export function useCreateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scenario: CreateVoiceScenarioRequest) =>
      AgentConfigService.createScenario(scenario),
    onSuccess: () => {
      // Invalidate scenarios query to refetch
      queryClient.invalidateQueries({ queryKey: agentConfigKeys.scenarios() });
    },
  });
}

/**
 * Update an existing voice scenario
 */
export function useUpdateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scenario: UpdateVoiceScenarioRequest) =>
      AgentConfigService.updateScenario(scenario),
    onSuccess: () => {
      // Invalidate scenarios query to refetch
      queryClient.invalidateQueries({ queryKey: agentConfigKeys.scenarios() });
    },
  });
}

/**
 * Toggle the active status of a voice scenario
 */
export function useToggleScenarioActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scenarioId: string) => AgentConfigService.toggleScenarioActive(scenarioId),
    onSuccess: () => {
      // Invalidate scenarios query to refetch
      queryClient.invalidateQueries({ queryKey: agentConfigKeys.scenarios() });
    },
  });
}
