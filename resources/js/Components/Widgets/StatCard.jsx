import React from 'react';

const StatCard = ({ title, value, icon, color = 'blue', trend = null }) => {
  const colorClasses = {
    blue: 'bg-blue-500 dark:bg-blue-600',
    green: 'bg-green-500 dark:bg-green-600',
    red: 'bg-red-500 dark:bg-red-600',
    yellow: 'bg-yellow-500 dark:bg-yellow-600',
    purple: 'bg-purple-500 dark:bg-purple-600',
    indigo: 'bg-indigo-500 dark:bg-indigo-600',
    gray: 'bg-gray-500 dark:bg-gray-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p className={`mt-2 text-sm font-medium ${trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-4 rounded-full ${colorClasses[color] || colorClasses.blue} shadow-sm`}>
            <span className="text-white text-3xl">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
