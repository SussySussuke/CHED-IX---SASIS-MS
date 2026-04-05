import React from 'react';
import { router } from '@inertiajs/react';
import StatusBadge from '../Widgets/StatusBadge';

// Skeleton shown while submissions prop is undefined/null
const RecentSubmissionsSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-3 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            {['HEI', 'Form', 'Submitted', 'Status', 'Action'].map(h => (
              <th key={h} className="px-6 py-3">
                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td className="px-6 py-4">
                <div className="space-y-1.5">
                  <div className="h-3 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-2.5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </td>
              <td className="px-6 py-4"><div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" /></td>
              <td className="px-6 py-4"><div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" /></td>
              <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" /></td>
              <td className="px-6 py-4 text-right"><div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded ml-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RecentSubmissionsTable = ({ submissions, style = {} }) => {
  if (!submissions) return <RecentSubmissionsSkeleton />;

  const getAnnexFilterValue = (annexName) => {
    if (annexName === 'Summary') return 'SUMMARY';
    const match = annexName.match(/Annex ([A-O])/);
    return match ? match[1] : '';
  };

  const handleViewDetails = (submission) => {
    const params = new URLSearchParams({
      annex:  getAnnexFilterValue(submission.annex),
      status: submission.status,
      year:   submission.academic_year,
    });
    router.visit(`/admin/submissions/${submission.hei_id}?${params.toString()}`);
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-up"
      style={style}
    >
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
              {['HEI', 'Form', 'Submitted', 'Status', 'Action'].map(header => (
                <th
                  key={header}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${header === 'Action' ? 'text-right' : 'text-left'}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {submissions.map((submission, i) => (
              <tr
                key={`${submission.annex}-${submission.id}`}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                style={{
                  animation: `fadeUp 0.35s ease-out ${i * 40}ms both`,
                }}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{submission.hei_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{submission.hei_code}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{submission.annex}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{submission.submitted_at}</span>
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
