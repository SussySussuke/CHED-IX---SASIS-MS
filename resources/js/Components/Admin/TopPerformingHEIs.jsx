import React, { useState } from 'react';
import { IoClose, IoSearch } from 'react-icons/io5';

const TopPerformingHEIs = ({ heis, allHEIs = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getTypeColor = (type) => {
    switch (type) {
      case 'SUC':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'LUC':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'Private':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  const getMedalColor = (index) => {
    switch (index) {
      case 0:
        return 'text-yellow-500';
      case 1:
        return 'text-gray-400';
      case 2:
        return 'text-orange-600';
      default:
        return 'text-gray-300';
    }
  };

  const getMedalEmoji = (index) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `#${index + 1}`;
    }
  };

  // Filter all HEIs based on search term
  const filteredHEIs = (allHEIs.length > 0 ? allHEIs : heis).filter(hei =>
    hei.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hei.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const HEICard = ({ hei, index, showRank = true }) => (
    <div 
      className="group relative bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
    >
      {/* Rank Badge */}
      {showRank && (
        <div className="absolute -left-2 -top-2 w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-sm">
          <span className={`text-xs font-bold ${getMedalColor(index)}`}>
            {index < 3 ? getMedalEmoji(index) : `#${index + 1}`}
          </span>
        </div>
      )}

      <div className={showRank ? "ml-3" : ""}>
        {/* HEI Name and Code */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {hei.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {hei.code}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${getTypeColor(hei.type)}`}>
            {hei.type}
          </span>
        </div>

        {/* Completion Stats */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {hei.completedForms}/{hei.totalForms} forms
              </span>
            </div>
            <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  hei.completionRate === 100 
                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                    : hei.completionRate >= 80
                    ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                    : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                }`}
                style={{ width: `${hei.completionRate}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </div>
          </div>
          <span className="ml-3 text-base font-bold text-gray-900 dark:text-white">
            {hei.completionRate}%
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Top Performing HEIs
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Highest completion rates
          </p>
        </div>

        <div className="p-6 space-y-3 overflow-y-auto flex-1">
          {heis.map((hei, index) => (
            <HEICard key={hei.id} hei={hei} index={index} />
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex-shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            View all HEIs →
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
              onClick={() => setShowModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              {/* Header */}
              <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    All HEIs Performance
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <IoClose className="w-6 h-6" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="mt-4 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by HEI name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="bg-white dark:bg-gray-800 px-6 py-4 max-h-96 overflow-y-auto">
                {filteredHEIs.length > 0 ? (
                  <div className="space-y-3">
                    {filteredHEIs.map((hei, index) => (
                      <HEICard key={hei.id} hei={hei} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No HEIs found matching "{searchTerm}"
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    Showing {filteredHEIs.length} of {(allHEIs.length > 0 ? allHEIs : heis).length} HEIs
                  </span>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopPerformingHEIs;
