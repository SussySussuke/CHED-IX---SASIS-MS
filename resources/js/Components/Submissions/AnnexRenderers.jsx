import React from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';
import AGGridViewer from '../Common/AGGridViewer';

// Annex D Renderer
export const renderAnnexD = (data, isDark) => {
    const submission = data.submission || data.batch;
    if (!submission) {
        return <p className="text-gray-500 dark:text-gray-400">No data available.</p>;
    }

    const sections = [
        {
            title: 'BASIC INFORMATION',
            fields: [
                { label: 'Version Publication Date', key: 'version_publication_date' },
                { label: 'Officer in Charge', key: 'officer_in_charge' },
                { label: 'Handbook Committee', key: 'handbook_committee' },
            ]
        },
        {
            title: 'MODE OF DISSEMINATION',
            fields: [
                { label: 'Dissemination Orientation', key: 'dissemination_orientation', isBoolean: true },
                { label: 'Orientation Dates', key: 'orientation_dates' },
                { label: 'Mode of Delivery', key: 'mode_of_delivery' },
                { label: 'Dissemination Uploaded', key: 'dissemination_uploaded', isBoolean: true },
                { label: 'Dissemination Others', key: 'dissemination_others', isBoolean: true },
                { label: 'Dissemination Others Text', key: 'dissemination_others_text' },
            ]
        },
        {
            title: 'TYPE OF HANDBOOK/MANUAL',
            fields: [
                { label: 'Type Digital', key: 'type_digital', isBoolean: true },
                { label: 'Type Printed', key: 'type_printed', isBoolean: true },
                { label: 'Type Others', key: 'type_others', isBoolean: true },
                { label: 'Type Others Text', key: 'type_others_text' },
            ]
        },
        {
            title: 'CHECKLIST',
            fields: [
                { label: 'Academic Policies', key: 'has_academic_policies', isBoolean: true },
                { label: 'Admission Requirements', key: 'has_admission_requirements', isBoolean: true },
                { label: 'Code of Conduct', key: 'has_code_of_conduct', isBoolean: true },
                { label: 'Scholarships', key: 'has_scholarships', isBoolean: true },
                { label: 'Student Publication', key: 'has_student_publication', isBoolean: true },
                { label: 'Housing Services', key: 'has_housing_services', isBoolean: true },
                { label: 'Disability Services', key: 'has_disability_services', isBoolean: true },
                { label: 'Student Council', key: 'has_student_council', isBoolean: true },
                { label: 'Refund Policies', key: 'has_refund_policies', isBoolean: true },
                { label: 'Drug Education', key: 'has_drug_education', isBoolean: true },
                { label: 'Foreign Students', key: 'has_foreign_students', isBoolean: true },
                { label: 'Disaster Management', key: 'has_disaster_management', isBoolean: true },
                { label: 'Safe Spaces', key: 'has_safe_spaces', isBoolean: true },
                { label: 'Anti Hazing', key: 'has_anti_hazing', isBoolean: true },
                { label: 'Anti Bullying', key: 'has_anti_bullying', isBoolean: true },
                { label: 'Violence Against Women', key: 'has_violence_against_women', isBoolean: true },
                { label: 'Gender Fair', key: 'has_gender_fair', isBoolean: true },
                { label: 'Others', key: 'has_others', isBoolean: true },
                { label: 'Others Text', key: 'has_others_text' },
            ]
        }
    ];

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 text-sm border border-gray-300 dark:border-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">Field</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">Value</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sections.map(section => (
                        <React.Fragment key={section.title}>
                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                                <td colSpan={2} className="px-3 py-2 font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{section.title}</td>
                            </tr>
                            {section.fields.map(field => (
                                <tr key={field.key}>
                                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">{field.label}</td>
                                    <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                                        {field.isBoolean ? (
                                            submission[field.key] ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">No</span>
                                        ) : (
                                            submission[field.key] || <span className="text-gray-400 dark:text-gray-500">NULL</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Annex G Renderer
export const renderAnnexG = (data, isDark) => {
    const formData = data.form_data;
    const editorialBoards = data.editorial_boards || [];

    const editorialBoardColumns = [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
        { field: 'position_in_editorial_board', headerName: 'Position', flex: 1, minWidth: 200 },
        { field: 'degree_program_year_level', headerName: 'Degree Program & Year', flex: 1, minWidth: 250 }
    ];

    return (
        <div className="space-y-4">
            {formData && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Publication Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {formData.official_school_name && (
                            <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">School Name:</span>
                                <p className="text-gray-900 dark:text-white">{formData.official_school_name}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {editorialBoards.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Editorial Board Members ({editorialBoards.length} entries)</h3>
                    <AGGridViewer
                        rowData={editorialBoards}
                        columnDefs={editorialBoardColumns}
                        height="400px"
                        paginationPageSize={10}
                    />
                </div>
            )}
        </div>
    );
};

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

// Annex M Renderer (keeping the complex one from original)
export const renderAnnexM = (data, isDark) => {
    const statistics = data.statistics || [];
    const services = data.services || [];

    // Extract years from year_data
    let years = [];
    if (statistics.length > 0) {
        const yearSet = new Set();
        statistics.forEach(stat => {
            let yearData = stat.year_data;
            if (typeof yearData === 'string') {
                try {
                    yearData = JSON.parse(yearData);
                } catch (e) {
                    console.error('Failed to parse year_data:', e);
                    return;
                }
            }
            if (yearData && typeof yearData === 'object' && !Array.isArray(yearData)) {
                Object.keys(yearData).forEach(year => yearSet.add(year));
            }
        });
        years = Array.from(yearSet).sort();
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

    const getYearData = (row) => {
        let yearData = row.year_data;
        if (typeof yearData === 'string') {
            try {
                yearData = JSON.parse(yearData);
            } catch (e) {
                return {};
            }
        }
        return yearData || {};
    };

    const getTotalEnrollment = (row) => {
        const yearData = getYearData(row);
        return years.reduce((sum, year) =>
            sum + (parseInt(yearData[year]?.enrollment) || 0), 0);
    };

    const getTotalGraduates = (row) => {
        const yearData = getYearData(row);
        return years.reduce((sum, year) =>
            sum + (parseInt(yearData[year]?.graduates) || 0), 0);
    };

    const renderStatisticsTable = () => {
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

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th rowSpan="2" className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">Category</th>
                            <th rowSpan="2" className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">Subcategory</th>
                            {years.map(year => (
                                <th key={year} colSpan="2" className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">
                                    AY {year}
                                </th>
                            ))}
                            <th colSpan="2" className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-b border-gray-200 dark:border-gray-600">Total</th>
                        </tr>
                        <tr>
                            {years.map(year => (
                                <React.Fragment key={year}>
                                    <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Enroll</th>
                                    <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Grad</th>
                                </React.Fragment>
                            ))}
                            <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Enroll</th>
                            <th className="px-2 py-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Grad</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {statistics.map((row, index) => {
                            const isFirstInCategory = index === 0 || statistics[index - 1].category !== row.category;
                            const categoryInfo = categoryStartIndices[row.category];
                            const rowspan = isFirstInCategory ? categoryInfo.count : 0;
                            const isReadOnly = row.is_subtotal || row.category === 'TOTAL';
                            const bgClass = isReadOnly ? 'bg-gray-100 dark:bg-gray-700/50 font-semibold' : 'bg-white dark:bg-gray-800';

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
                                        const yearData = getYearData(row);
                                        return (
                                            <React.Fragment key={year}>
                                                <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                                                    {yearData[year]?.enrollment ?? 0}
                                                </td>
                                                <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                                                    {yearData[year]?.graduates ?? 0}
                                                </td>
                                            </React.Fragment>
                                        );
                                    })}
                                    <td className="px-2 py-2 text-sm text-center font-semibold border-r border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                        {getTotalEnrollment(row)}
                                    </td>
                                    <td className="px-2 py-2 text-sm text-center font-semibold bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                        {getTotalGraduates(row)}
                                    </td>
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
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Category</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Institutional Services/Programs/Activities</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">No. of Beneficiaries/Participants</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sectionServices.map((service, index) => (
                            <tr key={index}>
                                <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                                    {service.category || '-'}
                                </td>
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

// Summary Renderer
export const renderSummary = (data) => {
    const info = data.summary;
    if (!info) return <p className="text-gray-500 dark:text-gray-400">No data available.</p>;

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Academic Year:</span>
                    <p className="text-gray-900 dark:text-white">{info.academic_year}</p>
                </div>
                <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
                    <p className="text-gray-900 dark:text-white capitalize">{info.status}</p>
                </div>
                <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Male Population:</span>
                    <p className="text-gray-900 dark:text-white">{info.population_male?.toLocaleString()}</p>
                </div>
                <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Female Population:</span>
                    <p className="text-gray-900 dark:text-white">{info.population_female?.toLocaleString()}</p>
                </div>
                <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Intersex Population:</span>
                    <p className="text-gray-900 dark:text-white">{info.population_intersex?.toLocaleString()}</p>
                </div>
                <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Total Population:</span>
                    <p className="text-gray-900 dark:text-white">{info.population_total?.toLocaleString()}</p>
                </div>
                {info.hei_website && (
                    <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">HEI Website:</span>
                        <p className="text-gray-900 dark:text-white break-all">{info.hei_website}</p>
                    </div>
                )}
                {info.sas_website && (
                    <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">SAS Website:</span>
                        <p className="text-gray-900 dark:text-white break-all">{info.sas_website}</p>
                    </div>
                )}
                {info.student_handbook && (
                    <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Student Handbook:</span>
                        <p className="text-gray-900 dark:text-white">{info.student_handbook}</p>
                    </div>
                )}
                {info.student_publication && (
                    <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Student Publication:</span>
                        <p className="text-gray-900 dark:text-white">{info.student_publication}</p>
                    </div>
                )}
            </div>
            {info.social_media_contacts && info.social_media_contacts.length > 0 && (
                <div className="mt-4">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Social Media Contacts:</span>
                    <ul className="list-disc list-inside text-gray-900 dark:text-white mt-1">
                        {info.social_media_contacts.map((contact, idx) => (
                            <li key={idx} className="break-all">{contact}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
