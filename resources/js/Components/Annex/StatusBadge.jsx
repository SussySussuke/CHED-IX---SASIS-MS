import React from 'react';

/**
 * Reusable status badge component for Annex submissions
 * @param {string} status - Status value (submitted, request, published, overwritten, rejected, cancelled)
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    submitted: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      label: 'Submitted'
    },
    request: {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      label: 'Request'
    },
    published: {
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      label: 'Published'
    },
    overwritten: {
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      label: 'Overwritten'
    },
    rejected: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      label: 'Rejected'
    },
    cancelled: {
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      label: 'Cancelled'
    },
  };

  const config = statusConfig[status] || statusConfig.submitted;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
