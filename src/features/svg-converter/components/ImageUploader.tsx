import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/ui/components/ui/card';
import { Alert, AlertDescription } from '@/ui/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';

interface ImageUploaderProps {
  onImageUploaded: (file: File) => void;
}

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ACCEPTED_FORMATS.includes(file.type)) {
        return t('svg_converter.error_invalid_format');
      }
      if (file.size > MAX_FILE_SIZE) {
        return t('svg_converter.error_file_too_large');
      }
      return null;
    },
    [t]
  );

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onImageUploaded(file);
    },
    [validateFile, onImageUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="py-16">
          <label className="flex flex-col items-center justify-center gap-4 cursor-pointer">
            <input
              type="file"
              accept={ACCEPTED_FORMATS.join(',')}
              onChange={handleFileInput}
              className="hidden"
            />

            <div className="p-4 rounded-full bg-primary/10">
              {isDragging ? (
                <Upload className="w-12 h-12 text-primary" />
              ) : (
                <ImageIcon className="w-12 h-12 text-primary" />
              )}
            </div>

            <div className="text-center">
              <p className="text-lg font-medium">
                {isDragging
                  ? t('svg_converter.drop_here')
                  : t('svg_converter.drag_drop_or_click')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('svg_converter.supported_formats')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('svg_converter.max_file_size')}
              </p>
            </div>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
