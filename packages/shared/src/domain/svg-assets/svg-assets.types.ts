/**
 * SVG Assets Domain Types
 * Types for the SVG converter and asset gallery feature
 */

/**
 * Available categories for SVG assets
 */
export const SVG_ASSET_CATEGORIES = [
  'general',
  'icons',
  'illustrations',
  'logos',
  'backgrounds',
  'patterns',
] as const;

export type SVGAssetCategory = (typeof SVG_ASSET_CATEGORIES)[number];

/**
 * Supported original image formats for conversion
 */
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'svg'] as const;

export type SupportedImageFormat = (typeof SUPPORTED_IMAGE_FORMATS)[number];

/**
 * SVG Asset entity
 */
export interface SVGAsset {
  id: string;
  name: string;
  description: string | null;
  svg_content: string;
  original_filename: string | null;
  original_format: SupportedImageFormat | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  tags: string[];
  category: SVGAssetCategory;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/**
 * Input for creating a new SVG asset
 */
export interface CreateSVGAssetInput {
  name: string;
  svg_content: string;
  description?: string;
  original_filename?: string;
  original_format?: SupportedImageFormat;
  width?: number;
  height?: number;
  file_size?: number;
  tags?: string[];
  category?: SVGAssetCategory;
}

/**
 * Input for updating an existing SVG asset
 */
export interface UpdateSVGAssetInput {
  id: string;
  name?: string;
  description?: string;
  tags?: string[];
  category?: SVGAssetCategory;
  is_active?: boolean;
}

/**
 * Filters for querying SVG assets
 */
export interface SVGAssetFilters {
  category?: SVGAssetCategory;
  search?: string;
  includeInactive?: boolean;
}

/**
 * Vectorization preset options
 */
export const VECTORIZATION_PRESETS = {
  photo: {
    name: 'photo',
    colorCount: 64,
    smoothing: 'medium',
  },
  logo: {
    name: 'logo',
    colorCount: 8,
    smoothing: 'high',
  },
  illustration: {
    name: 'illustration',
    colorCount: 32,
    smoothing: 'medium',
  },
  'line-art': {
    name: 'line-art',
    colorCount: 2,
    smoothing: 'low',
  },
} as const;

export type VectorizationPreset = keyof typeof VECTORIZATION_PRESETS;

/**
 * Vectorization settings for image conversion
 */
export interface VectorizationSettings {
  preset: VectorizationPreset;
  colorCount: number;
  smoothing: 'low' | 'medium' | 'high';
}
