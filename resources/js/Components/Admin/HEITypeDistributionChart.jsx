import React from 'react';
import DonutChart from './DonutChart';

const HEITypeDistributionChart = ({ data }) => {
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
      colorLight: 'rgba(255, 230, 0, 0.9)',
      colorDark: 'rgba(248, 147, 5, 0.99)',
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
        {value === 0 ? 'No data' : `${value.toLocaleString()} ${value === 1 ? 'HEI' : 'HEIs'}`}
      </p>
    </div>
  );

  return (
    <DonutChart
      data={data}
      title="HEI Type Distribution"
      emptyStateMessage="No HEI data available"
      emptyStateSubtext="Add HEI accounts to see distribution"
      gradientPrefix="hei"
      chartConfig={chartConfig}
      centerLabelFormatter={(total) => total.toString()}
      legendItemFormatter={legendItemFormatter}
    />
  );
};

export default HEITypeDistributionChart;
