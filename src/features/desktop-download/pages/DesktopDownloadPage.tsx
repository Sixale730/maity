import { Download, Monitor, Apple, ExternalLink, Wifi, Bell, Zap, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { Badge } from '@/ui/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDesktopRelease, formatFileSize } from '../hooks/useDesktopRelease';

export function DesktopDownloadPage() {
  const { t } = useLanguage();
  const {
    release,
    isLoading,
    isError,
    detectedOS,
    recommendedAsset,
    windowsAsset,
    macosAsset,
  } = useDesktopRelease();

  const features = [
    { icon: Wifi, key: 'offline' },
    { icon: Bell, key: 'notifications' },
    { icon: Zap, key: 'performance' },
    { icon: RefreshCw, key: 'auto_updates' },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">{t('download.loading')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Card className="border-destructive">
          <CardContent className="py-8">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">{t('download.error')}</h3>
              <p className="text-muted-foreground mt-2">{t('download.error_description')}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                {t('download.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isWindows = detectedOS === 'windows';
  const isMacos = detectedOS === 'macos';

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('download.title')}</h1>
            <p className="text-muted-foreground">{t('download.subtitle')}</p>
          </div>
        </div>
        {release && (
          <Badge variant="secondary" className="text-sm">
            {release.tag_name}
          </Badge>
        )}
      </div>

      {/* Recommended Download */}
      {recommendedAsset && (
        <Card className="mb-6 border-primary/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary">{t('download.recommended')}</Badge>
            </div>
            <div className="flex items-center gap-3 mt-3">
              {isWindows ? (
                <Monitor className="h-8 w-8 text-primary" />
              ) : (
                <Apple className="h-8 w-8 text-primary" />
              )}
              <div>
                <CardTitle>
                  {t('download.download_for')} {isWindows ? 'Windows' : isMacos ? 'macOS' : detectedOS}
                </CardTitle>
                <CardDescription>
                  {isWindows
                    ? t('download.requirements_windows')
                    : t('download.requirements_macos')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              size="lg"
              onClick={() => window.open(recommendedAsset.browser_download_url, '_blank')}
            >
              <Download className="mr-2 h-5 w-5" />
              {t('download.download_for')} {isWindows ? 'Windows' : 'macOS'}
              <span className="ml-2 text-xs opacity-70">
                ({formatFileSize(recommendedAsset.size)})
              </span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Other Platforms */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {t('download.other_platforms')}
        </h3>
        <div className="flex flex-wrap gap-3">
          {!isWindows && windowsAsset && (
            <Button
              variant="outline"
              onClick={() => window.open(windowsAsset.browser_download_url, '_blank')}
            >
              <Monitor className="mr-2 h-4 w-4" />
              Windows
              <Download className="ml-2 h-4 w-4" />
            </Button>
          )}
          {!isMacos && macosAsset && (
            <Button
              variant="outline"
              onClick={() => window.open(macosAsset.browser_download_url, '_blank')}
            >
              <Apple className="mr-2 h-4 w-4" />
              macOS
              <Download className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Features */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{t('download.features_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {features.map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-center gap-2">
                <div className="p-1.5 bg-green-500/10 rounded-full">
                  <Icon className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm">{t(`download.feature_${key}`)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View All Releases */}
      {release && (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => window.open(release.html_url, '_blank')}
          >
            {t('download.view_all_releases')}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
