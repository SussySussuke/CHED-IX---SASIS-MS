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
  const { showCancelModal, selectedId, handleCancel, handleCancelConfirm, handleCancelClose } = useCancelSubmission('annex-l');
  const [expandedBatches, setExpandedBatches] = useState({});
  const [batchHousing, setBatchHousing] = useState({});

  const toggleBatch = async (batchId) => {
    if (expandedBatches[batchId]) {
      setExpandedBatches(prev => ({ ...prev, [batchId]: false }));
    } else {
      setExpandedBatches(prev => ({ ...prev, [batchId]: true }));
      if (!batchHousing[batchId]) {
        try {
          const response = await fetch(`/hei/annex-l/${batchId}/housing`);
          const data = await response.json();
          setBatchHousing(prev => ({ ...prev, [batchId]: data.housing }));
        } catch (error) {
          console.error('Failed to fetch housing:', error);
        }
      }
    }
  };

  const columns = [
    { data: 'housing_name', title: 'Housing Name', type: 'text', readOnly: true, width: 250 },
    { data: 'complete_address', title: 'Complete Address', type: 'text', readOnly: true, width: 300 },
    { data: 'house_manager_name', title: 'House Manager Name', type: 'text', readOnly: true, width: 200 },
    { data: 'male', title: 'Male', type: 'checkbox', readOnly: true, width: 80, className: 'htCenter' },
    { data: 'female', title: 'Female', type: 'checkbox', readOnly: true, width: 80, className: 'htCenter' },
    { data: 'coed', title: 'Co-ed', type: 'checkbox', readOnly: true, width: 80, className: 'htCenter' },
    { data: 'others', title: 'Others', type: 'text', readOnly: true, width: 150 },
    { data: 'remarks', title: 'Remarks', type: 'text', readOnly: true, width: 200 }
  ];

  return (
    <HEILayout title="Annex L History">
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>
      <div className="space-y-6">
        <HistoryHeader
          annexName="L"
          submitUrl="/hei/annex-l/submit"
        />
        {batches.length === 0 ? (
          <EmptyState title="No Submissions Yet" message="You haven't submitted any Annex L data yet." buttonText="Create Your First Submission" buttonHref="/hei/annex-l/submit" />
        ) : (
          <div className="space-y-2">
            {batches.map((batch) => {
              const canCancel = batch.status === 'request';
              const isPublished = batch.status === 'published';
              const isExpanded = expandedBatches[batch.batch_id];
              const housing = batchHousing[batch.batch_id] || [];
              return (
                <BatchCard
                  key={batch.batch_id}
                  batch={batch}
                  isExpanded={isExpanded}
                  onToggle={() => toggleBatch(batch.batch_id)}
                  editUrl={`/hei/annex-l/${batch.batch_id}/edit`}
                  onCancel={() => handleCancel(batch.batch_id)}
                >
                  <div className="overflow-auto">
                    <HotTable data={housing} colHeaders={true} rowHeaders={true} columns={columns} height="auto" licenseKey="non-commercial-and-evaluation" stretchH="all" className={isDark ? 'dark-table' : ''} />
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
