import React from 'react';
import HEILayout from '../../Layouts/HEILayout';
import StatCard from '../../Components/Widgets/StatCard';
import InfoBox from '../../Components/Widgets/InfoBox';
import { CURRENT_YEAR } from '../../Utils/constants';
import { IoDocumentText, IoCheckmarkCircle, IoTime } from 'react-icons/io5';

const Dashboard = ({ stats, currentYearSubmission, notificationCount }) => {
  return (
    <HEILayout title="HEI Dashboard" notificationCount={notificationCount}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          HEI Dashboard
        </h1>

        {!currentYearSubmission && (
          <InfoBox
            type="warning"
            title="Annual Submission Required"
            message={`You have not submitted data for ${CURRENT_YEAR}. Please submit your data as soon as possible.`}
          />
        )}

        {currentYearSubmission?.status === 'submitted' && (
          <InfoBox
            type="info"
            title="Submission Pending Review"
            message="Your submission is currently under review by CHED administrators."
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Submissions"
            value={stats?.total_submissions || 0}
            icon={<IoDocumentText />}
            color="blue"
          />
          <StatCard
            title="Approved Submissions"
            value={stats?.approved_submissions || 0}
            icon={<IoCheckmarkCircle />}
            color="green"
          />
          <StatCard
            title="Pending Requests"
            value={stats?.pending_overwrites || 0}
            icon={<IoTime />}
            color="yellow"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/hei/summary/create"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Submit Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Submit your annual data
              </p>
            </a>
            <a
              href="/hei/summary/history"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">View History</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View past submissions
              </p>
            </a>
          </div>
        </div>
      </div>
    </HEILayout>
  );
};

export default Dashboard;
