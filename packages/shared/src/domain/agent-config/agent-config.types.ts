/**
 * Agent Configuration Types
 *
 * Types for managing voice agent profiles and scenarios.
 * Used by the admin agent configuration interface.
 */

import { z } from 'zod';

// =====================================================================
// VOICE AGENT PROFILE TYPES
// =====================================================================

export interface VoiceAgentProfile {
  id: string;
  name: string;
  description: string;
  key_focus: string;
  communication_style: string;
  personality_traits: Record<string, unknown>;
  area: string;
  impact: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateVoiceAgentProfileRequest {
  name: string;
  description: string;
  key_focus: string;
  communication_style: string;
  personality_traits: Record<string, unknown>;
  area: string;
  impact: string;
}

export interface UpdateVoiceAgentProfileRequest {
  id: string;
  name: string;
  description: string;
  key_focus: string;
  communication_style: string;
  personality_traits: Record<string, unknown>;
  area: string;
  impact: string;
  is_active: boolean;
}

// =====================================================================
// VOICE SCENARIO TYPES
// =====================================================================

export interface VoiceScenario {
  id: string;
  name: string;
  code: string;
  order_index: number;
  context: string;
  objectives: string[] | Record<string, unknown>;
  skill: string;
  instructions: string;
  rules: string;
  closing: string;
  estimated_duration: number;
  category: string;
  agent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateVoiceScenarioRequest {
  name: string;
  code: string;
  order_index: number;
  context: string;
  objectives: string[] | Record<string, unknown>;
  skill: string;
  instructions: string;
  rules: string;
  closing: string;
  estimated_duration: number;
  category: string;
  agent_id?: string | null;
}

export interface UpdateVoiceScenarioRequest {
  id: string;
  name: string;
  code: string;
  order_index: number;
  context: string;
  objectives: string[] | Record<string, unknown>;
  skill: string;
  instructions: string;
  rules: string;
  closing: string;
  estimated_duration: number;
  category: string;
  agent_id: string | null;
  is_active: boolean;
}

// =====================================================================
// ZOD VALIDATION SCHEMAS
// =====================================================================

export const VoiceAgentProfileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es demasiado largo'),
  description: z.string().min(1, 'La descripción es requerida'),
  key_focus: z.string().min(1, 'El enfoque clave es requerido'),
  communication_style: z.string().min(1, 'El estilo de comunicación es requerido'),
  personality_traits: z.record(z.unknown()),
  area: z.string().min(1, 'El área es requerida').max(50, 'El área es demasiado larga'),
  impact: z.string().min(1, 'El impacto es requerido').max(100, 'El impacto es demasiado largo'),
});

export const UpdateVoiceAgentProfileSchema = VoiceAgentProfileSchema.extend({
  id: z.string().uuid('ID inválido'),
  is_active: z.boolean(),
});

export const VoiceScenarioSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es demasiado largo'),
  code: z.string().min(1, 'El código es requerido').max(50, 'El código es demasiado largo').regex(/^[a-z0-9_]+$/, 'El código debe ser snake_case (solo letras minúsculas, números y guiones bajos)'),
  order_index: z.number().int().min(1, 'El orden debe ser mayor a 0'),
  context: z.string().min(1, 'El contexto es requerido'),
  objectives: z.union([z.array(z.string()), z.record(z.unknown())]),
  skill: z.string().min(1, 'La habilidad es requerida').max(100, 'La habilidad es demasiado larga'),
  instructions: z.string().min(1, 'Las instrucciones son requeridas'),
  rules: z.string().min(1, 'Las reglas son requeridas'),
  closing: z.string().min(1, 'El cierre es requerido'),
  estimated_duration: z.number().int().min(60, 'La duración mínima es 60 segundos'),
  category: z.string().min(1, 'La categoría es requerida').max(50, 'La categoría es demasiado larga'),
  agent_id: z.string().regex(/^agent_[a-z0-9]+$/, 'El Agent ID debe empezar con "agent_" seguido de caracteres alfanuméricos en minúsculas').optional().nullable(),
});

export const UpdateVoiceScenarioSchema = VoiceScenarioSchema.extend({
  id: z.string().uuid('ID inválido'),
  agent_id: z.string().regex(/^agent_[a-z0-9]+$/, 'El Agent ID debe empezar con "agent_" seguido de caracteres alfanuméricos en minúsculas').nullable(),
  is_active: z.boolean(),
});

// =====================================================================
// FORM FIELD TYPES
// =====================================================================

export type VoiceAgentProfileFormData = z.infer<typeof VoiceAgentProfileSchema>;
export type UpdateVoiceAgentProfileFormData = z.infer<typeof UpdateVoiceAgentProfileSchema>;
export type VoiceScenarioFormData = z.infer<typeof VoiceScenarioSchema>;
export type UpdateVoiceScenarioFormData = z.infer<typeof UpdateVoiceScenarioSchema>;

// =====================================================================
// UI STATE TYPES
// =====================================================================

export type AgentConfigTab = 'profiles' | 'scenarios';

export interface AgentConfigState {
  activeTab: AgentConfigTab;
  selectedProfileId: string | null;
  selectedScenarioId: string | null;
  isEditing: boolean;
  isCreating: boolean;
}
