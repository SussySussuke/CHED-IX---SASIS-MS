import React from 'react';
import { Link } from '@inertiajs/react';
import HEILayout from '../../Layouts/HEILayout';
import {
  IoCalendar,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoDocument,
  IoSend,
  IoCloseCircle,
  IoChevronForward,
  IoBook,
  IoHelpCircle,
  IoTime,
  IoNotifications
} from 'react-icons/io5';


const Dashboard = ({ hei, academic_year, deadline, summary, annexes, stats }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'published': 
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'submitted': 
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'not_submitted': 
        return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
      default: 
        return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'published': 
        return <IoCheckmarkCircle className="w-4 h-4" />;
      case 'submitted': 
        return <IoSend className="w-4 h-4" />;
      case 'not_submitted': 
        return <IoCloseCircle className="w-4 h-4" />;
      default: 
        return <IoDocument className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'published': 
        return 'Published';
      case 'submitted': 
        return 'Under Review';
      case 'not_submitted': 
        return 'Not Started';
      default: 
        return status;
    }
  };

  const progressPercentage = stats ? Math.round((stats.published / stats.total) * 100) : 0;

  const getDeadlineStatus = () => {
    if (!deadline) {
      return { 
        color: 'text-gray-600 dark:text-gray-400', 
        bgColor: 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700', 
        icon: IoTime, 
        message: 'No deadline set' 
      };
    }

    if (deadline.is_past_deadline) {
      return { 
        color: 'text-red-600 dark:text-red-400', 
        bgColor: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800', 
        icon: IoAlertCircle, 
        message: 'Deadline passed' 
      };
    }
    
    if (deadline.days_remaining <= 30) {
      return { 
        color: 'text-orange-600 dark:text-orange-400', 
        bgColor: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800', 
        icon: IoAlertCircle, 
        message: 'Deadline approaching' 
      };
    }
    
    return { 
      color: 'text-blue-600 dark:text-blue-400', 
      bgColor: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800', 
      icon: IoTime, 
      message: 'On track' 
    };
  };

  const deadlineStatus = getDeadlineStatus();

  return (
    <HEILayout title="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{hei.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              UII: {hei.uii} • {hei.type} • AY {academic_year}
            </p>
          </div>
        </div>

        {/* Deadline Alert */}
        {deadline && (
          <div className={`${deadlineStatus.bgColor} border rounded-xl p-6`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-white dark:bg-gray-900 rounded-lg ${deadlineStatus.color}`}>
                  <deadlineStatus.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Annual Submission Deadline</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {deadline.formatted}
                    <span className="mx-2">•</span>
                    <span className={deadline.days_remaining <= 30 ? 'font-semibold' : ''}>
                      {Math.abs(deadline.days_remaining)} days {deadline.is_past_deadline ? 'overdue' : 'remaining'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{progressPercentage}%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Complete</div>
              </div>
            </div>
            <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Published</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.published}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <IoCheckmarkCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Under Review</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.submitted}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <IoSend className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Not Started</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.not_submitted}</p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <IoDocument className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submission Checklist */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Submission Checklist</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your progress for AY {academic_year}</p>
            </div>
            
            <div className="p-6 space-y-3 max-h-[600px] overflow-y-auto">
              {/* Summary Form */}
              <Link
                href="/hei/summary/create"
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <IoBook className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white">General Information Summary</h3>
                      <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${getStatusColor(summary?.status || 'not_submitted')}`}>
                        {getStatusIcon(summary?.status || 'not_submitted')}
                        {getStatusText(summary?.status || 'not_submitted')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Last updated: {summary?.last_updated ? new Date(summary.last_updated).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
                <IoChevronForward className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </Link>

              {/* Annexes */}
              {annexes.map((annex) => (
                <Link
                  key={annex.id}
                  href={`/hei/annex-${annex.id.toLowerCase()}/submit`}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <IoDocument className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Annex {annex.id}: {annex.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${getStatusColor(annex.status)}`}>
                          {getStatusIcon(annex.status)}
                          {getStatusText(annex.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {annex.record_count > 0 ? `${annex.record_count} records` : 'No records'}
                        {annex.last_updated && ` • Updated ${new Date(annex.last_updated).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <IoChevronForward className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/hei/summary/create"
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <IoSend className="w-4 h-4" />
                  Continue Submissions
                </Link>
                <Link
                  href="/hei/submissions/history"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <IoDocument className="w-4 h-4" />
                  View All Forms
                </Link>
                <Link
                  href="/hei/summary/history"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <IoTime className="w-4 h-4" />
                  Submission History
                </Link>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
              <div className="flex items-center gap-2 mb-2">
                <IoHelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">Need Help?</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Contact CHED support for assistance with your submissions.
              </p>
              <button className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors font-medium text-sm">
                Contact Support
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {annexes
                  .filter(a => a.last_updated)
                  .sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated))
                  .slice(0, 5)
                  .map((annex, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        annex.status === 'published' ? 'bg-green-500' : 
                        annex.status === 'submitted' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Annex {annex.id} {getStatusText(annex.status)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(annex.last_updated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                {annexes.filter(a => a.last_updated).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </HEILayout>
  );
};

export default Dashboard;
