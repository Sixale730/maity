import { Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SVGAsset } from '@maity/shared';

interface SVGGalleryItemProps {
  asset: SVGAsset;
  onClick: () => void;
}

export function SVGGalleryItem({ asset, onClick }: SVGGalleryItemProps) {
  const { t } = useLanguage();

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
        !asset.is_active ? 'opacity-60' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* SVG Preview */}
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden mb-3">
          <div
            className="max-w-full max-h-full p-4"
            dangerouslySetInnerHTML={{ __html: asset.svg_content }}
          />
        </div>

        {/* Info */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm truncate flex-1" title={asset.name}>
              {asset.name}
            </h3>
            {!asset.is_active && (
              <EyeOff className="h-4 w-4 text-muted-foreground ml-2" title={t('svg_converter.inactive')} />
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {t(`svg_converter.category_${asset.category}`)}
            </Badge>
            {asset.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {asset.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">+{asset.tags.length - 2}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
