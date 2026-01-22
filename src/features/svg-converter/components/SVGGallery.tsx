import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSVGAssets, SVG_ASSET_CATEGORIES, type SVGAssetCategory } from '@maity/shared';
import { SVGGalleryItem } from './SVGGalleryItem';
import { SVGDetailDialog } from './SVGDetailDialog';
import type { SVGAsset } from '@maity/shared';

export function SVGGallery() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SVGAssetCategory | 'all'>('all');
  const [selectedAsset, setSelectedAsset] = useState<SVGAsset | null>(null);

  const { data: assets, isLoading, error } = useSVGAssets({
    includeInactive: true,
  });

  // Filter assets client-side for immediate feedback
  const filteredAssets = useMemo(() => {
    if (!assets) return [];

    return assets.filter((asset) => {
      // Category filter
      if (categoryFilter !== 'all' && asset.category !== categoryFilter) {
        return false;
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const nameMatch = asset.name.toLowerCase().includes(searchLower);
        const descMatch = asset.description?.toLowerCase().includes(searchLower);
        const tagMatch = asset.tags.some((tag) => tag.toLowerCase().includes(searchLower));
        if (!nameMatch && !descMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });
  }, [assets, categoryFilter, search]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('svg_converter.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={categoryFilter}
            onValueChange={(v) => setCategoryFilter(v as SVGAssetCategory | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('svg_converter.all_categories')}</SelectItem>
              {SVG_ASSET_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {t(`svg_converter.category_${cat}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">{t('svg_converter.loading')}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive">{t('svg_converter.error_loading')}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredAssets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">{t('svg_converter.no_assets')}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('svg_converter.no_assets_hint')}
          </p>
        </div>
      )}

      {/* Gallery Grid */}
      {filteredAssets.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredAssets.map((asset) => (
            <SVGGalleryItem
              key={asset.id}
              asset={asset}
              onClick={() => setSelectedAsset(asset)}
            />
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <SVGDetailDialog
        asset={selectedAsset}
        open={!!selectedAsset}
        onOpenChange={(open) => !open && setSelectedAsset(null)}
      />
    </div>
  );
}
