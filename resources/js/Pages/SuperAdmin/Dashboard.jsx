import React from 'react';
import SuperAdminLayout from '../../Layouts/SuperAdminLayout';
import StatCard from '../../Components/Widgets/StatCard';
import InfoBox from '../../Components/Widgets/InfoBox';
import {
  IoHourglassOutline,
  IoBarChart,
  IoPeople,
} from 'react-icons/io5';
import AdminYearHeader from '../../Components/Admin/AdminYearHeader';
import EnrollmentDistributionChart from '../../Components/Admin/EnrollmentDistributionChart';
import HEITypeDistributionChart from '../../Components/Admin/HEITypeDistributionChart';
import RecentSubmissionsTable from '../../Components/Admin/RecentSubmissionsTable';
import TopPerformingHEIs from '../../Components/Admin/TopPerformingHEIs';
import FormCompletionChart from '../../Components/Admin/FormCompletionChart';

const Dashboard = ({ academicYears, selectedYear, stats }) => {
  return (
    <SuperAdminLayout title="Super Admin Dashboard">
      {/* Academic Year Header - Full Width */}
      <AdminYearHeader
        academicYears={academicYears}
        selectedYear={selectedYear}
      />

      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            System-wide overview for AY {selectedYear}
          </p>
        </div>

        {/* Pending Reviews Alert */}
        {stats.pendingReviews > 0 && (
          <InfoBox
            type="warning"
            title="Pending Reviews"
            message={`There are ${stats.pendingReviews} pending review request(s) across all HEIs.`}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT COLUMN */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            {/* 3 Stat Cards: Total Admins (superadmin-only), Pending Reviews, Completion */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Admins"
                value={stats.totalAdmins ?? 0}
                icon={<IoPeople />}
                color="blue"
              />
              <StatCard
                title="Pending Reviews"
                value={stats.pendingReviews}
                icon={<IoHourglassOutline />}
                color="yellow"
              />
              <StatCard
                title="Total Completion"
                value={`${stats.completionRate}%`}
                icon={<IoBarChart />}
                color="purple"
              />
            </div>

            {/* 2 Pie Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EnrollmentDistributionChart data={stats.enrollmentByType} />
              <HEITypeDistributionChart data={stats.heisByType} />
            </div>

            {/* Recent Submissions */}
            <RecentSubmissionsTable submissions={stats.recentSubmissions} />
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <a
                  href="/superadmin/admin-management"
                  className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Manage Admins
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {stats.totalAdmins ?? 0} admin account(s)
                  </p>
                </a>
                <a
                  href="/superadmin/hei-accounts"
                  className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Manage HEI Accounts
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Add, edit, or remove accounts
                  </p>
                </a>
                <a
                  href="/superadmin/system-audit-logs"
                  className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    System Audit Logs
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Track all system changes
                  </p>
                </a>
              </div>
            </div>

            {/* Top Performing HEIs */}
            <div style={{ maxHeight: '400px' }}>
              <TopPerformingHEIs heis={stats.topHEIs} allHEIs={stats.allHEIs} />
            </div>

            {/* Form Completion Chart */}
            <div style={{ maxHeight: '450px' }}>
              <FormCompletionChart data={stats.formCompletion} />
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default Dashboard;
