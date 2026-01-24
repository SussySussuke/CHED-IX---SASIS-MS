import React from 'react';
import HEILayout from '../../Layouts/HEILayout';
import DashboardStats from '../../Components/HEI/DashboardStats';
import SubmissionChecklist from '../../Components/HEI/SubmissionChecklist';
import DeadlineAlert from '../../Components/HEI/DeadlineAlert';
import QuickActions from '../../Components/HEI/QuickActions';
import NeedHelp from '../../Components/HEI/NeedHelp';
import RecentActivity from '../../Components/HEI/RecentActivity';

const Dashboard = ({ hei, academicYears, selectedYear, stats, checklist, deadline, recentActivities }) => {
  // Calculate progress percentage
  const progressPercentage = stats.totalForms > 0 
    ? Math.round((stats.submitted / stats.totalForms) * 100) 
    : 0;

  return (
    <HEILayout title="HEI Dashboard">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your submissions for AY {selectedYear}
          </p>
        </div>

        {/* Deadline Alert */}
        {deadline && (
          <DeadlineAlert 
            deadline={deadline} 
            progressPercentage={progressPercentage} 
          />
        )}

        {/* Stats Grid */}
        <DashboardStats stats={stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submission Checklist - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <SubmissionChecklist 
              checklist={checklist} 
              selectedYear={selectedYear} 
            />
          </div>

          {/* Sidebar - Takes 1 column on large screens */}
          <div className="space-y-6">
            <QuickActions checklist={checklist} selectedYear={selectedYear} />
            <NeedHelp />
            <RecentActivity activities={recentActivities} />
          </div>
        </div>
      </div>
    </HEILayout>
  );
};

export default Dashboard;
