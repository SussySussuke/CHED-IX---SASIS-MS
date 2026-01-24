import React from 'react';
import StatusBadge from '../Widgets/StatusBadge';

const RecentSubmissionsTable = ({ submissions }) => {
  // Map annex display names to filter values
  const getAnnexFilterValue = (annexName) => {
    if (annexName === 'Summary') return 'SUMMARY';
    // Extract letter from "Annex X" format
    const match = annexName.match(/Annex ([A-O])/);
    return match ? match[1] : '';
  };

  const handleViewDetails = (submission) => {
    const annexFilter = getAnnexFilterValue(submission.annex);
    const params = new URLSearchParams({
      annex: annexFilter,  // Changed from 'form' to 'annex'
      status: submission.status,
      year: submission.academic_year
    });
    
    window.location.href = `/admin/submissions/${submission.hei_id}?${params.toString()}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Recent Submissions
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Latest submissions across all HEIs
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                HEI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Form
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {submissions.map((submission) => (
              <tr 
                key={submission.id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {submission.hei_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {submission.hei_code}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {submission.annex}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {submission.submitted_at}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={submission.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleViewDetails(submission)}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
        <a 
          href="/admin/submissions" 
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          View all submissions →
        </a>
      </div>
    </div>
  );
};

export default RecentSubmissionsTable;
