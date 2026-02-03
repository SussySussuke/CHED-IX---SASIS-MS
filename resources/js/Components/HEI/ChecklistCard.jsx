import React from 'react';
import { Link } from '@inertiajs/react';
import { IoDocument, IoBook, IoChevronForward } from 'react-icons/io5';
import StatusBadge from '../Widgets/StatusBadge';
import { getFormName } from '../../Config/formConfig';

const ChecklistCard = ({ annex, status, lastUpdated, selectedYear }) => {
  // Determine filter URL - no status filters, just annex and year
  const getFilterUrl = () => {
    const baseUrl = '/hei/submissions/history';
    const params = new URLSearchParams();

    params.append('annex', annex);
    
    // Add academic year filter
    if (selectedYear) {
      params.append('year', selectedYear);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const CardIcon = annex === 'SUMMARY' ? IoBook : IoDocument;

  // Get the display name from formConfig (single source of truth)
  const displayName = getFormName(annex);

  // Format the full display text
  const fullDisplayName = annex === 'SUMMARY' 
    ? displayName
    : annex.startsWith('MER')
      ? displayName
      : `Annex ${annex}: ${displayName}`;

  // Show badge for: submitted, published, under review, and not started
  const shouldShowBadge = ['submitted', 'published', 'request', 'not_started'].includes(status);

  return (
    <Link
      href={getFilterUrl()}
      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="p-1.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <CardIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
              {fullDisplayName}
            </h3>
            {shouldShowBadge && <StatusBadge status={status} />}
          </div>
          {lastUpdated && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Updated {new Date(lastUpdated).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <IoChevronForward className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
    </Link>
  );
};

export default ChecklistCard;
