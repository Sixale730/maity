/**
 * SVG Assets Service
 * Handles CRUD operations for SVG assets via Supabase RPC
 */

import { supabase } from '../../api/client/supabase';
import type {
  SVGAsset,
  CreateSVGAssetInput,
  UpdateSVGAssetInput,
  SVGAssetFilters,
} from './svg-assets.types';

export class SVGAssetsService {
  /**
   * Get all SVG assets with optional filters
   */
  static async getAllAssets(filters?: SVGAssetFilters): Promise<SVGAsset[]> {
    const { data, error } = await supabase.rpc('get_all_svg_assets', {
      p_category: filters?.category || null,
      p_search: filters?.search || null,
      p_include_inactive: filters?.includeInactive || false,
    });

    if (error) {
      console.error('Error fetching SVG assets:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create a new SVG asset (admin only)
   */
  static async createAsset(input: CreateSVGAssetInput): Promise<SVGAsset> {
    const { data, error } = await supabase.rpc('create_svg_asset', {
      p_name: input.name,
      p_svg_content: input.svg_content,
      p_description: input.description || null,
      p_original_filename: input.original_filename || null,
      p_original_format: input.original_format || null,
      p_width: input.width || null,
      p_height: input.height || null,
      p_file_size: input.file_size || null,
      p_tags: input.tags || [],
      p_category: input.category || 'general',
    });

    if (error) {
      console.error('Error creating SVG asset:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update an existing SVG asset (admin only)
   */
  static async updateAsset(input: UpdateSVGAssetInput): Promise<SVGAsset> {
    const { data, error } = await supabase.rpc('update_svg_asset', {
      p_id: input.id,
      p_name: input.name || null,
      p_description: input.description || null,
      p_tags: input.tags || null,
      p_category: input.category || null,
      p_is_active: input.is_active ?? null,
    });

    if (error) {
      console.error('Error updating SVG asset:', error);
      throw error;
    }

    return data;
  }

  /**
   * Soft delete an SVG asset (admin only)
   */
  static async deleteAsset(id: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('delete_svg_asset', {
      p_id: id,
    });

    if (error) {
      console.error('Error deleting SVG asset:', error);
      throw error;
    }

    return data;
  }
}
