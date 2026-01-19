import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import HEILayout from '../../../Layouts/HEILayout';
import CancelSubmissionModal from '../../../Components/Modals/CancelSubmissionModal';
import { IoCheckmarkCircle } from 'react-icons/io5';
import HistoryHeader from '../../../Components/Annex/HistoryHeader';
import BatchCard from '../../../Components/Annex/BatchCard';
import EmptyState from '../../../Components/Annex/EmptyState';

const History = ({ submissions }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [expandedSubmissions, setExpandedSubmissions] = useState({});

  const toggleSubmission = (submissionId) => {
    setExpandedSubmissions(prev => ({
      ...prev,
      [submissionId]: !prev[submissionId]
    }));
  };

  const handleCancel = (submissionId) => {
    setSelectedSubmissionId(submissionId);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = (submissionId, notes) => {
    router.post(`/hei/annex-d/${submissionId}/cancel`, {
      cancelled_notes: notes
    });
    setShowCancelModal(false);
    setSelectedSubmissionId(null);
  };

  const handleCancelClose = () => {
    setShowCancelModal(false);
    setSelectedSubmissionId(null);
  };

  return (
    <HEILayout title="Annex D History">
      <div className="space-y-6">
        <HistoryHeader
          annexName="D"
          entityName="Submission"
          submitUrl="/hei/annex-d/submit"
        />

        {submissions.length === 0 ? (
          <EmptyState
            title="No Submissions Yet"
            message="You haven't submitted any Annex D data yet."
            buttonText="Create Your First Submission"
            buttonHref="/hei/annex-d/submit"
          />
        ) : (
          <div className="space-y-2">
            {submissions.map((submission) => {
              const isExpanded = expandedSubmissions[submission.submission_id];

              return (
                <BatchCard
                  key={submission.submission_id}
                  batch={submission}
                  idKey="submission_id"
                  idLabel="Submission"
                  isExpanded={isExpanded}
                  onToggle={() => toggleSubmission(submission.submission_id)}
                  editUrl={`/hei/annex-d/${submission.submission_id}/edit`}
                  onCancel={() => handleCancel(submission.submission_id)}
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 text-sm border border-gray-300 dark:border-gray-600">
                          <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">Field</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                              <td colSpan={2} className="px-3 py-2 font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">BASIC INFORMATION</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">version_publication_date</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.version_publication_date || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">officer_in_charge</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.officer_in_charge || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">handbook_committee</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.handbook_committee || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                            </tr>

                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                              <td colSpan={2} className="px-3 py-2 font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">MODE OF DISSEMINATION</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">dissemination_orientation</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.dissemination_orientation ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">orientation_dates</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.orientation_dates || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">mode_of_delivery</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.mode_of_delivery || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">dissemination_uploaded</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.dissemination_uploaded ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">dissemination_others</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.dissemination_others ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">dissemination_others_text</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.dissemination_others_text || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                            </tr>

                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                              <td colSpan={2} className="px-3 py-2 font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">TYPE OF HANDBOOK/MANUAL</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">type_digital</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.type_digital ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">type_printed</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.type_printed ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">type_others</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.type_others ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">type_others_text</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.type_others_text || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                            </tr>

                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                              <td colSpan={2} className="px-3 py-2 font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">CHECKLIST</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_academic_policies</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_academic_policies ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_admission_requirements</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_admission_requirements ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_code_of_conduct</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_code_of_conduct ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_scholarships</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_scholarships ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_student_publication</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_student_publication ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_housing_services</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_housing_services ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_disability_services</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_disability_services ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_student_council</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_student_council ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_refund_policies</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_refund_policies ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_drug_education</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_drug_education ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_foreign_students</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_foreign_students ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_disaster_management</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_disaster_management ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_safe_spaces</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_safe_spaces ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_anti_hazing</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_anti_hazing ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_anti_bullying</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_anti_bullying ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_violence_against_women</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_violence_against_women ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_gender_fair</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_gender_fair ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_others</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_others ? <IoCheckmarkCircle className="text-green-500 text-lg" /> : <span className="text-gray-400 dark:text-gray-500">0</span>}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">has_others_text</td>
                              <td className="px-3 py-2 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{submission.has_others_text || <span className="text-gray-400 dark:text-gray-500">NULL</span>}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                </BatchCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Submission Modal */}
      <CancelSubmissionModal
        isOpen={showCancelModal}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        submissionId={selectedSubmissionId}
      />
    </HEILayout>
  );
};

export default History;
