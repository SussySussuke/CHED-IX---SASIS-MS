import React from 'react';

const DonutChart = ({ 
  data, 
  title,
  emptyStateMessage,
  emptyStateSubtext,
  gradientPrefix = 'chart',
  centerLabelFormatter = (val) => val.toLocaleString(),
  legendItemFormatter = null,
  chartConfig = [
    {
      key: 'SUC',
      label: 'SUC',
      colorLight: 'rgba(239, 68, 68, 0.9)',
      colorDark: 'rgba(185, 28, 28, 0.95)',
      legendColor: 'bg-red-500'
    },
    {
      key: 'LUC',
      label: 'LUC',
      colorLight: 'rgba(234, 179, 8, 0.9)',
      colorDark: 'rgba(161, 98, 7, 0.95)',
      legendColor: 'bg-yellow-500'
    },
    {
      key: 'Private',
      label: 'Private',
      colorLight: 'rgba(59, 130, 246, 0.9)',
      colorDark: 'rgba(29, 78, 216, 0.95)',
      legendColor: 'bg-blue-500'
    }
  ]
}) => {
  // Calculate total from data based on chartConfig keys
  const total = chartConfig.reduce((sum, config) => sum + (data[config.key] || 0), 0);

  // Handle case when total is 0
  if (total === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {title}
        </h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">{emptyStateMessage}</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{emptyStateSubtext}</p>
          </div>
        </div>
      </div>
    );
  }

  // Build chart data from config
  const allChartData = chartConfig.map(config => {
    const value = data[config.key] || 0;
    const percentage = (value / total) * 100;
    return {
      label: config.label,
      value: value,
      percentage: percentage,
      percentageDisplay: percentage.toFixed(1),
      gradientId: `gradient-${gradientPrefix}-${config.key.toLowerCase()}`,
      colorLight: config.colorLight,
      colorDark: config.colorDark,
      legendColor: config.legendColor
    };
  });

  // Filter to only items with percentage >= 0.1% for rendering
  // This prevents invisible segments when value rounds to 0.0%
  const chartData = allChartData.filter(item => item.percentage >= 0.1);

  // Special case: if only one segment after filtering, show full circle
  const isSingleSegment = chartData.length === 1;

  // Calculate angles for pie chart
  let currentAngle = 0;
  const segments = chartData.map(item => {
    const angle = (item.percentage / 100) * 360;
    const segment = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {title}
      </h2>

      <div className="flex flex-col items-center justify-center gap-6">
        {/* Pie Chart */}
        <div className="relative w-56 h-56">
          <svg viewBox="0 0 200 200" className="transform -rotate-90">
            <defs>
              {segments.map((segment, index) => (
                <linearGradient
                  key={index}
                  id={segment.gradientId}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" style={{ stopColor: segment.colorLight, stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: segment.colorDark, stopOpacity: 1 }} />
                </linearGradient>
              ))}
            </defs>
            
            {isSingleSegment ? (
              // Render full circle for single segment
              <circle
                cx="100"
                cy="100"
                r="85"
                fill={`url(#${segments[0].gradientId})`}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer stroke-white dark:stroke-gray-800"
                strokeWidth="1.5"
              />
            ) : (
              segments.map((segment, index) => {
                const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
                const startX = 100 + 85 * Math.cos((segment.startAngle * Math.PI) / 180);
                const startY = 100 + 85 * Math.sin((segment.startAngle * Math.PI) / 180);
                const endX = 100 + 85 * Math.cos((segment.endAngle * Math.PI) / 180);
                const endY = 100 + 85 * Math.sin((segment.endAngle * Math.PI) / 180);

                const pathData = [
                  `M 100 100`,
                  `L ${startX} ${startY}`,
                  `A 85 85 0 ${largeArc} 1 ${endX} ${endY}`,
                  `Z`
                ].join(' ');

                return (
                  <g key={index}>
                    <path
                      d={pathData}
                      fill={`url(#${segment.gradientId})`}
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer stroke-white dark:stroke-gray-800"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })
            )}
          </svg>
          
          {/* Center circle for donut effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center shadow-inner border-2 border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {centerLabelFormatter(total)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend - Below the chart */}
        <div className="w-full space-y-3">
          {/* Show all types in legend, even if zero */}
          {chartConfig.map((config, index) => {
            const value = data[config.key] || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            
            return (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded ${config.legendColor} flex-shrink-0 mt-0.5 ${value === 0 ? 'opacity-30' : 'opacity-90'}`}></div>
                <div className="flex-1 min-w-0">
                  {legendItemFormatter ? (
                    legendItemFormatter(config, value, percentage, total)
                  ) : (
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
                  )}
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
