import React from 'react';
import { IoChevronDown, IoChevronForward } from 'react-icons/io5';
import { formatDateTime } from '../../Utils/formatters';
import StatusBadge from './StatusBadge';
import ActionButtons from './ActionButtons';

const BatchCard = ({
  batch,
  isExpanded,
  onToggle,
  editUrl,
  onCancel,
  children,
  idLabel = "Batch",
  idKey = "batch_id"
}) => {
  const canCancel = batch.status === 'request';
  const isPublished = batch.status === 'published';
  const batchId = batch[idKey];
  const displayId = idLabel + " #" + batchId.substring(0, 8);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 overflow-hidden">
      {/* Batch Header */}
      <div className="border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {isExpanded ? (
                <IoChevronDown className="text-lg" />
              ) : (
                <IoChevronForward className="text-lg" />
              )}
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {displayId}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {batch.academic_year}
              </span>
              {batch.programs_count !== undefined && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {batch.programs_count} program{batch.programs_count !== 1 ? 's' : ''}
                </span>
              )}
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {formatDateTime(batch.created_at)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={batch.status} />
            <ActionButtons
              editUrl={editUrl}
              isPublished={isPublished}
              canCancel={canCancel}
              onCancel={onCancel}
            />
          </div>
        </div>
        {batch.request_notes && (
          <div className="px-3 py-2 border-t border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
            <p className="text-xs text-yellow-900 dark:text-yellow-200">
              <strong>Notes:</strong> {batch.request_notes}
            </p>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-300 dark:border-gray-600 p-3 bg-white dark:bg-gray-800">
          {children}
        </div>
      )}
    </div>
  );
};

export default BatchCard;
