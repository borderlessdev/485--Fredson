import { useMemo, useState } from 'react';
import BaseChart from '@/components/charts/BaseChart';

interface BarChartProps<TDatum> {
  data: TDatum[];
  xLabelAccessor: (datum: TDatum) => string;
  valueAccessor: (datum: TDatum) => number;
  barColorAccessor?: (datum: TDatum, index: number) => string;
  tooltipTitleAccessor: (datum: TDatum) => string;
  tooltipValueFormatter?: (datum: TDatum) => string;
  tooltipExtraFormatter?: (datum: TDatum) => string;
}

const DEFAULT_COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'];

const formatInteger = (value: number) => `${Math.round(value)}`;

export default function BarChart<TDatum>({
  data,
  xLabelAccessor,
  valueAccessor,
  barColorAccessor,
  tooltipTitleAccessor,
  tooltipValueFormatter,
  tooltipExtraFormatter,
}: BarChartProps<TDatum>) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const xLabels = useMemo(() => data.map(xLabelAccessor), [data, xLabelAccessor]);
  const values = useMemo(() => data.map(valueAccessor), [data, valueAccessor]);

  return (
    <div className="relative">
      <BaseChart xLabels={xLabels} values={values} height={320} yTickFormatter={formatInteger}>
        {({ x, y, padding, innerWidth, innerHeight, width }) => {
          const slotWidth = innerWidth / Math.max(data.length, 1);
          const barWidth = Math.min(54, slotWidth * 0.70);

          return (
            <>
              {data.map((datum, index) => {
                const value = valueAccessor(datum);
                const barHeight = padding.top + innerHeight - y(value);
                const xCenter = x(index);
                const xPos = xCenter - barWidth / 2;
                const yPos = y(value);

                const color = barColorAccessor
                  ? barColorAccessor(datum, index)
                  : DEFAULT_COLORS[index % DEFAULT_COLORS.length];

                return (
                  <g key={`bar-${index}`}>
                    <rect
                      x={xPos}
                      y={yPos}
                      width={barWidth}
                      height={barHeight}
                      rx="7"
                      fill={color}
                      className="transition-opacity duration-150"
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.45}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    />

                    <rect
                      x={xPos - 4}
                      y={padding.top}
                      width={barWidth + 8}
                      height={innerHeight}
                      fill="transparent"
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    />
                  </g>
                );
              })}

              {activeIndex !== null && (
                <foreignObject
                  x={Math.min(width - 164, Math.max(8, x(activeIndex) - 80))}
                  y={8}
                  width={158}
                  height={84}
                >
                  <div className="rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 shadow-sm backdrop-blur-sm text-[11px]">
                    <p className="font-semibold text-slate-800 mb-1">{tooltipTitleAccessor(data[activeIndex])}</p>
                    <p className="text-slate-600">
                      Quantidade: <span className="font-semibold text-slate-800">
                        {tooltipValueFormatter ? tooltipValueFormatter(data[activeIndex]) : formatInteger(valueAccessor(data[activeIndex]))}
                      </span>
                    </p>
                    {tooltipExtraFormatter && (
                      <p className="text-slate-600 mt-0.5">
                        Valor: <span className="font-semibold text-slate-800">{tooltipExtraFormatter(data[activeIndex])}</span>
                      </p>
                    )}
                  </div>
                </foreignObject>
              )}
            </>
          );
        }}
      </BaseChart>
    </div>
  );
}
