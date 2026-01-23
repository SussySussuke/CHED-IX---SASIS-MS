import React from 'react';
import HEILayout from '../../../Layouts/HEILayout';
import { useCancelSubmission } from '../../../Hooks/useCancelSubmission';
import CancelSubmissionModal from '../../../Components/Modals/CancelSubmissionModal';
import SubmissionsList from '../../../Components/Submissions/SubmissionsList';

export default function Index({ submissions, selectedAnnex, academicYears }) {
    const { showCancelModal, selectedId, handleCancel, handleCancelConfirm, handleCancelClose } = useCancelSubmission(`annex-${selectedAnnex?.toLowerCase() || 'a'}`);

    return (
        <HEILayout title="Submissions">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Submissions</h1>
                    <p className="text-gray-600 dark:text-gray-400">View and manage all your submissions</p>
                </div>

                <SubmissionsList
                    mode="hei"
                    submissions={submissions}
                    academicYears={academicYears}
                    selectedAnnex={selectedAnnex || 'A'}
                    fetchDataUrl="/hei/submissions/:annex/:batchId/data"
                    onCancel={handleCancel}
                    showCreateButton={true}
                    createButtonUrl={`/hei/annex-${(selectedAnnex || 'A').toLowerCase()}/submit`}
                />
            </div>

            <CancelSubmissionModal
                isOpen={showCancelModal}
                onClose={handleCancelClose}
                onConfirm={handleCancelConfirm}
                submissionId={selectedId}
            />
        </HEILayout>
    );
}
