import React, { useEffect, useRef, useState } from 'react';

// Skeleton shown while parent hasn't passed data yet (data === undefined/null)
const DonutSkeleton = ({ title }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full animate-pulse">
    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
    <div className="flex flex-col items-center gap-6">
      {/* Donut ring skeleton */}
      <div className="relative w-56 h-56">
        <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-full w-24 h-24" />
        </div>
      </div>
      {/* Legend skeleton */}
      <div className="w-full space-y-3">
        {[60, 45, 75].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <div className="flex-1 h-3 rounded bg-gray-200 dark:bg-gray-700" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DonutChart = ({
  data,
  title,
  emptyStateMessage,
  emptyStateSubtext,
  gradientPrefix = 'chart',
  centerLabelFormatter = (val) => val.toLocaleString(),
  legendItemFormatter = null,
  style = {},
  chartConfig = [
    {
      key: 'SUC',
      label: 'SUC',
      colorLight: 'rgba(239, 68, 68, 0.9)',
      colorDark:  'rgba(185, 28, 28, 0.95)',
      legendColor: 'bg-red-500',
    },
    {
      key: 'LUC',
      label: 'LUC',
      colorLight: 'rgba(234, 179, 8, 0.9)',
      colorDark:  'rgba(161, 98, 7, 0.95)',
      legendColor: 'bg-yellow-500',
    },
    {
      key: 'Private',
      label: 'Private',
      colorLight: 'rgba(59, 130, 246, 0.9)',
      colorDark:  'rgba(29, 78, 216, 0.95)',
      legendColor: 'bg-blue-500',
    },
  ],
}) => {
  // Animate segments in after mount
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    // One rAF to ensure the browser paints the initial state before we trigger
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!data) return <DonutSkeleton title={title} />;

  const total = chartConfig.reduce((sum, c) => sum + (data[c.key] || 0), 0);

  if (total === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full animate-fade-up" style={style}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{title}</h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">{emptyStateMessage}</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{emptyStateSubtext}</p>
          </div>
        </div>
      </div>
    );
  }

  const allChartData = chartConfig.map(config => {
    const value      = data[config.key] || 0;
    const percentage = (value / total) * 100;
    return {
      label:             config.label,
      value,
      percentage,
      percentageDisplay: percentage.toFixed(1),
      gradientId:        `gradient-${gradientPrefix}-${config.key.toLowerCase()}`,
      colorLight:        config.colorLight,
      colorDark:         config.colorDark,
      legendColor:       config.legendColor,
    };
  });

  const chartData       = allChartData.filter(item => item.percentage >= 0.1);
  const isSingleSegment = chartData.length === 1;

  // SVG arc path animation constants
  // Circumference of a circle r=85: 2 * π * 85 ≈ 534
  const RADIUS = 85;
  const CIRC   = 2 * Math.PI * RADIUS;

  // Build cumulative arc fractions for stroke-dashoffset animation
  let cumulativeFraction = 0;
  const animatedSegments = chartData.map(item => {
    const fraction = item.percentage / 100;
    const seg = { ...item, fraction, offset: cumulativeFraction };
    cumulativeFraction += fraction;
    return seg;
  });

  // Standard path-based rendering (kept for gradients — SVG gradient fills don't
  // work cleanly with stroke-based approach, so we animate opacity instead)
  let currentAngle = 0;
  const segments = chartData.map(item => {
    const angle = (item.percentage / 100) * 360;
    const seg   = { ...item, startAngle: currentAngle, endAngle: currentAngle + angle };
    currentAngle += angle;
    return seg;
  });

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full animate-fade-up"
      style={style}
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{title}</h2>

      <div className="flex flex-col items-center justify-center gap-6">
        {/* Donut chart */}
        <div className="relative w-56 h-56">
          <svg viewBox="0 0 200 200" className="transform -rotate-90">
            <defs>
              {segments.map((segment, i) => (
                <linearGradient key={i} id={segment.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   style={{ stopColor: segment.colorLight, stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: segment.colorDark,  stopOpacity: 1 }} />
                </linearGradient>
              ))}
            </defs>

            {isSingleSegment ? (
              <circle
                cx="100" cy="100" r={RADIUS}
                fill={`url(#${segments[0].gradientId})`}
                className="stroke-white dark:stroke-gray-800"
                strokeWidth="1.5"
                style={{
                  opacity:    animated ? 1 : 0,
                  transition: 'opacity 0.6s ease-out',
                }}
              />
            ) : (
              segments.map((segment, i) => {
                const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
                const startX   = 100 + RADIUS * Math.cos((segment.startAngle * Math.PI) / 180);
                const startY   = 100 + RADIUS * Math.sin((segment.startAngle * Math.PI) / 180);
                const endX     = 100 + RADIUS * Math.cos((segment.endAngle   * Math.PI) / 180);
                const endY     = 100 + RADIUS * Math.sin((segment.endAngle   * Math.PI) / 180);

                const pathData = `M 100 100 L ${startX} ${startY} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${endX} ${endY} Z`;

                return (
                  <path
                    key={i}
                    d={pathData}
                    fill={`url(#${segment.gradientId})`}
                    className="stroke-white dark:stroke-gray-800 hover:opacity-80 cursor-pointer"
                    strokeWidth="1.5"
                    style={{
                      opacity:         animated ? 1 : 0,
                      transform:       animated ? 'scale(1)'    : 'scale(0.85)',
                      transformOrigin: '100px 100px',
                      transition:      `opacity 0.5s ease-out ${i * 80}ms, transform 0.5s ease-out ${i * 80}ms`,
                    }}
                  />
                );
              })
            )}
          </svg>

          {/* Center donut hole */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center shadow-inner border-2 border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total</p>
                <p
                  className="text-lg font-bold text-gray-900 dark:text-white"
                  style={{
                    opacity:    animated ? 1 : 0,
                    transition: 'opacity 0.4s ease-out 0.4s',
                  }}
                >
                  {centerLabelFormatter(total)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-3">
          {chartConfig.map((config, i) => {
            const value      = data[config.key] || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

            return (
              <div
                key={i}
                className="flex items-start gap-3"
                style={{
                  opacity:    animated ? 1 : 0,
                  transform:  animated ? 'translateX(0)' : 'translateX(-8px)',
                  transition: `opacity 0.35s ease-out ${0.3 + i * 70}ms, transform 0.35s ease-out ${0.3 + i * 70}ms`,
                }}
              >
                <div className={`w-4 h-4 rounded ${config.legendColor} flex-shrink-0 mt-0.5 ${value === 0 ? 'opacity-30' : 'opacity-90'}`} />
                <div className="flex-1 min-w-0">
                  {legendItemFormatter
                    ? legendItemFormatter(config, value, percentage, total)
                    : (
                      <div className="flex items-center justify-between gap-4">
                        <span className={`text-sm font-medium ${value === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                          {config.label}
                        </span>
                        <div className="text-right">
                          <p className={`text-base font-bold ${value === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                            {value}
                          </p>
                          <p className={`text-xs ${value === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                            {percentage}%
                          </p>
                        </div>
                      </div>
                    )
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
