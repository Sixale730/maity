/**
 * MountainBackground Component
 * Generates SVG mountains programmatically with multiple layers
 */

import { useMemo } from 'react';
import type { MountainLayer, JourneyTheme } from '@maity/shared';
import { JOURNEY_THEME_COLORS } from '@maity/shared';

interface MountainBackgroundProps {
  layers: MountainLayer[];
  theme: JourneyTheme;
  showSnow?: boolean;
  backgroundImage?: string;
  className?: string;
}

/**
 * Generate SVG path for a mountain layer
 */
function generateMountainPath(
  peaks: { x: number; height: number }[],
  width: number,
  height: number
): string {
  if (peaks.length < 2) return '';

  // Sort peaks by x position
  const sortedPeaks = [...peaks].sort((a, b) => a.x - b.x);

  // Start at bottom left
  let path = `M 0 ${height}`;

  // Generate smooth curves between peaks
  sortedPeaks.forEach((peak, index) => {
    const x = (peak.x / 100) * width;
    const y = height - (peak.height / 100) * height;

    if (index === 0) {
      // First peak - curve from bottom left
      const cp1x = x / 2;
      const cp1y = height;
      const cp2x = x / 2;
      const cp2y = y + (height - y) * 0.3;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
    } else {
      // Subsequent peaks - curve from previous peak
      const prevPeak = sortedPeaks[index - 1];
      const prevX = (prevPeak.x / 100) * width;
      const prevY = height - (prevPeak.height / 100) * height;

      const midX = (prevX + x) / 2;
      const valleyY = Math.max(prevY, y) + Math.abs(prevY - y) * 0.4;

      // Create valley then peak
      const cp1x = prevX + (midX - prevX) * 0.6;
      const cp1y = prevY + (valleyY - prevY) * 0.8;
      const cp2x = midX;
      const cp2y = valleyY;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${midX} ${valleyY}`;

      const cp3x = midX + (x - midX) * 0.4;
      const cp3y = valleyY;
      const cp4x = x - (x - midX) * 0.3;
      const cp4y = y + (valleyY - y) * 0.2;
      path += ` C ${cp3x} ${cp3y}, ${cp4x} ${cp4y}, ${x} ${y}`;
    }
  });

  // Close path to bottom right
  const lastPeak = sortedPeaks[sortedPeaks.length - 1];
  const lastX = (lastPeak.x / 100) * width;
  const lastY = height - (lastPeak.height / 100) * height;
  const cpx = lastX + (width - lastX) / 2;
  const cpy = lastY + (height - lastY) * 0.5;
  path += ` C ${cpx} ${cpy}, ${width} ${height * 0.7}, ${width} ${height}`;

  // Close the path
  path += ' Z';

  return path;
}

/**
 * Generate snow cap path for a peak
 */
function generateSnowCapPath(
  peak: { x: number; height: number },
  width: number,
  height: number,
  snowDepth: number = 0.15
): string {
  const x = (peak.x / 100) * width;
  const y = height - (peak.height / 100) * height;
  const snowHeight = (peak.height / 100) * height * snowDepth;
  const snowWidth = snowHeight * 1.5;

  return `
    M ${x} ${y}
    Q ${x - snowWidth / 2} ${y + snowHeight * 0.3}, ${x - snowWidth} ${y + snowHeight}
    Q ${x} ${y + snowHeight * 1.2}, ${x + snowWidth} ${y + snowHeight}
    Q ${x + snowWidth / 2} ${y + snowHeight * 0.3}, ${x} ${y}
    Z
  `;
}

export function MountainBackground({
  layers,
  theme,
  showSnow = true,
  backgroundImage,
  className = '',
}: MountainBackgroundProps) {
  const colors = JOURNEY_THEME_COLORS[theme];

  // Si hay imagen de fondo, usarla en lugar del SVG generado
  if (backgroundImage) {
    return (
      <div
        className={`absolute inset-0 w-full h-full ${className}`}
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundColor: colors.background,
        }}
      />
    );
  }

  const viewBoxWidth = 1000;
  const viewBoxHeight = 600;

  const sortedLayers = useMemo(
    () => [...layers].sort((a, b) => a.depth - b.depth),
    [layers]
  );

  const mountainPaths = useMemo(
    () =>
      sortedLayers.map((layer) => ({
        path: generateMountainPath(layer.peaks, viewBoxWidth, viewBoxHeight),
        color: layer.color,
        depth: layer.depth,
        peaks: layer.peaks,
      })),
    [sortedLayers]
  );

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="xMidYMax slice"
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ background: colors.background }}
    >
      {/* Gradient definitions */}
      <defs>
        {sortedLayers.map((layer, index) => (
          <linearGradient
            key={`gradient-${index}`}
            id={`mountain-gradient-${index}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={layer.color} stopOpacity={1} />
            <stop
              offset="100%"
              stopColor={layer.color}
              stopOpacity={0.8}
            />
          </linearGradient>
        ))}
        {/* Snow gradient */}
        <linearGradient id="snow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.snow} stopOpacity={1} />
          <stop offset="100%" stopColor={colors.snow} stopOpacity={0.7} />
        </linearGradient>
      </defs>

      {/* Render mountain layers */}
      {mountainPaths.map((layer, index) => (
        <g key={`layer-${index}`}>
          <path
            d={layer.path}
            fill={`url(#mountain-gradient-${index})`}
            style={{
              filter: `brightness(${1 - layer.depth * 0.1})`,
            }}
          />
          {/* Snow caps on peaks (only for front layers and if enabled) */}
          {showSnow &&
            theme === 'snow' &&
            layer.depth >= sortedLayers.length - 2 &&
            layer.peaks
              .filter((p) => p.height > 60)
              .map((peak, peakIndex) => (
                <path
                  key={`snow-${index}-${peakIndex}`}
                  d={generateSnowCapPath(peak, viewBoxWidth, viewBoxHeight)}
                  fill="url(#snow-gradient)"
                  opacity={0.9}
                />
              ))}
        </g>
      ))}

      {/* Stars/particles for night sky effect */}
      {theme === 'snow' && (
        <g className="stars">
          {Array.from({ length: 30 }).map((_, i) => (
            <circle
              key={`star-${i}`}
              cx={Math.random() * viewBoxWidth}
              cy={Math.random() * viewBoxHeight * 0.4}
              r={Math.random() * 1.5 + 0.5}
              fill="#ffffff"
              opacity={Math.random() * 0.5 + 0.3}
            />
          ))}
        </g>
      )}
    </svg>
  );
}

export default MountainBackground;
