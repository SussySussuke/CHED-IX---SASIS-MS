import React from 'react';
import { Link } from '@inertiajs/react';
import { IoChevronDown, IoChevronUp, IoEye } from 'react-icons/io5';
import { formatDateTime } from '../../Utils/formatters';
import StatusBadge from '../Widgets/StatusBadge';
import { ANNEX_NAMES } from '../../Config/formConfig';
import { renderBatchContent } from './renderers';

/**
 * Individual submission row with expand/collapse functionality
 * Handles the display and interaction for a single submission
 */
export default function SubmissionExpand({
    submission,
    mode,
    isExpanded,
    batchData,
    isLoading,
    isDark,
    onToggle,
    onApprove,
    onReject,
    onCompare
}) {
    const key = `${submission.annex}-${submission.batch_id}`;
    const data = batchData[key];

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                onClick={() => onToggle(submission.batch_id, submission.annex)}
            >
                <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                    {/* Annex Name */}
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                            {submission.annex === 'SUMMARY' ? 'Summary' : `Annex ${submission.annex}`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {submission.annex === 'SUMMARY' ? 'School Details' : ANNEX_NAMES[submission.annex]}
                        </div>
                    </div>

                    {/* Academic Year */}
                    <div className="text-sm text-gray-900 dark:text-white">
                        {submission.academic_year}
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <StatusBadge status={submission.status} />
                    </div>

                    {/* Submitted Date */}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(submission.submitted_at || submission.created_at)}
                    </div>

                    {/* Request Notes */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {submission.request_notes || '-'}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end items-center gap-2">
                        {/* HEI Mode: Edit Button */}
                        {mode === 'hei' && (
                            <Link
                                href={submission.annex === 'SUMMARY' 
                                    ? `/hei/summary/${submission.id}/edit`
                                    : `/hei/annex-${submission.annex.toLowerCase()}/${submission.submission_id || submission.batch_id}/edit`
                                }
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Edit
                            </Link>
                        )}

                        {/* Admin Mode: Action Buttons */}
                        {mode === 'admin' && submission.status === 'request' && (
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => onCompare(submission)}
                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                                >
                                    <IoEye size={14} /> Compare
                                </button>
                                <button
                                    onClick={() => onApprove(submission.id, submission.annex)}
                                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => onReject(submission.id, submission.annex)}
                                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Reject
                                </button>
                            </div>
                        )}

                        {/* Expand/Collapse Icon */}
                        {isExpanded ? (
                            <IoChevronUp className="text-gray-400" size={20} />
                        ) : (
                            <IoChevronDown className="text-gray-400" size={20} />
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading data...</p>
                        </div>
                    ) : data ? (
                        renderBatchContent(submission.annex, data, isDark)
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">Failed to load data.</p>
                    )}
                </div>
            )}
        </div>
    );
}
