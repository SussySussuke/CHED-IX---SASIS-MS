import React from 'react';
import AGGridViewer from '../../Common/AGGridViewer';

export const renderMER1 = (data, isDark) => {
    const submission = data.mer1;
    const educationalAttainments = data.educational_attainments || [];
    const trainings = data.trainings || [];

    if (!submission) {
        return <p className="text-gray-500 dark:text-gray-400">No data available.</p>;
    }

    const educationColumns = [
        { field: 'degree_program', headerName: 'Degree Program', flex: 1, minWidth: 200 },
        { field: 'school', headerName: 'School/University', flex: 1, minWidth: 250 },
        { field: 'year', headerName: 'Year', width: 100 }
    ];

    const trainingColumns = [
        { field: 'training_title', headerName: 'Training Title', flex: 1, minWidth: 300 },
        { field: 'period_date', headerName: 'Period/Date', flex: 1, minWidth: 200 }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">SAS Head Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Name:</span>
                        <p className="text-gray-900 dark:text-white">{submission.sas_head_name}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Position:</span>
                        <p className="text-gray-900 dark:text-white">{submission.sas_head_position}</p>
                    </div>
                    {submission.permanent_status && (
                        <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">Permanent Status:</span>
                            <p className="text-gray-900 dark:text-white">{submission.permanent_status}</p>
                        </div>
                    )}
                </div>
            </div>

            {educationalAttainments.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Highest Educational Attainment ({educationalAttainments.length} entries)
                    </h3>
                    <AGGridViewer
                        rowData={educationalAttainments}
                        columnDefs={educationColumns}
                        height="300px"
                        paginationPageSize={10}
                    />
                </div>
            )}

            {trainings.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Latest Training/s Attended ({trainings.length} entries)
                    </h3>
                    <AGGridViewer
                        rowData={trainings}
                        columnDefs={trainingColumns}
                        height="300px"
                        paginationPageSize={10}
                    />
                </div>
            )}

            {submission.other_achievements && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Other Achievements</h3>
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {submission.other_achievements}
                    </p>
                </div>
            )}
        </div>
    );
};