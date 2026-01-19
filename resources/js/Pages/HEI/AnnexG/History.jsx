import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import HEILayout from '../../../Layouts/HEILayout';
import CancelSubmissionModal from '../../../Components/Modals/CancelSubmissionModal';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { useDarkMode } from '../../../Hooks/useDarkMode';
import { useCancelSubmission } from '../../../Hooks/useCancelSubmission';
import HistoryHeader from '../../../Components/Annex/HistoryHeader';
import BatchCard from '../../../Components/Annex/BatchCard';
import EmptyState from '../../../Components/Annex/EmptyState';
import { HOT_TABLE_DARK_MODE_STYLES } from '../../../Utils/hotTableStyles';

registerAllModules();

const History = ({ submissions }) => {
  const isDark = useDarkMode();
  const { showCancelModal, selectedId, handleCancel, handleCancelConfirm, handleCancelClose } = useCancelSubmission('annex-g');
  const [expandedSubmissions, setExpandedSubmissions] = useState({});
  const [submissionData, setSubmissionData] = useState({});

  const toggleSubmission = async (submissionId) => {
    if (expandedSubmissions[submissionId]) {
      setExpandedSubmissions(prev => ({ ...prev, [submissionId]: false }));
    } else {
      setExpandedSubmissions(prev => ({ ...prev, [submissionId]: true }));

      if (!submissionData[submissionId]) {
        try {
          const response = await fetch(`/hei/annex-g/${submissionId}/data`);
          const data = await response.json();
          setSubmissionData(prev => ({ ...prev, [submissionId]: data }));
        } catch (error) {
          console.error('Failed to fetch submission data:', error);
        }
      }
    }
  };

  const editorialBoardColumns = [
    { data: 'name', title: 'Name', type: 'text', readOnly: true, width: 200 },
    { data: 'position_in_editorial_board', title: 'Position', type: 'text', readOnly: true, width: 200 },
    { data: 'degree_program_year_level', title: 'Degree Program & Year', type: 'text', readOnly: true, width: 250 }
  ];

  const otherPublicationsColumns = [
    { data: 'name_of_publication', title: 'Publication Name', type: 'text', readOnly: true, width: 200 },
    { data: 'department_unit_in_charge', title: 'Department/Unit', type: 'text', readOnly: true, width: 200 },
    { data: 'type_of_publication', title: 'Type', type: 'text', readOnly: true, width: 150 }
  ];

  const programsColumns = [
    { data: 'title_of_program', title: 'Program Title', type: 'text', readOnly: true, width: 250 },
    { data: 'implementation_date', title: 'Date', type: 'date', dateFormat: 'YYYY-MM-DD', readOnly: true, width: 150 },
    { data: 'implementation_venue', title: 'Venue', type: 'text', readOnly: true, width: 200 },
    { data: 'target_group_of_participants', title: 'Target Group', type: 'text', readOnly: true, width: 200 }
  ];

  return (
    <HEILayout title="Annex G History">
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>

      <div className="space-y-6">
        <HistoryHeader
          annexName="G"
          entityName="Submission"
          submitUrl="/hei/annex-g/submit"
        />

        {submissions.length === 0 ? (
          <EmptyState
            title="No Submissions Yet"
            message="You haven't submitted any Annex G data yet."
            buttonText="Create Your First Submission"
            buttonHref="/hei/annex-g/submit"
          />
        ) : (
          <div className="space-y-2">
            {submissions.map((submission) => {
              const isExpanded = expandedSubmissions[submission.submission_id];
              const data = submissionData[submission.submission_id];

              return (
                <BatchCard
                  key={submission.submission_id}
                  batch={submission}
                  idKey="submission_id"
                  idLabel="Submission"
                  isExpanded={isExpanded}
                  onToggle={() => toggleSubmission(submission.submission_id)}
                  editUrl={`/hei/annex-g/${submission.submission_id}/edit`}
                  onCancel={() => handleCancel(submission.submission_id)}
                >
                  {data && (
                    <div className="space-y-4">
                      {data.form_data && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Publication Information</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {data.form_data.official_school_name && (
                              <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">School Name:</span>
                                <p className="text-gray-900 dark:text-white">{data.form_data.official_school_name}</p>
                              </div>
                            )}
                            {data.form_data.student_publication_name && (
                              <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Publication Name:</span>
                                <p className="text-gray-900 dark:text-white">{data.form_data.student_publication_name}</p>
                              </div>
                            )}
                            {data.form_data.publication_fee_per_student && (
                              <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Fee per Student:</span>
                                <p className="text-gray-900 dark:text-white">₱{data.form_data.publication_fee_per_student}</p>
                              </div>
                            )}
                            {data.form_data.adviser_name && (
                              <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Adviser:</span>
                                <p className="text-gray-900 dark:text-white">{data.form_data.adviser_name}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {data.editorial_boards && data.editorial_boards.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Editorial Board Members</h3>
                          <div className="overflow-auto">
                            <HotTable
                              data={data.editorial_boards}
                              colHeaders={true}
                              rowHeaders={true}
                              columns={editorialBoardColumns}
                              height="auto"
                              licenseKey="non-commercial-and-evaluation"
                              stretchH="all"
                              className={isDark ? 'dark-table' : ''}
                            />
                          </div>
                        </div>
                      )}

                      {data.other_publications && data.other_publications.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Other Publications</h3>
                          <div className="overflow-auto">
                            <HotTable
                              data={data.other_publications}
                              colHeaders={true}
                              rowHeaders={true}
                              columns={otherPublicationsColumns}
                              height="auto"
                              licenseKey="non-commercial-and-evaluation"
                              stretchH="all"
                              className={isDark ? 'dark-table' : ''}
                            />
                          </div>
                        </div>
                      )}

                      {data.programs && data.programs.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Training Programs</h3>
                          <div className="overflow-auto">
                            <HotTable
                              data={data.programs}
                              colHeaders={true}
                              rowHeaders={true}
                              columns={programsColumns}
                              height="auto"
                              licenseKey="non-commercial-and-evaluation"
                              stretchH="all"
                              className={isDark ? 'dark-table' : ''}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </BatchCard>
              );
            })}
          </div>
        )}
      </div>

      <CancelSubmissionModal
        show={showCancelModal}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
      />
    </HEILayout>
  );
};

export default History;
