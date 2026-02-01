import { useState } from 'react';
import { Play, Clock } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';
import { FadeIn } from './FadeIn';

interface VideoCardProps {
  title: string;
  description: string;
  duration: string;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  variant?: 'inline' | 'featured';
  accentColor?: string;
}

function getYouTubeId(url: string): string | null {
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const longMatch = url.match(/youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/);
  if (longMatch) return longMatch[1];
  return null;
}

function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
}

function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export const VideoCard = ({
  title,
  description,
  duration,
  thumbnailUrl,
  videoUrl,
  variant = 'inline',
  accentColor = LANDING_COLORS.maityPink,
}: VideoCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const autoThumbnail = videoUrl ? getYouTubeThumbnail(videoUrl) : null;
  const displayThumbnail = thumbnailUrl || autoThumbnail;
  const isPlaceholder = !videoUrl && !displayThumbnail;
  const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

  const maxWidth = variant === 'featured' ? 'max-w-2xl' : 'max-w-xl';

  const handlePlay = () => {
    if (embedUrl) setIsPlaying(true);
  };

  return (
    <FadeIn delay={200} className={`w-full ${maxWidth}`}>
      <div
        className="rounded-xl overflow-hidden border border-white/10"
        style={{ backgroundColor: LANDING_COLORS.bgCard }}
      >
        {/* Video / Thumbnail area */}
        <div className="relative aspect-video bg-black/50">
          {isPlaying && embedUrl ? (
            <iframe
              src={embedUrl}
              title={title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={handlePlay}
              className="absolute inset-0 w-full h-full cursor-pointer group"
              disabled={!embedUrl}
              aria-label={`Play ${title}`}
            >
              {displayThumbnail ? (
                <img
                  src={displayThumbnail}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/60 to-black/80">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center opacity-40"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              )}

              {/* Play overlay */}
              {!isPlaceholder && embedUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              )}

              {/* Duration badge */}
              <span
                className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-medium text-white flex items-center gap-1"
                style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
              >
                <Clock className="w-3 h-3" />
                {duration}
              </span>

              {/* Placeholder badge */}
              {isPlaceholder && (
                <span
                  className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: `${accentColor}20`,
                    color: accentColor,
                  }}
                >
                  Proximamente
                </span>
              )}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3
            className="font-semibold text-base mb-1"
            style={{ color: LANDING_COLORS.textMain }}
          >
            {title}
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: LANDING_COLORS.textMuted }}
          >
            {description}
          </p>
        </div>
      </div>
    </FadeIn>
  );
};
