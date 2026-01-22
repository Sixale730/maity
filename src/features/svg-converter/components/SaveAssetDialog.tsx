import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/ui/dialog';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Textarea } from '@/ui/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/shared/hooks/use-toast';
import {
  useCreateSVGAsset,
  SVG_ASSET_CATEGORIES,
  type SVGAssetCategory,
  type SupportedImageFormat,
} from '@maity/shared';

interface SaveAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  svgContent: string;
  originalFilename: string;
  originalFormat: SupportedImageFormat;
  width: number;
  height: number;
  onSuccess: () => void;
}

export function SaveAssetDialog({
  open,
  onOpenChange,
  svgContent,
  originalFilename,
  originalFormat,
  width,
  height,
  onSuccess,
}: SaveAssetDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const createAsset = useCreateSVGAsset();

  const [name, setName] = useState(() => {
    const baseName = originalFilename.split('.')[0];
    return baseName.replace(/[-_]/g, ' ');
  });
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SVGAssetCategory>('general');
  const [tags, setTags] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: t('svg_converter.error'),
        description: t('svg_converter.error_name_required'),
        variant: 'destructive',
      });
      return;
    }

    try {
      await createAsset.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        svg_content: svgContent,
        original_filename: originalFilename,
        original_format: originalFormat,
        width,
        height,
        file_size: new Blob([svgContent]).size,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        category,
      });

      toast({
        title: t('svg_converter.success'),
        description: t('svg_converter.asset_saved'),
      });

      onOpenChange(false);
      onSuccess();

      // Reset form
      setName('');
      setDescription('');
      setCategory('general');
      setTags('');
    } catch {
      toast({
        title: t('svg_converter.error'),
        description: t('svg_converter.error_save_failed'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('svg_converter.save_dialog_title')}</DialogTitle>
          <DialogDescription>{t('svg_converter.save_dialog_description')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* SVG Preview */}
          <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            <div
              className="max-w-full max-h-full"
              style={{ maxWidth: '120px', maxHeight: '120px' }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('svg_converter.field_name')} *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('svg_converter.field_name_placeholder')}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('svg_converter.field_description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('svg_converter.field_description_placeholder')}
              rows={2}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">{t('svg_converter.field_category')}</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as SVGAssetCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SVG_ASSET_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t(`svg_converter.category_${cat}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">{t('svg_converter.field_tags')}</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={t('svg_converter.field_tags_placeholder')}
            />
            <p className="text-xs text-muted-foreground">{t('svg_converter.field_tags_hint')}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={createAsset.isPending}>
            {createAsset.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('svg_converter.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
