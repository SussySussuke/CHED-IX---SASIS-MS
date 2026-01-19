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

const History = ({ batches }) => {
  const isDark = useDarkMode();
  const { showCancelModal, selectedId, handleCancel, handleCancelConfirm, handleCancelClose } = useCancelSubmission('annex-k');
  const [expandedBatches, setExpandedBatches] = useState({});
  const [batchCommittees, setBatchCommittees] = useState({});

  const toggleBatch = async (batchId) => {
    if (expandedBatches[batchId]) {
      setExpandedBatches(prev => ({ ...prev, [batchId]: false }));
    } else {
      setExpandedBatches(prev => ({ ...prev, [batchId]: true }));
      if (!batchCommittees[batchId]) {
        try {
          const response = await fetch(`/hei/annex-k/${batchId}/committees`);
          const data = await response.json();
          setBatchCommittees(prev => ({ ...prev, [batchId]: data }));
        } catch (error) {
          console.error('Failed to fetch committees:', error);
        }
      }
    }
  };

  const columns = [
    { data: 'committee_name', title: 'Committee Name', type: 'text', readOnly: true, width: 250 },
    { data: 'committee_head_name', title: 'Committee Head Name', type: 'text', readOnly: true, width: 200 },
    { data: 'members_composition', title: 'Members Composition', type: 'text', readOnly: true, width: 200 },
    { data: 'programs_projects_activities_trainings', title: 'Programs/Projects/Activities/Trainings', type: 'text', readOnly: true, width: 300 },
    { data: 'remarks', title: 'Remarks', type: 'text', readOnly: true, width: 200 }
  ];

  return (
    <HEILayout title="Annex K History">
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>
      <div className="space-y-6">
        <HistoryHeader
          annexName="K"
          submitUrl="/hei/annex-k/submit"
        />
        {batches.length === 0 ? (
          <EmptyState title="No Submissions Yet" message="You haven't submitted any Annex K data yet." buttonText="Create Your First Submission" buttonHref="/hei/annex-k/submit" />
        ) : (
          <div className="space-y-2">
            {batches.map((batch) => {
              const canCancel = batch.status === 'request';
              const isPublished = batch.status === 'published';
              const isExpanded = expandedBatches[batch.batch_id];
              const committees = batchCommittees[batch.batch_id] || [];
              return (
                <BatchCard
                  key={batch.batch_id}
                  batch={batch}
                  isExpanded={isExpanded}
                  onToggle={() => toggleBatch(batch.batch_id)}
                  editUrl={`/hei/annex-k/${batch.batch_id}/edit`}
                  onCancel={() => handleCancel(batch.batch_id)}
                >
                  <div className="overflow-auto">
                    <HotTable data={committees} colHeaders={true} rowHeaders={true} columns={columns} height="auto" licenseKey="non-commercial-and-evaluation" stretchH="all" className={isDark ? 'dark-table' : ''} />
                  </div>
                </BatchCard>
              );
            })}
          </div>
        )}
      </div>
      <CancelSubmissionModal
        isOpen={showCancelModal}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        submissionId={selectedId}
      />
    </HEILayout>
  );
};

export default History;
