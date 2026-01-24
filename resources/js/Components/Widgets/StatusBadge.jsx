import React from 'react';
import { STATUS_COLORS, STATUS_LABELS } from '../../Utils/constants';

/**
 * Reusable Status Badge component
 * @param {string} status - Status key to lookup in constants (optional if color and label provided)
 * @param {string} label - Custom label text (optional, defaults to STATUS_LABELS[status] or status)
 * @param {string} color - Custom color key: 'gray', 'blue', 'green', 'red', 'yellow', 'purple', 'orange', 'indigo' (optional, defaults to STATUS_COLORS[status])
 */
const StatusBadge = ({ status, label = null, color = null }) => {
  const colorMap = {
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
    red: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300',
    indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300'
  };

  const badgeColor = color || STATUS_COLORS[status] || 'gray';
  const displayLabel = label || STATUS_LABELS[status] || status;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorMap[badgeColor]}`}>
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
