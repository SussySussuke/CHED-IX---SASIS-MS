import React from 'react';
import StatCard from '../Widgets/StatCard';
import { IoCheckmarkCircle, IoSend, IoDocument } from 'react-icons/io5';

// Each card gets its own stagger delay so they cascade in left-to-right.
// animationDelay is forwarded through StatCard's existing `style` prop.
const CARDS = [
  { key: 'submitted',   title: 'Submitted',    icon: IoCheckmarkCircle, color: 'bleue',  delay: 0   },
  { key: 'underReview', title: 'Under Review',  icon: IoSend,            color: 'yellow', delay: 60  },
  { key: 'notStarted',  title: 'Not Started',   icon: IoDocument,        color: 'red',    delay: 120 },
];

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {CARDS.map(({ key, title, icon: Icon, color, delay }) => (
        <StatCard
          key={key}
          title={title}
          value={stats[key]}
          icon={<Icon className="w-6 h-6" />}
          color={color}
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
};

export default DashboardStats;
