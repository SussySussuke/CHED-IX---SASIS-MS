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
  const { showCancelModal, selectedId, handleCancel, handleCancelConfirm, handleCancelClose } = useCancelSubmission('annex-o');
  const [expandedBatches, setExpandedBatches] = useState({});
  const [batchPrograms, setBatchPrograms] = useState({});

  const toggleBatch = async (batchId) => {
    if (expandedBatches[batchId]) {
      setExpandedBatches(prev => ({ ...prev, [batchId]: false }));
    } else {
      setExpandedBatches(prev => ({ ...prev, [batchId]: true }));
      if (!batchPrograms[batchId]) {
        try {
          const response = await fetch(`/hei/annex-o/${batchId}/programs`);
          const data = await response.json();
          setBatchPrograms(prev => ({ ...prev, [batchId]: data }));
        } catch (error) {
          console.error('Failed to fetch programs:', error);
        }
      }
    }
  };

  const columns = [
    { data: 'title_of_program', title: 'Title of Program', type: 'text', readOnly: true, width: 300 },
    { data: 'date_conducted', title: 'Date Conducted', type: 'date', dateFormat: 'YYYY-MM-DD', readOnly: true, width: 150 },
    { data: 'number_of_beneficiaries', title: 'Number of Beneficiaries', type: 'numeric', readOnly: true, width: 150 },
    { data: 'type_of_community_service', title: 'Type of Community Service', type: 'text', readOnly: true, width: 250 },
    { data: 'community_population_served', title: 'Community Population Served', type: 'text', readOnly: true, width: 250 }
  ];

  return (
    <HEILayout title="Annex O History">
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>
      <div className="space-y-6">
        <HistoryHeader
          annexName="O"
          submitUrl="/hei/annex-o/submit"
        />
        {batches.length === 0 ? (
          <EmptyState title="No Submissions Yet" message="You haven't submitted any Annex O data yet." buttonText="Create Your First Submission" buttonHref="/hei/annex-o/submit" />
        ) : (
          <div className="space-y-2">
            {batches.map((batch) => {
              const canCancel = batch.status === 'request';
              const isPublished = batch.status === 'published';
              const isExpanded = expandedBatches[batch.batch_id];
              const programs = batchPrograms[batch.batch_id] || [];
              return (
                <BatchCard
                  key={batch.batch_id}
                  batch={batch}
                  isExpanded={isExpanded}
                  onToggle={() => toggleBatch(batch.batch_id)}
                  editUrl={`/hei/annex-o/${batch.batch_id}/edit`}
                  onCancel={() => handleCancel(batch.batch_id)}
                >
                  <div className="overflow-auto">
                    <HotTable data={programs} colHeaders={true} rowHeaders={true} columns={columns} height="auto" licenseKey="non-commercial-and-evaluation" stretchH="all" className={isDark ? 'dark-table' : ''} />
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
