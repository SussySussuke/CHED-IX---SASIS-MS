import React from 'react';

const RecentActivity = ({ activities = [] }) => {
  // Default activities if none provided
  const defaultActivities = [
    {
      id: 1,
      title: 'Annex B Published',
      date: '2 days ago',
      status: 'published'
    },
    {
      id: 2,
      title: 'Annex F Submitted',
      date: '3 days ago',
      status: 'submitted'
    },
    {
      id: 3,
      title: 'Annex A Published',
      date: '5 days ago',
      status: 'published'
    }
  ];

  const activityList = activities.length > 0 ? activities : defaultActivities;

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'submitted':
        return 'bg-blue-500';
      case 'request':
        return 'bg-orange-500';
      case 'draft':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (activityList.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          No recent activity yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activityList.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className={`w-2 h-2 ${getStatusColor(activity.status)} rounded-full mt-2`}></div>
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
