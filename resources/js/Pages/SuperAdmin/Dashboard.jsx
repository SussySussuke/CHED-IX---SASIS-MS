import React from 'react';
import SuperAdminLayout from '../../Layouts/SuperAdminLayout';
import StatCard from '../../Components/Widgets/StatCard';
import { IoPeople, IoSchool, IoDocumentText, IoDocument } from 'react-icons/io5';

const Dashboard = ({ stats }) => {
  return (
    <SuperAdminLayout title="Super Admin Dashboard">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Super Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Admins"
            value={stats?.total_admins || 0}
            icon={<IoPeople />}
            color="blue"
          />
          <StatCard
            title="Total HEIs"
            value={stats?.total_heis || 0}
            icon={<IoSchool />}
            color="green"
          />
          <StatCard
            title="Total Submissions"
            value={stats?.total_submissions || 0}
            icon={<IoDocumentText />}
            color="purple"
          />
          <StatCard
            title="System Audit Logs"
            value={stats?.total_audit_logs || 0}
            icon={<IoDocument />}
            color="yellow"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            System Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to the CHED HEI Information Management System. As a Super Administrator,
            you have full access to manage administrators, view system audit logs, and configure
            system settings.
          </p>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default Dashboard;
