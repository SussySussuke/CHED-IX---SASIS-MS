import React from 'react';
import { getAnnexName, ANNEX_PRIORITY_ORDER } from '../../Config/formConfig';

const FormCompletionChart = ({ data }) => {
  // DEBUG: Log what data we're receiving
  console.log('FormCompletionChart received data:', data);
  console.log('ANNEX_PRIORITY_ORDER:', ANNEX_PRIORITY_ORDER);

  // Convert data object to array, translate codes to names, and sort by priority order
  const chartData = ANNEX_PRIORITY_ORDER
    .filter(code => {
      const exists = data[code] !== undefined;
      console.log(`Checking code "${code}": exists=${exists}, value=${data[code]}`);
      return exists;
    })
    .map(code => ({
      code,  // Keep code for reference (A, B, C-1, etc.)
      name: code === 'SUMMARY' ? 'Summary' : getAnnexName(code),  // Full name from formConfig
      displayLabel: code === 'SUMMARY' ? 'Summary' : `Annex ${code}`,  // Short label for display
      percentage: data[code]
    }))
    .sort((a, b) => b.percentage - a.percentage);  // Sort by completion rate descending

  console.log('chartData after processing:', chartData);

  const average = chartData.length > 0 
    ? (chartData.reduce((sum, item) => sum + item.percentage, 0) / chartData.length).toFixed(1)
    : 0;

  const getBarGradient = (percentage) => {
    if (percentage >= 80) return 'from-green-400 to-green-600';
    if (percentage >= 60) return 'from-blue-400 to-blue-600';
    if (percentage >= 40) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

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
        {chartData.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No data available
          </p>
        ) : (
          chartData.map((item) => (
            <div key={item.code} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-sm font-semibold text-gray-900 dark:text-white min-w-[70px]" 
                    title={item.name}  // Show full name on hover
                  >
                    {item.displayLabel}
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
          ))
        )}
      </div>
    </div>
  );
};

export default FormCompletionChart;
