import React from 'react';

const EnrollmentDistributionChart = ({ data }) => {
  const total = data.SUC + data.LUC + data.Private;

  // Handle case when total is 0
  if (total === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Enrollment Distribution by HEI Type
        </h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No enrollment data available</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Submit Summary forms to see enrollment statistics</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = [
    {
      label: 'SUC',
      value: data.SUC,
      percentage: ((data.SUC / total) * 100).toFixed(1),
      gradientId: 'gradient-enroll-suc',
      colorLight: 'rgba(239, 68, 68, 0.9)',
      colorDark: 'rgba(185, 28, 28, 0.95)',
      legendColor: 'bg-red-500'
    },
    {
      label: 'LUC',
      value: data.LUC,
      percentage: ((data.LUC / total) * 100).toFixed(1),
      gradientId: 'gradient-enroll-luc',
      colorLight: 'rgba(234, 179, 8, 0.9)',   // yellow-400
      colorDark: 'rgba(161, 98, 7, 0.95)',    // yellow-700
      legendColor: 'bg-yellow-500'
    },
    {
      label: 'Private',
      value: data.Private,
      percentage: ((data.Private / total) * 100).toFixed(1),
      gradientId: 'gradient-enroll-private',
      colorLight: 'rgba(59, 130, 246, 0.9)',
      colorDark: 'rgba(29, 78, 216, 0.95)',
      legendColor: 'bg-blue-500'
    }
  ].filter(item => item.value > 0); // Only show segments with values

  // Calculate angles for pie chart
  let currentAngle = 0;
  const segments = chartData.map(item => {
    const angle = (parseFloat(item.percentage) / 100) * 360;
    const segment = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle
    };
    currentAngle += angle;
    return segment;
  });

  // Format total dynamically
  const formatTotal = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Enrollment Distribution by HEI Type
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
            
            {segments.map((segment, index) => {
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
            })}
          </svg>
          
          {/* Center circle for donut effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center shadow-inner border-2 border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatTotal(total)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend - Below the chart */}
        <div className="w-full space-y-3">
          {/* Show all types in legend, even if zero */}
          {[
            { label: 'SUC', value: data.SUC, legendColor: 'bg-red-500' },
            { label: 'LUC', value: data.LUC, legendColor: 'bg-yellow-500' },
            { label: 'Private', value: data.Private, legendColor: 'bg-blue-500' }
          ].map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded ${item.legendColor} flex-shrink-0 ${item.value === 0 ? 'opacity-30' : 'opacity-90'}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <span className={`text-sm font-medium ${item.value === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                      {item.label}
                    </span>
                    <span className={`text-sm font-bold ${item.value === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                      {percentage}%
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${item.value === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                    {item.value === 0 ? 'No data' : `${item.value.toLocaleString()} students`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDistributionChart;
