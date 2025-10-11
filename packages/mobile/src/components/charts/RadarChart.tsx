import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Line,
  Polygon,
  Text as SvgText,
  G
} from 'react-native-svg';

export interface RadarDataPoint {
  dimension: string;
  value: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  strokeColor?: string;
  fillColor?: string;
  maxValue?: number;
  showLabels?: boolean;
  fontSize?: number;
}

export function RadarChart({
  data,
  size = 300,
  strokeColor = '#3b82f6',
  fillColor = '#3b82f6',
  maxValue = 100,
  showLabels = true,
  fontSize = 11
}: RadarChartProps) {
  if (data.length === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Text style={styles.noDataText}>Sin datos disponibles</Text>
      </View>
    );
  }

  const center = size / 2;
  const radius = (size * 0.35); // Leave room for labels
  const numPoints = data.length;
  const angleStep = (2 * Math.PI) / numPoints;

  /**
   * Calculate point position on circle
   * angle in radians, ratio 0-1 from center
   */
  const getPoint = (index: number, ratio: number) => {
    // Start from top and go clockwise
    const angle = index * angleStep - Math.PI / 2;
    return {
      x: center + radius * ratio * Math.cos(angle),
      y: center + radius * ratio * Math.sin(angle)
    };
  };

  /**
   * Generate polygon points string for SVG
   */
  const getPolygonPoints = (values: number[]) => {
    return values
      .map((value, index) => {
        const ratio = value / maxValue;
        const point = getPoint(index, ratio);
        return `${point.x},${point.y}`;
      })
      .join(' ');
  };

  /**
   * Generate grid polygon for given ratio
   */
  const getGridPolygon = (ratio: number) => {
    const points = Array(numPoints)
      .fill(0)
      .map((_, index) => {
        const point = getPoint(index, ratio);
        return `${point.x},${point.y}`;
      })
      .join(' ');
    return points;
  };

  // Data values
  const values = data.map(d => d.value);
  const dataPolygon = getPolygonPoints(values);

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G>
          {/* Grid polygons */}
          {gridLevels.map((ratio, i) => (
            <Polygon
              key={`grid-${i}`}
              points={getGridPolygon(ratio)}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          ))}

          {/* Axis lines */}
          {Array(numPoints)
            .fill(0)
            .map((_, index) => {
              const endPoint = getPoint(index, 1.0);
              return (
                <Line
                  key={`axis-${index}`}
                  x1={center}
                  y1={center}
                  x2={endPoint.x}
                  y2={endPoint.y}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1"
                />
              );
            })}

          {/* Data polygon */}
          <Polygon
            points={dataPolygon}
            fill={fillColor}
            fillOpacity={0.3}
            stroke={strokeColor}
            strokeWidth="2"
          />

          {/* Data point dots */}
          {values.map((value, index) => {
            const ratio = value / maxValue;
            const point = getPoint(index, ratio);
            return (
              <Circle
                key={`dot-${index}`}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={strokeColor}
              />
            );
          })}

          {/* Labels */}
          {showLabels && data.map((item, index) => {
            // Position labels slightly outside the chart
            const labelPoint = getPoint(index, 1.25);

            // Calculate text anchor based on position
            const angle = index * angleStep - Math.PI / 2;
            const normalizedAngle = ((angle + Math.PI * 2) % (Math.PI * 2));

            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (normalizedAngle > Math.PI / 6 && normalizedAngle < (5 * Math.PI) / 6) {
              textAnchor = 'end';
            } else if (normalizedAngle > (7 * Math.PI) / 6 && normalizedAngle < (11 * Math.PI) / 6) {
              textAnchor = 'start';
            }

            // Shorten label if it's too long for subdimensions
            const label = item.dimension.length > 15
              ? item.dimension.substring(0, 12) + '...'
              : item.dimension;

            return (
              <SvgText
                key={`label-${index}`}
                x={labelPoint.x}
                y={labelPoint.y}
                fontSize={fontSize}
                fill="white"
                textAnchor={textAnchor}
                alignmentBaseline="middle"
                fontWeight="500"
              >
                {label}
              </SvgText>
            );
          })}

          {/* Center dot */}
          <Circle
            cx={center}
            cy={center}
            r="2"
            fill="rgba(255, 255, 255, 0.3)"
          />

          {/* Scale labels (0, 25, 50, 75, 100 on one axis) */}
          {[0, 25, 50, 75, 100].map((value, i) => {
            const ratio = value / maxValue;
            const point = getPoint(0, ratio);
            return (
              <SvgText
                key={`scale-${i}`}
                x={point.x + 8}
                y={point.y}
                fontSize={9}
                fill="rgba(255, 255, 255, 0.5)"
                textAnchor="start"
                alignmentBaseline="middle"
              >
                {value}
              </SvgText>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
});
