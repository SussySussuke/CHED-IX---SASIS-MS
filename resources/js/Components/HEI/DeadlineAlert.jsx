import React from 'react';
import { IoTime, IoWarning } from 'react-icons/io5';

const DeadlineAlert = ({ deadline, progressPercentage }) => {
  const getDeadlineStatus = () => {
    if (deadline.isPastDeadline) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        icon: IoWarning,
        message: 'Deadline passed'
      };
    }
    if (deadline.daysRemaining <= 30) {
      return {
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
        icon: IoWarning,
        message: 'Deadline approaching'
      };
    }
    return {
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: IoTime,
      message: 'On track'
    };
  };

  const deadlineStatus = getDeadlineStatus();
  const DeadlineIcon = deadlineStatus.icon;

  return (
    <div className={`${deadlineStatus.bgColor} border rounded-xl p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 bg-white dark:bg-gray-800 rounded-lg ${deadlineStatus.color}`}>
            <DeadlineIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Annual Submission Deadline
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {new Date(deadline.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
              <span className="mx-2">•</span>
              <span className={deadline.daysRemaining <= 30 ? 'font-semibold' : ''}>
                {deadline.daysRemaining} days remaining
              </span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {progressPercentage}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Complete</div>
        </div>
      </div>
      <div className="mt-4 bg-white dark:bg-gray-700 rounded-lg h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default DeadlineAlert;
