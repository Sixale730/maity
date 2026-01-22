/**
 * SVG Assets Hooks
 * React Query hooks for SVG asset operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SVGAssetsService } from '../svg-assets.service';
import type {
  CreateSVGAssetInput,
  UpdateSVGAssetInput,
  SVGAssetFilters,
} from '../svg-assets.types';

const SVG_ASSETS_KEY = ['svg-assets'];

/**
 * Hook to fetch all SVG assets with optional filters
 */
export function useSVGAssets(filters?: SVGAssetFilters) {
  return useQuery({
    queryKey: [...SVG_ASSETS_KEY, filters],
    queryFn: () => SVGAssetsService.getAllAssets(filters),
  });
}

/**
 * Hook to create a new SVG asset
 */
export function useCreateSVGAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSVGAssetInput) => SVGAssetsService.createAsset(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SVG_ASSETS_KEY });
    },
  });
}

/**
 * Hook to update an existing SVG asset
 */
export function useUpdateSVGAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSVGAssetInput) => SVGAssetsService.updateAsset(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SVG_ASSETS_KEY });
    },
  });
}

/**
 * Hook to delete an SVG asset (soft delete)
 */
export function useDeleteSVGAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SVGAssetsService.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SVG_ASSETS_KEY });
    },
  });
}
