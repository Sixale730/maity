import { useState } from 'react';
import { Play } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';
import { FadeIn } from './FadeIn';

interface VideoCardProps {
  title: string;
  description?: string;
  duration: string;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  variant?: 'inline' | 'featured';
  accentColor?: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
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
  const [playing, setPlaying] = useState(false);

  const ytId = videoUrl ? getYouTubeId(videoUrl) : null;
  const embedUrl = ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0` : null;
  const autoThumbnail = !thumbnailUrl && ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : thumbnailUrl;
  const isPlaceholder = !videoUrl && !thumbnailUrl && !autoThumbnail;

  return (
    <FadeIn delay={200}>
      <div className={`${variant === 'featured' ? 'mt-12' : 'mt-10'}`}>
        <div
          className={`relative overflow-hidden rounded-2xl border transition-all group ${
            variant === 'featured' ? 'max-w-2xl mx-auto' : 'max-w-xl mx-auto'
          } ${isPlaceholder ? 'border-white/5 hover:border-white/10 cursor-default' : 'border-white/10 hover:border-pink-500/30 cursor-pointer'}`}
          style={{ aspectRatio: '16/9' }}
          onClick={() => !isPlaceholder && embedUrl && setPlaying(true)}
        >
          {playing && embedUrl ? (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            />
          ) : (
            <>
              {autoThumbnail ? (
                <img src={autoThumbnail} alt={title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`${variant === 'featured' ? 'w-20 h-20' : 'w-14 h-14'} rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all border border-white/20`}>
                  <Play size={variant === 'featured' ? 32 : 22} className="text-white ml-1" fill="currentColor" />
                </div>
              </div>

              {isPlaceholder && (
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 bg-black/50 px-2 py-1 rounded-full">Próximamente</span>
                </div>
              )}

              {duration && (
                <div className="absolute bottom-14 right-4 bg-black/70 px-2 py-0.5 rounded text-xs font-mono text-gray-300">
                  {duration}
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="font-bold text-white text-sm mb-0.5">{title}</h4>
                {description && <p className="text-xs text-gray-400">{description}</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </FadeIn>
  );
};
