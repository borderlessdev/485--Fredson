import { type ReactNode } from 'react';

interface BaseChartPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface BaseChartRenderContext {
  x: (index: number) => number;
  y: (value: number) => number;
  innerWidth: number;
  innerHeight: number;
  width: number;
  height: number;
  padding: BaseChartPadding;
  yMax: number;
}

interface BaseChartProps {
  xLabels: string[];
  values: number[];
  yTickCount?: number;
  width?: number;
  height?: number;
  className?: string;
  yTickFormatter?: (value: number) => string;
  children: (ctx: BaseChartRenderContext) => ReactNode;
}

const DEFAULT_PADDING: BaseChartPadding = {
  top: 22,
  right: 20,
  bottom: 46,
  left: 44,
};

function getNiceMax(maxValue: number): number {
  if (maxValue <= 0) return 1;

  const padded = maxValue * 1.15;
  const magnitude = 10 ** Math.floor(Math.log10(padded));
  const normalized = padded / magnitude;

  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

export default function BaseChart({
  xLabels,
  values,
  yTickCount = 4,
  width = 640,
  height = 320,
  className = 'w-full',
  yTickFormatter = (value) => `${value}`,
  children,
}: BaseChartProps) {
  const padding = DEFAULT_PADDING;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const yMax = getNiceMax(Math.max(...values, 0));

  const x = (index: number) => {
    if (xLabels.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (xLabels.length - 1)) * innerWidth;
  };

  const y = (value: number) => padding.top + innerHeight - (value / yMax) * innerHeight;

  const yTicks = Array.from({ length: yTickCount + 1 }, (_, index) => {
    const fraction = index / yTickCount;
    return Math.round((yMax - fraction * yMax) * 100) / 100;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none" style={{ height }}>
      {yTicks.map((value) => {
        const yPos = y(value);
        return (
          <g key={value}>
            <line
              x1={padding.left}
              y1={yPos}
              x2={width - padding.right}
              y2={yPos}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text x={padding.left - 6} y={yPos + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
              {yTickFormatter(value)}
            </text>
          </g>
        );
      })}

      {children({ x, y, innerWidth, innerHeight, width, height, padding, yMax })}

      {xLabels.map((label, index) => (
        <text
          key={label}
          x={x(index)}
          y={height - 10}
          textAnchor="middle"
          fontSize="10"
          fill="#94a3b8"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}
