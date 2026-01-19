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
  const { showCancelModal, selectedId, handleCancel, handleCancelConfirm, handleCancelClose } = useCancelSubmission('annex-i');
  const [expandedBatches, setExpandedBatches] = useState({});
  const [batchScholarships, setBatchScholarships] = useState({});

  const toggleBatch = async (batchId) => {
    if (expandedBatches[batchId]) {
      setExpandedBatches(prev => ({ ...prev, [batchId]: false }));
    } else {
      setExpandedBatches(prev => ({ ...prev, [batchId]: true }));

      if (!batchScholarships[batchId]) {
        try {
          const response = await fetch(`/hei/annex-i/${batchId}/scholarships`);
          const data = await response.json();
          setBatchScholarships(prev => ({ ...prev, [batchId]: data }));
        } catch (error) {
          console.error('Failed to fetch scholarships:', error);
        }
      }
    }
  };

  const columns = [
    {
      data: 'scholarship_name',
      title: 'Scholarship Name',
      type: 'text',
      readOnly: true,
      width: 250
    },
    {
      data: 'type',
      title: 'Type',
      type: 'text',
      readOnly: true,
      width: 150
    },
    {
      data: 'category_intended_beneficiaries',
      title: 'Category/Intended Beneficiaries',
      type: 'text',
      readOnly: true,
      width: 250
    },
    {
      data: 'number_of_beneficiaries',
      title: 'Number of Beneficiaries',
      type: 'numeric',
      readOnly: true,
      width: 150
    },
    {
      data: 'remarks',
      title: 'Remarks',
      type: 'text',
      readOnly: true,
      width: 200
    }
  ];

  return (
    <HEILayout title="Annex I History">
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>

      <div className="space-y-6">
        <HistoryHeader
          annexName="I"
          submitUrl="/hei/annex-i/submit"
        />

        {batches.length === 0 ? (
          <EmptyState
            title="No Submissions Yet"
            message="You haven't submitted any Annex I data yet."
            buttonText="Create Your First Submission"
            buttonHref="/hei/annex-i/submit"
          />
        ) : (
          <div className="space-y-2">
            {batches.map((batch) => {
              const canCancel = batch.status === 'request';
              const isPublished = batch.status === 'published';
              const isExpanded = expandedBatches[batch.batch_id];
              const scholarships = batchScholarships[batch.batch_id] || [];

              return (
                <BatchCard
                  key={batch.batch_id}
                  batch={batch}
                  isExpanded={isExpanded}
                  onToggle={() => toggleBatch(batch.batch_id)}
                  editUrl={`/hei/annex-i/${batch.batch_id}/edit`}
                  onCancel={() => handleCancel(batch.batch_id)}
                >
                  <div className="overflow-auto">
                    <HotTable
                      data={scholarships}
                      colHeaders={true}
                      rowHeaders={true}
                      columns={columns}
                      height="auto"
                      licenseKey="non-commercial-and-evaluation"
                      stretchH="all"
                      className={isDark ? 'dark-table' : ''}
                    />
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
