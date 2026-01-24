import React from 'react';

const FormCompletionChart = ({ data }) => {
  // Convert object to array and sort by completion percentage
  const chartData = Object.entries(data)
    .map(([name, percentage]) => ({
      name,
      percentage
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const getBarGradient = (percentage) => {
    if (percentage >= 80) return 'from-green-400 to-green-600';
    if (percentage >= 60) return 'from-blue-400 to-blue-600';
    if (percentage >= 40) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const average = (chartData.reduce((sum, item) => sum + item.percentage, 0) / chartData.length).toFixed(1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Form Completion Rate
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Percentage of HEIs that completed each form
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{average}%</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ maxHeight: 'calc(100% - 80px)' }}>
        {chartData.map((item, index) => (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[70px]">
                  {item.name}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  item.percentage >= 80 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : item.percentage >= 60
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : item.percentage >= 40
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {item.percentage >= 80 ? 'Excellent' : item.percentage >= 60 ? 'Good' : item.percentage >= 40 ? 'Fair' : 'Needs Attention'}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {item.percentage}%
              </span>
            </div>
            
            <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getBarGradient(item.percentage)} transition-all duration-700 ease-out rounded-full group-hover:opacity-90`}
                style={{ width: `${item.percentage}%` }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormCompletionChart;
