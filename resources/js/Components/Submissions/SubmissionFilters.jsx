import React from 'react';
import { Link } from '@inertiajs/react';
import { IoCreate } from 'react-icons/io5';
import { ANNEX_NAMES } from '../../Config/formConfig';

export default function SubmissionFilters({
    mode,
    filterStatus,
    setFilterStatus,
    filterYear,
    setFilterYear,
    filterAnnex,
    handleAnnexChange,
    annexOptions,
    academicYears,
    showCreateButton,
    createButtonUrl
}) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
            {showCreateButton && (
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Submissions</h2>
                    <Link
                        href={filterAnnex === 'SUMMARY' 
                            ? '/hei/summary/create'
                            : `/hei/annex-${filterAnnex.toLowerCase()}/submit`
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <IoCreate />
                        Create New {filterAnnex === 'SUMMARY' ? 'Summary' : (filterAnnex === 'D' || filterAnnex === 'G' ? 'Submission' : 'Batch')}
                    </Link>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {mode === 'hei' ? 'Select Form' : 'Filter by Form'}
                    </label>
                    <select
                        value={filterAnnex}
                        onChange={(e) => mode === 'hei' ? handleAnnexChange(e.target.value) : handleAnnexChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        {mode === 'admin' && <option value="all">All Form</option>}
                        {annexOptions.map(annex => {
                            // Handle SUMMARY specially
                            if (annex === 'SUMMARY') {
                                return (
                                    <option key="SUMMARY" value="SUMMARY">
                                        Summary - School Details
                                    </option>
                                );
                            }
                            // For standard annexes, look up name in ANNEX_NAMES
                            const name = ANNEX_NAMES[annex];
                            return (
                                <option key={annex} value={annex}>
                                    Annex {annex} - {name || annex}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Filter by Status
                    </label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Statuses</option>
                        {mode === 'hei' && <option value="draft">Draft</option>}
                        <option value="submitted">Submitted</option>
                        <option value="published">Published</option>
                        <option value="request">Pending Requests</option>
                        <option value="overwritten">Overwritten</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Filter by Academic Year
                    </label>
                    <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Years</option>
                        {academicYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
