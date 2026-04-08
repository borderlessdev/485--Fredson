import { useMemo, useState } from 'react';
import BaseChart from '@/components/charts/BaseChart';
import { type LineSeries } from '@/types/charts';

interface LineChartProps<TDatum> {
  data: TDatum[];
  xLabelAccessor: (datum: TDatum) => string;
  series: LineSeries<TDatum>[];
}

const formatInteger = (value: number) => `${Math.round(value)}`;

export default function LineChart<TDatum>({ data, xLabelAccessor, series }: LineChartProps<TDatum>) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const xLabels = useMemo(() => data.map(xLabelAccessor), [data, xLabelAccessor]);

  const values = useMemo(
    () => series.flatMap((line) => data.map((datum) => line.valueAccessor(datum))),
    [data, series],
  );

  return (
    <div className="relative">
      <BaseChart xLabels={xLabels} values={values} height={190} yTickFormatter={formatInteger}>
        {({ x, y, width, padding, innerHeight }) => {
          const pointsBySeries = series.map((line) =>
            data.map((datum, index) => ({
              x: x(index),
              y: y(line.valueAccessor(datum)),
              value: line.valueAccessor(datum),
            })),
          );

          return (
            <>
              <defs>
                <linearGradient id="line-area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>
              </defs>

              {pointsBySeries.map((points, idx) => {
                const pathData = points
                  .map((point, pointIndex) => (pointIndex === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`))
                  .join(' ');

                const areaPath = `${pathData} L${points[points.length - 1].x},${padding.top + innerHeight} L${points[0].x},${padding.top + innerHeight} Z`;
                const currentSeries = series[idx];

                return (
                  <g key={currentSeries.key}>
                    {idx === 0 && <path d={areaPath} fill="url(#line-area-gradient)" />}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={currentSeries.color}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {points.map((point, pointIndex) => (
                      <circle
                        key={`${currentSeries.key}-${pointIndex}`}
                        cx={point.x}
                        cy={point.y}
                        r={activeIndex === pointIndex ? 4.5 : 3.5}
                        fill={currentSeries.color}
                        stroke="white"
                        strokeWidth="2"
                        className="transition-all duration-150"
                      />
                    ))}
                  </g>
                );
              })}

              {xLabels.map((_, index) => {
                const xPos = x(index);
                return (
                  <rect
                    key={`hover-${index}`}
                    x={xPos - 18}
                    y={padding.top}
                    width={36}
                    height={innerHeight}
                    fill="transparent"
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  />
                );
              })}

              {activeIndex !== null && (
                <line
                  x1={x(activeIndex)}
                  y1={padding.top}
                  x2={x(activeIndex)}
                  y2={padding.top + innerHeight}
                  stroke="#bae6fd"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              )}

              {activeIndex !== null && (
                <foreignObject
                    x={Math.min(width - 160, Math.max(8, x(activeIndex) - 78))}
                  y={8}
                    width={154}
                    height={80}
                >
                  <div className="rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 shadow-sm backdrop-blur-sm text-[11px]">
                    <p className="text-slate-500 font-medium mb-1">{xLabels[activeIndex]}</p>
                    <div className="space-y-1">
                      {series.map((line) => {
                        const raw = line.valueAccessor(data[activeIndex]);
                        const formatted = line.formatter ? line.formatter(raw) : formatInteger(raw);
                        return (
                          <div key={line.key} className="flex items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-1.5 text-slate-600">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: line.color }} />
                              {line.label}
                            </span>
                            <span className="font-semibold text-slate-800">{formatted}</span>
                          </div>
                        );
                      })}
                    </div>
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
