import React from 'react';
import StatCard from '../Widgets/StatCard';
import { IoCheckmarkCircle, IoSend, IoDocument } from 'react-icons/io5';

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Submitted"
        value={stats.submitted}
        icon={<IoCheckmarkCircle className="w-6 h-6" />}
        color="bleue"
      />
      <StatCard
        title="Under Review"
        value={stats.underReview}
        icon={<IoSend className="w-6 h-6" />}
        color="yellow"
      />
      <StatCard
        title="Not Started"
        value={stats.notStarted}
        icon={<IoDocument className="w-6 h-6" />}
        color="red"
      />
    </div>
  );
};

export default DashboardStats;
