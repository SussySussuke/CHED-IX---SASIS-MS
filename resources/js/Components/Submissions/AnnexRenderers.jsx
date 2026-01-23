import React from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { HotTable } from '@handsontable/react';

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

export const renderAnnexH = (data, isDark) => {
    const admissionServices = data.admission_services || [];
    const admissionStatistics = data.admission_statistics || [];

    const servicesColumns = [
        { data: 'service_type', title: 'Service Type', type: 'text', readOnly: true, width: 350 },
        { data: 'with', title: 'With', type: 'checkbox', readOnly: true, width: 80 },
        { data: 'supporting_documents', title: 'Supporting Documents', type: 'text', readOnly: true, width: 250 },
        { data: 'remarks', title: 'Remarks', type: 'text', readOnly: true, width: 250 },
    ];

    const statisticsColumns = [
        { data: 'program', title: 'Program', type: 'text', readOnly: true, width: 300 },
        { data: 'applicants', title: 'Applicants', type: 'numeric', readOnly: true, width: 120 },
        { data: 'admitted', title: 'Admitted', type: 'numeric', readOnly: true, width: 120 },
        { data: 'enrolled', title: 'Enrolled', type: 'numeric', readOnly: true, width: 120 },
    ];

    return (
        <div className="space-y-4">
            {admissionServices.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Admission Services/Requirements ({admissionServices.length})</h3>
                    <div className="overflow-auto">
                        <HotTable
                            data={admissionServices}
                            colHeaders={true}
                            rowHeaders={true}
                            columns={servicesColumns}
                            height="auto"
                            licenseKey="non-commercial-and-evaluation"
                            readOnly={true}
                            stretchH="all"
                            className={isDark ? 'dark-table' : ''}
                        />
                    </div>
                </div>
            )}
            {admissionStatistics.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Admission Statistics ({admissionStatistics.length})</h3>
                    <div className="overflow-auto">
                        <HotTable
                            data={admissionStatistics}
                            colHeaders={true}
                            rowHeaders={true}
                            columns={statisticsColumns}
                            height="auto"
                            licenseKey="non-commercial-and-evaluation"
                            readOnly={true}
                            stretchH="all"
                            className={isDark ? 'dark-table' : ''}
                        />
                    </div>
                </div>
            )}
            {admissionServices.length === 0 && admissionStatistics.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">No data available.</p>
            )}
        </div>
    );
};

export const renderAnnexM = (data, isDark) => {
    const statistics = data.statistics || [];
    const services = data.services || [];

    return (
        <div className="space-y-4">
            {statistics.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Enrollment and Graduate Statistics ({statistics.length} rows)</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border-r border-gray-200 dark:border-gray-600">Category</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border-r border-gray-200 dark:border-gray-600">Subcategory</th>
                                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border-r border-gray-200 dark:border-gray-600">2023-2024 Enroll</th>
                                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border-r border-gray-200 dark:border-gray-600">2023-2024 Grad</th>
                                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border-r border-gray-200 dark:border-gray-600">2022-2023 Enroll</th>
                                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border-r border-gray-200 dark:border-gray-600">2022-2023 Grad</th>
                                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border-r border-gray-200 dark:border-gray-600">2021-2022 Enroll</th>
                                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">2021-2022 Grad</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {statistics.map((row, index) => (
                                    <tr key={index} className={row.is_subtotal ? 'bg-gray-100 dark:bg-gray-700 font-semibold' : ''}>
                                        <td className="px-2 py-2 text-sm border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{row.category}</td>
                                        <td className="px-2 py-2 text-sm border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{row.subcategory || 'TOTAL'}</td>
                                        <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{row.ay_2023_2024_enrollment}</td>
                                        <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{row.ay_2023_2024_graduates}</td>
                                        <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{row.ay_2022_2023_enrollment}</td>
                                        <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{row.ay_2022_2023_graduates}</td>
                                        <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{row.ay_2021_2022_enrollment}</td>
                                        <td className="px-2 py-2 text-sm text-center text-gray-900 dark:text-gray-100">{row.ay_2021_2022_graduates}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {services.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Institutional Services and Programs ({services.length} entries)</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border-r border-gray-200 dark:border-gray-600">Section</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border-r border-gray-200 dark:border-gray-600">Category</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border-r border-gray-200 dark:border-gray-600">Services/Programs/Activities</th>
                                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border-r border-gray-200 dark:border-gray-600">Beneficiaries</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {services.map((row, index) => (
                                    <tr key={index}>
                                        <td className="px-2 py-2 text-sm border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{row.section}</td>
                                        <td className="px-2 py-2 text-sm border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{row.category}</td>
                                        <td className="px-2 py-2 text-sm border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{row.institutional_services_programs_activities}</td>
                                        <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{row.number_of_beneficiaries_participants}</td>
                                        <td className="px-2 py-2 text-sm text-gray-900 dark:text-gray-100">{row.remarks || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {statistics.length === 0 && services.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">No data available.</p>
            )}
        </div>
    );
};
