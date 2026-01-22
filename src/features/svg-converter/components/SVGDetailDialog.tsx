import { useState, useEffect } from 'react';
import { Download, Trash2, Save, Eye, EyeOff, Loader2, Copy, Check } from 'lucide-react';
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
import { Badge } from '@/ui/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/shared/hooks/use-toast';
import {
  useUpdateSVGAsset,
  useDeleteSVGAsset,
  SVG_ASSET_CATEGORIES,
  type SVGAsset,
  type SVGAssetCategory,
} from '@maity/shared';

interface SVGDetailDialogProps {
  asset: SVGAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SVGDetailDialog({ asset, open, onOpenChange }: SVGDetailDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const updateAsset = useUpdateSVGAsset();
  const deleteAsset = useDeleteSVGAsset();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SVGAssetCategory>('general');
  const [tags, setTags] = useState('');

  // Reset form when asset changes
  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setDescription(asset.description || '');
      setCategory(asset.category);
      setTags(asset.tags.join(', '));
      setIsEditing(false);
    }
  }, [asset]);

  if (!asset) return null;

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
      await updateAsset.mutateAsync({
        id: asset.id,
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });

      toast({
        title: t('svg_converter.success'),
        description: t('svg_converter.asset_updated'),
      });

      setIsEditing(false);
    } catch {
      toast({
        title: t('svg_converter.error'),
        description: t('svg_converter.error_update_failed'),
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async () => {
    try {
      await updateAsset.mutateAsync({
        id: asset.id,
        is_active: !asset.is_active,
      });

      toast({
        title: t('svg_converter.success'),
        description: asset.is_active
          ? t('svg_converter.asset_deactivated')
          : t('svg_converter.asset_activated'),
      });
    } catch {
      toast({
        title: t('svg_converter.error'),
        description: t('svg_converter.error_update_failed'),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAsset.mutateAsync(asset.id);

      toast({
        title: t('svg_converter.success'),
        description: t('svg_converter.asset_deleted'),
      });

      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch {
      toast({
        title: t('svg_converter.error'),
        description: t('svg_converter.error_delete_failed'),
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([asset.svg_content], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${asset.name.replace(/\s+/g, '-').toLowerCase()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySVG = async () => {
    try {
      await navigator.clipboard.writeText(asset.svg_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: t('svg_converter.error'),
        description: t('svg_converter.error_copy_failed'),
        variant: 'destructive',
      });
    }
  };

  const sizeKB = (new Blob([asset.svg_content]).size / 1024).toFixed(1);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t('svg_converter.edit_asset') : t('svg_converter.asset_details')}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? t('svg_converter.edit_asset_description')
                : t('svg_converter.asset_details_description')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* SVG Preview */}
            <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              <div
                className="max-w-full max-h-full p-4"
                dangerouslySetInnerHTML={{ __html: asset.svg_content }}
              />
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{sizeKB} KB</span>
              {asset.width && asset.height && (
                <span>
                  • {asset.width} x {asset.height}
                </span>
              )}
              {asset.original_filename && <span>• {asset.original_filename}</span>}
              <span>• {new Date(asset.created_at).toLocaleDateString()}</span>
            </div>

            {isEditing ? (
              <>
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="edit-name">{t('svg_converter.field_name')} *</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="edit-description">{t('svg_converter.field_description')}</Label>
                  <Textarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>{t('svg_converter.field_category')}</Label>
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
                  <Label htmlFor="edit-tags">{t('svg_converter.field_tags')}</Label>
                  <Input id="edit-tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                  <p className="text-xs text-muted-foreground">
                    {t('svg_converter.field_tags_hint')}
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* View Mode */}
                <div>
                  <h3 className="font-medium">{asset.name}</h3>
                  {asset.description && (
                    <p className="text-sm text-muted-foreground mt-1">{asset.description}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{t(`svg_converter.category_${asset.category}`)}</Badge>
                  {asset.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {asset.is_active ? (
                    <Badge variant="default" className="bg-green-500">
                      <Eye className="h-3 w-3 mr-1" />
                      {t('svg_converter.active')}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <EyeOff className="h-3 w-3 mr-1" />
                      {t('svg_converter.inactive')}
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSave} disabled={updateAsset.isPending}>
                  {updateAsset.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  {t('svg_converter.save')}
                </Button>
              </>
            ) : (
              <>
                <div className="flex gap-2 flex-1">
                  <Button variant="outline" size="sm" onClick={handleCopySVG}>
                    {copied ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copied ? t('svg_converter.copied') : t('svg_converter.copy_svg')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" />
                    {t('svg_converter.download')}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleActive}
                    disabled={updateAsset.isPending}
                  >
                    {asset.is_active ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        {t('svg_converter.deactivate')}
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        {t('svg_converter.activate')}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    {t('svg_converter.edit')}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t('svg_converter.delete')}
                  </Button>
                </div>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('svg_converter.delete_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('svg_converter.delete_confirm_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAsset.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('svg_converter.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
