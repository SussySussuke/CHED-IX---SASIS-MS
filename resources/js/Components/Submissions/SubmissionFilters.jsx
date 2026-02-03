import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { IoCreate, IoChevronDown } from 'react-icons/io5';
import { FORM_NAMES, getAllAnnexCodes, buildFormOptionsGrouped } from '../../Config/formConfig';
import { MER_FORMS, SUMMARY_FORM } from '../../Config/nonAnnexForms';
import SearchableSelect from '../Form/SearchableSelect';

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
    selectedYear
}) {
    const [showDropdown, setShowDropdown] = useState(false);

    // Get year parameter for URLs
    const yearParam = selectedYear ? `?year=${selectedYear}` : '';

    // Build ALL form options for create dropdown (grouped)
    const createFormOptions = useMemo(() => {
        const grouped = buildFormOptionsGrouped();
        
        // Add URLs to each option
        return grouped.map(group => ({
            ...group,
            options: group.options.map(option => {
                let url;
                if (option.value === 'SUMMARY') {
                    url = `${SUMMARY_FORM.route}${yearParam}`;
                } else if (MER_FORMS[option.value]) {
                    url = `${MER_FORMS[option.value].route}${yearParam}`;
                } else {
                    url = `/hei/annex-${option.value.toLowerCase()}/submit${yearParam}`;
                }
                return { ...option, url };
            })
        }));
    }, [yearParam]);

    // Build filter options (for filtering existing submissions)
    const formSelectOptions = useMemo(() => {
        if (mode === 'hei') {
            // HEI: Show all possible forms with grouping
            const grouped = buildFormOptionsGrouped();
            // Add "All Forms" at the beginning without a group
            const allFormsGroup = grouped[0];
            return [
                {
                    ...allFormsGroup,
                    options: [{ value: 'all', label: 'All Forms' }, ...allFormsGroup.options]
                },
                ...grouped.slice(1)
            ];
        } else {
            // Admin: Build grouped structure from actual submissions
            const allOption = { value: 'all', label: 'All Forms' };
            const summaryOptions = [];
            const merOptions = [];
            const annexOptions_list = [];
            
            annexOptions.forEach(formCode => {
                let label = formCode;
                
                if (formCode === 'SUMMARY') {
                    label = SUMMARY_FORM.name;
                    summaryOptions.push({ value: formCode, label });
                } else if (MER_FORMS[formCode]) {
                    label = MER_FORMS[formCode].name;
                    merOptions.push({ value: formCode, label });
                } else if (FORM_NAMES[formCode]) {
                    label = `Annex ${formCode} - ${FORM_NAMES[formCode]}`;
                    annexOptions_list.push({ value: formCode, label });
                }
            });
            
            const groups = [];
            
            // Add "All Forms" to the first available group
            if (summaryOptions.length > 0) {
                groups.push({ group: 'Institutional Forms', options: [allOption, ...summaryOptions] });
            } else if (merOptions.length > 0) {
                groups.push({ group: 'MER Forms', options: [allOption, ...merOptions] });
                if (annexOptions_list.length > 0) {
                    groups.push({ group: 'Student Services Annexes', options: annexOptions_list });
                }
                return groups;
            } else if (annexOptions_list.length > 0) {
                groups.push({ group: 'Student Services Annexes', options: [allOption, ...annexOptions_list] });
                return groups;
            } else {
                // Fallback if no forms exist
                return [{ group: 'Forms', options: [allOption] }];
            }
            
            if (merOptions.length > 0) {
                groups.push({ group: 'MER Forms', options: merOptions });
            }
            if (annexOptions_list.length > 0) {
                groups.push({ group: 'Student Services Annexes', options: annexOptions_list });
            }
            
            return groups;
        }
    }, [mode, annexOptions]);

    const statusSelectOptions = useMemo(() => [
        { value: 'all', label: 'All Statuses' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'published', label: 'Published' },
        { value: 'request', label: 'Pending Requests' },
        { value: 'overwritten', label: 'Overwritten' },
        { value: 'rejected', label: 'Rejected' }
    ], []);

    const yearSelectOptions = useMemo(() => [
        { value: '', label: 'All Years' },
        ...academicYears.map(year => ({ value: year, label: year }))
    ], [academicYears]);

    // Helper to get the correct URL for the current filter
    const getCurrentCreateUrl = () => {
        if (filterAnnex === 'all') return null;
        
        if (filterAnnex === 'SUMMARY') return `${SUMMARY_FORM.route}${yearParam}`;
        if (MER_FORMS[filterAnnex]) return `${MER_FORMS[filterAnnex].route}${yearParam}`;
        
        // It's an annex
        return `/hei/annex-${filterAnnex.toLowerCase()}/submit${yearParam}`;
    };

    const currentCreateUrl = getCurrentCreateUrl();

    // Group create options by category for the "Create New" dropdown
    const groupedCreateOptions = useMemo(() => {
        const groups = {};
        createFormOptions.forEach(group => {
            groups[group.group] = group.options;
        });
        return groups;
    }, [createFormOptions]);

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
            {showCreateButton && (
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Submissions</h2>
                    
                    {/* Show dropdown if "all" is selected, otherwise show direct link */}
                    {!currentCreateUrl ? (
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
                                    
                                    {/* Dropdown menu with groups */}
                                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20 max-h-96 overflow-y-auto">
                                        <div className="py-2">
                                            {Object.entries(groupedCreateOptions).map(([group, options]) => (
                                                <div key={group}>
                                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                        {group}
                                                    </div>
                                                    {options.map(option => (
                                                        <Link
                                                            key={option.value}
                                                            href={option.url}
                                                            className="block pl-8 pr-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                            onClick={() => setShowDropdown(false)}
                                                        >
                                                            {option.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link
                            href={currentCreateUrl}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <IoCreate />
                            Create New {
                                filterAnnex === 'SUMMARY' ? 'Summary' :
                                MER_FORMS[filterAnnex] ? filterAnnex :
                                (filterAnnex === 'D' || filterAnnex === 'G' ? 'Submission' : 'Batch')
                            }
                        </Link>
                    )}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SearchableSelect
                    label={mode === 'hei' ? 'Select Form' : 'Filter by Form'}
                    value={filterAnnex}
                    onChange={handleAnnexChange}
                    options={formSelectOptions}
                    placeholder="Select form..."
                />
                
                <SearchableSelect
                    label="Filter by Status"
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={statusSelectOptions}
                    placeholder="Select status..."
                />
                
                <SearchableSelect
                    label="Filter by Academic Year"
                    value={filterYear}
                    onChange={setFilterYear}
                    options={yearSelectOptions}
                    placeholder="Select year..."
                />
            </div>
        </div>
    );
}
