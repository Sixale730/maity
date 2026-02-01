interface RadarDataPoint {
  name: string;
  value: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  color: string;
}

const SIZE = 180;
const CENTER = 90;
const RADIUS = 70;
const GRID_LEVELS = [0.25, 0.5, 0.75, 1];
const GRID_LABELS = ['100m', '1km', '5km', '10km'];

function polarToCartesian(
  angle: number,
  radius: number
): { x: number; y: number } {
  const rad = (Math.PI / 180) * (angle - 90);
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function getPolygonPoints(
  count: number,
  radius: number
): { x: number; y: number }[] {
  const step = 360 / count;
  return Array.from({ length: count }, (_, i) =>
    polarToCartesian(i * step, radius)
  );
}

function pointsToString(points: { x: number; y: number }[]): string {
  return points.map(p => `${p.x},${p.y}`).join(' ');
}

export const RadarChart = ({ data, color }: RadarChartProps) => {
  const count = data.length;
  const angleStep = 360 / count;

  const dataPoints = data.map((d, i) => {
    const clampedValue = Math.min(Math.max(d.value, 0), 10);
    const r = (clampedValue / 10) * RADIUS;
    return polarToCartesian(i * angleStep, r);
  });

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="drop-shadow-lg"
    >
      {/* Grid polygons */}
      {GRID_LEVELS.map((level, idx) => (
        <polygon
          key={`grid-${idx}`}
          points={pointsToString(getPolygonPoints(count, RADIUS * level))}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={0.5}
        />
      ))}

      {/* Grid level labels */}
      {GRID_LEVELS.map((level, idx) => {
        const pos = polarToCartesian(0, RADIUS * level);
        return (
          <text
            key={`label-level-${idx}`}
            x={pos.x + 4}
            y={pos.y - 2}
            fill="rgba(255,255,255,0.3)"
            fontSize={7}
            fontFamily="sans-serif"
          >
            {GRID_LABELS[idx]}
          </text>
        );
      })}

      {/* Axis lines */}
      {data.map((_, i) => {
        const end = polarToCartesian(i * angleStep, RADIUS);
        return (
          <line
            key={`axis-${i}`}
            x1={CENTER}
            y1={CENTER}
            x2={end.x}
            y2={end.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={pointsToString(dataPoints)}
        fill={color}
        fillOpacity={0.2}
        stroke={color}
        strokeWidth={1.5}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle
          key={`dot-${i}`}
          cx={p.x}
          cy={p.y}
          r={2.5}
          fill={color}
        />
      ))}

      {/* Labels */}
      {data.map((d, i) => {
        const labelRadius = RADIUS + 14;
        const pos = polarToCartesian(i * angleStep, labelRadius);
        return (
          <text
            key={`label-${i}`}
            x={pos.x}
            y={pos.y}
            fill="rgba(255,255,255,0.7)"
            fontSize={8}
            fontFamily="sans-serif"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {d.name}
          </text>
        );
      })}
    </svg>
  );
};
