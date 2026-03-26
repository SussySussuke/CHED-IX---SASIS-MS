import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import StatCard from '../../Components/Widgets/StatCard';
import InfoBox from '../../Components/Widgets/InfoBox';
import {
  IoHourglassOutline,
  IoBarChart,
} from 'react-icons/io5';
import AdminYearHeader from '../../Components/Admin/AdminYearHeader';
import EnrollmentDistributionChart from '../../Components/Admin/EnrollmentDistributionChart';
import HEITypeDistributionChart from '../../Components/Admin/HEITypeDistributionChart';
import RecentSubmissionsTable from '../../Components/Admin/RecentSubmissionsTable';
import TopPerformingHEIs from '../../Components/Admin/TopPerformingHEIs';
import FormCompletionChart from '../../Components/Admin/FormCompletionChart';

// Utility: inline style for staggered fade-up entrance.
// Each dashboard section gets a slightly later delay so they cascade in
// rather than all popping in simultaneously.
const fadeUp = (delayMs) => ({
  animationName:     'fadeUp',
  animationDuration: '0.4s',
  animationTimingFunction: 'ease-out',
  animationFillMode: 'both',
  animationDelay:    `${delayMs}ms`,
});

const Dashboard = ({ academicYears, selectedYear, stats }) => {
  return (
    <AdminLayout title="Admin Dashboard" pendingCount={stats.pendingReviews}>
      {/* Academic Year Header */}
      <AdminYearHeader
        academicYears={academicYears}
        selectedYear={selectedYear}
      />

      <div className="p-6 space-y-6">
        {/* Page Title */}
        <div style={fadeUp(0)}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of all HEI submissions for AY {selectedYear}
          </p>
        </div>

        {/* Pending Overwrites Alert */}
        {stats.pendingReviews > 0 && (
          <InfoBox
            type="warning"
            title="Pending Reviews"
            message={`You have ${stats.pendingReviews} pending review request(s) that require attention.`}
            style={fadeUp(60)}
          />
        )}

        {/* MAIN ROW */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT COLUMN */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            {/* StatCards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                title="Pending Reviews"
                value={stats.pendingReviews}
                icon={<IoHourglassOutline />}
                color="yellow"
                style={fadeUp(80)}
              />
              <StatCard
                title="Total Completion Percentage"
                value={`${stats.completionRate}%`}
                icon={<IoBarChart />}
                color="purple"
                style={fadeUp(140)}
              />
            </div>

            {/* Pie Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EnrollmentDistributionChart
                data={stats.enrollmentByType}
                style={fadeUp(200)}
              />
              <HEITypeDistributionChart
                data={stats.heisByType}
                style={fadeUp(260)}
              />
            </div>

            {/* Recent Submissions */}
            <RecentSubmissionsTable
              submissions={stats.recentSubmissions}
              style={fadeUp(320)}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            {/* Quick Actions */}
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
              style={fadeUp(100)}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <a
                  href="/admin/hei-accounts"
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
                  href="/admin/submissions"
                  className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Review Submissions
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {stats.pendingReviews} pending review(s)
                  </p>
                </a>
                <a
                  href="/admin/audit-logs"
                  className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    View Audit Logs
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Track all system changes
                  </p>
                </a>
              </div>
            </div>

            {/* Top Performing HEIs */}
            <div style={{ maxHeight: '400px', ...fadeUp(180) }}>
              <TopPerformingHEIs
                heis={stats.topHEIs}
                allHEIs={stats.allHEIs}
                selectedYear={selectedYear}
              />
            </div>

            {/* Form Completion Rate */}
            <div style={{ maxHeight: '450px', ...fadeUp(260) }}>
              <FormCompletionChart data={stats.formCompletion} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
