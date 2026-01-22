import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { ImageUploader } from '../components/ImageUploader';
import { ConversionPreview } from '../components/ConversionPreview';
import { SVGGallery } from '../components/SVGGallery';

export interface ConvertedImage {
  originalFile: File;
  originalUrl: string;
  svgContent: string | null;
  width: number;
  height: number;
}

export function SVGConverterPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('convert');
  const [convertedImage, setConvertedImage] = useState<ConvertedImage | null>(null);

  const handleImageUploaded = (file: File) => {
    const url = URL.createObjectURL(file);

    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setConvertedImage({
        originalFile: file,
        originalUrl: url,
        svgContent: null,
        width: img.width,
        height: img.height,
      });
    };
    img.src = url;
  };

  const handleConversionComplete = (svgContent: string) => {
    if (convertedImage) {
      setConvertedImage({
        ...convertedImage,
        svgContent,
      });
    }
  };

  const handleReset = () => {
    if (convertedImage?.originalUrl) {
      URL.revokeObjectURL(convertedImage.originalUrl);
    }
    setConvertedImage(null);
  };

  const handleSaveSuccess = () => {
    // Switch to gallery tab after saving
    setActiveTab('gallery');
    handleReset();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Wand2 className="w-8 h-8" />
            {t('svg_converter.title')}
          </h1>
          <p className="text-muted-foreground">{t('svg_converter.description')}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="convert">{t('svg_converter.tab_convert')}</TabsTrigger>
          <TabsTrigger value="gallery">{t('svg_converter.tab_gallery')}</TabsTrigger>
        </TabsList>

        <TabsContent value="convert" className="mt-6">
          {!convertedImage ? (
            <ImageUploader onImageUploaded={handleImageUploaded} />
          ) : (
            <ConversionPreview
              convertedImage={convertedImage}
              onConversionComplete={handleConversionComplete}
              onReset={handleReset}
              onSaveSuccess={handleSaveSuccess}
            />
          )}
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <SVGGallery />
        </TabsContent>
      </Tabs>
    </div>
  );
}
