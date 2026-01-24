import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { IoCreate, IoChevronDown } from 'react-icons/io5';
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
    createButtonUrl,
    selectedYear // Add selectedYear prop
}) {
    const [showDropdown, setShowDropdown] = useState(false);

    // Get year parameter for URLs
    const yearParam = selectedYear ? `?year=${selectedYear}` : '';

    // Build form options for dropdown
    const formOptions = [
        { value: 'SUMMARY', label: 'Summary - School Details', url: `/hei/summary/create${yearParam}` },
        ...Object.keys(ANNEX_NAMES)
            .sort()
            .map(annex => ({
                value: annex,
                label: `Annex ${annex} - ${ANNEX_NAMES[annex]}`,
                url: `/hei/annex-${annex.toLowerCase()}/submit${yearParam}`
            }))
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
            {showCreateButton && (
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Submissions</h2>
                    
                    {/* Show dropdown if "all" is selected, otherwise show direct link */}
                    {filterAnnex === 'all' ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <IoCreate />
                                Create New...
                                <IoChevronDown className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showDropdown && (
                                <>
                                    {/* Backdrop to close dropdown */}
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setShowDropdown(false)}
                                    />
                                    
                                    {/* Dropdown menu */}
                                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20 max-h-96 overflow-y-auto">
                                        <div className="py-2">
                                            {formOptions.map(option => (
                                                <Link
                                                    key={option.value}
                                                    href={option.url}
                                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    {option.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link
                            href={filterAnnex === 'SUMMARY' 
                                ? `/hei/summary/create${yearParam}`
                                : `/hei/annex-${filterAnnex.toLowerCase()}/submit${yearParam}`
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <IoCreate />
                            Create New {filterAnnex === 'SUMMARY' ? 'Summary' : (filterAnnex === 'D' || filterAnnex === 'G' ? 'Submission' : 'Batch')}
                        </Link>
                    )}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {mode === 'hei' ? 'Select Form' : 'Filter by Form'}
                    </label>
                    <select
                        value={filterAnnex}
                        onChange={(e) => handleAnnexChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        {/* Both HEI and Admin now have "All" option */}
                        <option value="all">All Forms</option>
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
