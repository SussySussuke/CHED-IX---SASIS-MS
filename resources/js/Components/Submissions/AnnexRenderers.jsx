import React from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';
import AGGridViewer from '../Common/AGGridViewer';

/**
 * Custom Renderers for Complex Forms
 * 
 * ONLY H and M remain here - they have unique structures that are too complex for SharedRenderer:
 * - H (Admission Services): Two different table types with special structure
 * - M (Sports Development): Complex year-based multi-table with grouping
 * 
 * All other forms now use SharedRenderer!
 */

// Annex H Renderer
export const renderAnnexH = (data, isDark) => {
    const admissionServices = data.admission_services || [];
    const admissionStatistics = data.admission_statistics || [];

    const servicesColumns = [
        { field: 'service_type', headerName: 'Service Type', flex: 1, minWidth: 250 },
        { 
            field: 'with', 
            headerName: 'Available', 
            width: 120,
            cellRenderer: params => params.value ? '✓' : '',
            cellStyle: { textAlign: 'center' }
        },
        { field: 'supporting_documents', headerName: 'Supporting Documents', flex: 1, minWidth: 200 },
        { field: 'remarks', headerName: 'Remarks', flex: 1, minWidth: 200 }
    ];

    const statisticsColumns = [
        { field: 'program', headerName: 'Program', flex: 1, minWidth: 250 },
        { field: 'applicants', headerName: 'Applicants', width: 120, type: 'numericColumn' },
        { field: 'admitted', headerName: 'Admitted', width: 120, type: 'numericColumn' },
        { field: 'enrolled', headerName: 'Enrolled', width: 120, type: 'numericColumn' }
    ];

    return (
        <div className="space-y-6">
            {admissionServices.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Admission Services ({admissionServices.length} entries)</h3>
                    <AGGridViewer
                        rowData={admissionServices}
                        columnDefs={servicesColumns}
                        height="400px"
                        paginationPageSize={10}
                    />
                </div>
            )}
            {admissionStatistics.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Admission Statistics ({admissionStatistics.length} entries)</h3>
                    <AGGridViewer
                        rowData={admissionStatistics}
                        columnDefs={statisticsColumns}
                        height="400px"
                        paginationPageSize={10}
                    />
                </div>
            )}
        </div>
    );
};

// Annex M Renderer
export const renderAnnexM = (data, isDark) => {
    const statistics   = data.statistics   || [];
    const services     = data.services     || [];
    const currentAy    = data.academic_year || null;  // injected by getBatchData

    // Build sorted year list from all year_data keys across all rows.
    // The controller now merges prior-year values into each row's year_data,
    // so every row has the same 3 AY keys — just scan the first non-empty one.
    const getYearData = (row) => {
        const yd = row.year_data;
        if (!yd) return {};
        if (typeof yd === 'string') {
            try { return JSON.parse(yd); } catch { return {}; }
        }
        return yd;
    };

    let years = [];
    for (const row of statistics) {
        const keys = Object.keys(getYearData(row));
        if (keys.length > 0) { years = keys.sort(); break; }
    }

    const SECTIONS = [
        'A. Persons with Disabilities',
        'B. Indigenous People',
        'C. Dependents of Solo Parents / Solo Parents',
        'D. Other students with special needs',
    ];
    const servicesBySection = {};
    SECTIONS.forEach(section => {
        servicesBySection[section] = services.filter(s => s.section === section);
    });

    const renderStatisticsTable = () => {
        // Build category → rowspan map
        let currentCategory = null;
        let categoryRowCount = 0;
        const categoryStartIndices = {};
        statistics.forEach((row, index) => {
            if (row.category !== currentCategory) {
                if (currentCategory !== null) {
                    categoryStartIndices[currentCategory] = { start: index - categoryRowCount, count: categoryRowCount };
                }
                currentCategory = row.category;
                categoryRowCount = 1;
            } else {
                categoryRowCount++;
            }
        });
        if (currentCategory !== null) {
            categoryStartIndices[currentCategory] = { start: statistics.length - categoryRowCount, count: categoryRowCount };
        }

        const thBase = 'px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600';
        const tdRO   = 'px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 italic';

        return (
            <div className="overflow-x-auto">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 italic">
                    Prior years (grayed) are read-only. Current AY <strong>{currentAy}</strong> is highlighted.
                </p>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th rowSpan="2" className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">Category</th>
                            <th rowSpan="2" className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">Subcategory</th>
                            {years.map(year => {
                                const isCurrent = year === currentAy;
                                return (
                                    <th key={year} colSpan="2" className={`${thBase} ${
                                        isCurrent
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                            : 'opacity-60'
                                    }`}>
                                        AY {year}{isCurrent ? ' (current)' : ' (view only)'}
                                    </th>
                                );
                            })}
                        </tr>
                        <tr>
                            {years.map(year => {
                                const isCurrent = year === currentAy;
                                return (
                                    <React.Fragment key={year}>
                                        <th className={`${thBase} font-normal ${
                                            isCurrent
                                                ? 'bg-green-50 dark:bg-green-900/20'
                                                : 'opacity-60'
                                        }`}>Enroll</th>
                                        <th className={`${thBase} font-normal ${
                                            isCurrent
                                                ? 'bg-green-50 dark:bg-green-900/20'
                                                : 'opacity-60'
                                        }`}>Grad</th>
                                    </React.Fragment>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {statistics.map((row, index) => {
                            const isFirstInCategory = index === 0 || statistics[index - 1].category !== row.category;
                            const categoryInfo = categoryStartIndices[row.category];
                            const rowspan = isFirstInCategory ? (categoryInfo?.count ?? 1) : 0;
                            const isSubtotalRow = row.is_subtotal || row.category === 'TOTAL';
                            const bgClass = isSubtotalRow ? 'bg-gray-100 dark:bg-gray-700/50 font-semibold' : 'bg-white dark:bg-gray-800';
                            const yearData = getYearData(row);

                            return (
                                <tr key={index} className={bgClass}>
                                    {isFirstInCategory && (
                                        <td rowSpan={rowspan} className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600 align-top">
                                            {row.category}
                                        </td>
                                    )}
                                    <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                                        {row.subcategory || (row.category === 'TOTAL' ? 'TOTAL' : '')}
                                    </td>
                                    {years.map(year => {
                                        const isCurrent = year === currentAy;
                                        const enroll = parseInt(yearData[year]?.enrollment) || 0;
                                        const grads  = parseInt(yearData[year]?.graduates)  || 0;
                                        return (
                                            <React.Fragment key={year}>
                                                <td className={isCurrent
                                                    ? 'px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 bg-green-50/30 dark:bg-green-900/10 text-gray-900 dark:text-gray-100'
                                                    : tdRO
                                                }>{enroll}</td>
                                                <td className={isCurrent
                                                    ? 'px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 bg-green-50/30 dark:bg-green-900/10 text-gray-900 dark:text-gray-100'
                                                    : tdRO
                                                }>{grads}</td>
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderServicesTable = (section) => {
        const sectionServices = servicesBySection[section] || [];
        
        if (sectionServices.length === 0) {
            return (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic ml-4">No services for this section.</p>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Institutional Services/Programs/Activities</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">No. of Beneficiaries/Participants</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sectionServices.map((service, index) => (
                            <tr key={index}>
                                <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                                    {service.institutional_services_programs_activities}
                                </td>
                                <td className="px-3 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                                    {service.number_of_beneficiaries_participants?.toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                                    {service.remarks || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {statistics.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Table 1: Statistics</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Enrollment and graduate statistics across the last three academic years.
                    </p>
                    {renderStatisticsTable()}
                </div>
            )}
            {services.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Table 2: Services</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Institutional services, programs, and activities for each category of students with special needs.
                    </p>
                    <div className="space-y-4">
                        {SECTIONS.map(section => (
                            <div key={section}>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{section}</h4>
                                {renderServicesTable(section)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
