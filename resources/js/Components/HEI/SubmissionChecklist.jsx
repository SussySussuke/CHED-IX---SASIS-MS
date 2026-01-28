import React from 'react';
import ChecklistCard from './ChecklistCard';

const SubmissionChecklist = ({ checklist, selectedYear }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Submission Checklist
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track your progress for AY {selectedYear}
        </p>
      </div>

      <div className="p-6 space-y-3">
        {checklist.map((item) => (
          <ChecklistCard
            key={item.annex}
            annex={item.annex}
            status={item.status}
            recordCount={item.recordCount}
            lastUpdated={item.lastUpdated}
            selectedYear={selectedYear}
          />
        ))}
      </div>
    </div>
  );
};

export default SubmissionChecklist;
