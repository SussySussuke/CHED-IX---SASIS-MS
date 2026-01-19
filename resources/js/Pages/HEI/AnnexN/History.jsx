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
  const { showCancelModal, selectedId, handleCancel, handleCancelConfirm, handleCancelClose } = useCancelSubmission('annex-n');
  const [expandedBatches, setExpandedBatches] = useState({});
  const [batchActivities, setBatchActivities] = useState({});

  const toggleBatch = async (batchId) => {
    if (expandedBatches[batchId]) {
      setExpandedBatches(prev => ({ ...prev, [batchId]: false }));
    } else {
      setExpandedBatches(prev => ({ ...prev, [batchId]: true }));
      if (!batchActivities[batchId]) {
        try {
          const response = await fetch(`/hei/annex-n/${batchId}/activities`);
          const data = await response.json();
          setBatchActivities(prev => ({ ...prev, [batchId]: data }));
        } catch (error) {
          console.error('Failed to fetch activities:', error);
        }
      }
    }
  };

  const columns = [
    { data: 'title_of_activity', title: 'Title of Activity', type: 'text', readOnly: true, width: 300 },
    { data: 'implementation_date', title: 'Implementation Date', type: 'date', dateFormat: 'YYYY-MM-DD', readOnly: true, width: 150 },
    { data: 'implementation_venue', title: 'Implementation Venue', type: 'text', readOnly: true, width: 250 },
    { data: 'number_of_participants', title: 'Number of Participants', type: 'numeric', readOnly: true, width: 150 },
    { data: 'organizer', title: 'Organizer', type: 'text', readOnly: true, width: 200 },
    { data: 'remarks', title: 'Remarks', type: 'text', readOnly: true, width: 200 }
  ];

  return (
    <HEILayout title="Annex N History">
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>
      <div className="space-y-6">
        <HistoryHeader
          annexName="N"
          submitUrl="/hei/annex-n/submit"
        />
        {batches.length === 0 ? (
          <EmptyState title="No Submissions Yet" message="You haven't submitted any Annex N data yet." buttonText="Create Your First Submission" buttonHref="/hei/annex-n/submit" />
        ) : (
          <div className="space-y-2">
            {batches.map((batch) => {
              const canCancel = batch.status === 'request';
              const isPublished = batch.status === 'published';
              const isExpanded = expandedBatches[batch.batch_id];
              const activities = batchActivities[batch.batch_id] || [];
              return (
                <BatchCard
                  key={batch.batch_id}
                  batch={batch}
                  isExpanded={isExpanded}
                  onToggle={() => toggleBatch(batch.batch_id)}
                  editUrl={`/hei/annex-n/${batch.batch_id}/edit`}
                  onCancel={() => handleCancel(batch.batch_id)}
                >
                  <div className="overflow-auto">
                    <HotTable data={activities} colHeaders={true} rowHeaders={true} columns={columns} height="auto" licenseKey="non-commercial-and-evaluation" stretchH="all" className={isDark ? 'dark-table' : ''} />
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
