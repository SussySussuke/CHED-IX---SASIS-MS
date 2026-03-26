import React from 'react';
import EmptyState from '../Common/EmptyState';

const RecentActivity = ({ activities = [] }) => {
  const activityList = activities;

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':  return 'bg-green-500';
      case 'submitted':  return 'bg-blue-500';
      case 'request':    return 'bg-orange-500';
      case 'draft':      return 'bg-yellow-500';
      default:           return 'bg-gray-500';
    }
  };

  const activityIcon = (
    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  if (activityList.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <EmptyState
          icon={activityIcon}
          title="No recent activity"
          message="Activity will appear here once you start submitting forms."
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activityList.map((activity, index) => (
          <div
            key={activity.id}
            className="flex gap-3 animate-enter"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className={`w-2 h-2 ${getStatusColor(activity.status)} rounded-full mt-2 flex-shrink-0`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activity.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
