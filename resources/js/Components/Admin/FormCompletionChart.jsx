import React, { useEffect, useState } from 'react';
import { getFormName, PRIORITY_ORDER } from '../../Config/formConfig';

// Skeleton shown while data prop is undefined/null
const FormCompletionSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col animate-pulse">
    {/* Header row */}
    <div className="flex items-center justify-between mb-4">
      <div className="space-y-2">
        <div className="h-5 w-44 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="text-right space-y-1">
        <div className="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
      </div>
    </div>
    {/* Bar rows */}
    <div className="flex-1 space-y-3 overflow-hidden">
      {[80, 55, 70, 40, 90, 60, 75, 50].map((w, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

const FormCompletionChart = ({ data, style = {} }) => {
  // Drive bar animations — start at 0, flip to true after mount
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!data) return <FormCompletionSkeleton />;

  const chartData = PRIORITY_ORDER
    .filter(code => data[code] !== undefined)
    .map(code => ({
      code,
      name:         getFormName(code),
      displayLabel: code === 'SUMMARY' || code.startsWith('MER') ? code : `Annex ${code}`,
      percentage:   data[code],
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const average = chartData.length > 0
    ? (chartData.reduce((sum, item) => sum + item.percentage, 0) / chartData.length).toFixed(1)
    : 0;

  const getBarGradient = (pct) => {
    if (pct >= 80) return 'from-green-400 to-green-600';
    if (pct >= 60) return 'from-blue-400 to-blue-600';
    if (pct >= 40) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getBadge = (pct) => {
    if (pct >= 80) return { label: 'Excellent',        cls: 'bg-green-100  dark:bg-green-900/30  text-green-700  dark:text-green-400'  };
    if (pct >= 60) return { label: 'Good',             cls: 'bg-blue-100   dark:bg-blue-900/30   text-blue-700   dark:text-blue-400'   };
    if (pct >= 40) return { label: 'Fair',             cls: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' };
    return           { label: 'Needs Attention',   cls: 'bg-red-100    dark:bg-red-900/30    text-red-700    dark:text-red-400'    };
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col animate-fade-up"
      style={style}
    >
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
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No data available</p>
        ) : (
          chartData.map((item, i) => {
            const badge = getBadge(item.percentage);
            // Stagger each row by 40ms, capped — rows beyond 15 all share the same delay
            const delay = Math.min(i, 15) * 40;

            return (
              <div
                key={item.code}
                className="group"
                style={{
                  opacity:    animated ? 1 : 0,
                  transform:  animated ? 'translateY(0)' : 'translateY(8px)',
                  transition: `opacity 0.35s ease-out ${delay}ms, transform 0.35s ease-out ${delay}ms`,
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold text-gray-900 dark:text-white min-w-[70px]"
                      title={item.name}
                    >
                      {item.displayLabel}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.percentage}%
                  </span>
                </div>

                <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getBarGradient(item.percentage)} rounded-full group-hover:opacity-90`}
                    style={{
                      width:      animated ? `${item.percentage}%` : '0%',
                      transition: `width 0.7s ease-out ${delay}ms`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FormCompletionChart;
