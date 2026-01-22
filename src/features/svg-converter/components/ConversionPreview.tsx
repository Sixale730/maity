import { useState, useEffect, useCallback } from 'react';
import { Download, Save, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { Alert, AlertDescription } from '@/ui/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { VECTORIZATION_PRESETS, type VectorizationSettings } from '@maity/shared';
import { ConversionSettings } from './ConversionSettings';
import { SaveAssetDialog } from './SaveAssetDialog';
import type { ConvertedImage } from '../pages/SVGConverterPage';

interface ConversionPreviewProps {
  convertedImage: ConvertedImage;
  onConversionComplete: (svgContent: string) => void;
  onReset: () => void;
  onSaveSuccess: () => void;
}

const SVG_SIZE_WARNING_KB = 500;

export function ConversionPreview({
  convertedImage,
  onConversionComplete,
  onReset,
  onSaveSuccess,
}: ConversionPreviewProps) {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<VectorizationSettings>({
    preset: 'photo',
    colorCount: VECTORIZATION_PRESETS.photo.colorCount,
    smoothing: 'medium',
  });
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const svgSizeKB = convertedImage.svgContent
    ? new Blob([convertedImage.svgContent]).size / 1024
    : 0;

  const convertImage = useCallback(async () => {
    setIsConverting(true);
    setError(null);

    try {
      // Dynamic import of imagetracerjs to avoid loading it until needed
      const ImageTracer = (await import('imagetracerjs')).default;

      // Create an image element from the file
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = convertedImage.originalUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Create canvas to get image data
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      ctx.drawImage(img, 0, 0);

      // Get ImageData from canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Configure ImageTracer options based on settings
      const options = {
        numberofcolors: settings.colorCount,
        colorsampling: 2, // Enhanced color sampling
        mincolorratio: 0,
        colorquantcycles: 3,
        ltres: settings.smoothing === 'high' ? 0.1 : settings.smoothing === 'medium' ? 1 : 2,
        qtres: settings.smoothing === 'high' ? 0.1 : settings.smoothing === 'medium' ? 1 : 2,
        pathomit: 8,
        blurradius: settings.smoothing === 'high' ? 5 : settings.smoothing === 'medium' ? 2 : 0,
        blurdelta: 20,
        strokewidth: 1,
        linefilter: false,
        scale: 1,
        roundcoords: 1,
        viewbox: true,
        desc: false,
        lcpr: 0,
        qcpr: 0,
      };

      // Convert to SVG using ImageTracer
      const svgContent = ImageTracer.imagedataToSVG(imageData, options);

      onConversionComplete(svgContent);
    } catch (err) {
      console.error('Conversion error:', err);
      setError(t('svg_converter.error_conversion_failed'));
    } finally {
      setIsConverting(false);
    }
  }, [convertedImage.originalUrl, settings.colorCount, settings.smoothing, onConversionComplete, t]);

  // Auto-convert on settings change
  useEffect(() => {
    convertImage();
  }, [convertImage]);

  const handleDownload = () => {
    if (!convertedImage.svgContent) return;

    const blob = new Blob([convertedImage.svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${convertedImage.originalFile.name.split('.')[0]}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || 'png';
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {svgSizeKB > SVG_SIZE_WARNING_KB && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t('svg_converter.warning_large_svg', { size: Math.round(svgSizeKB) })}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="md:col-span-1">
          <ConversionSettings settings={settings} onSettingsChange={setSettings} />
        </div>

        {/* Preview Panel */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Original */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('svg_converter.original')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={convertedImage.originalUrl}
                    alt="Original"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {convertedImage.width} x {convertedImage.height} •{' '}
                  {(convertedImage.originalFile.size / 1024).toFixed(1)} KB
                </p>
              </CardContent>
            </Card>

            {/* Converted SVG */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {t('svg_converter.converted')}
                  {isConverting && <Loader2 className="h-4 w-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {convertedImage.svgContent ? (
                    <div
                      className="max-w-full max-h-full"
                      dangerouslySetInnerHTML={{ __html: convertedImage.svgContent }}
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      {isConverting
                        ? t('svg_converter.converting')
                        : t('svg_converter.no_preview')}
                    </p>
                  )}
                </div>
                {convertedImage.svgContent && (
                  <p className="text-xs text-muted-foreground mt-2">
                    SVG • {svgSizeKB.toFixed(1)} KB
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('svg_converter.reset')}
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!convertedImage.svgContent || isConverting}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('svg_converter.download')}
            </Button>
            <Button
              onClick={() => setShowSaveDialog(true)}
              disabled={!convertedImage.svgContent || isConverting}
            >
              <Save className="h-4 w-4 mr-2" />
              {t('svg_converter.save_to_gallery')}
            </Button>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <SaveAssetDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        svgContent={convertedImage.svgContent || ''}
        originalFilename={convertedImage.originalFile.name}
        originalFormat={
          getFileExtension(convertedImage.originalFile.name) as
            | 'jpg'
            | 'jpeg'
            | 'png'
            | 'webp'
        }
        width={convertedImage.width}
        height={convertedImage.height}
        onSuccess={onSaveSuccess}
      />
    </div>
  );
}
