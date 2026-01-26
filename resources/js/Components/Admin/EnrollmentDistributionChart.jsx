import React from 'react';
import DonutChart from './DonutChart';

const EnrollmentDistributionChart = ({ data }) => {
  // Format total dynamically
  const formatTotal = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const chartConfig = [
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
  ];

  const legendItemFormatter = (config, value, percentage) => (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className={`text-sm font-medium ${value === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
          {config.label}
        </span>
        <span className={`text-sm font-bold ${value === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
          {percentage}%
        </span>
      </div>
      <p className={`text-xs mt-0.5 ${value === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
        {value === 0 ? 'No data' : `${value.toLocaleString()} students`}
      </p>
    </div>
  );

  return (
    <DonutChart
      data={data}
      title="Enrollment Distribution by HEI Type"
      emptyStateMessage="No enrollment data available"
      emptyStateSubtext="Submit Summary forms to see enrollment statistics"
      gradientPrefix="enroll"
      chartConfig={chartConfig}
      centerLabelFormatter={formatTotal}
      legendItemFormatter={legendItemFormatter}
    />
  );
};

export default EnrollmentDistributionChart;
