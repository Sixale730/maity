/**
 * Hero Journey Service
 * Handles all hero journey operations via Supabase RPC
 */

import { supabase } from '../../api/client/supabase';
import type {
  HeroJourneyConfig,
  HeroJourneyConfigRow,
  SaveHeroJourneyConfigRequest,
  JourneyTheme,
} from './hero-journey.types';
import { DEFAULT_MOUNTAIN_LAYERS } from './hero-journey.types';

export class HeroJourneyService {
  /**
   * Get all hero journey configs
   */
  static async getConfigs(companyId?: string): Promise<HeroJourneyConfig[]> {
    const { data, error } = await supabase.rpc('get_hero_journey_configs', {
      p_company_id: companyId ?? null,
    });

    if (error) {
      console.error('Error fetching hero journey configs:', error);
      throw error;
    }

    const configs = (data || []) as HeroJourneyConfigRow[];
    return configs.map(this.transformConfig);
  }

  /**
   * Get a single config by ID
   */
  static async getConfigById(id: string): Promise<HeroJourneyConfig | null> {
    const configs = await this.getConfigs();
    return configs.find((c) => c.id === id) || null;
  }

  /**
   * Get the default config
   */
  static async getDefaultConfig(): Promise<HeroJourneyConfig | null> {
    const configs = await this.getConfigs();
    return configs.find((c) => c.isDefault) || configs[0] || null;
  }

  /**
   * Save a hero journey config (create or update)
   */
  static async saveConfig(
    request: SaveHeroJourneyConfigRequest
  ): Promise<HeroJourneyConfig> {
    const configPayload = {
      ...(request.id && { id: request.id }),
      name: request.name,
      description: request.description || null,
      theme: request.theme || 'snow',
      nodes: request.nodes,
      mountain_layers: request.mountainLayers || DEFAULT_MOUNTAIN_LAYERS,
      is_default: request.isDefault || false,
      company_id: request.companyId || null,
    };

    const { data, error } = await supabase.rpc('save_hero_journey_config', {
      p_config: configPayload,
    });

    if (error) {
      console.error('Error saving hero journey config:', error);
      throw error;
    }

    return this.transformConfig(data as HeroJourneyConfigRow);
  }

  /**
   * Delete a hero journey config
   */
  static async deleteConfig(id: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('delete_hero_journey_config', {
      p_id: id,
    });

    if (error) {
      console.error('Error deleting hero journey config:', error);
      throw error;
    }

    return data as boolean;
  }

  /**
   * Clone an existing config with a new name
   */
  static async cloneConfig(
    sourceId: string,
    newName: string
  ): Promise<HeroJourneyConfig> {
    const source = await this.getConfigById(sourceId);
    if (!source) {
      throw new Error('Source config not found');
    }

    return this.saveConfig({
      name: newName,
      description: source.description,
      theme: source.theme,
      nodes: source.nodes.map((node) => ({
        ...node,
        id: crypto.randomUUID(),
      })),
      mountainLayers: source.mountainLayers,
      isDefault: false,
      companyId: source.companyId,
    });
  }

  /**
   * Create a new config with default values
   */
  static createEmptyConfig(name: string, theme: JourneyTheme = 'snow'): SaveHeroJourneyConfigRequest {
    return {
      name,
      theme,
      nodes: [
        {
          id: crypto.randomUUID(),
          x: 50,
          y: 85,
          type: 'checkpoint',
          status: 'current',
          icon: '🏕️',
          title: 'Inicio',
          description: 'Punto de partida',
        },
      ],
      mountainLayers: DEFAULT_MOUNTAIN_LAYERS,
    };
  }

  /**
   * Transform raw DB response to typed interface
   */
  private static transformConfig(row: HeroJourneyConfigRow): HeroJourneyConfig {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      theme: row.theme as JourneyTheme,
      nodes: row.nodes || [],
      mountainLayers: row.mountain_layers || DEFAULT_MOUNTAIN_LAYERS,
      isDefault: row.is_default,
      companyId: row.company_id || undefined,
      createdBy: row.created_by || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
