import React from 'react';
import ChecklistCard from './ChecklistCard';

const SubmissionChecklist = ({ checklist, selectedYear }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Submission Checklist
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Click on any form to view and manage its submissions
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {checklist.map((item) => (
                    <ChecklistCard
                        key={item.annex}
                        annex={item.annex}
                        name={item.name}
                        status={item.status}
                        lastUpdated={item.lastUpdated}
                        selectedYear={selectedYear}
                    />
                ))}
            </div>
        </div>
    );
};

export default SubmissionChecklist;
