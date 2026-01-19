import React from 'react';
import { STATUS_COLORS } from '../../Utils/constants';

const StatusBadge = ({ status, label = null }) => {
  const colorMap = {
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
    red: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
  };

  const color = STATUS_COLORS[status] || 'gray';
  const displayLabel = label || status;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorMap[color]}`}>
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
