import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import StatCard from '../../Components/Widgets/StatCard';
import InfoBox from '../../Components/Widgets/InfoBox';
import { IoSchool, IoDocumentText, IoTime, IoBarChart } from 'react-icons/io5';

const Dashboard = ({ stats, pendingOverwrites }) => {
  return (
    <AdminLayout title="Admin Dashboard" pendingCount={stats?.pending_overwrites || 0}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>

        {stats?.pending_overwrites > 0 && (
          <InfoBox
            type="warning"
            title="Pending Overwrites"
            message={`You have ${stats.pending_overwrites} pending overwrite request(s) that require review.`}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total HEIs"
            value={stats?.total_heis || 0}
            icon={<IoSchool />}
            color="blue"
          />
          <StatCard
            title="Active Submissions"
            value={stats?.active_submissions || 0}
            icon={<IoDocumentText />}
            color="green"
          />
          <StatCard
            title="Pending Overwrites"
            value={stats?.pending_overwrites || 0}
            icon={<IoTime />}
            color="yellow"
          />
          <StatCard
            title="Total for Current Year"
            value={stats?.current_year_total || 0}
            icon={<IoBarChart />}
            color="purple"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/hei-accounts/create"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Create HEI Account</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add a new HEI to the system
              </p>
            </a>
            <a
              href="/admin/submissions"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Review Submissions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View and approve submissions
              </p>
            </a>
            <a
              href="/admin/audit-logs"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">View Audit Logs</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track all system changes
              </p>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
