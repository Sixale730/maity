/**
 * Types for Avatar Showcase feature
 * Compares different voxel avatar rendering approaches
 */

export type ShowcaseApproach = 'procedural' | 'vox' | 'obj' | 'gltf';

export interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  approach: ShowcaseApproach;
  pros: string[];
  cons: string[];
  fileSize: string;
  loadTime: string;
  assetPath?: string;
  /** Optional secondary asset path (e.g., MTL file for OBJ) */
  secondaryAssetPath?: string;
}

export interface ShowcaseCardProps {
  item: ShowcaseItem;
  className?: string;
}

export interface ShowcaseCanvasProps {
  children: React.ReactNode;
  enableRotation?: boolean;
  enableZoom?: boolean;
  autoRotate?: boolean;
  className?: string;
}

export interface LoaderAvatarProps {
  url?: string;
  scale?: number;
  position?: [number, number, number];
}
