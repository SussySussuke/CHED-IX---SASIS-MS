import React from 'react';
import HEILayout from '../../Layouts/HEILayout';
import DashboardStats from '../../Components/HEI/DashboardStats';
import SubmissionChecklist from '../../Components/HEI/SubmissionChecklist';
import DeadlineAlert from '../../Components/HEI/DeadlineAlert';
import QuickActions from '../../Components/HEI/QuickActions';
import NeedHelp from '../../Components/HEI/NeedHelp';
import RecentActivity from '../../Components/HEI/RecentActivity';

// Thin wrapper that applies the shared entrance animation with a stagger delay.
// Per CSS best practices: only animate compositor-only properties (opacity + transform)
// to avoid layout thrashing. The `animate-enter` keyframe lives in tailwind.config.js.
// className prop allows forwarding grid column spans so layout is never broken.
const AnimatedSection = ({ children, delay = 0, className = '' }) => (
  <div
    className={`animate-enter ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

const Dashboard = ({ hei, academicYears, selectedYear, stats, checklist, deadline, recentActivities }) => {
  const progressPercentage = stats.totalForms > 0
    ? Math.round((stats.submitted / stats.totalForms) * 100)
    : 0;

  return (
    <HEILayout title="HEI Dashboard">
      <div className="space-y-6">
        {/* Page Header */}
        <AnimatedSection delay={0}>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Overview of your submissions for AY {selectedYear}
            </p>
          </div>
        </AnimatedSection>

        {/* Deadline Alert */}
        {deadline && (
          <AnimatedSection delay={60}>
            <DeadlineAlert
              deadline={deadline}
              progressPercentage={progressPercentage}
            />
          </AnimatedSection>
        )}

        {/* Stats Grid */}
        <AnimatedSection delay={120}>
          <DashboardStats stats={stats} />
        </AnimatedSection>

        {/* Main Content Grid — grid is on this container, column spans go on AnimatedSection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AnimatedSection delay={180} className="lg:col-span-2">
            <SubmissionChecklist
              checklist={checklist}
              selectedYear={selectedYear}
            />
          </AnimatedSection>

          {/* Sidebar */}
          <div className="space-y-6">
            <AnimatedSection delay={240}>
              <QuickActions checklist={checklist} selectedYear={selectedYear} />
            </AnimatedSection>
            <AnimatedSection delay={300}>
              <RecentActivity activities={recentActivities} />
            </AnimatedSection>
            <AnimatedSection delay={360}>
              <NeedHelp />
            </AnimatedSection>
          </div>
        </div>
      </div>
    </HEILayout>
  );
};

export default Dashboard;
