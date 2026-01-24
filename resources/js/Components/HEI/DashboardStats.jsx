import React from 'react';
import StatCard from '../Widgets/StatCard';
import { IoCheckmarkCircle, IoTime, IoRemoveCircle } from 'react-icons/io5';

const DashboardStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
                title="Completed"
                value={stats.completed}
                icon={<IoCheckmarkCircle />}
                color="green"
            />
            <StatCard
                title="Under Review"
                value={stats.pending}
                icon={<IoTime />}
                color="yellow"
            />
            <StatCard
                title="Not Started"
                value={stats.notStarted}
                icon={<IoRemoveCircle />}
                color="gray"
            />
        </div>
    );
};

export default DashboardStats;
