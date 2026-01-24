import React from 'react';
import HEILayout from '../../Layouts/HEILayout';
import DashboardStats from '../../Components/HEI/DashboardStats';
import SubmissionChecklist from '../../Components/HEI/SubmissionChecklist';

const Dashboard = ({ hei, academicYears, selectedYear, stats, checklist }) => {
  return (
    <HEILayout title="HEI Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your submissions for AY {selectedYear}
          </p>
        </div>

        <DashboardStats stats={stats} />

        <SubmissionChecklist checklist={checklist} selectedYear={selectedYear} />
      </div>
    </HEILayout>
  );
};

export default Dashboard;
