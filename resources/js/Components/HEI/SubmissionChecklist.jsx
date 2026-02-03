import React, { useState, useMemo } from 'react';
import { IoSearch, IoClose } from 'react-icons/io5';
import ChecklistCard from './ChecklistCard';
import { getFormName } from '../../Config/formConfig';

const SubmissionChecklist = ({ checklist, selectedYear }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter checklist based on search query
  const filteredChecklist = useMemo(() => {
    if (!searchQuery.trim()) return checklist;

    const query = searchQuery.toLowerCase();

    return checklist.filter((item) => {
      // Get form display name
      const formName = getFormName(item.annex);
      
      const fullFormText = item.annex === 'SUMMARY' 
        ? formName
        : item.annex.startsWith('MER')
          ? formName
          : `Annex ${item.annex}: ${formName}`;

      // Search in: annex identifier, annex name, and status
      return (
        item.annex.toLowerCase().includes(query) ||
        formName.toLowerCase().includes(query) ||
        fullFormText.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
      );
    });
  }, [checklist, searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Submission Checklist
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track your progress for AY {selectedYear}
        </p>
        
        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative w-full">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or status..."
              className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <IoClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-2">
        {filteredChecklist.length > 0 ? (
          filteredChecklist.map((item) => (
            <ChecklistCard
              key={item.annex}
              annex={item.annex}
              status={item.status}
              recordCount={item.recordCount}
              lastUpdated={item.lastUpdated}
              selectedYear={selectedYear}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No items found matching "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionChecklist;
